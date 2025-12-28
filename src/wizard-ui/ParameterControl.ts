/**
 * Parameter Control Component
 *
 * Enhanced UI controls for adjusting demo parameters with code linking.
 * Shows the variable name, explanation, and provides interactive controls.
 *
 * @see FR-005 (Live Parameter Connection)
 */

import type { ParameterBinding } from '../wizard/types';

/**
 * Type of parameter control to create.
 */
export type ParameterControlType = 'slider' | 'checkbox' | 'select' | 'color';

/**
 * Configuration for a parameter control.
 */
export interface ParameterControlConfig {
  /** The parameter binding data */
  binding: ParameterBinding;
  /** Type of control to render */
  type: ParameterControlType;
  /** Current value */
  value: unknown;
  /** Minimum value (for sliders) */
  min?: number;
  /** Maximum value (for sliders) */
  max?: number;
  /** Step increment (for sliders) */
  step?: number;
  /** Options (for select) */
  options?: Array<{ label: string; value: unknown }>;
  /** Display label override (uses binding.parameterKey if not provided) */
  label?: string;
}

/**
 * Callbacks for parameter control events.
 */
export interface ParameterControlCallbacks {
  /** Called when control receives focus */
  onFocus?: (key: string) => void;
  /** Called when control loses focus */
  onBlur?: (key: string) => void;
  /** Called when value changes */
  onChange?: (key: string, value: unknown) => void;
  /** Called when mouse hovers over control */
  onHover?: (key: string) => void;
  /** Called when mouse leaves control */
  onLeave?: (key: string) => void;
}

/**
 * Generate CSS styles for parameter controls.
 */
export function getParameterControlStyles(): string {
  return `
    .parameter-control {
      margin-bottom: 16px;
      padding: 12px;
      background-color: rgba(30, 41, 59, 0.5);
      border-radius: 8px;
      border: 1px solid transparent;
      transition: border-color 0.2s, background-color 0.2s;
    }

    .parameter-control:hover {
      border-color: rgba(56, 139, 253, 0.3);
      background-color: rgba(30, 41, 59, 0.8);
    }

    .parameter-control:focus-within {
      border-color: rgba(56, 139, 253, 0.6);
      background-color: rgba(30, 41, 59, 0.9);
    }

    .parameter-control--highlighted {
      border-color: rgba(255, 215, 0, 0.6) !important;
      background-color: rgba(255, 215, 0, 0.1) !important;
      animation: parameter-highlight-pulse 0.5s ease-in-out;
    }

    @keyframes parameter-highlight-pulse {
      0%, 100% { background-color: rgba(255, 215, 0, 0.1); }
      50% { background-color: rgba(255, 215, 0, 0.2); }
    }

    .parameter-control-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .parameter-control-label {
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
      text-transform: capitalize;
    }

    .parameter-control-variable {
      font-size: 12px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      color: #58a6ff;
      background-color: rgba(56, 139, 253, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .parameter-control-explanation {
      font-size: 13px;
      color: #8b949e;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .parameter-control-input {
      width: 100%;
    }

    /* Slider styles */
    .parameter-control-slider-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .parameter-control-slider {
      flex: 1;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: linear-gradient(to right, #388bfd 0%, #388bfd var(--value-percent, 50%), #30363d var(--value-percent, 50%), #30363d 100%);
      border-radius: 3px;
      outline: none;
      cursor: pointer;
    }

    .parameter-control-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #58a6ff;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #0d1117;
      transition: transform 0.1s;
    }

    .parameter-control-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    .parameter-control-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #58a6ff;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #0d1117;
    }

    .parameter-control-value {
      min-width: 50px;
      font-size: 14px;
      font-family: 'Monaco', 'Menlo', monospace;
      color: #c9d1d9;
      text-align: right;
    }

    /* Checkbox styles */
    .parameter-control-checkbox-container {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .parameter-control-checkbox {
      width: 20px;
      height: 20px;
      -webkit-appearance: none;
      appearance: none;
      background-color: #30363d;
      border: 2px solid #484f58;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .parameter-control-checkbox:checked {
      background-color: #388bfd;
      border-color: #388bfd;
    }

    .parameter-control-checkbox:checked::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 14px;
      font-weight: bold;
    }

    .parameter-control-checkbox-label {
      font-size: 14px;
      color: #c9d1d9;
    }

    /* Select styles */
    .parameter-control-select {
      width: 100%;
      padding: 8px 12px;
      font-size: 14px;
      color: #c9d1d9;
      background-color: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      cursor: pointer;
      outline: none;
    }

    .parameter-control-select:focus {
      border-color: #388bfd;
    }

    .parameter-control-select option {
      background-color: #21262d;
      color: #c9d1d9;
    }

    /* Color input styles */
    .parameter-control-color-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .parameter-control-color {
      width: 40px;
      height: 40px;
      border: 2px solid #30363d;
      border-radius: 6px;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      padding: 0;
    }

    .parameter-control-color::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    .parameter-control-color::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }

    .parameter-control-color-value {
      font-size: 14px;
      font-family: 'Monaco', 'Menlo', monospace;
      color: #c9d1d9;
    }
  `;
}

