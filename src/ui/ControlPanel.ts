/**
 * ControlPanel - Parameter Adjustment UI Component
 *
 * Provides a GUI interface for adjusting demo parameters in real-time.
 * Uses lil-gui library to render appropriate controls based on parameter types.
 *
 * Features:
 * - Renders sliders for number parameters
 * - Renders checkboxes for boolean parameters
 * - Renders dropdowns for select parameters
 * - Emits change events when values are modified
 * - Supports reset to default values
 * - Updates controls when switching between demos
 *
 * @see FR-008 (Parameter Adjustment requirement)
 */

import GUI from 'lil-gui';
import type { ParameterSchema } from '../types';

/**
 * Callback type for parameter change events.
 */
export type ParameterChangeCallback = (key: string, value: unknown) => void;

/**
 * Callback type for reset events.
 */
export type ResetCallback = () => void;

/**
 * ControlPanel provides a lil-gui based interface for adjusting demo parameters.
 *
 * The panel dynamically renders controls based on the ParameterSchema provided
 * by each demo. When values change, callbacks are invoked to notify the demo.
 *
 * @example
 * ```typescript
 * const panel = new ControlPanel(container);
 *
 * // Set up for a specific demo
 * panel.setParameters(demo.getParameterSchema());
 *
 * // Handle parameter changes
 * panel.onParameterChange((key, value) => {
 *   demo.setParameter(key, value);
 * });
 *
 * // Handle reset
 * panel.onReset(() => {
 *   demo.reset();
 * });
 * ```
 */
export class ControlPanel {
  /** Container element for the panel */
  private readonly container: HTMLElement;

  /** lil-gui instance */
  private gui: GUI;

  /** Current parameter values (tracked for lil-gui binding) */
  private values: Record<string, unknown> = {};

  /** Default values from schema (for reset functionality) */
  private defaults: Record<string, unknown> = {};

  /** Current parameter schemas (stored for reference and used by getSchemas) */
  private currentSchemas: ParameterSchema[] = [];

  /** Registered parameter change callbacks */
  private changeCallbacks: ParameterChangeCallback[] = [];

  /** Registered reset callbacks */
  private resetCallbacks: ResetCallback[] = [];

  /** Debounce timers for rapid value changes */
  private debounceTimers: Map<string, number> = new Map();

  /** Debounce delay in milliseconds */
  private readonly debounceDelay: number = 16; // ~60fps

  /**
   * Creates a new ControlPanel instance.
   *
   * @param container - The HTML element to contain the panel
   */
  constructor(container: HTMLElement) {
    this.container = container;

    // Create lil-gui instance
    this.gui = new GUI({
      container: this.container,
      title: 'Parameters',
      width: 280,
      autoPlace: false,
    });

    // Add reset button at the bottom
    this.addResetButton();
  }

  /**
   * Sets the parameters to display in the control panel.
   * Clears existing controls and creates new ones based on the schema.
   *
   * @param schemas - Array of parameter schema definitions
   */
  setParameters(schemas: ParameterSchema[]): void {
    // Store schemas for reference
    this.currentSchemas = schemas;

    // Clear existing controls (except the reset button which is in a folder)
    this.clearControls();

    // Reset values and defaults
    this.values = {};
    this.defaults = {};

    // Create controls for each parameter
    for (const schema of schemas) {
      this.createControl(schema);
    }

    // Re-add reset button
    this.addResetButton();
  }

  /**
   * Registers a callback for parameter change events.
   *
   * @param callback - Function called when a parameter value changes
   */
  onParameterChange(callback: ParameterChangeCallback): void {
    this.changeCallbacks.push(callback);
  }

  /**
   * Registers a callback for reset events.
   *
   * @param callback - Function called when reset is triggered
   */
  onReset(callback: ResetCallback): void {
    this.resetCallbacks.push(callback);
  }

  /**
   * Gets the current parameter schemas.
   *
   * @returns The current parameter schemas
   */
  getSchemas(): ParameterSchema[] {
    return this.currentSchemas;
  }

  /**
   * Gets the current value of a parameter.
   *
   * @param key - The parameter key
   * @returns The current value, or undefined if not found
   */
  getValue(key: string): unknown {
    return this.values[key];
  }

  /**
   * Sets the value of a parameter programmatically.
   * Updates the GUI control to reflect the new value.
   *
   * @param key - The parameter key
   * @param value - The new value
   */
  setValue(key: string, value: unknown): void {
    if (key in this.values) {
      this.values[key] = value;
      // Update GUI to reflect the change
      for (const controller of this.gui.controllersRecursive()) {
        if (controller.property === key) {
          controller.updateDisplay();
        }
      }
    }
  }

