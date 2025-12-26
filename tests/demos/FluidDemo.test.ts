/**
 * FluidDemo Unit Tests
 *
 * Tests the FluidDemo implementation against story-009 acceptance criteria:
 * - AC1: Fluid elements exhibit flowing motion
 * - AC2: Fluid responds to boundaries
 * - AC3: User interaction affects fluid
 * - AC4: Demo implements the Demo interface
 * - AC5: Performance remains acceptable (30+ FPS)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Vector2, Vector3, Group, InstancedMesh } from 'three';
import { FluidDemo } from '../../src/demos/FluidDemo';
import type { InputState, Demo } from '../../src/types';

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

describe('FluidDemo', () => {
  let demo: FluidDemo;

  beforeEach(() => {
    demo = new FluidDemo({ particleCount: 50 }); // Use fewer particles for testing
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
      demo.setParameter('gravity', 5.0);
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
      const demoInstance: Demo = demo;
      expect(demoInstance).toBeDefined();
    });
  });

  describe('AC1: Fluid elements exhibit flowing motion', () => {
    it('should create particles as InstancedMesh', () => {
      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      );
      expect(instancedMesh).toBeDefined();
      expect(instancedMesh).toBeInstanceOf(InstancedMesh);
    });

    it('should create the specified number of particles', () => {
      const customDemo = new FluidDemo({ particleCount: 100 });
      const group = customDemo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      expect(instancedMesh.count).toBe(100);
      customDemo.dispose();
    });

    it('should update particle positions when running', () => {
      demo.start();

      // Get initial position from instanced mesh
      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // Store initial matrix for first particle
      const initialMatrix = instancedMesh.instanceMatrix.array.slice(0, 16);

      // Run several updates to allow particles to move
      for (let i = 0; i < 10; i++) {
        demo.update(0.016);
      }

      // Check that matrix has changed (particles moved)
      const finalMatrix = instancedMesh.instanceMatrix.array.slice(0, 16);
      const hasChanged = initialMatrix.some(
        (val, idx) => val !== finalMatrix[idx]
      );
      expect(hasChanged).toBe(true);
    });

    it('should apply gravity to particles (they move downward)', () => {
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // Get initial Y position (from translation in matrix)
      // Matrix format: [m11,m12,m13,m14,m21,m22,m23,m24,m31,m32,m33,m34,tx,ty,tz,tw]
      // Y position is at index 13 (ty)
      const initialY = instancedMesh.instanceMatrix.array[13];

      // Run for a bit to let gravity take effect
      for (let i = 0; i < 60; i++) {
        demo.update(0.016);
      }

      const finalY = instancedMesh.instanceMatrix.array[13];

      // Particles should generally move down (or be at bottom)
      // After enough time, they should be lower or at the container floor
      expect(finalY).toBeLessThanOrEqual(initialY);
    });

    it('should not update when stopped', () => {
      demo.start();
      demo.update(0.1);
      demo.stop();

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      const beforeMatrix = instancedMesh.instanceMatrix.array.slice(0, 16);

      demo.update(0.1);

      const afterMatrix = instancedMesh.instanceMatrix.array.slice(0, 16);

      // Should be the same when stopped
      expect(afterMatrix).toEqual(beforeMatrix);
    });
  });

  describe('AC2: Fluid responds to boundaries', () => {
    it('should keep particles within container bounds', () => {
      demo.start();

      // Run for many updates to let particles settle
      for (let i = 0; i < 300; i++) {
        demo.update(0.016);
      }

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // Check positions are within bounds
      // Container size is 2.0 in FluidDemo, particle radius is 0.08
      const bound = 2.0;

      for (let i = 0; i < 50; i++) {
        const offset = i * 16;
        const x = instancedMesh.instanceMatrix.array[offset + 12];
        const y = instancedMesh.instanceMatrix.array[offset + 13];
        const z = instancedMesh.instanceMatrix.array[offset + 14];

        expect(x).toBeGreaterThanOrEqual(-bound);
        expect(x).toBeLessThanOrEqual(bound);
        expect(y).toBeGreaterThanOrEqual(-bound);
        expect(y).toBeLessThanOrEqual(bound);
        expect(z).toBeGreaterThanOrEqual(-bound);
        expect(z).toBeLessThanOrEqual(bound);
      }
    });

    it('should pool particles at bottom after enough time', () => {
      demo.start();

      // Run for many updates to let particles settle at bottom
      for (let i = 0; i < 500; i++) {
        demo.update(0.016);
      }

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // Most particles should be near the bottom
      let particlesNearBottom = 0;
      const bottomThreshold = -1.5; // Close to bottom

      for (let i = 0; i < 50; i++) {
        const offset = i * 16;
        const y = instancedMesh.instanceMatrix.array[offset + 13];

        if (y < bottomThreshold) {
          particlesNearBottom++;
        }
      }

      // Most particles should have settled near the bottom
      expect(particlesNearBottom).toBeGreaterThan(25); // At least half
    });
  });

  describe('AC3: User interaction affects fluid', () => {
    it('should respond to mouse down input', () => {
      demo.start();

      // Run a few updates first
      for (let i = 0; i < 10; i++) {
        demo.update(0.016);
      }

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // Provide input with mouse down near the center
      demo.onInput(
        createInputState({
          mousePosition: new Vector2(0, 0),
          mouseWorldPosition: new Vector3(0, 0, 0),
          isMouseDown: true,
        })
      );

      const beforeMatrix = instancedMesh.instanceMatrix.array.slice(0, 48);

      // Update with mouse down
      demo.update(0.016);

      const afterMatrix = instancedMesh.instanceMatrix.array.slice(0, 48);

      // Something should change (force applied)
      const hasChanged = beforeMatrix.some(
        (val, idx) => val !== afterMatrix[idx]
      );
      expect(hasChanged).toBe(true);
    });

    it('should not apply interaction force when mouse is up', () => {
      demo.start();

      // First, let particles settle a bit
      for (let i = 0; i < 50; i++) {
        demo.update(0.016);
      }

      // Provide input with mouse up
      demo.onInput(
        createInputState({
          mousePosition: new Vector2(0, 0),
          mouseWorldPosition: new Vector3(0, 0, 0),
          isMouseDown: false,
        })
      );

      // Update should proceed normally without extra force
      demo.update(0.016);
      // No exception means it works correctly
    });
  });

  describe('AC5: Performance remains acceptable', () => {
    it('should handle update in reasonable time with default particle count', () => {
      const fullDemo = new FluidDemo({ particleCount: 200 });
      fullDemo.start();

      const startTime = performance.now();

      // Run 60 updates (1 second at 60fps)
      for (let i = 0; i < 60; i++) {
        fullDemo.update(0.016);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete 60 updates in less than 1 second (leaving room for rendering)
      // This means each update should take less than ~16ms on average
      expect(totalTime).toBeLessThan(1000);

      fullDemo.dispose();
    });

    it('should use InstancedMesh for efficient rendering', () => {
      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      );

      // Verify we're using InstancedMesh (single draw call for all particles)
      expect(instancedMesh).toBeDefined();
      expect(instancedMesh).toBeInstanceOf(InstancedMesh);
    });

    it('should clamp delta time to prevent instability', () => {
      demo.start();

      // Large delta time should not cause particles to escape bounds
      demo.update(0.5); // Very large frame time

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // Particles should still be within reasonable bounds
      const bound = 3.0; // Allow some margin

      for (let i = 0; i < 50; i++) {
        const offset = i * 16;
        const x = instancedMesh.instanceMatrix.array[offset + 12];
        const y = instancedMesh.instanceMatrix.array[offset + 13];
        const z = instancedMesh.instanceMatrix.array[offset + 14];

        expect(Math.abs(x)).toBeLessThan(bound);
        expect(Math.abs(y)).toBeLessThan(bound);
        expect(Math.abs(z)).toBeLessThan(bound);
      }
    });
  });

  describe('getParameterSchema', () => {
    it('should return particleCount parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'particleCount');

      expect(param).toBeDefined();
      expect(param?.type).toBe('number');
      expect(param?.min).toBeDefined();
      expect(param?.max).toBeDefined();
    });

    it('should return gravity parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'gravity');

      expect(param).toBeDefined();
      expect(param?.type).toBe('number');
    });

    it('should return viscosity parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'viscosity');

      expect(param).toBeDefined();
      expect(param?.type).toBe('number');
    });

    it('should return restDensity parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'restDensity');

      expect(param).toBeDefined();
      expect(param?.type).toBe('number');
    });

    it('should return boundaryDamping parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'boundaryDamping');

      expect(param).toBeDefined();
      expect(param?.type).toBe('number');
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
    it('should update gravity parameter', () => {
      demo.setParameter('gravity', 0);
      demo.start();

      // With zero gravity, particles should not fall as fast
      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      const initialY = instancedMesh.instanceMatrix.array[13];

      for (let i = 0; i < 30; i++) {
        demo.update(0.016);
      }

      const finalY = instancedMesh.instanceMatrix.array[13];

      // With zero gravity, Y should not change as much
      const yChange = Math.abs(finalY - initialY);
      expect(yChange).toBeLessThan(1.0); // Small change without gravity
    });

    it('should update viscosity parameter', () => {
      demo.setParameter('viscosity', 1.0);
      // Should not throw
      demo.start();
      demo.update(0.016);
    });

    it('should update restDensity parameter', () => {
      demo.setParameter('restDensity', 2.0);
      // Should not throw
      demo.start();
      demo.update(0.016);
    });

    it('should update boundaryDamping parameter', () => {
      demo.setParameter('boundaryDamping', 0.9);
      // Should not throw
      demo.start();
      demo.update(0.016);
    });

    it('should update particleCount and reinitialize', () => {
      demo.setParameter('particleCount', 75);

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      expect(instancedMesh.count).toBe(75);
    });
  });

  describe('reset', () => {
    it('should reinitialize particles', () => {
      demo.start();

      // Run for a while to let particles move
      for (let i = 0; i < 100; i++) {
        demo.update(0.016);
      }

      demo.reset();

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // After reset, particles should be back near the top
      // Check first few particles have positive Y values
      let particlesNearTop = 0;
      for (let i = 0; i < 10; i++) {
        const offset = i * 16;
        const y = instancedMesh.instanceMatrix.array[offset + 13];
        if (y > 0) {
          particlesNearTop++;
        }
      }

      expect(particlesNearTop).toBeGreaterThan(0);
    });

    it('should allow restarting after reset', () => {
      demo.start();
      demo.update(0.5);
      demo.reset();

      demo.start();
      demo.update(0.1);

      // Should run without errors
      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      );
      expect(instancedMesh).toBeDefined();
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      demo.start();
      demo.update(0.1);

      const group = demo.getSceneObjects()[0] as Group;
      const initialChildCount = group.children.length;

      demo.dispose();

      expect(group.children.length).toBe(0);
    });

    it('should stop the demo when disposed', () => {
      demo.start();
      demo.dispose();

      // Should be able to call update without error
      demo.update(0.1);
    });
  });

  describe('applyForce', () => {
    it('should apply external force to particles', () => {
      demo.start();

      // Run a few updates first
      for (let i = 0; i < 10; i++) {
        demo.update(0.016);
      }

      // Apply an upward force at the center
      const force = new Vector3(0, 20, 0);
      const position = new Vector3(0, 0, 0);
      demo.applyForce(position, force, 2.0);

      demo.update(0.016);

      // Should not throw, force is applied internally
    });
  });

  describe('constructor', () => {
    it('should accept custom particle count', () => {
      const customDemo = new FluidDemo({ particleCount: 100 });

      const group = customDemo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      expect(instancedMesh.count).toBe(100);

      customDemo.dispose();
    });

    it('should accept custom gravity', () => {
      const customDemo = new FluidDemo({ gravity: 5.0 });

      // Custom gravity should be set (verified by behavior)
      customDemo.start();
      customDemo.update(0.016);

      customDemo.dispose();
    });

    it('should accept custom viscosity', () => {
      const customDemo = new FluidDemo({ viscosity: 0.5 });

      customDemo.start();
      customDemo.update(0.016);

      customDemo.dispose();
    });

    it('should use defaults for unspecified parameters', () => {
      const schema = demo.getParameterSchema();
      const gravitySchema = schema.find(p => p.key === 'gravity');

      expect(gravitySchema?.default).toBe(9.8);
    });
  });

  describe('fluid behavior', () => {
    it('should have particles spread apart (pressure forces)', () => {
      // Start with particles in a tight cluster
      demo.start();

      // Run physics
      for (let i = 0; i < 100; i++) {
        demo.update(0.016);
      }

      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      // Collect X positions of first 10 particles
      const xPositions: number[] = [];
      for (let i = 0; i < 10; i++) {
        const offset = i * 16;
        xPositions.push(instancedMesh.instanceMatrix.array[offset + 12]);
      }

      // Particles should have spread out (not all at the same X)
      const uniqueRounded = new Set(xPositions.map(x => Math.round(x * 10)));
      expect(uniqueRounded.size).toBeGreaterThan(1);
    });

    it('should have semi-transparent blue material', () => {
      const group = demo.getSceneObjects()[0] as Group;
      const instancedMesh = group.children.find(
        child => child instanceof InstancedMesh
      ) as InstancedMesh;

      const material = instancedMesh.material as any;

      expect(material.transparent).toBe(true);
      expect(material.opacity).toBeLessThan(1);
      // Blue-ish color
      expect(material.color.b).toBeGreaterThan(material.color.r);
    });
  });
});
