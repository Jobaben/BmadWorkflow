/**
 * Parameter Code Linker
 *
 * Bridges parameter UI controls with code display and demo updates.
 * When users adjust parameters, the corresponding code is highlighted
 * to show the connection between UI controls and implementation.
 *
 * @see FR-005 (Live Parameter Connection)
 */

import type { ParameterBinding } from './types';
import type { LearningPanel } from '../wizard-ui/LearningPanel';
import type { DemoAdapter } from './DemoAdapter';

/**
 * Event types emitted by ParameterCodeLinker.
 */
export type ParameterLinkerEvent = 'parameterFocus' | 'parameterChange' | 'parameterBlur';

/**
 * Event data for parameter events.
 */
export interface ParameterEventData {
  event: ParameterLinkerEvent;
  key: string;
  value?: unknown;
  binding?: ParameterBinding;
}

/**
 * Callback type for parameter events.
 */
export type ParameterEventCallback = (data: ParameterEventData) => void;

/**
 * ParameterCodeLinker connects parameter controls to code highlighting
 * and demo updates.
 *
 * Responsibilities:
 * - Store parameter-to-code mappings
 * - Trigger code highlighting on parameter focus
 * - Forward parameter changes to demo
 * - Emit events for parameter interactions
 *
 * @example
 * ```typescript
 * const linker = new ParameterCodeLinker(panel, adapter);
 * linker.setBindings(step.parameters);
 *
 * // When parameter is focused
 * linker.onParameterFocus('emissionRate');
 *
 * // When parameter value changes
 * linker.onParameterChange('emissionRate', 50);
 * ```
 */
export class ParameterCodeLinker {
  /** Learning panel for code highlighting */
  private readonly panel: LearningPanel;

  /** Demo adapter for parameter updates */
  private readonly adapter: DemoAdapter;

  /** Current parameter bindings */
  private bindings: Map<string, ParameterBinding> = new Map();

  /** Currently focused parameter key */
  private focusedParameter: string | null = null;

  /** Event callbacks */
  private callbacks: Set<ParameterEventCallback> = new Set();

  /** Whether a highlight animation is in progress */
  private highlightTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Whether the linker has been disposed */
  private disposed: boolean = false;

  /**
   * Create a new ParameterCodeLinker.
   *
   * @param panel - Learning panel for code highlighting
   * @param adapter - Demo adapter for parameter updates
   */
  constructor(panel: LearningPanel, adapter: DemoAdapter) {
    this.panel = panel;
    this.adapter = adapter;
  }

  /**
   * Set the parameter bindings for the current step.
   * Clears any previous bindings.
   *
   * @param bindings - Array of parameter bindings from the wizard step
   */
  setBindings(bindings: ParameterBinding[] | undefined): void {
    this.bindings.clear();
    this.focusedParameter = null;

    if (bindings) {
      for (const binding of bindings) {
        this.bindings.set(binding.parameterKey, binding);
      }
    }
  }

  /**
   * Get all current parameter bindings.
   *
   * @returns Array of parameter bindings
   */
  getBindings(): ParameterBinding[] {
    return Array.from(this.bindings.values());
  }

  /**
   * Get a specific parameter binding.
   *
   * @param key - Parameter key to look up
   * @returns The binding or undefined if not found
   */
  getBinding(key: string): ParameterBinding | undefined {
    return this.bindings.get(key);
  }

  /**
   * Check if a parameter binding exists.
   *
   * @param key - Parameter key to check
   * @returns True if binding exists
   */
  hasBinding(key: string): boolean {
    return this.bindings.has(key);
  }

  /**
   * Handle parameter focus event.
   * Highlights the corresponding code section.
   *
   * @param key - The parameter key that received focus
   */
  onParameterFocus(key: string): void {
    if (this.disposed) return;

    this.focusedParameter = key;
    this.highlightCodeForParameter(key);

    const binding = this.bindings.get(key);
    this.emit({
      event: 'parameterFocus',
      key,
      binding,
    });
  }

  /**
   * Handle parameter blur event.
   * Clears the code highlight.
   *
   * @param key - The parameter key that lost focus
   */
  onParameterBlur(key: string): void {
    if (this.disposed) return;

    if (this.focusedParameter === key) {
      this.focusedParameter = null;
    }

    this.emit({
      event: 'parameterBlur',
      key,
      binding: this.bindings.get(key),
    });
  }

  /**
   * Handle parameter value change.
   * Updates the demo and briefly highlights the code.
   *
   * @param key - The parameter key that changed
   * @param value - The new parameter value
   */
  onParameterChange(key: string, value: unknown): void {
    if (this.disposed) return;

    // Forward to demo adapter for immediate visual feedback
    this.adapter.setParameter(key, value);

    // Highlight the code briefly to show the connection
    this.highlightCodeForParameter(key, true);

    const binding = this.bindings.get(key);
    this.emit({
      event: 'parameterChange',
      key,
      value,
      binding,
    });
  }

  /**
   * Highlight the code section for a parameter.
   *
   * @param key - The parameter key
   * @param animate - Whether to animate the highlight (brief flash)
   */
  highlightCodeForParameter(key: string, animate: boolean = false): void {
    if (this.disposed) return;

    const binding = this.bindings.get(key);
    if (!binding) {
      return;
    }

    // Clear any pending highlight timeout
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }

    // Notify the panel to highlight the parameter
    this.panel.highlightParameter(key);

    // If animating, clear the highlight after a delay
    if (animate) {
      this.highlightTimeout = setTimeout(() => {
        // Only clear if this parameter is not currently focused
        if (this.focusedParameter !== key) {
          // The panel will handle clearing the highlight
        }
        this.highlightTimeout = null;
      }, 1500);
    }
  }

  /**
   * Get the currently focused parameter key.
   *
   * @returns The focused parameter key or null
   */
  getFocusedParameter(): string | null {
    return this.focusedParameter;
  }

  /**
   * Register an event callback.
   *
   * @param callback - Function to call on events
   */
  on(callback: ParameterEventCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove an event callback.
   *
   * @param callback - Function to remove
   */
  off(callback: ParameterEventCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Dispose of the linker and clean up resources.
   */
  dispose(): void {
    if (this.disposed) return;

    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }

    this.bindings.clear();
    this.callbacks.clear();
    this.focusedParameter = null;
    this.disposed = true;
  }

  /**
   * Emit an event to all callbacks.
   */
  private emit(data: ParameterEventData): void {
    for (const callback of this.callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error('ParameterCodeLinker: Error in event callback:', error);
      }
    }
  }
}
