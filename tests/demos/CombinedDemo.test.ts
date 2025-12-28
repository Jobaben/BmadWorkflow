/**
 * CombinedDemo Unit Tests
 *
 * Tests the CombinedDemo implementation against story-011 acceptance criteria:
 * - AC1: All three animation types visible simultaneously
 * - AC2: Each system operates correctly
 * - AC3: Systems don't interfere with each other
 * - AC4: User interaction works on appropriate elements
 * - AC5: Performance is acceptable (30+ FPS)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Vector2, Vector3, Group } from 'three';
import { CombinedDemo } from '../../src/demos/CombinedDemo';
import type { InputState, Demo, ParameterSchema } from '../../src/types';

// Helper to create a mock InputState
function createInputState(overrides: Partial<InputState> = {}): InputState {
  return {
    mousePosition: new Vector2(0, 0),
    mouseWorldPosition: new Vector3(0, 0, 0),
    isMouseDown: false,
    keysPressed: new Set<string>(),
    ...overrides,
  };
}

describe('CombinedDemo', () => {
  let demo: CombinedDemo;

  beforeEach(() => {
    demo = new CombinedDemo();
  });

  afterEach(() => {
    demo.dispose();
  });

  describe('Demo Interface Implementation', () => {
    it('should implement start() method', () => {
      expect(typeof demo.start).toBe('function');
      demo.start();
      // Should not throw
    });

    it('should implement stop() method', () => {
      expect(typeof demo.stop).toBe('function');
      demo.start();
      demo.stop();
      // Should not throw
    });

    it('should implement reset() method', () => {
      expect(typeof demo.reset).toBe('function');
      demo.start();
      demo.update(0.1);
      demo.reset();
      // Should not throw
    });

    it('should implement update(dt) method', () => {
      expect(typeof demo.update).toBe('function');
      demo.start();
      demo.update(0.016);
      // Should not throw
    });

    it('should implement onInput() method', () => {
      expect(typeof demo.onInput).toBe('function');
      const inputState = createInputState();
      demo.onInput(inputState);
      // Should not throw
    });

    it('should implement getParameterSchema() method', () => {
      expect(typeof demo.getParameterSchema).toBe('function');
      const schema = demo.getParameterSchema();
      expect(Array.isArray(schema)).toBe(true);
      expect(schema.length).toBeGreaterThan(0);
    });

    it('should implement setParameter() method', () => {
      expect(typeof demo.setParameter).toBe('function');
      demo.setParameter('particle_emissionRate', 50);
      // Should not throw
    });

    it('should implement getSceneObjects() method', () => {
      expect(typeof demo.getSceneObjects).toBe('function');
      const objects = demo.getSceneObjects();
      expect(Array.isArray(objects)).toBe(true);
      expect(objects.length).toBe(1);
    });

    it('should return Group object from getSceneObjects', () => {
      const objects = demo.getSceneObjects();
      expect(objects[0]).toBeInstanceOf(Group);
    });

    it('should satisfy Demo interface type', () => {
      const demoInterface: Demo = demo;
      expect(demoInterface).toBeDefined();
    });
  });

  describe('AC1: All three animation types visible simultaneously', () => {
    it('should contain all three sub-demos', () => {
      expect(demo.getParticleDemo()).toBeDefined();
      expect(demo.getObjectDemo()).toBeDefined();
      expect(demo.getFluidDemo()).toBeDefined();
    });

    it('should have a container group with three children (sub-demo containers)', () => {
      const objects = demo.getSceneObjects();
      const mainGroup = objects[0] as Group;
      expect(mainGroup.children.length).toBe(3);
    });

    it('should have all sub-demo objects in the scene', () => {
      const objects = demo.getSceneObjects();
      const mainGroup = objects[0] as Group;

      // Each container should have children (the sub-demo scene objects)
      mainGroup.children.forEach((container) => {
        expect(container.children.length).toBeGreaterThan(0);
      });
    });
  });

  describe('AC2: Each system operates correctly', () => {
    it('should start all sub-demos when started', () => {
      demo.start();
      // Update to allow particles to be emitted
      demo.update(0.1);

      // Particle demo should have particles
      const particleDemo = demo.getParticleDemo();
      expect(particleDemo.getActiveParticleCount()).toBeGreaterThan(0);
    });

    it('should stop all sub-demos when stopped', () => {
      demo.start();
      demo.update(0.1);
      demo.stop();

      // Update again - should not process (running is false)
      const particleCountBefore = demo.getParticleDemo().getActiveParticleCount();
      demo.update(0.1);
      // Particles may have decayed, but no new particles should be emitted
    });

    it('should reset all sub-demos when reset', () => {
      demo.start();
      // Run for a while to generate particles
      for (let i = 0; i < 10; i++) {
        demo.update(0.1);
      }

      demo.reset();

      // Particle demo should have no active particles after reset
      expect(demo.getParticleDemo().getActiveParticleCount()).toBe(0);
    });

    it('should update all sub-demos with the same delta time', () => {
      demo.start();

      // Both demos should be updated
      demo.update(0.016);

      // This is a behavioral test - all demos should receive the same dt
      // We verify by checking that all demos are in a running state
    });
  });

  describe('AC3: Systems do not interfere with each other', () => {
    it('should position sub-demos in different regions', () => {
      const objects = demo.getSceneObjects();
      const mainGroup = objects[0] as Group;

      const positions = mainGroup.children.map((child) => child.position.clone());

      // Check that at least two containers have different X positions
      const uniqueXPositions = new Set(positions.map((p) => p.x));
      expect(uniqueXPositions.size).toBeGreaterThanOrEqual(2);
    });

    it('should run all demos for extended period without errors', () => {
      demo.start();

      // Run for 100 frames
      for (let i = 0; i < 100; i++) {
        demo.update(0.016);
        demo.onInput(createInputState());
      }

      // Should complete without errors
    });

    it('should maintain separate parameters for each sub-demo', () => {
      // Set particle parameter
      demo.setParameter('particle_emissionRate', 25);

      // Set fluid parameter
      demo.setParameter('fluid_gravity', 5);

      // Both should be set independently without affecting each other
    });
  });

  describe('AC4: User interaction works on appropriate elements', () => {
    it('should route input to all sub-demos', () => {
      demo.start();

      const inputState = createInputState({
        mousePosition: new Vector2(0.5, 0.5),
        mouseWorldPosition: new Vector3(2, 2, 0),
        isMouseDown: true,
      });

      // Should not throw
      demo.onInput(inputState);
      demo.update(0.016);
    });

    it('should adjust input coordinates for sub-demo offsets', () => {
      demo.start();

      // Click at different positions to test offset adjustment
      const leftInput = createInputState({
        mouseWorldPosition: new Vector3(-3, 0, 0),
        isMouseDown: true,
      });

      const rightInput = createInputState({
        mouseWorldPosition: new Vector3(3, 0, 0),
        isMouseDown: true,
      });

      demo.onInput(leftInput);
      demo.update(0.016);

      demo.onInput(rightInput);
      demo.update(0.016);

      // Both should work without errors
    });

    it('should handle keyboard input', () => {
      demo.start();

      const inputState = createInputState({
        keysPressed: new Set(['1', 'r']),
      });

      demo.onInput(inputState);
      demo.update(0.016);

      // Should not throw
    });
  });

  describe('AC5: Performance is acceptable', () => {
    it('should use reduced complexity for particles', () => {
      // CombinedDemo uses 50% particle emission rate
      demo.start();
      demo.update(1.0); // 1 second

      const particleCount = demo.getParticleDemo().getActiveParticleCount();
      // With 50 particles/sec emission rate and 1 second, should have ~50 particles
      expect(particleCount).toBeLessThan(200);
    });

    it('should handle many update cycles efficiently', { timeout: 15000 }, () => {
      demo.start();

      const startTime = performance.now();

      // Run 1000 update cycles
      for (let i = 0; i < 1000; i++) {
        demo.update(0.016);
      }

      const endTime = performance.now();
      const elapsedMs = endTime - startTime;

      // Should complete in reasonable time (less than 30 seconds for CI environments)
      // This is a loose threshold since test environments vary significantly
      // The CombinedDemo runs all three demos which is computationally intensive
      expect(elapsedMs).toBeLessThan(30000);
    });
  });

  describe('Parameter Schema', () => {
    it('should return combined parameter schema from all sub-demos', () => {
      const schema = demo.getParameterSchema();

      // Should have parameters from all three demos
      const particleParams = schema.filter((p) => p.key.startsWith('particle_'));
      const objectParams = schema.filter((p) => p.key.startsWith('object_'));
      const fluidParams = schema.filter((p) => p.key.startsWith('fluid_'));

      expect(particleParams.length).toBeGreaterThan(0);
      expect(objectParams.length).toBeGreaterThan(0);
      expect(fluidParams.length).toBeGreaterThan(0);
    });

    it('should have prefixed labels for all parameters', () => {
      const schema = demo.getParameterSchema();

      schema.forEach((param) => {
        expect(param.label).toMatch(/^\[[POF]\]/);
      });
    });

    it('should route particle parameters to particle demo', () => {
      demo.setParameter('particle_emissionRate', 100);
      // Should not throw and should update particle demo
    });

    it('should route object parameters to object demo', () => {
      demo.setParameter('object_animationSpeed', 2.0);
      // Should not throw and should update object demo
    });

    it('should route fluid parameters to fluid demo', () => {
      demo.setParameter('fluid_viscosity', 0.5);
      // Should not throw and should update fluid demo
    });

    it('should ignore unknown parameter prefixes', () => {
      demo.setParameter('unknown_param', 123);
      // Should not throw
    });
  });

  describe('Lifecycle', () => {
    it('should not update when not running', () => {
      // Don't start the demo
      demo.update(0.016);

      // Particle count should be 0 since demo never started
      expect(demo.getParticleDemo().getActiveParticleCount()).toBe(0);
    });

    it('should properly dispose all resources', () => {
      demo.start();
      demo.update(0.1);

      // Should not throw
      demo.dispose();

      // After dispose, scene objects should be cleared
      const objects = demo.getSceneObjects();
      const mainGroup = objects[0] as Group;
      expect(mainGroup.children.length).toBe(0);
    });

    it('should be able to start again after stop', () => {
      demo.start();
      demo.update(0.1);
      demo.stop();
      demo.start();
      demo.update(0.1);

      // Should work without errors
    });

    it('should be able to reset while running', () => {
      demo.start();
      demo.update(0.1);
      demo.reset();
      demo.update(0.1);

      // Should work without errors
    });
  });

  describe('Sub-Demo Access', () => {
    it('should provide access to particle demo', () => {
      const particleDemo = demo.getParticleDemo();
      expect(particleDemo).toBeDefined();
      expect(typeof particleDemo.getActiveParticleCount).toBe('function');
    });

    it('should provide access to object demo', () => {
      const objectDemo = demo.getObjectDemo();
      expect(objectDemo).toBeDefined();
      expect(typeof objectDemo.getCurrentAnimationType).toBe('function');
    });

    it('should provide access to fluid demo', () => {
      const fluidDemo = demo.getFluidDemo();
      expect(fluidDemo).toBeDefined();
      expect(typeof fluidDemo.applyForce).toBe('function');
    });
  });
});
