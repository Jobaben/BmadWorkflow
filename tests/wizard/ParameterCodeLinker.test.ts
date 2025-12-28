/**
 * ParameterCodeLinker Unit Tests
 *
 * Tests the ParameterCodeLinker implementation against story-020 acceptance criteria:
 * - AC1: Parameter controls show code variable names (via bindings)
 * - AC2: Adjusting parameter highlights related code
 * - AC3: Hovering parameter shows code location (via focus)
 * - AC4: Visual effect changes in real-time (via adapter)
 * - AC5: Parameter explanation is visible (via bindings)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ParameterCodeLinker } from '../../src/wizard/ParameterCodeLinker';
import type { ParameterBinding, CodeSnippetRef } from '../../src/wizard/types';
import type { LearningPanel } from '../../src/wizard-ui/LearningPanel';
import type { DemoAdapter } from '../../src/wizard/DemoAdapter';

// Helper to create mock parameter binding
function createMockBinding(key: string): ParameterBinding {
  const codeLocation: CodeSnippetRef = {
    id: `snippet-${key}`,
    sourceFile: 'demos/test.ts',
    startLine: 10,
    endLine: 15,
  };

  return {
    parameterKey: key,
    codeLocation,
    variableName: `this.params.${key}`,
    explanation: `Controls the ${key} setting`,
  };
}

// Create mock dependencies
function createMocks() {
  const mockPanel = {
    highlightParameter: vi.fn(),
  };

  const mockAdapter = {
    setParameter: vi.fn(),
  };

  return {
    panel: mockPanel as unknown as LearningPanel,
    adapter: mockAdapter as unknown as DemoAdapter,
    mockPanel,
    mockAdapter,
  };
}

describe('ParameterCodeLinker', () => {
  let linker: ParameterCodeLinker;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
    linker = new ParameterCodeLinker(mocks.panel, mocks.adapter);
  });

  describe('AC1/AC5: Parameter bindings with variable names and explanations', () => {
    it('should store parameter bindings', () => {
      const bindings = [
        createMockBinding('emissionRate'),
        createMockBinding('particleSpeed'),
      ];

      linker.setBindings(bindings);

      expect(linker.getBindings()).toHaveLength(2);
    });

    it('should retrieve binding by key', () => {
      const bindings = [createMockBinding('emissionRate')];
      linker.setBindings(bindings);

      const binding = linker.getBinding('emissionRate');

      expect(binding).toBeDefined();
      expect(binding?.variableName).toBe('this.params.emissionRate');
      expect(binding?.explanation).toBe('Controls the emissionRate setting');
    });

    it('should return undefined for non-existent binding', () => {
      linker.setBindings([createMockBinding('emissionRate')]);

      expect(linker.getBinding('nonExistent')).toBeUndefined();
    });

    it('should check if binding exists', () => {
      linker.setBindings([createMockBinding('emissionRate')]);

      expect(linker.hasBinding('emissionRate')).toBe(true);
      expect(linker.hasBinding('nonExistent')).toBe(false);
    });

    it('should clear bindings when new ones are set', () => {
      linker.setBindings([createMockBinding('first')]);
      linker.setBindings([createMockBinding('second')]);

      expect(linker.hasBinding('first')).toBe(false);
      expect(linker.hasBinding('second')).toBe(true);
    });

    it('should handle undefined bindings', () => {
      linker.setBindings(undefined);

      expect(linker.getBindings()).toHaveLength(0);
    });
  });

  describe('AC2/AC3: Code highlighting on focus', () => {
    it('should highlight code on parameter focus', () => {
      linker.setBindings([createMockBinding('emissionRate')]);

      linker.onParameterFocus('emissionRate');

      expect(mocks.mockPanel.highlightParameter).toHaveBeenCalledWith('emissionRate');
    });

    it('should track focused parameter', () => {
      linker.setBindings([createMockBinding('emissionRate')]);

      expect(linker.getFocusedParameter()).toBeNull();

      linker.onParameterFocus('emissionRate');

      expect(linker.getFocusedParameter()).toBe('emissionRate');
    });

    it('should clear focused parameter on blur', () => {
      linker.setBindings([createMockBinding('emissionRate')]);
      linker.onParameterFocus('emissionRate');

      linker.onParameterBlur('emissionRate');

      expect(linker.getFocusedParameter()).toBeNull();
    });

    it('should emit parameterFocus event', () => {
      const callback = vi.fn();
      linker.on(callback);
      linker.setBindings([createMockBinding('emissionRate')]);

      linker.onParameterFocus('emissionRate');

      expect(callback).toHaveBeenCalledWith({
        event: 'parameterFocus',
        key: 'emissionRate',
        binding: expect.objectContaining({ parameterKey: 'emissionRate' }),
      });
    });

    it('should emit parameterBlur event', () => {
      const callback = vi.fn();
      linker.on(callback);
      linker.setBindings([createMockBinding('emissionRate')]);

      linker.onParameterBlur('emissionRate');

      expect(callback).toHaveBeenCalledWith({
        event: 'parameterBlur',
        key: 'emissionRate',
        binding: expect.objectContaining({ parameterKey: 'emissionRate' }),
      });
    });
  });

  describe('AC2/AC4: Parameter change updates demo and highlights code', () => {
    it('should forward parameter change to adapter', () => {
      linker.setBindings([createMockBinding('emissionRate')]);

      linker.onParameterChange('emissionRate', 75);

      expect(mocks.mockAdapter.setParameter).toHaveBeenCalledWith('emissionRate', 75);
    });

    it('should highlight code on parameter change', () => {
      linker.setBindings([createMockBinding('emissionRate')]);

      linker.onParameterChange('emissionRate', 75);

      expect(mocks.mockPanel.highlightParameter).toHaveBeenCalledWith('emissionRate');
    });

    it('should emit parameterChange event', () => {
      const callback = vi.fn();
      linker.on(callback);
      linker.setBindings([createMockBinding('emissionRate')]);

      linker.onParameterChange('emissionRate', 75);

      expect(callback).toHaveBeenCalledWith({
        event: 'parameterChange',
        key: 'emissionRate',
        value: 75,
        binding: expect.objectContaining({ parameterKey: 'emissionRate' }),
      });
    });

    it('should handle parameter change for unknown binding', () => {
      linker.setBindings([]);

      // Should not throw
      linker.onParameterChange('unknown', 50);

      expect(mocks.mockAdapter.setParameter).toHaveBeenCalledWith('unknown', 50);
    });
  });

  describe('Direct code highlighting', () => {
    it('should highlight code for parameter with binding', () => {
      linker.setBindings([createMockBinding('emissionRate')]);

      linker.highlightCodeForParameter('emissionRate');

      expect(mocks.mockPanel.highlightParameter).toHaveBeenCalledWith('emissionRate');
    });

    it('should not highlight for parameter without binding', () => {
      linker.setBindings([]);

      linker.highlightCodeForParameter('unknown');

      expect(mocks.mockPanel.highlightParameter).not.toHaveBeenCalled();
    });
  });

  describe('Event callbacks', () => {
    it('should register callback', () => {
      const callback = vi.fn();
      linker.on(callback);
      linker.setBindings([createMockBinding('test')]);

      linker.onParameterFocus('test');

      expect(callback).toHaveBeenCalled();
    });

    it('should remove callback', () => {
      const callback = vi.fn();
      linker.on(callback);
      linker.off(callback);
      linker.setBindings([createMockBinding('test')]);

      linker.onParameterFocus('test');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = () => {
        throw new Error('Callback error');
      };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      linker.on(errorCallback);
      linker.setBindings([createMockBinding('test')]);

      expect(() => linker.onParameterFocus('test')).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Dispose', () => {
    it('should clean up on dispose', () => {
      linker.setBindings([createMockBinding('test')]);
      linker.onParameterFocus('test');

      linker.dispose();

      expect(linker.getBindings()).toHaveLength(0);
      expect(linker.getFocusedParameter()).toBeNull();
    });

    it('should ignore operations after dispose', () => {
      linker.dispose();

      linker.onParameterFocus('test');
      linker.onParameterChange('test', 50);

      expect(mocks.mockPanel.highlightParameter).not.toHaveBeenCalled();
      expect(mocks.mockAdapter.setParameter).not.toHaveBeenCalled();
    });

    it('should handle double dispose', () => {
      expect(() => {
        linker.dispose();
        linker.dispose();
      }).not.toThrow();
    });
  });
});
