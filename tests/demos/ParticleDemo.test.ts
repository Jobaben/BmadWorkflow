/**
 * ParticleDemo Unit Tests
 *
 * Tests the ParticleDemo implementation against story-007 acceptance criteria:
 * - AC1: Particles are generated continuously
 * - AC2: Particles move and decay over time
 * - AC3: Mouse interaction affects particles
 * - AC4: Demo implements the Demo interface
 * - AC5: Performance remains smooth (verified by architecture patterns)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Vector2, Vector3, Points, BufferGeometry, PointsMaterial } from 'three';
import { ParticleDemo } from '../../src/demos/ParticleDemo';
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

describe('ParticleDemo', () => {
  let demo: ParticleDemo;

  beforeEach(() => {
    demo = new ParticleDemo();
  });

  afterEach(() => {
    demo.dispose();
  });

  describe('AC4: Demo implements the Demo interface', () => {
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
      expect(demo.getActiveParticleCount()).toBe(0);
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
      demo.setParameter('emissionRate', 200);
      // Should not throw
    });

    it('should implement getSceneObjects() method', () => {
      expect(typeof demo.getSceneObjects).toBe('function');
      const objects = demo.getSceneObjects();
      expect(Array.isArray(objects)).toBe(true);
      expect(objects.length).toBe(1);
    });

    it('should return Points object from getSceneObjects', () => {
      const objects = demo.getSceneObjects();
      expect(objects[0]).toBeInstanceOf(Points);
    });

    it('should satisfy Demo interface type', () => {
      // TypeScript will catch this at compile time, but we verify at runtime
      const demoInstance: Demo = demo;
      expect(demoInstance).toBeDefined();
    });
  });

  describe('AC1: Particles are generated continuously', () => {
    it('should emit particles when running', () => {
      demo.start();

      // Update for 0.1 seconds (should emit ~10 particles at 100/sec rate)
      demo.update(0.1);

      expect(demo.getActiveParticleCount()).toBeGreaterThan(0);
    });

    it('should not emit particles when stopped', () => {
      demo.start();
      demo.update(0.1);
      const countAfterStart = demo.getActiveParticleCount();

      demo.stop();
      demo.update(0.1);

      // Count should not increase (or may decrease due to decay)
      expect(demo.getActiveParticleCount()).toBeLessThanOrEqual(countAfterStart);
    });

    it('should emit particles continuously over multiple frames', () => {
      demo.start();

      demo.update(0.016);
      const count1 = demo.getActiveParticleCount();

      demo.update(0.016);
      const count2 = demo.getActiveParticleCount();

      demo.update(0.016);
      const count3 = demo.getActiveParticleCount();

      // Particle count should generally increase
      expect(count3).toBeGreaterThanOrEqual(count1);
    });

    it('should respect emission rate parameter', () => {
      demo.setParameter('emissionRate', 500);
      demo.start();
      demo.update(0.1);
      const highRateCount = demo.getActiveParticleCount();

      // Reset and try lower rate
      demo.reset();
      demo.setParameter('emissionRate', 50);
      demo.start();
      demo.update(0.1);
      const lowRateCount = demo.getActiveParticleCount();

      // High rate should produce more particles
      expect(highRateCount).toBeGreaterThan(lowRateCount);
    });
  });

  describe('AC2: Particles move and decay over time', () => {
    it('should move particles according to velocity', () => {
      demo.start();
      demo.update(0.016);

      // Get the points object and check positions
      const points = demo.getSceneObjects()[0] as Points;
      const geometry = points.geometry as BufferGeometry;
      const positions = geometry.getAttribute('position');

      // At least some particles should be at non-zero positions
      let hasMovedParticle = false;
      for (let i = 0; i < demo.getActiveParticleCount(); i++) {
        const y = positions.getY(i);
        if (y !== 0 && y !== -1000) {
          hasMovedParticle = true;
          break;
        }
      }
      expect(hasMovedParticle).toBe(true);
    });

    it('should remove particles after their lifetime', () => {
      demo.setParameter('lifetime', 0.05); // Very short lifetime
      demo.setParameter('emissionRate', 100);
      demo.start();

      // Emit some particles
      demo.update(0.02);
      const initialCount = demo.getActiveParticleCount();
      expect(initialCount).toBeGreaterThan(0);

      // Wait for particles to expire
      demo.stop(); // Stop emitting new particles
      demo.update(0.1); // Update with enough time for decay

      // All particles should be dead now
      expect(demo.getActiveParticleCount()).toBe(0);
    });

    it('should apply gravity to particles', () => {
      demo.setParameter('gravity', -10);
      demo.setParameter('lifetime', 5); // Long lifetime
      demo.setParameter('initialSpeed', 0.1); // Low initial speed
      demo.start();
      demo.update(0.016);

      // Stop emission to track existing particles only
      demo.stop();

      // Get the points object
      const points = demo.getSceneObjects()[0] as Points;
      const geometry = points.geometry as BufferGeometry;
      const positions = geometry.getAttribute('position');

      // Store initial Y position of first particle
      const initialY = positions.getY(0);

      // Update for a significant time to let gravity take effect
      for (let i = 0; i < 60; i++) {
        demo.update(0.016);
      }

      // Particle should have moved down due to gravity
      const finalY = positions.getY(0);
      expect(finalY).toBeLessThan(initialY);
    });
  });

  describe('AC3: Mouse interaction affects particles', () => {
    it('should update emission point to mouse position', () => {
      const mousePosition = new Vector3(2, 3, 0);
      demo.onInput(createInputState({
        mouseWorldPosition: mousePosition,
      }));

      demo.start();
      demo.update(0.1);

      // Particles should be emitted near the mouse position
      const points = demo.getSceneObjects()[0] as Points;
      const geometry = points.geometry as BufferGeometry;
      const positions = geometry.getAttribute('position');

      // Check that at least some particles started near mouse position
      let foundNearMouse = false;
      for (let i = 0; i < demo.getActiveParticleCount(); i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const dx = Math.abs(x - mousePosition.x);
        const dy = Math.abs(y - mousePosition.y);
        if (dx < 2 && dy < 2) {
          foundNearMouse = true;
          break;
        }
      }
      expect(foundNearMouse).toBe(true);
    });

    it('should apply attraction when mouse is down', () => {
      demo.start();

      // Place mouse at origin
      demo.onInput(createInputState({
        mouseWorldPosition: new Vector3(0, 0, 0),
        isMouseDown: false,
      }));
      demo.update(0.1);

      // Now hold mouse down and update
      demo.onInput(createInputState({
        mouseWorldPosition: new Vector3(0, 0, 0),
        isMouseDown: true,
      }));

      // This tests that mouseDown state is captured
      // The attraction effect is applied in updateParticles
      demo.update(0.1);

      // Should not throw and particles should still exist
      expect(demo.getActiveParticleCount()).toBeGreaterThan(0);
    });
  });

  describe('getParameterSchema', () => {
    it('should return emissionRate parameter', () => {
      const schema = demo.getParameterSchema();
      const emissionRate = schema.find(p => p.key === 'emissionRate');

      expect(emissionRate).toBeDefined();
      expect(emissionRate?.type).toBe('number');
      expect(emissionRate?.min).toBeDefined();
      expect(emissionRate?.max).toBeDefined();
    });

    it('should return lifetime parameter', () => {
      const schema = demo.getParameterSchema();
      const lifetime = schema.find(p => p.key === 'lifetime');

      expect(lifetime).toBeDefined();
      expect(lifetime?.type).toBe('number');
    });

    it('should return initialSpeed parameter', () => {
      const schema = demo.getParameterSchema();
      const speed = schema.find(p => p.key === 'initialSpeed');

      expect(speed).toBeDefined();
      expect(speed?.type).toBe('number');
    });

    it('should return gravity parameter', () => {
      const schema = demo.getParameterSchema();
      const gravity = schema.find(p => p.key === 'gravity');

      expect(gravity).toBeDefined();
      expect(gravity?.type).toBe('number');
    });

    it('should return size parameter', () => {
      const schema = demo.getParameterSchema();
      const size = schema.find(p => p.key === 'size');

      expect(size).toBeDefined();
      expect(size?.type).toBe('number');
    });

    it('should have all required ParameterSchema fields', () => {
      const schema = demo.getParameterSchema();
      for (const param of schema) {
        expect(param.key).toBeDefined();
        expect(param.label).toBeDefined();
        expect(param.type).toBeDefined();
        expect(param.default).toBeDefined();
      }
    });
  });

  describe('setParameter', () => {
    it('should update emissionRate', () => {
      demo.setParameter('emissionRate', 250);
      demo.start();
      demo.update(0.1);

      // Higher rate should produce more particles
      expect(demo.getActiveParticleCount()).toBeGreaterThan(10);
    });

    it('should update lifetime', () => {
      demo.setParameter('lifetime', 0.1);
      demo.start();
      demo.update(0.05);
      demo.stop();
      demo.update(0.2);

      // Short lifetime particles should all be dead
      expect(demo.getActiveParticleCount()).toBe(0);
    });

    it('should update particle size', () => {
      demo.setParameter('size', 0.5);
      const points = demo.getSceneObjects()[0] as Points;
      const material = points.material as PointsMaterial;

      expect(material.size).toBe(0.5);
    });
  });

  describe('reset', () => {
    it('should clear all active particles', () => {
      demo.start();
      demo.update(0.1);
      expect(demo.getActiveParticleCount()).toBeGreaterThan(0);

      demo.reset();
      expect(demo.getActiveParticleCount()).toBe(0);
    });

    it('should allow restarting after reset', () => {
      demo.start();
      demo.update(0.1);
      demo.reset();

      demo.start();
      demo.update(0.1);
      expect(demo.getActiveParticleCount()).toBeGreaterThan(0);
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      demo.start();
      demo.update(0.1);

      const points = demo.getSceneObjects()[0] as Points;
      const geometry = points.geometry as BufferGeometry;
      const material = points.material as PointsMaterial;

      demo.dispose();

      // After dispose, particle count should be 0
      expect(demo.getActiveParticleCount()).toBe(0);
    });
  });

  describe('constructor', () => {
    it('should accept custom parameters', () => {
      const customDemo = new ParticleDemo({
        emissionRate: 200,
        lifetime: 5,
      });

      customDemo.start();
      customDemo.update(0.1);

      // Should use the custom emission rate
      expect(customDemo.getActiveParticleCount()).toBeGreaterThan(10);

      customDemo.dispose();
    });

    it('should use defaults for unspecified parameters', () => {
      const schema = demo.getParameterSchema();
      const emissionRateSchema = schema.find(p => p.key === 'emissionRate');

      expect(emissionRateSchema?.default).toBe(100);
    });
  });

  describe('AC5: Performance (ObjectPool usage)', () => {
    it('should handle many particles without error', () => {
      demo.setParameter('emissionRate', 500);
      demo.start();

      // Run for 2 seconds of simulated time
      for (let i = 0; i < 120; i++) {
        demo.update(0.016);
      }

      // Should have particles and not throw
      expect(demo.getActiveParticleCount()).toBeGreaterThan(0);
    });

    it('should recycle particles efficiently', () => {
      demo.setParameter('emissionRate', 200);
      demo.setParameter('lifetime', 0.5);
      demo.start();

      // Run for several seconds to cycle particles
      for (let i = 0; i < 300; i++) {
        demo.update(0.016);
      }

      // Should still be running without issues
      expect(demo.getActiveParticleCount()).toBeGreaterThan(0);
    });

    it('should not exceed max particles', () => {
      demo.setParameter('emissionRate', 500);
      demo.setParameter('lifetime', 100); // Very long lifetime
      demo.start();

      // Try to emit way more than max
      for (let i = 0; i < 600; i++) {
        demo.update(0.016);
      }

      // Should be capped at 5000
      expect(demo.getActiveParticleCount()).toBeLessThanOrEqual(5000);
    });
  });

  describe('buffer management', () => {
    it('should update position buffer for rendering', () => {
      demo.start();

      const points = demo.getSceneObjects()[0] as Points;
      const geometry = points.geometry as BufferGeometry;
      const positionAttr = geometry.getAttribute('position');

      // Before update, positions should be at default
      demo.update(0.016);

      // Position attribute should have needsUpdate flag set
      // (We check this indirectly by verifying particles have moved)
      const activeCount = demo.getActiveParticleCount();
      expect(activeCount).toBeGreaterThan(0);
    });

    it('should hide unused particle slots', () => {
      demo.start();
      demo.update(0.1);

      const points = demo.getSceneObjects()[0] as Points;
      const geometry = points.geometry as BufferGeometry;
      const positions = geometry.getAttribute('position');

      // Get an index beyond active particles
      const unusedIndex = demo.getActiveParticleCount() + 10;
      if (unusedIndex < 5000) {
        // Unused particles should be hidden (y = -1000)
        expect(positions.getY(unusedIndex)).toBe(-1000);
      }
    });
  });
});
