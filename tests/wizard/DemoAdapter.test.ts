/**
 * DemoAdapter Unit Tests
 *
 * Tests the DemoAdapter implementation against story-018 acceptance criteria:
 * - AC1: Adapter can load any demo type
 * - AC2: Adapter forwards parameter changes
 * - AC3: Adapter can reset the demo
 * - AC4: Adapter provides scene objects
 * - AC5: Adapter manages demo lifecycle
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Object3D } from 'three';
import { DemoAdapter } from '../../src/wizard/DemoAdapter';
import type { DemoFactory, DemoAdapterEventData } from '../../src/wizard/DemoAdapter';
import type { Demo, InputState, ParameterSchema } from '../../src/types';
import { DemoType } from '../../src/types';
import type { WizardStep } from '../../src/wizard/types';
import { ComplexityTier } from '../../src/wizard/types';

// Mock Demo implementation for testing
function createMockDemo(): Demo & {
  startCalled: boolean;
  stopCalled: boolean;
  resetCalled: boolean;
  updateCalls: number[];
  inputCalls: InputState[];
  parameterCalls: Array<{ key: string; value: unknown }>;
} {
  const sceneObject = new Object3D();
  return {
    startCalled: false,
    stopCalled: false,
    resetCalled: false,
    updateCalls: [],
    inputCalls: [],
    parameterCalls: [],

    start() {
      this.startCalled = true;
    },
    stop() {
      this.stopCalled = true;
    },
    reset() {
      this.resetCalled = true;
    },
    update(deltaTime: number) {
      this.updateCalls.push(deltaTime);
    },
    onInput(state: InputState) {
      this.inputCalls.push(state);
    },
    getParameterSchema(): ParameterSchema[] {
      return [{ key: 'testParam', label: 'Test', type: 'number', default: 0 }];
    },
    setParameter(key: string, value: unknown) {
      this.parameterCalls.push({ key, value });
    },
    getSceneObjects(): Object3D[] {
      return [sceneObject];
    },
  };
}

// Helper to create a mock WizardStep
function createMockStep(demoType: DemoType): WizardStep {
  return {
    id: `test-step-${demoType}`,
    title: 'Test Step',
    tier: ComplexityTier.Micro,
    demoType,
    description: 'Test description',
    learningObjectives: ['Learn something'],
    codeSnippets: [],
    annotations: [],
    order: 1,
  };
}

// Mock InputState
function createMockInputState(): InputState {
  return {
    mouseX: 0,
    mouseY: 0,
    mouseWorldX: 0,
    mouseWorldY: 0,
    isMouseDown: false,
    deltaX: 0,
    deltaY: 0,
  };
}

describe('DemoAdapter', () => {
  let adapter: DemoAdapter;
  let mockDemos: Map<DemoType, ReturnType<typeof createMockDemo>>;
  let demoFactories: Map<DemoType, DemoFactory>;

  beforeEach(() => {
    mockDemos = new Map();

    // Create factories that track created demos
    demoFactories = new Map<DemoType, DemoFactory>([
      [
        DemoType.Particles,
        () => {
          const demo = createMockDemo();
          mockDemos.set(DemoType.Particles, demo);
          return demo;
        },
      ],
      [
        DemoType.Objects,
        () => {
          const demo = createMockDemo();
          mockDemos.set(DemoType.Objects, demo);
          return demo;
        },
      ],
      [
        DemoType.Fluid,
        () => {
          const demo = createMockDemo();
          mockDemos.set(DemoType.Fluid, demo);
          return demo;
        },
      ],
      [
        DemoType.Combined,
        () => {
          const demo = createMockDemo();
          mockDemos.set(DemoType.Combined, demo);
          return demo;
        },
      ],
    ]);

    adapter = new DemoAdapter(demoFactories);
  });

  afterEach(() => {
    adapter.dispose();
  });

  describe('AC1: Adapter can load any demo type', () => {
    it('should load particle demo', () => {
      const step = createMockStep(DemoType.Particles);

      adapter.loadDemoForStep(step);

      expect(adapter.getCurrentDemoType()).toBe(DemoType.Particles);
      expect(adapter.getCurrentDemo()).not.toBeNull();
    });

    it('should load object demo', () => {
      const step = createMockStep(DemoType.Objects);

      adapter.loadDemoForStep(step);

      expect(adapter.getCurrentDemoType()).toBe(DemoType.Objects);
    });

    it('should load fluid demo', () => {
      const step = createMockStep(DemoType.Fluid);

      adapter.loadDemoForStep(step);

      expect(adapter.getCurrentDemoType()).toBe(DemoType.Fluid);
    });

    it('should load combined demo', () => {
      const step = createMockStep(DemoType.Combined);

      adapter.loadDemoForStep(step);

      expect(adapter.getCurrentDemoType()).toBe(DemoType.Combined);
    });

    it('should start the demo after loading', () => {
      const step = createMockStep(DemoType.Particles);

      adapter.loadDemoForStep(step);

      const demo = mockDemos.get(DemoType.Particles);
      expect(demo?.startCalled).toBe(true);
    });

    it('should throw error for unregistered demo type', () => {
      // Create adapter with only particles
      const limitedAdapter = new DemoAdapter(
        new Map([[DemoType.Particles, () => createMockDemo()]])
      );

      const step = createMockStep(DemoType.Fluid);

      expect(() => limitedAdapter.loadDemoForStep(step)).toThrow(
        /No factory registered for demo type/
      );

      limitedAdapter.dispose();
    });

    it('should emit demoLoaded event', () => {
      const listener = vi.fn();
      adapter.on('demoLoaded', listener);

      const step = createMockStep(DemoType.Particles);
      adapter.loadDemoForStep(step);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'demoLoaded',
          demoType: DemoType.Particles,
        })
      );
    });
  });

  describe('AC2: Adapter forwards parameter changes', () => {
    it('should forward parameter to active demo', () => {
      const step = createMockStep(DemoType.Particles);
      adapter.loadDemoForStep(step);

      adapter.setParameter('testParam', 42);

      const demo = mockDemos.get(DemoType.Particles);
      expect(demo?.parameterCalls).toContainEqual({ key: 'testParam', value: 42 });
    });

    it('should forward multiple parameter changes', () => {
      const step = createMockStep(DemoType.Particles);
      adapter.loadDemoForStep(step);

      adapter.setParameter('param1', 10);
      adapter.setParameter('param2', 'value');
      adapter.setParameter('param3', true);

      const demo = mockDemos.get(DemoType.Particles);
      expect(demo?.parameterCalls).toHaveLength(3);
    });

    it('should handle setParameter when no demo loaded', () => {
      // Should not throw, just warn
      expect(() => adapter.setParameter('test', 123)).not.toThrow();
    });

    it('should forward parameters to new demo after switch', () => {
      // Load first demo
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      adapter.setParameter('beforeSwitch', 1);

      // Switch to new demo
      adapter.loadDemoForStep(createMockStep(DemoType.Objects));
      adapter.setParameter('afterSwitch', 2);

      const objectsDemo = mockDemos.get(DemoType.Objects);
      expect(objectsDemo?.parameterCalls).toContainEqual({ key: 'afterSwitch', value: 2 });
      expect(objectsDemo?.parameterCalls).not.toContainEqual({ key: 'beforeSwitch', value: 1 });
    });
  });

  describe('AC3: Adapter can reset the demo', () => {
    it('should reset active demo', () => {
      const step = createMockStep(DemoType.Particles);
      adapter.loadDemoForStep(step);

      adapter.resetDemo();

      const demo = mockDemos.get(DemoType.Particles);
      expect(demo?.resetCalled).toBe(true);
    });

    it('should handle reset when no demo loaded', () => {
      expect(() => adapter.resetDemo()).not.toThrow();
    });

    it('should reset same demo type instead of reloading', () => {
      const step = createMockStep(DemoType.Particles);

      adapter.loadDemoForStep(step);
      const firstDemo = mockDemos.get(DemoType.Particles);
      firstDemo!.resetCalled = false; // Reset the flag

      // Loading same demo type again should reset, not create new
      adapter.loadDemoForStep(step);

      // Same demo instance should be reset
      expect(firstDemo?.resetCalled).toBe(true);
      // Should still be the same demo type
      expect(adapter.getCurrentDemoType()).toBe(DemoType.Particles);
    });
  });

  describe('AC4: Adapter provides scene objects', () => {
    it('should return scene objects from active demo', () => {
      const step = createMockStep(DemoType.Particles);
      adapter.loadDemoForStep(step);

      const objects = adapter.getSceneObjects();

      expect(objects).toHaveLength(1);
      expect(objects[0]).toBeInstanceOf(Object3D);
    });

    it('should return empty array when no demo loaded', () => {
      const objects = adapter.getSceneObjects();

      expect(objects).toEqual([]);
    });

    it('should return new demo objects after switch', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      const particleObjects = adapter.getSceneObjects();

      adapter.loadDemoForStep(createMockStep(DemoType.Objects));
      const objectObjects = adapter.getSceneObjects();

      // Should be different object instances
      expect(objectObjects).not.toBe(particleObjects);
      expect(objectObjects).toHaveLength(1);
    });
  });

  describe('AC5: Adapter manages demo lifecycle', () => {
    it('should stop previous demo when switching', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      const particleDemo = mockDemos.get(DemoType.Particles);

      adapter.loadDemoForStep(createMockStep(DemoType.Objects));

      expect(particleDemo?.stopCalled).toBe(true);
    });

    it('should emit demoUnloaded event when switching', () => {
      const listener = vi.fn();
      adapter.on('demoUnloaded', listener);

      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      adapter.loadDemoForStep(createMockStep(DemoType.Objects));

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'demoUnloaded',
          demoType: DemoType.Particles,
        })
      );
    });

    it('should cleanup on dispose', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      const demo = mockDemos.get(DemoType.Particles);

      adapter.dispose();

      expect(demo?.stopCalled).toBe(true);
      expect(adapter.getCurrentDemo()).toBeNull();
      expect(adapter.getCurrentDemoType()).toBeNull();
    });

    it('should handle rapid demo switching', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      adapter.loadDemoForStep(createMockStep(DemoType.Objects));
      adapter.loadDemoForStep(createMockStep(DemoType.Fluid));
      adapter.loadDemoForStep(createMockStep(DemoType.Combined));

      expect(adapter.getCurrentDemoType()).toBe(DemoType.Combined);

      // Previous demos should all be stopped
      const particleDemo = mockDemos.get(DemoType.Particles);
      const objectDemo = mockDemos.get(DemoType.Objects);
      const fluidDemo = mockDemos.get(DemoType.Fluid);

      expect(particleDemo?.stopCalled).toBe(true);
      expect(objectDemo?.stopCalled).toBe(true);
      expect(fluidDemo?.stopCalled).toBe(true);
    });

    it('should unload demo explicitly', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      const demo = mockDemos.get(DemoType.Particles);

      adapter.unloadCurrentDemo();

      expect(demo?.stopCalled).toBe(true);
      expect(adapter.getCurrentDemo()).toBeNull();
      expect(adapter.hasDemo()).toBe(false);
    });
  });

  describe('Update and Input Forwarding', () => {
    it('should forward update calls', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));

      adapter.update(0.016);
      adapter.update(0.017);

      const demo = mockDemos.get(DemoType.Particles);
      expect(demo?.updateCalls).toEqual([0.016, 0.017]);
    });

    it('should handle update when no demo loaded', () => {
      expect(() => adapter.update(0.016)).not.toThrow();
    });

    it('should forward input calls', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      const inputState = createMockInputState();
      inputState.mouseX = 100;

      adapter.onInput(inputState);

      const demo = mockDemos.get(DemoType.Particles);
      expect(demo?.inputCalls).toContainEqual(expect.objectContaining({ mouseX: 100 }));
    });

    it('should handle input when no demo loaded', () => {
      expect(() => adapter.onInput(createMockInputState())).not.toThrow();
    });
  });

  describe('Helper Methods', () => {
    it('hasDemo should return correct state', () => {
      expect(adapter.hasDemo()).toBe(false);

      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      expect(adapter.hasDemo()).toBe(true);

      adapter.unloadCurrentDemo();
      expect(adapter.hasDemo()).toBe(false);
    });

    it('supportsDemoType should check factory registration', () => {
      expect(adapter.supportsDemoType(DemoType.Particles)).toBe(true);
      expect(adapter.supportsDemoType(DemoType.Objects)).toBe(true);

      // Create limited adapter
      const limitedAdapter = new DemoAdapter(
        new Map([[DemoType.Particles, () => createMockDemo()]])
      );
      expect(limitedAdapter.supportsDemoType(DemoType.Particles)).toBe(true);
      expect(limitedAdapter.supportsDemoType(DemoType.Fluid)).toBe(false);
      limitedAdapter.dispose();
    });

    it('getSupportedDemoTypes should return all registered types', () => {
      const types = adapter.getSupportedDemoTypes();

      expect(types).toContain(DemoType.Particles);
      expect(types).toContain(DemoType.Objects);
      expect(types).toContain(DemoType.Fluid);
      expect(types).toContain(DemoType.Combined);
      expect(types).toHaveLength(4);
    });
  });

  describe('Event Handling', () => {
    it('should allow adding and removing listeners', () => {
      const listener = vi.fn();

      adapter.on('demoLoaded', listener);
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));
      expect(listener).toHaveBeenCalledTimes(1);

      adapter.off('demoLoaded', listener);
      adapter.loadDemoForStep(createMockStep(DemoType.Objects));
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should emit error event on factory failure', () => {
      const errorFactory = () => {
        throw new Error('Factory failed');
      };
      const errorAdapter = new DemoAdapter(
        new Map([[DemoType.Particles, errorFactory]])
      );
      const errorListener = vi.fn();
      errorAdapter.on('error', errorListener);

      expect(() =>
        errorAdapter.loadDemoForStep(createMockStep(DemoType.Particles))
      ).toThrow('Factory failed');

      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'error',
          demoType: DemoType.Particles,
          error: expect.any(Error),
        })
      );

      errorAdapter.dispose();
    });
  });

  describe('Edge Cases', () => {
    it('should handle dispose being called multiple times', () => {
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));

      expect(() => {
        adapter.dispose();
        adapter.dispose();
        adapter.dispose();
      }).not.toThrow();
    });

    it('should warn when loading after dispose', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      adapter.dispose();
      adapter.loadDemoForStep(createMockStep(DemoType.Particles));

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('adapter is disposed')
      );

      consoleSpy.mockRestore();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = () => {
        throw new Error('Listener error');
      };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      adapter.on('demoLoaded', errorListener);

      // Should not throw despite listener error
      expect(() =>
        adapter.loadDemoForStep(createMockStep(DemoType.Particles))
      ).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
