/**
 * ComponentInitializer
 *
 * Manages idle-time initialization of non-critical components.
 * Uses requestIdleCallback to initialize components during browser idle time,
 * with a setTimeout fallback for Safari compatibility.
 *
 * Key principle: Expensive initialization shouldn't block user interaction.
 *
 * @see story-026 (ComponentInitializer - Idle-Time Pre-warming)
 * @see ADR-003: requestIdleCallback with Safari fallback
 */

import type { AsyncInitializable, InitStatus } from './types';

/** Callback type for initialization success events */
type InitializedCallback = (id: string) => void;

/** Callback type for initialization failure events */
type InitFailedCallback = (id: string, error: Error) => void;

/** Default timeout for idle callback (ms) */
const DEFAULT_IDLE_TIMEOUT = 2000;

/** Fallback timeout for browsers without requestIdleCallback (ms) */
const FALLBACK_TIMEOUT = 50;

/**
 * Check if requestIdleCallback is available.
 * Safari doesn't support it, so we need a fallback.
 */
const hasRequestIdleCallback = typeof requestIdleCallback !== 'undefined';

/**
 * Wrapper for requestIdleCallback with setTimeout fallback.
 * Provides consistent API across all browsers.
 */
function scheduleIdleWork(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (hasRequestIdleCallback) {
    return requestIdleCallback(callback, options);
  }
  // Fallback for Safari: use setTimeout with short delay
  return setTimeout(callback, FALLBACK_TIMEOUT) as unknown as number;
}

/**
 * Cancel scheduled idle work.
 */
