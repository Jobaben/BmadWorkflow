/**
 * AsyncContentLoader
 *
 * Coordinates asynchronous content loading for wizard steps.
 * Integrates with CodeSnippetEngine for content retrieval,
 * LoadingStateManager for loading UI, and ContentBuffer for storage.
 *
 * Key principle: Content loads asynchronously without blocking the render loop.
 * Uses AbortController for cancellation to prevent race conditions.
 *
 * @see story-027 (AsyncContentLoader - Wizard Content Pipeline)
 * @see ADR-004: AbortController for cancellation pattern
 */

import type { StepContent } from './types';
import type { PreparedContent } from './types';
import type { ContentBuffer } from './ContentBuffer';
import type { LoadingStateManager } from './LoadingStateManager';
import type { CodeSnippetEngine, HighlightedCode } from '../wizard/CodeSnippetEngine';
import type { WizardStep } from '../wizard/types';

/** Callback type for load start events */
type LoadStartCallback = (stepId: string) => void;

/** Callback type for load complete events */
type LoadCompleteCallback = (stepId: string, content: StepContent) => void;

/** Callback type for load error events */
type LoadErrorCallback = (stepId: string, error: Error) => void;

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
 */
function scheduleIdleWork(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (hasRequestIdleCallback) {
    return requestIdleCallback(callback, options);
  }
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
 * Interface for providing wizard step data to the loader.
 * Allows the loader to work without direct ConceptRegistry dependency.
 */
export interface StepProvider {
  getStep(stepId: string): WizardStep | undefined;
}

/**
 * AsyncContentLoader coordinates async content loading for wizard steps.
 * It manages the pipeline from content retrieval through CodeSnippetEngine,
 * loading state through LoadingStateManager, and storage in ContentBuffer.
 *
 * @example
 * ```typescript
 * const loader = new AsyncContentLoader(
 *   contentBuffer,
 *   loadingManager,
 *   snippetEngine,
 *   stepProvider
 * );
 *
 * // Load content for a step
 * const content = await loader.loadStep('particle-emission');
 *
 * // Preload adjacent steps during idle time
 * loader.preloadSteps(['particle-forces', 'particle-lifetime']);
 * ```
 */
export class AsyncContentLoader {
  /** Content buffer for storing loaded content */
  private readonly buffer: ContentBuffer;

  /** Loading state manager for UI feedback */
  private readonly loadingManager: LoadingStateManager;

  /** Code snippet engine for content retrieval */
  private readonly snippetEngine: CodeSnippetEngine;

  /** Provider for wizard step data */
  private readonly stepProvider: StepProvider;

  /** Current pending load operation's abort controller */
  private currentAbortController: AbortController | null = null;

  /** Current pending step ID */
  private currentLoadingStepId: string | null = null;

  /** Preload abort controllers by step ID */
  private readonly preloadAbortControllers = new Map<string, AbortController>();

  /** Pending idle callback IDs for preloading */
  private readonly preloadIdleCallbackIds: number[] = [];

  /** Load start callbacks */
  private readonly loadStartCallbacks = new Set<LoadStartCallback>();

  /** Load complete callbacks */
  private readonly loadCompleteCallbacks = new Set<LoadCompleteCallback>();

  /** Load error callbacks */
  private readonly loadErrorCallbacks = new Set<LoadErrorCallback>();

  /** Whether the loader has been disposed */
  private isDisposed = false;

  /**
   * Create a new AsyncContentLoader.
   *
   * @param buffer - ContentBuffer for storing loaded content
   * @param loadingManager - LoadingStateManager for loading UI
   * @param snippetEngine - CodeSnippetEngine for content retrieval
   * @param stepProvider - Provider for wizard step data
   */
  constructor(
    buffer: ContentBuffer,
    loadingManager: LoadingStateManager,
    snippetEngine: CodeSnippetEngine,
    stepProvider: StepProvider
  ) {
    this.buffer = buffer;
    this.loadingManager = loadingManager;
    this.snippetEngine = snippetEngine;
    this.stepProvider = stepProvider;
  }

  /**
   * Load content for a wizard step.
   * Cancels any pending load first, then loads the new step.
   *
   * @param stepId - The step ID to load
   * @returns Promise resolving to the loaded content
   * @throws Error if step not found or load fails
   *
   * @see AC1: Content loads asynchronously without blocking animation
   * @see AC2: Pending loads are cancellable
   * @see AC3: Race conditions are prevented
   * @see AC4: Loaded content is stored in ContentBuffer
   * @see AC5: Loading state is coordinated with LoadingStateManager
   */
  async loadStep(stepId: string): Promise<StepContent> {
    if (this.isDisposed) {
      throw new Error('AsyncContentLoader has been disposed');
    }

    // Cancel any pending load (AC2, AC3)
    this.cancelPending();

    // Check if content is already in buffer
    const cached = this.buffer.get(stepId);
    if (cached) {
      return this.preparedContentToStepContent(cached);
    }

    // Get step data
    const step = this.stepProvider.getStep(stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    // Create abort controller for this load
    const abortController = new AbortController();
    this.currentAbortController = abortController;
    this.currentLoadingStepId = stepId;

    // Start loading state (AC5)
    this.loadingManager.startLoading(stepId);

    // Notify load start
    this.notifyLoadStart(stepId);

    try {
      // Load all snippets for the step
      const snippets = await this.loadSnippets(step, abortController.signal);

      // Check if aborted
      if (abortController.signal.aborted) {
        throw new DOMException('Load aborted', 'AbortError');
      }

      // Create step content
      const content: StepContent = {
        stepId,
        snippets,
        annotations: step.annotations,
        loadedAt: Date.now(),
      };

      // Store in buffer (AC4)
      const preparedContent: PreparedContent = {
        stepId,
        snippets,
        annotations: step.annotations,
        preparedAt: Date.now(),
        expiresAt: null,
      };
      this.buffer.set(stepId, preparedContent);

      // Stop loading state (AC5)
      this.loadingManager.stopLoading(stepId);

      // Notify load complete
      this.notifyLoadComplete(stepId, content);

      // Clear current load tracking
      this.currentAbortController = null;
      this.currentLoadingStepId = null;

      return content;
    } catch (error) {
      // Stop loading state (AC5)
      this.loadingManager.stopLoading(stepId);

      // Clear current load tracking
      this.currentAbortController = null;
      this.currentLoadingStepId = null;

      // Handle abort gracefully
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // Notify load error
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyLoadError(stepId, err);
      throw err;
    }
  }

  /**
   * Cancel any pending load operation.
   *
   * @see AC2: Pending loads are cancellable
   */
  cancelPending(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    if (this.currentLoadingStepId) {
      this.loadingManager.stopLoading(this.currentLoadingStepId);
      this.currentLoadingStepId = null;
    }
  }

  /**
   * Preload content for multiple steps during idle time.
   * Skips steps that are already loaded or currently loading.
   *
   * @param stepIds - Array of step IDs to preload
   *
   * @see AC6: Content preloading is supported
   */
  preloadSteps(stepIds: string[]): void {
    if (this.isDisposed) {
      return;
    }

    for (const stepId of stepIds) {
      // Skip if already in buffer
      if (this.buffer.has(stepId)) {
        continue;
      }

      // Skip if already being preloaded
      if (this.preloadAbortControllers.has(stepId)) {
        continue;
      }

      // Skip if currently loading
      if (this.currentLoadingStepId === stepId) {
        continue;
      }

      // Schedule preload during idle time
      const idleCallbackId = scheduleIdleWork(
        () => {
          this.preloadStep(stepId);
        },
        { timeout: DEFAULT_IDLE_TIMEOUT }
      );

      this.preloadIdleCallbackIds.push(idleCallbackId);
    }
  }

  /**
   * Check if content is available for a step.
   *
   * @param stepId - The step ID to check
   * @returns True if content is available in buffer
   */
  hasContent(stepId: string): boolean {
    return this.buffer.has(stepId);
  }

  /**
   * Get content for a step synchronously (from buffer).
   * Returns undefined if not loaded yet.
   *
   * @param stepId - The step ID to get
   * @returns The step content or undefined
   */
  getContent(stepId: string): StepContent | undefined {
    const prepared = this.buffer.get(stepId);
    if (prepared) {
      return this.preparedContentToStepContent(prepared);
    }
    return undefined;
  }

  /**
   * Check if a step is currently loading.
   *
   * @param stepId - The step ID to check
   * @returns True if the step is currently loading
   */
  isLoading(stepId: string): boolean {
    return this.currentLoadingStepId === stepId || this.preloadAbortControllers.has(stepId);
  }

  /**
   * Register a callback for load start events.
   *
   * @param callback - Function called when a load starts
   */
  onLoadStart(callback: LoadStartCallback): void {
    this.loadStartCallbacks.add(callback);
  }

  /**
   * Unregister a callback for load start events.
   *
   * @param callback - Previously registered callback
   */
  offLoadStart(callback: LoadStartCallback): void {
    this.loadStartCallbacks.delete(callback);
  }

  /**
   * Register a callback for load complete events.
   *
   * @param callback - Function called when a load completes
   */
  onLoadComplete(callback: LoadCompleteCallback): void {
    this.loadCompleteCallbacks.add(callback);
  }

  /**
   * Unregister a callback for load complete events.
   *
   * @param callback - Previously registered callback
   */
  offLoadComplete(callback: LoadCompleteCallback): void {
    this.loadCompleteCallbacks.delete(callback);
  }

  /**
   * Register a callback for load error events.
   *
   * @param callback - Function called when a load fails
   */
  onLoadError(callback: LoadErrorCallback): void {
    this.loadErrorCallbacks.add(callback);
  }

  /**
   * Unregister a callback for load error events.
   *
   * @param callback - Previously registered callback
   */
  offLoadError(callback: LoadErrorCallback): void {
    this.loadErrorCallbacks.delete(callback);
  }

  /**
   * Dispose of the loader, cancelling all pending operations.
   */
  dispose(): void {
    this.isDisposed = true;

    // Cancel current load
    this.cancelPending();

    // Cancel all preloads
    for (const [, controller] of this.preloadAbortControllers) {
      controller.abort();
    }
    this.preloadAbortControllers.clear();

    // Cancel all idle callbacks
    for (const id of this.preloadIdleCallbackIds) {
      cancelIdleWork(id);
    }
    this.preloadIdleCallbackIds.length = 0;

    // Clear callbacks
    this.loadStartCallbacks.clear();
    this.loadCompleteCallbacks.clear();
    this.loadErrorCallbacks.clear();
  }

  /**
   * Preload a single step (called during idle time).
   */
  private async preloadStep(stepId: string): Promise<void> {
    // Double-check if already loaded or disposed
    if (this.isDisposed || this.buffer.has(stepId)) {
      return;
    }

    // Get step data
    const step = this.stepProvider.getStep(stepId);
    if (!step) {
      return;
    }

    // Create abort controller for this preload
    const abortController = new AbortController();
    this.preloadAbortControllers.set(stepId, abortController);

    try {
      // Load snippets (no loading indicator for preloads)
      const snippets = await this.loadSnippets(step, abortController.signal);

      // Check if aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Store in buffer
      const preparedContent: PreparedContent = {
        stepId,
        snippets,
        annotations: step.annotations,
        preparedAt: Date.now(),
        expiresAt: null,
      };
      this.buffer.set(stepId, preparedContent);
    } catch {
      // Silently ignore preload errors
    } finally {
      this.preloadAbortControllers.delete(stepId);
    }
  }

  /**
   * Load all snippets for a step.
   */
  private async loadSnippets(
    step: WizardStep,
    signal: AbortSignal
  ): Promise<HighlightedCode[]> {
    const snippets: HighlightedCode[] = [];

    for (const snippetRef of step.codeSnippets) {
      // Check if aborted before each snippet
      if (signal.aborted) {
        throw new DOMException('Load aborted', 'AbortError');
      }

      // Get annotations relevant to this snippet
      const relevantAnnotations = step.annotations.filter(
        (ann) => ann.lineStart >= snippetRef.startLine && ann.lineEnd <= snippetRef.endLine
      );

      const highlighted = await this.snippetEngine.getSnippet(snippetRef, relevantAnnotations);
      snippets.push(highlighted);
    }

    return snippets;
  }

  /**
   * Convert PreparedContent to StepContent.
   */
  private preparedContentToStepContent(prepared: PreparedContent): StepContent {
    return {
      stepId: prepared.stepId,
      snippets: prepared.snippets,
      annotations: prepared.annotations,
      loadedAt: prepared.preparedAt,
    };
  }

  /**
   * Notify all load start callbacks.
   */
  private notifyLoadStart(stepId: string): void {
    for (const callback of this.loadStartCallbacks) {
      callback(stepId);
    }
  }

  /**
   * Notify all load complete callbacks.
   */
  private notifyLoadComplete(stepId: string, content: StepContent): void {
    for (const callback of this.loadCompleteCallbacks) {
      callback(stepId, content);
    }
  }

  /**
   * Notify all load error callbacks.
   */
  private notifyLoadError(stepId: string, error: Error): void {
    for (const callback of this.loadErrorCallbacks) {
      callback(stepId, error);
    }
  }
}
