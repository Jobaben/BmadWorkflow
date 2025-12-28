/**
 * ParameterControl Unit Tests
 *
 * Tests the ParameterControl UI component against story-020 acceptance criteria:
 * - AC1: Parameter controls show code variable names
 * - AC5: Parameter explanation is visible
 * - Slider, checkbox, select, and color control types
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  ParameterControl,
  getParameterControlStyles,
  injectParameterControlStyles,
} from '../../src/wizard-ui/ParameterControl';
import type { ParameterBinding } from '../../src/wizard/types';

// Setup DOM environment
let dom: JSDOM;
let document: Document;
let container: HTMLElement;

function setupDOM(): void {
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    runScripts: 'dangerously',
  });
  document = dom.window.document;
  container = document.createElement('div');
  document.body.appendChild(container);

  // Set globals for the module
  (global as unknown as Record<string, unknown>).document = document;
  (global as unknown as Record<string, unknown>).window = dom.window;
}

function teardownDOM(): void {
  (global as unknown as Record<string, unknown>).document = undefined;
  (global as unknown as Record<string, unknown>).window = undefined;
  dom.window.close();
}

// Helper to create mock parameter binding
function createMockBinding(key: string): ParameterBinding {
  return {
    parameterKey: key,
    codeLocation: {
      id: `snippet-${key}`,
      sourceFile: 'demos/test.ts',
      startLine: 10,
      endLine: 15,
    },
    variableName: `this.params.${key}`,
    explanation: `Controls the ${key} setting`,
  };
}

describe('ParameterControl', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    teardownDOM();
  });

  describe('getParameterControlStyles', () => {
    it('should return CSS styles string', () => {
      const styles = getParameterControlStyles();

      expect(styles).toContain('.parameter-control');
      expect(styles).toContain('.parameter-control-label');
      expect(styles).toContain('.parameter-control-variable');
      expect(styles).toContain('.parameter-control-explanation');
      expect(styles).toContain('.parameter-control-slider');
      expect(styles).toContain('.parameter-control-checkbox');
      expect(styles).toContain('.parameter-control-select');
      expect(styles).toContain('.parameter-control-color');
    });

    it('should include highlight animation', () => {
      const styles = getParameterControlStyles();

      expect(styles).toContain('@keyframes parameter-highlight-pulse');
      expect(styles).toContain('parameter-control--highlighted');
    });
  });

  describe('Slider Control', () => {
    it('should render a slider with label and variable name (AC1)', () => {
      const binding = createMockBinding('emissionRate');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
        min: 0,
        max: 100,
      });

      const label = container.querySelector('.parameter-control-label');
      const variable = container.querySelector('.parameter-control-variable');

      expect(label?.textContent).toBe('Emission Rate');
      expect(variable?.textContent).toBe('this.params.emissionRate');
    });

    it('should display explanation (AC5)', () => {
      const binding = createMockBinding('emissionRate');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
      });

      const explanation = container.querySelector('.parameter-control-explanation');
      expect(explanation?.textContent).toBe('Controls the emissionRate setting');
    });

    it('should render slider with correct min/max/step', () => {
      const binding = createMockBinding('speed');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 25,
        min: 10,
        max: 200,
        step: 5,
      });

      const slider = container.querySelector('.parameter-control-slider') as HTMLInputElement;

      expect(slider?.min).toBe('10');
      expect(slider?.max).toBe('200');
      expect(slider?.step).toBe('5');
      expect(slider?.value).toBe('25');
    });

    it('should display current value', () => {
      const binding = createMockBinding('speed');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 75,
      });

      const valueDisplay = container.querySelector('.parameter-control-value');
      expect(valueDisplay?.textContent).toBe('75');
    });

    it('should call onFocus callback', () => {
      const onFocus = vi.fn();
      const binding = createMockBinding('test');
      new ParameterControl(
        container,
        { binding, type: 'slider', value: 50 },
        { onFocus }
      );

      const slider = container.querySelector('.parameter-control-slider') as HTMLInputElement;
      slider?.dispatchEvent(new dom.window.FocusEvent('focus'));

      expect(onFocus).toHaveBeenCalledWith('test');
    });

    it('should call onBlur callback', () => {
      const onBlur = vi.fn();
      const binding = createMockBinding('test');
      new ParameterControl(
        container,
        { binding, type: 'slider', value: 50 },
        { onBlur }
      );

      const slider = container.querySelector('.parameter-control-slider') as HTMLInputElement;
      slider?.dispatchEvent(new dom.window.FocusEvent('blur'));

      expect(onBlur).toHaveBeenCalledWith('test');
    });

    it('should call onChange callback with parsed value', () => {
      const onChange = vi.fn();
      const binding = createMockBinding('test');
      new ParameterControl(
        container,
        { binding, type: 'slider', value: 50 },
        { onChange }
      );

      const slider = container.querySelector('.parameter-control-slider') as HTMLInputElement;
      slider.value = '75';
      slider?.dispatchEvent(new dom.window.Event('input'));

      expect(onChange).toHaveBeenCalledWith('test', 75);
    });
  });

  describe('Checkbox Control', () => {
    it('should render a checkbox with label (AC1)', () => {
      const binding = createMockBinding('enabled');
      new ParameterControl(container, {
        binding,
        type: 'checkbox',
        value: true,
      });

      const checkbox = container.querySelector('.parameter-control-checkbox') as HTMLInputElement;
      const variable = container.querySelector('.parameter-control-variable');

      expect(checkbox).not.toBeNull();
      expect(checkbox?.type).toBe('checkbox');
      expect(checkbox?.checked).toBe(true);
      expect(variable?.textContent).toBe('this.params.enabled');
    });

    it('should display enabled/disabled label', () => {
      const binding = createMockBinding('enabled');
      new ParameterControl(container, {
        binding,
        type: 'checkbox',
        value: true,
      });

      const label = container.querySelector('.parameter-control-checkbox-label');
      expect(label?.textContent).toBe('Enabled');
    });

    it('should toggle label text on change', () => {
      const binding = createMockBinding('enabled');
      new ParameterControl(container, {
        binding,
        type: 'checkbox',
        value: true,
      });

      const checkbox = container.querySelector('.parameter-control-checkbox') as HTMLInputElement;
      checkbox.checked = false;
      checkbox?.dispatchEvent(new dom.window.Event('change'));

      const label = container.querySelector('.parameter-control-checkbox-label');
      expect(label?.textContent).toBe('Disabled');
    });

    it('should call onChange with boolean value', () => {
      const onChange = vi.fn();
      const binding = createMockBinding('enabled');
      new ParameterControl(
        container,
        { binding, type: 'checkbox', value: false },
        { onChange }
      );

      const checkbox = container.querySelector('.parameter-control-checkbox') as HTMLInputElement;
      checkbox.checked = true;
      checkbox?.dispatchEvent(new dom.window.Event('change'));

      expect(onChange).toHaveBeenCalledWith('enabled', true);
    });
  });

  describe('Select Control', () => {
    it('should render a select with options', () => {
      const binding = createMockBinding('blendMode');
      new ParameterControl(container, {
        binding,
        type: 'select',
        value: 'additive',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Additive', value: 'additive' },
          { label: 'Multiply', value: 'multiply' },
        ],
      });

      const select = container.querySelector('.parameter-control-select') as HTMLSelectElement;
      expect(select).not.toBeNull();
      expect(select?.options.length).toBe(3);
      expect(select?.value).toBe('additive');
    });

    it('should call onChange with selected value', () => {
      const onChange = vi.fn();
      const binding = createMockBinding('blendMode');
      new ParameterControl(
        container,
        {
          binding,
          type: 'select',
          value: 'normal',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Additive', value: 'additive' },
          ],
        },
        { onChange }
      );

      const select = container.querySelector('.parameter-control-select') as HTMLSelectElement;
      select.value = 'additive';
      select?.dispatchEvent(new dom.window.Event('change'));

      expect(onChange).toHaveBeenCalledWith('blendMode', 'additive');
    });
  });

  describe('Color Control', () => {
    it('should render a color picker', () => {
      const binding = createMockBinding('particleColor');
      new ParameterControl(container, {
        binding,
        type: 'color',
        value: '#ff5500',
      });

      const colorInput = container.querySelector('.parameter-control-color') as HTMLInputElement;
      expect(colorInput).not.toBeNull();
      expect(colorInput?.type).toBe('color');
      expect(colorInput?.value).toBe('#ff5500');
    });

    it('should display color value', () => {
      const binding = createMockBinding('particleColor');
      new ParameterControl(container, {
        binding,
        type: 'color',
        value: '#ff5500',
      });

      const colorValue = container.querySelector('.parameter-control-color-value');
      expect(colorValue?.textContent).toBe('#FF5500');
    });

    it('should call onChange with color value', () => {
      const onChange = vi.fn();
      const binding = createMockBinding('particleColor');
      new ParameterControl(
        container,
        { binding, type: 'color', value: '#ff5500' },
        { onChange }
      );

      const colorInput = container.querySelector('.parameter-control-color') as HTMLInputElement;
      colorInput.value = '#00ff00';
      colorInput?.dispatchEvent(new dom.window.Event('input'));

      expect(onChange).toHaveBeenCalledWith('particleColor', '#00ff00');
    });
  });

  describe('Hover events', () => {
    it('should call onHover when mouse enters', () => {
      const onHover = vi.fn();
      const binding = createMockBinding('test');
      new ParameterControl(
        container,
        { binding, type: 'slider', value: 50 },
        { onHover }
      );

      const control = container.querySelector('.parameter-control') as HTMLElement;
      control?.dispatchEvent(new dom.window.MouseEvent('mouseenter'));

      expect(onHover).toHaveBeenCalledWith('test');
    });

    it('should call onLeave when mouse leaves', () => {
      const onLeave = vi.fn();
      const binding = createMockBinding('test');
      new ParameterControl(
        container,
        { binding, type: 'slider', value: 50 },
        { onLeave }
      );

      const control = container.querySelector('.parameter-control') as HTMLElement;
      control?.dispatchEvent(new dom.window.MouseEvent('mouseleave'));

      expect(onLeave).toHaveBeenCalledWith('test');
    });
  });

  describe('Value management', () => {
    it('should update slider value via setValue', () => {
      const binding = createMockBinding('speed');
      const control = new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
      });

      control.setValue(75);

      // Check internal state (getValue returns config.value which is updated)
      expect(control.getValue()).toBe(75);
    });

    it('should update checkbox value via setValue', () => {
      const binding = createMockBinding('enabled');
      const control = new ParameterControl(container, {
        binding,
        type: 'checkbox',
        value: false,
      });

      control.setValue(true);

      // Check internal state
      expect(control.getValue()).toBe(true);
    });

    it('should get parameter key', () => {
      const binding = createMockBinding('testParam');
      const control = new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
      });

      expect(control.getParameterKey()).toBe('testParam');
    });
  });

  describe('Highlight', () => {
    it('should add highlight class', () => {
      const binding = createMockBinding('test');
      const control = new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
      });

      control.highlight();

      const element = container.querySelector('.parameter-control');
      expect(element?.classList.contains('parameter-control--highlighted')).toBe(true);
    });
  });

  describe('Dispose', () => {
    it('should remove element from DOM', () => {
      const binding = createMockBinding('test');
      const control = new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
      });

      expect(container.querySelector('.parameter-control')).not.toBeNull();

      control.dispose();

      expect(container.querySelector('.parameter-control')).toBeNull();
    });
  });

  describe('Label formatting', () => {
    it('should format camelCase keys as readable labels', () => {
      const binding = createMockBinding('emissionRate');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
      });

      const label = container.querySelector('.parameter-control-label');
      expect(label?.textContent).toBe('Emission Rate');
    });

    it('should use custom label when provided', () => {
      const binding = createMockBinding('emissionRate');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 50,
        label: 'Custom Label',
      });

      const label = container.querySelector('.parameter-control-label');
      expect(label?.textContent).toBe('Custom Label');
    });
  });

  describe('Value formatting', () => {
    it('should format integer values without decimals', () => {
      const binding = createMockBinding('count');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 100,
      });

      const valueDisplay = container.querySelector('.parameter-control-value');
      expect(valueDisplay?.textContent).toBe('100');
    });

    it('should format float values with 2 decimals', () => {
      const binding = createMockBinding('ratio');
      new ParameterControl(container, {
        binding,
        type: 'slider',
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
      });

      const valueDisplay = container.querySelector('.parameter-control-value');
      expect(valueDisplay?.textContent).toBe('0.50');
    });
  });
});