  /**
   * Resets all parameters to their default values.
   * Triggers reset callbacks after restoring defaults.
   */
  resetToDefaults(): void {
    // Restore default values
    for (const key in this.defaults) {
      this.values[key] = this.defaults[key];
    }

    // Update GUI display
    for (const controller of this.gui.controllersRecursive()) {
      controller.updateDisplay();
    }

    // Emit reset event
    this.emitReset();

    // Also emit change events for each parameter with default value
    for (const key in this.defaults) {
      this.emitChange(key, this.defaults[key]);
    }
  }

  /**
   * Shows the control panel.
   */
  show(): void {
    this.gui.show();
  }

  /**
   * Hides the control panel.
   */
  hide(): void {
    this.gui.hide();
  }

  /**
   * Opens the control panel (expands it).
   */
  open(): void {
    this.gui.open();
  }

  /**
   * Closes the control panel (collapses it).
   */
  close(): void {
    this.gui.close();
  }

  /**
   * Disposes of all resources used by the control panel.
   * Call this when the panel is no longer needed.
   */
  dispose(): void {
    // Clear timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Clear callbacks
    this.changeCallbacks.length = 0;
    this.resetCallbacks.length = 0;

    // Destroy GUI
    this.gui.destroy();
  }

  /**
   * Creates a control for a parameter based on its schema.
   *
   * @param schema - The parameter schema
   */
  private createControl(schema: ParameterSchema): void {
    // Initialize value with default
    this.values[schema.key] = schema.default;
    this.defaults[schema.key] = schema.default;

    // Create appropriate control based on type
    switch (schema.type) {
      case 'number':
        this.createNumberControl(schema);
        break;
      case 'boolean':
        this.createBooleanControl(schema);
        break;
      case 'select':
        this.createSelectControl(schema);
        break;
      default:
        console.warn(`ControlPanel: Unknown parameter type "${schema.type}"`);
    }
  }

  /**
   * Creates a slider control for a number parameter.
   *
   * @param schema - The parameter schema
   */
  private createNumberControl(schema: ParameterSchema): void {
    const controller = this.gui.add(
      this.values,
      schema.key,
      schema.min ?? 0,
      schema.max ?? 100,
      schema.step ?? 1
    );

    controller.name(schema.label);

    // Handle value changes with debouncing
    controller.onChange((value: number) => {
      this.debouncedEmitChange(schema.key, value);
    });
  }

  /**
   * Creates a checkbox control for a boolean parameter.
   *
   * @param schema - The parameter schema
   */
  private createBooleanControl(schema: ParameterSchema): void {
    const controller = this.gui.add(this.values, schema.key);
    controller.name(schema.label);

    // Boolean changes don't need debouncing
    controller.onChange((value: boolean) => {
      this.emitChange(schema.key, value);
    });
  }

  /**
   * Creates a dropdown control for a select parameter.
   *
   * @param schema - The parameter schema
   */
  private createSelectControl(schema: ParameterSchema): void {
    if (!schema.options || schema.options.length === 0) {
      console.warn(`ControlPanel: Select parameter "${schema.key}" has no options`);
      return;
    }

    const controller = this.gui.add(this.values, schema.key, schema.options);
    controller.name(schema.label);

    // Select changes don't need debouncing
    controller.onChange((value: string) => {
      this.emitChange(schema.key, value);
    });
  }

  /**
   * Adds the reset button to the GUI.
   */
  private addResetButton(): void {
    // Create an actions object with the reset function
    const actions = {
      resetToDefaults: () => this.resetToDefaults(),
    };

    this.gui.add(actions, 'resetToDefaults').name('Reset to Defaults');
  }

  /**
   * Clears all controls from the GUI.
   */
  private clearControls(): void {
    // Destroy and recreate GUI to clear all controls
    this.gui.destroy();

    this.gui = new GUI({
      container: this.container,
      title: 'Parameters',
      width: 280,
      autoPlace: false,
    });
  }

  /**
   * Emits a parameter change event with debouncing.
   * Used for slider controls to prevent excessive updates.
   *
   * @param key - The parameter key
   * @param value - The new value
   */
  private debouncedEmitChange(key: string, value: unknown): void {
    // Clear existing timer for this key
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer !== undefined) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = window.setTimeout(() => {
      this.emitChange(key, value);
      this.debounceTimers.delete(key);
    }, this.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Emits a parameter change event to all registered callbacks.
   *
   * @param key - The parameter key
   * @param value - The new value
   */
  private emitChange(key: string, value: unknown): void {
    this.changeCallbacks.forEach((callback) => {
      try {
        callback(key, value);
      } catch (error) {
        console.error('ControlPanel: Error in change callback:', error);
      }
    });
  }

  /**
   * Emits a reset event to all registered callbacks.
   */
  private emitReset(): void {
    this.resetCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('ControlPanel: Error in reset callback:', error);
      }
    });
  }
}
