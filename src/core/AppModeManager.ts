/**
 * Application Mode Manager
 *
 * Manages application mode state (playground vs wizard) and emits events
 * for mode transitions. This is a thin coordination layer that doesn't
 * own any UI components.
 *
 * @zone SYNC
 * @reason Mode state must be synchronous for immediate UI updates
 *
 * @see story-029: Wizard UI Integration & Mode Toggle
 * @see FR-INT-001: Mode Toggle
 */

/**
 * Available application modes.
 */
export type AppMode = 'playground' | 'wizard';

/**
 * Callback type for mode change events.
 */
export type ModeChangeCallback = (mode: AppMode, previousMode: AppMode) => void;

/**
 * AppModeManager tracks and coordinates application mode transitions.
 *
 * Responsibilities:
 * - Track current mode state
 * - Emit events on mode change
 * - Provide mode query methods
 *
 * Does NOT:
 * - Own or manage UI components
 * - Perform DOM operations
 * - Handle component instantiation
 *
 * @example
 * ```typescript
 * const modeManager = new AppModeManager();
 *
 * modeManager.onModeChange((mode, prev) => {
 *   if (mode === 'wizard') {
 *     showWizardUI();
 *   } else {
 *     showPlaygroundUI();
 *   }
 * });
 *
 * modeManager.switchMode('wizard');
 * ```
 */
export class AppModeManager {
  /** Current application mode */
  private currentMode: AppMode;

  /** Mode change callbacks */
  private modeChangeCallbacks: Set<ModeChangeCallback> = new Set();

  /** Whether the manager has been disposed */
  private disposed = false;

  /**
   * Create a new AppModeManager.
   *
   * @param initialMode - Initial mode (defaults to 'playground' for backwards compatibility)
   */
  constructor(initialMode: AppMode = 'playground') {
    this.currentMode = initialMode;
  }

  /**
   * Get the current application mode.
   */
  getMode(): AppMode {
    return this.currentMode;
  }

  /**
   * Check if the current mode is playground.
   */
  isPlaygroundMode(): boolean {
    return this.currentMode === 'playground';
  }

  /**
   * Check if the current mode is wizard.
   */
  isWizardMode(): boolean {
    return this.currentMode === 'wizard';
  }

  /**
   * Switch to a new mode.
   * No-op if already in the requested mode.
   *
   * @param mode - The mode to switch to
   */
  switchMode(mode: AppMode): void {
    if (this.disposed) {
      console.warn('AppModeManager: Cannot switch mode, manager is disposed');
      return;
    }

    if (this.currentMode === mode) {
      return;
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;

    this.emitModeChange(mode, previousMode);
  }

  /**
   * Toggle between playground and wizard modes.
   */
  toggleMode(): void {
    const newMode: AppMode = this.currentMode === 'playground' ? 'wizard' : 'playground';
    this.switchMode(newMode);
  }

  /**
   * Register a callback for mode change events.
   *
   * @param callback - Function called when mode changes
   */
  onModeChange(callback: ModeChangeCallback): void {
    this.modeChangeCallbacks.add(callback);
  }

  /**
   * Remove a mode change callback.
   *
   * @param callback - Previously registered callback
   */
  offModeChange(callback: ModeChangeCallback): void {
    this.modeChangeCallbacks.delete(callback);
  }

  /**
   * Dispose of the manager and clean up resources.
   */
  dispose(): void {
    this.disposed = true;
    this.modeChangeCallbacks.clear();
  }

  /**
   * Emit mode change event to all callbacks.
   */
  private emitModeChange(mode: AppMode, previousMode: AppMode): void {
    for (const callback of this.modeChangeCallbacks) {
      try {
        callback(mode, previousMode);
      } catch (error) {
        console.error('AppModeManager: Error in mode change callback:', error);
      }
    }
  }
}
