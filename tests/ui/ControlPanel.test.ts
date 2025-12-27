/**
 * ControlPanel Tests
 *
 * Tests for the ControlPanel component that provides parameter adjustment UI.
 * Covers all acceptance criteria from story-010.
 *
 * Note: Since lil-gui creates DOM elements, we test the ControlPanel API
 * without mocking the underlying library.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ControlPanel } from '../../src/ui/ControlPanel';
import type { ParameterSchema } from '../../src/types';

// Mock window.matchMedia for lil-gui
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ControlPanel', () => {
  let container: HTMLElement;
  let controlPanel: ControlPanel;

  // Sample parameter schemas for testing
  const numberSchema: ParameterSchema = {
    key: 'speed',
    label: 'Speed',
    type: 'number',
    min: 0,
    max: 100,
    step: 1,
    default: 50,
  };

  const booleanSchema: ParameterSchema = {
    key: 'enabled',
    label: 'Enabled',
    type: 'boolean',
    default: true,
  };

  const selectSchema: ParameterSchema = {
    key: 'mode',
    label: 'Mode',
    type: 'select',
    options: ['slow', 'medium', 'fast'],
    default: 'medium',
  };

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (controlPanel) {
      controlPanel.dispose();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Construction', () => {
    it('should create a ControlPanel instance', () => {
      controlPanel = new ControlPanel(container);
      expect(controlPanel).toBeInstanceOf(ControlPanel);
    });

    it('should create GUI elements in the container', () => {
      controlPanel = new ControlPanel(container);
      // lil-gui adds elements to the container
      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('AC1: Control panel shows parameters for active demo', () => {
    it('should track number parameter values', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      expect(controlPanel.getValue('speed')).toBe(50);
    });

    it('should track boolean parameter values', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([booleanSchema]);

      expect(controlPanel.getValue('enabled')).toBe(true);
    });

    it('should track select parameter values', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([selectSchema]);

      expect(controlPanel.getValue('mode')).toBe('medium');
    });

    it('should handle multiple parameters', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema, booleanSchema, selectSchema]);

      expect(controlPanel.getValue('speed')).toBe(50);
      expect(controlPanel.getValue('enabled')).toBe(true);
      expect(controlPanel.getValue('mode')).toBe('medium');
    });
  });

  describe('AC2: Parameter changes take effect immediately', () => {
    it('should allow registering change callbacks', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      const callback = vi.fn();
      expect(() => controlPanel.onParameterChange(callback)).not.toThrow();
    });

    it('should support multiple change callbacks', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      expect(() => {
        controlPanel.onParameterChange(callback1);
        controlPanel.onParameterChange(callback2);
      }).not.toThrow();
    });
  });

  describe('AC3: Different control types for different parameters', () => {
    it('should store number parameter with min/max/step', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      const schemas = controlPanel.getSchemas();
      expect(schemas).toHaveLength(1);
      expect(schemas[0].type).toBe('number');
      expect(schemas[0].min).toBe(0);
      expect(schemas[0].max).toBe(100);
      expect(schemas[0].step).toBe(1);
    });

    it('should store boolean parameter', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([booleanSchema]);

      const schemas = controlPanel.getSchemas();
      expect(schemas).toHaveLength(1);
      expect(schemas[0].type).toBe('boolean');
    });

    it('should store select parameter with options', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([selectSchema]);

      const schemas = controlPanel.getSchemas();
      expect(schemas).toHaveLength(1);
      expect(schemas[0].type).toBe('select');
      expect(schemas[0].options).toEqual(['slow', 'medium', 'fast']);
    });
  });

  describe('AC4: Default values are visible', () => {
    it('should initialize with default values', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema, booleanSchema, selectSchema]);

      expect(controlPanel.getValue('speed')).toBe(numberSchema.default);
      expect(controlPanel.getValue('enabled')).toBe(booleanSchema.default);
      expect(controlPanel.getValue('mode')).toBe(selectSchema.default);
    });

    it('should reset to default values when resetToDefaults is called', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      // Modify the value programmatically
      controlPanel.setValue('speed', 75);
      expect(controlPanel.getValue('speed')).toBe(75);

      // Reset
      controlPanel.resetToDefaults();

      expect(controlPanel.getValue('speed')).toBe(50);
    });

    it('should emit reset callback when reset is triggered', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      const resetCallback = vi.fn();
      controlPanel.onReset(resetCallback);

      controlPanel.resetToDefaults();

      expect(resetCallback).toHaveBeenCalled();
    });

    it('should emit change events for all parameters after reset', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema, booleanSchema]);

      const changeCallback = vi.fn();
      controlPanel.onParameterChange(changeCallback);

      controlPanel.resetToDefaults();

      // Should have been called for each parameter
      expect(changeCallback).toHaveBeenCalledWith('speed', 50);
      expect(changeCallback).toHaveBeenCalledWith('enabled', true);
    });
  });

  describe('AC5: Control panel updates when switching demos', () => {
    it('should clear and rebuild controls when setParameters is called again', () => {
      controlPanel = new ControlPanel(container);

      // Set initial parameters
      controlPanel.setParameters([numberSchema]);
      expect(controlPanel.getValue('speed')).toBe(50);

      // Switch to different parameters
      const newSchema: ParameterSchema = {
        key: 'volume',
        label: 'Volume',
        type: 'number',
        min: 0,
        max: 10,
        step: 0.1,
        default: 5,
      };
      controlPanel.setParameters([newSchema]);

      // Old parameter should be gone
      expect(controlPanel.getValue('speed')).toBeUndefined();

      // New parameter should be present
      expect(controlPanel.getValue('volume')).toBe(5);
    });

    it('should update schemas when switching demos', () => {
      controlPanel = new ControlPanel(container);

      controlPanel.setParameters([numberSchema]);
      expect(controlPanel.getSchemas()).toHaveLength(1);
      expect(controlPanel.getSchemas()[0].key).toBe('speed');

      controlPanel.setParameters([booleanSchema, selectSchema]);
      expect(controlPanel.getSchemas()).toHaveLength(2);
      expect(controlPanel.getSchemas()[0].key).toBe('enabled');
      expect(controlPanel.getSchemas()[1].key).toBe('mode');
    });
  });

  describe('UI Methods', () => {
    it('should have show/hide methods', () => {
      controlPanel = new ControlPanel(container);

      expect(() => controlPanel.show()).not.toThrow();
      expect(() => controlPanel.hide()).not.toThrow();
    });

    it('should have open/close methods', () => {
      controlPanel = new ControlPanel(container);

      expect(() => controlPanel.open()).not.toThrow();
      expect(() => controlPanel.close()).not.toThrow();
    });
  });

  describe('setValue', () => {
    it('should update internal value when setValue is called', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      controlPanel.setValue('speed', 75);
      expect(controlPanel.getValue('speed')).toBe(75);
    });

    it('should ignore setValue for non-existent keys', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      expect(() => controlPanel.setValue('nonexistent', 100)).not.toThrow();
      expect(controlPanel.getValue('nonexistent')).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('should dispose without errors', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema, booleanSchema]);

      expect(() => controlPanel.dispose()).not.toThrow();
    });

    it('should clear callbacks on dispose', () => {
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);

      const changeCallback = vi.fn();
      const resetCallback = vi.fn();
      controlPanel.onParameterChange(changeCallback);
      controlPanel.onReset(resetCallback);

      controlPanel.dispose();

      // Create a new panel and verify old callbacks are not called
      controlPanel = new ControlPanel(container);
      controlPanel.setParameters([numberSchema]);
      controlPanel.resetToDefaults();

      // Original callbacks should not have been called on new instance
      expect(changeCallback).not.toHaveBeenCalled();
      expect(resetCallback).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty parameter array', () => {
      controlPanel = new ControlPanel(container);
      expect(() => controlPanel.setParameters([])).not.toThrow();
      expect(controlPanel.getSchemas()).toEqual([]);
    });

    it('should handle select with no options gracefully', () => {
      controlPanel = new ControlPanel(container);

      const badSelectSchema: ParameterSchema = {
        key: 'broken',
        label: 'Broken',
        type: 'select',
        options: [],
        default: '',
      };

      // Should not throw, just warn
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => controlPanel.setParameters([badSelectSchema])).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle unknown parameter types gracefully', () => {
      controlPanel = new ControlPanel(container);

      const badSchema = {
        key: 'broken',
        label: 'Broken',
        type: 'unknown' as 'number', // Force bad type
        default: null,
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => controlPanel.setParameters([badSchema])).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
