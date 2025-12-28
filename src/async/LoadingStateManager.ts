/**
 * LoadingStateManager
 *
 * Manages loading indicators with a threshold delay to prevent
 * visual noise from fast operations. Only shows loading indicators
 * for operations that take longer than 100ms.
 *
 * Key principle: Fast operations feel instant; slow operations
 * show clear loading feedback.
 *
 * @see story-025 (LoadingStateManager - Threshold Loading Indicators)
 * @see ADR-002: 100ms threshold based on perceived performance research
 */

import type { LoadingState } from './types';

/** Default threshold before showing loading indicator (ms) */
const DEFAULT_THRESHOLD_MS = 100;

/** Callback type for show/hide indicator events */
type IndicatorCallback = (id: string) => void;

/**
 * LoadingStateManager tracks async operations and shows loading
 * indicators only when operations exceed a threshold duration.
 *
 * @example
 * ```typescript
 * const loadingManager = new LoadingStateManager();
 *
 * // Register callbacks
 * loadingManager.onShowIndicator((id) => showSpinner(id));
 * loadingManager.onHideIndicator((id) => hideSpinner(id));
 *
 * // Start loading (indicator shown after 100ms if still loading)
 * loadingManager.startLoading('fetch-data');
 *
 * // If complete within 100ms, no indicator shown
 * loadingManager.stopLoading('fetch-data');
 * ```
 */
export class LoadingStateManager {
  /** Internal storage for loading states */
  private readonly states = new Map<string, LoadingState>();

  /** Callbacks to invoke when indicator becomes visible */
  private readonly showCallbacks: Set<IndicatorCallback> = new Set();

  /** Callbacks to invoke when indicator is hidden */
  private readonly hideCallbacks: Set<IndicatorCallback> = new Set();

  /** Threshold before showing indicator (ms) */
  private readonly threshold: number;

  /**
   * Create a new LoadingStateManager.
   *
   * @param threshold - Milliseconds to wait before showing indicator (default: 100)
   */
  constructor(threshold: number = DEFAULT_THRESHOLD_MS) {
    this.threshold = threshold;
  }

  /**
   * Start tracking a loading operation.
   * If the operation takes longer than threshold, loading indicator is shown.
   *
   * @param id - Unique identifier for this loading operation
   *
   * @see AC1: Loading indicators delayed by 100ms threshold
   * @see AC4: Multiple concurrent loading states supported
   */
  startLoading(id: string): void {
    // If already loading with this ID, stop the previous one first
    if (this.states.has(id)) {
      this.stopLoading(id);
    }

    const state: LoadingState = {
      id,
      startTime: Date.now(),
      timeoutId: null,
      isVisible: false,
    };

    // Set timeout to show indicator after threshold
    state.timeoutId = setTimeout(() => {
      const currentState = this.states.get(id);
      if (currentState) {
        currentState.isVisible = true;
        currentState.timeoutId = null;
        this.notifyShow(id);
      }
    }, this.threshold);

    this.states.set(id, state);
  }

  /**
   * Stop tracking a loading operation.
   * Immediately hides indicator if visible, cancels pending timeout if not.
   *
   * @param id - Unique identifier for the loading operation
   *
   * @see AC2: Fast operations show no indicator
   * @see AC3: Indicators clear immediately on completion
   */
  stopLoading(id: string): void {
    const state = this.states.get(id);
    if (!state) {
      // Safe to call stop for non-existent ID
      return;
    }

    // Clear pending timeout if indicator not yet visible
    if (state.timeoutId !== null) {
      clearTimeout(state.timeoutId);
    }

    // Notify hide only if indicator was visible
    if (state.isVisible) {
      this.notifyHide(id);
    }

    this.states.delete(id);
  }

  /**
   * Check if a loading operation is in progress.
   *
   * @param id - Unique identifier for the loading operation
   * @returns True if loading operation exists (visible or pending)
   */
  isLoading(id: string): boolean {
    return this.states.has(id);
  }

  /**
   * Check if a loading indicator is currently visible.
   *
   * @param id - Unique identifier for the loading operation
   * @returns True if loading indicator is visible
   */
  isIndicatorVisible(id: string): boolean {
    const state = this.states.get(id);
    return state?.isVisible ?? false;
  }

  /**
   * Clear all loading operations.
   * Cancels pending timeouts and hides visible indicators.
   *
   * @see AC5: Navigation clears pending indicators
   */
  clearAll(): void {
    for (const [id, state] of this.states) {
      // Clear pending timeout
      if (state.timeoutId !== null) {
        clearTimeout(state.timeoutId);
      }

      // Notify hide if indicator was visible
      if (state.isVisible) {
        this.notifyHide(id);
      }
    }

    this.states.clear();
  }

  /**
   * Register a callback to be invoked when loading indicator is shown.
   *
   * @param callback - Function to call when indicator becomes visible
   */
  onShowIndicator(callback: IndicatorCallback): void {
    this.showCallbacks.add(callback);
  }

  /**
   * Unregister a callback for show indicator events.
   *
   * @param callback - Previously registered callback to remove
   */
  offShowIndicator(callback: IndicatorCallback): void {
    this.showCallbacks.delete(callback);
  }

  /**
   * Register a callback to be invoked when loading indicator is hidden.
   *
   * @param callback - Function to call when indicator is hidden
   */
  onHideIndicator(callback: IndicatorCallback): void {
    this.hideCallbacks.add(callback);
  }

  /**
   * Unregister a callback for hide indicator events.
   *
   * @param callback - Previously registered callback to remove
   */
  offHideIndicator(callback: IndicatorCallback): void {
    this.hideCallbacks.delete(callback);
  }

  /**
   * Dispose of the manager, clearing all state and timeouts.
   * After disposal, the manager should not be used.
   */
  dispose(): void {
    this.clearAll();
    this.showCallbacks.clear();
    this.hideCallbacks.clear();
  }

  /**
   * Get the number of active loading operations.
   */
  get activeCount(): number {
    return this.states.size;
  }

  /**
   * Notify all show callbacks that an indicator is now visible.
   */
  private notifyShow(id: string): void {
    for (const callback of this.showCallbacks) {
      callback(id);
    }
  }

  /**
   * Notify all hide callbacks that an indicator is now hidden.
   */
  private notifyHide(id: string): void {
    for (const callback of this.hideCallbacks) {
      callback(id);
    }
  }
}