/**
 * Inject parameter control styles into the document head.
 * Uses DOM check to determine if already injected, making it test-friendly.
 */
export function injectParameterControlStyles(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Check DOM for existing style element (test-friendly approach)
  if (document.getElementById('parameter-control-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'parameter-control-styles';
  styleElement.textContent = getParameterControlStyles();
  document.head.appendChild(styleElement);
}

/**
 * ParameterControl creates an interactive control for a demo parameter
 * with code variable display and explanation.
 *
 * @example
 * ```typescript
 * const control = new ParameterControl(container, {
 *   binding: parameterBinding,
 *   type: 'slider',
 *   value: 50,
 *   min: 0,
 *   max: 100,
 * }, {
 *   onFocus: (key) => linker.onParameterFocus(key),
 *   onChange: (key, value) => linker.onParameterChange(key, value),
 * });
 * ```
 */
export class ParameterControl {
  private container: HTMLElement;
  private config: ParameterControlConfig;
  private callbacks: ParameterControlCallbacks;
  private element: HTMLElement | null = null;
  private inputElement: HTMLInputElement | HTMLSelectElement | null = null;

  /**
   * Create a new ParameterControl.
   *
   * @param container - The HTML element to render into
   * @param config - Configuration for the control
   * @param callbacks - Event callbacks
   */
  constructor(
    container: HTMLElement,
    config: ParameterControlConfig,
    callbacks: ParameterControlCallbacks = {}
  ) {
    this.container = container;
    this.config = config;
    this.callbacks = callbacks;

    // Inject styles
    injectParameterControlStyles();

    // Render the control
    this.render();
  }

  /**
   * Render the control into the container.
   */
  private render(): void {
    this.element = document.createElement('div');
    this.element.className = 'parameter-control';
    this.element.dataset.parameterKey = this.config.binding.parameterKey;

    // Header with label and variable name
    const header = document.createElement('div');
    header.className = 'parameter-control-header';

    const label = document.createElement('span');
    label.className = 'parameter-control-label';
    label.textContent = this.config.label ?? this.formatLabel(this.config.binding.parameterKey);
    header.appendChild(label);

    const variable = document.createElement('code');
    variable.className = 'parameter-control-variable';
    variable.textContent = this.config.binding.variableName;
    header.appendChild(variable);

    this.element.appendChild(header);

    // Explanation
    const explanation = document.createElement('div');
    explanation.className = 'parameter-control-explanation';
    explanation.textContent = this.config.binding.explanation;
    this.element.appendChild(explanation);

    // Input control based on type
    const inputContainer = document.createElement('div');
    inputContainer.className = 'parameter-control-input';

    switch (this.config.type) {
      case 'slider':
        this.renderSlider(inputContainer);
        break;
      case 'checkbox':
        this.renderCheckbox(inputContainer);
        break;
      case 'select':
        this.renderSelect(inputContainer);
        break;
      case 'color':
        this.renderColor(inputContainer);
        break;
    }

    this.element.appendChild(inputContainer);

    // Add hover listeners to the whole control
    this.element.addEventListener('mouseenter', () => {
      this.callbacks.onHover?.(this.config.binding.parameterKey);
    });

    this.element.addEventListener('mouseleave', () => {
      this.callbacks.onLeave?.(this.config.binding.parameterKey);
    });

    this.container.appendChild(this.element);
  }

  /**
   * Render a slider control.
   */
  private renderSlider(container: HTMLElement): void {
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'parameter-control-slider-container';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'parameter-control-slider';
    slider.min = String(this.config.min ?? 0);
    slider.max = String(this.config.max ?? 100);
    slider.step = String(this.config.step ?? 1);
    slider.value = String(this.config.value);

    // Calculate and set initial value percent for gradient
    this.updateSliderGradient(slider);

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'parameter-control-value';
    valueDisplay.textContent = this.formatValue(this.config.value);

    // Event listeners
    slider.addEventListener('focus', () => {
      this.callbacks.onFocus?.(this.config.binding.parameterKey);
    });

    slider.addEventListener('blur', () => {
      this.callbacks.onBlur?.(this.config.binding.parameterKey);
    });

    slider.addEventListener('input', () => {
      const value = parseFloat(slider.value);
      valueDisplay.textContent = this.formatValue(value);
      this.updateSliderGradient(slider);
      this.callbacks.onChange?.(this.config.binding.parameterKey, value);
    });

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    container.appendChild(sliderContainer);

    this.inputElement = slider;
  }

  /**
   * Render a checkbox control.
   */
  private renderCheckbox(container: HTMLElement): void {
    const checkboxContainer = document.createElement('label');
    checkboxContainer.className = 'parameter-control-checkbox-container';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'parameter-control-checkbox';
    checkbox.checked = Boolean(this.config.value);

    const label = document.createElement('span');
    label.className = 'parameter-control-checkbox-label';
    label.textContent = this.config.value ? 'Enabled' : 'Disabled';

    checkbox.addEventListener('focus', () => {
      this.callbacks.onFocus?.(this.config.binding.parameterKey);
    });

    checkbox.addEventListener('blur', () => {
      this.callbacks.onBlur?.(this.config.binding.parameterKey);
    });

    checkbox.addEventListener('change', () => {
      label.textContent = checkbox.checked ? 'Enabled' : 'Disabled';
      this.callbacks.onChange?.(this.config.binding.parameterKey, checkbox.checked);
    });

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    container.appendChild(checkboxContainer);

    this.inputElement = checkbox;
  }

  /**
   * Render a select control.
   */
  private renderSelect(container: HTMLElement): void {
    const select = document.createElement('select');
    select.className = 'parameter-control-select';

    if (this.config.options) {
      for (const option of this.config.options) {
        const optionElement = document.createElement('option');
        optionElement.value = String(option.value);
        optionElement.textContent = option.label;
        optionElement.selected = option.value === this.config.value;
        select.appendChild(optionElement);
      }
    }

    select.addEventListener('focus', () => {
      this.callbacks.onFocus?.(this.config.binding.parameterKey);
    });

    select.addEventListener('blur', () => {
      this.callbacks.onBlur?.(this.config.binding.parameterKey);
    });

    select.addEventListener('change', () => {
      this.callbacks.onChange?.(this.config.binding.parameterKey, select.value);
    });

    container.appendChild(select);
    this.inputElement = select;
  }

  /**
   * Render a color picker control.
   */
  private renderColor(container: HTMLElement): void {
    const colorContainer = document.createElement('div');
    colorContainer.className = 'parameter-control-color-container';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'parameter-control-color';
    colorInput.value = String(this.config.value);

    const colorValue = document.createElement('span');
    colorValue.className = 'parameter-control-color-value';
    colorValue.textContent = String(this.config.value).toUpperCase();

    colorInput.addEventListener('focus', () => {
      this.callbacks.onFocus?.(this.config.binding.parameterKey);
    });

    colorInput.addEventListener('blur', () => {
      this.callbacks.onBlur?.(this.config.binding.parameterKey);
    });

    colorInput.addEventListener('input', () => {
      colorValue.textContent = colorInput.value.toUpperCase();
      this.callbacks.onChange?.(this.config.binding.parameterKey, colorInput.value);
    });

    colorContainer.appendChild(colorInput);
    colorContainer.appendChild(colorValue);
    container.appendChild(colorContainer);

    this.inputElement = colorInput;
  }

  /**
   * Update the slider gradient to show progress.
   */
  private updateSliderGradient(slider: HTMLInputElement): void {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const value = parseFloat(slider.value);
    const percent = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--value-percent', `${percent}%`);
  }

  /**
   * Format a parameter key into a readable label.
   */
  private formatLabel(key: string): string {
    // Convert camelCase or snake_case to Title Case with spaces
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  /**
   * Format a value for display.
   */
  private formatValue(value: unknown): string {
    if (typeof value === 'number') {
      // Show 2 decimal places for floats, none for integers
      if (Number.isInteger(value)) {
        return String(value);
      }
      return value.toFixed(2);
    }
    return String(value);
  }

  /**
   * Update the control's value.
   *
   * @param value - The new value
   */
  setValue(value: unknown): void {
    this.config.value = value;

    if (this.inputElement) {
      if (this.inputElement instanceof HTMLInputElement) {
        if (this.inputElement.type === 'checkbox') {
          this.inputElement.checked = Boolean(value);
        } else {
          // Use setAttribute for compatibility with JSDOM and real browsers
          this.inputElement.setAttribute('value', String(value));
          this.inputElement.value = String(value);
          if (this.inputElement.type === 'range') {
            this.updateSliderGradient(this.inputElement);
          }
        }
      } else if (this.inputElement instanceof HTMLSelectElement) {
        this.inputElement.value = String(value);
      }
    }
  }

  /**
   * Get the current value.
   *
   * @returns The current control value
   */
  getValue(): unknown {
    return this.config.value;
  }

  /**
   * Add highlight effect to the control.
   */
  highlight(): void {
    if (this.element) {
      this.element.classList.add('parameter-control--highlighted');
      // Remove after animation
      setTimeout(() => {
        this.element?.classList.remove('parameter-control--highlighted');
      }, 1000);
    }
  }

  /**
   * Get the parameter key for this control.
   */
  getParameterKey(): string {
    return this.config.binding.parameterKey;
  }

  /**
   * Dispose of the control.
   */
  dispose(): void {
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
    this.element = null;
    this.inputElement = null;
  }
}