function cancelIdleWork(id: number): void {
  if (hasRequestIdleCallback) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * ComponentInitializer manages async component initialization during idle time.
 * Components register with a priority, and are initialized in order during
 * browser idle periods.
 *
 * @example
 * ```typescript
 * const initializer = new ComponentInitializer();
 *
 * // Register components
 * initializer.register(shikiHighlighter); // priority: 1
 * initializer.register(codeCache);        // priority: 2
 *
 * // Callbacks for tracking
 * initializer.onInitialized((id) => console.log(`${id} ready`));
 * initializer.onInitFailed((id, err) => console.error(`${id} failed`, err));
 *
 * // Start initialization during idle time
 * await initializer.initializeAll();
 * ```
 */
export class ComponentInitializer {
  /** Registered components by ID */
  private readonly components = new Map<string, AsyncInitializable>();

  /** Status of each component */
  private readonly statuses = new Map<string, InitStatus>();

  /** Callbacks for successful initialization */
  private readonly initializedCallbacks = new Set<InitializedCallback>();

  /** Callbacks for failed initialization */
  private readonly failedCallbacks = new Set<InitFailedCallback>();

  /** Current idle callback ID (for cancellation) */
  private idleCallbackId: number | null = null;

  /** Whether initialization is in progress */
  private isInitializing = false;

  /** Whether the initializer has been disposed */
  private isDisposed = false;

  /**
   * Register a component for idle-time initialization.
   * If a component with the same ID is already registered, it will be replaced.
   *
   * @param component - Component implementing AsyncInitializable
   *
   * @see AC1: Components can register for idle-time initialization
   */
  register(component: AsyncInitializable): void {
    if (this.isDisposed) {
      return;
    }

    // If already registered with same ID, unregister first
    if (this.components.has(component.id)) {
      this.components.delete(component.id);
    }

    this.components.set(component.id, component);

    // Set initial status based on component state
    if (component.isInitialized) {
      this.statuses.set(component.id, 'initialized');
    } else {
      this.statuses.set(component.id, 'pending');
    }
  }

  /**
   * Initialize all registered components during idle time.
   * Components are processed in priority order (lower number = higher priority).
   *
   * @returns Promise that resolves when all components are initialized
   *
   * @see AC2: Initialization uses requestIdleCallback
   * @see AC3: Safari fallback uses setTimeout
   * @see AC4: Critical components initialize first
   */
  async initializeAll(): Promise<void> {
    if (this.isDisposed || this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    try {
      // Get components sorted by priority (lower = earlier)
      const sortedComponents = this.getSortedComponents();

      for (const component of sortedComponents) {
        if (this.isDisposed) {
          break;
        }

        // Skip already initialized components
        if (component.isInitialized || this.statuses.get(component.id) === 'initialized') {
          continue;
        }

        // Wait for idle time before initializing each component
        await this.waitForIdle();

        if (this.isDisposed) {
          break;
        }

        await this.initializeComponent(component);
      }
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Get the initialization status of a component.
   *
   * @param id - Component ID
   * @returns Status or undefined if not registered
   *
   * @see AC5: Initialization status is trackable
   */
  getStatus(id: string): InitStatus | undefined {
    return this.statuses.get(id);
  }

  /**
   * Get all component statuses.
   *
   * @returns Map of component ID to status
   *
   * @see AC5: Initialization status is trackable
   */
  getAllStatuses(): Map<string, InitStatus> {
    return new Map(this.statuses);
  }

  /**
   * Register a callback for successful initialization.
   *
   * @param callback - Function called when a component initializes successfully
   */
  onInitialized(callback: InitializedCallback): void {
    this.initializedCallbacks.add(callback);
  }

  /**
   * Unregister a callback for successful initialization.
   *
   * @param callback - Previously registered callback
   */
  offInitialized(callback: InitializedCallback): void {
    this.initializedCallbacks.delete(callback);
  }

  /**
   * Register a callback for failed initialization.
   *
   * @param callback - Function called when a component fails to initialize
   */
  onInitFailed(callback: InitFailedCallback): void {
    this.failedCallbacks.add(callback);
  }

  /**
   * Unregister a callback for failed initialization.
   *
   * @param callback - Previously registered callback
   */
  offInitFailed(callback: InitFailedCallback): void {
    this.failedCallbacks.delete(callback);
  }

  /**
   * Get the number of registered components.
   */
  get componentCount(): number {
    return this.components.size;
  }

  /**
   * Check if a component is registered.
   *
   * @param id - Component ID
   */
  isRegistered(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Dispose of the initializer, cancelling any pending work.
   */
  dispose(): void {
    this.isDisposed = true;

    if (this.idleCallbackId !== null) {
      cancelIdleWork(this.idleCallbackId);
      this.idleCallbackId = null;
    }

    this.components.clear();
    this.statuses.clear();
    this.initializedCallbacks.clear();
    this.failedCallbacks.clear();
  }

  /**
   * Get components sorted by priority (lower number = higher priority).
   * Critical components come before non-critical at same priority.
   */
  private getSortedComponents(): AsyncInitializable[] {
    return Array.from(this.components.values()).sort((a, b) => {
      // First sort by priority (lower = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then by isCritical (critical first)
      if (a.isCritical !== b.isCritical) {
        return a.isCritical ? -1 : 1;
      }
      return 0;
    });
  }

  /**
   * Wait for browser idle time.
   * Uses requestIdleCallback or setTimeout fallback.
   * Resolves immediately if disposed.
   */
  private waitForIdle(): Promise<void> {
    if (this.isDisposed) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.idleCallbackId = scheduleIdleWork(
        () => {
          this.idleCallbackId = null;
          resolve();
        },
        { timeout: DEFAULT_IDLE_TIMEOUT }
      );
    });
  }

  /**
   * Initialize a single component.
   */
  private async initializeComponent(component: AsyncInitializable): Promise<void> {
    const id = component.id;

    try {
      this.statuses.set(id, 'initializing');

      await component.initialize();

      this.statuses.set(id, 'initialized');
      this.notifyInitialized(id);
    } catch (error) {
      this.statuses.set(id, 'failed');
      this.notifyFailed(id, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Notify all initialized callbacks.
   */
  private notifyInitialized(id: string): void {
    for (const callback of this.initializedCallbacks) {
      callback(id);
    }
  }

  /**
   * Notify all failed callbacks.
   */
  private notifyFailed(id: string, error: Error): void {
    for (const callback of this.failedCallbacks) {
      callback(id, error);
    }
  }
}
