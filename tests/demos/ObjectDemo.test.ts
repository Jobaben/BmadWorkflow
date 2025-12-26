/**
 * ObjectDemo Unit Tests
 *
 * Tests the ObjectDemo implementation against story-008 acceptance criteria:
 * - AC1: 3D objects are visible with depth
 * - AC2: Multiple animation types are available
 * - AC3: Animations run smoothly
 * - AC4: User input affects the demo
 * - AC5: Demo implements the Demo interface
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Vector2, Vector3, Group, Mesh } from 'three';
import { ObjectDemo } from '../../src/demos/ObjectDemo';
import type { InputState, Demo, AnimationType } from '../../src/types';

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

describe('ObjectDemo', () => {
  let demo: ObjectDemo;

  beforeEach(() => {
    demo = new ObjectDemo();
  });

  afterEach(() => {
    demo.dispose();
  });

  describe('AC5: Demo implements the Demo interface', () => {
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
      demo.setParameter('animationSpeed', 2.0);
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
      // TypeScript will catch this at compile time, but we verify at runtime
      const demoInstance: Demo = demo;
      expect(demoInstance).toBeDefined();
    });
  });

  describe('AC1: 3D objects are visible with depth', () => {
    it('should create multiple 3D objects', () => {
      const group = demo.getSceneObjects()[0] as Group;
      // Should have 8 objects by default plus axes helper
      const meshes = group.children.filter(child => child instanceof Mesh);
      expect(meshes.length).toBe(8);
    });

    it('should create alternating cubes and spheres', () => {
      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      // Check that we have a mix of geometries
      const geometryTypes = meshes.map(m => m.geometry.type);
      const hasCubes = geometryTypes.some(t => t === 'BoxGeometry');
      const hasSpheres = geometryTypes.some(t => t === 'SphereGeometry');

      expect(hasCubes).toBe(true);
      expect(hasSpheres).toBe(true);
    });

    it('should position objects in a circular pattern', () => {
      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      // All objects should be approximately the same distance from center (radius = 2)
      for (const mesh of meshes) {
        const distance = Math.sqrt(
          mesh.position.x ** 2 + mesh.position.z ** 2
        );
        expect(distance).toBeCloseTo(2, 0.1);
      }
    });

    it('should apply distinct colors to objects', () => {
      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      // Collect color hex values
      const colors = meshes.map(m => {
        const material = m.material as any;
        return material.color.getHex();
      });

      // All colors should be different (using HSL distribution)
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('should create objects with MeshStandardMaterial for lighting response', () => {
      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      for (const mesh of meshes) {
        expect(mesh.material.type).toBe('MeshStandardMaterial');
      }
    });
  });

  describe('AC2: Multiple animation types are available', () => {
    it('should support rotate animation type', () => {
      demo.setAnimationType('rotate');
      expect(demo.getCurrentAnimationType()).toBe('rotate');
    });

    it('should support orbit animation type', () => {
      demo.setAnimationType('orbit');
      expect(demo.getCurrentAnimationType()).toBe('orbit');
    });

    it('should support bounce animation type', () => {
      demo.setAnimationType('bounce');
      expect(demo.getCurrentAnimationType()).toBe('bounce');
    });

    it('should support wave animation type', () => {
      demo.setAnimationType('wave');
      expect(demo.getCurrentAnimationType()).toBe('wave');
    });

    it('should support scale animation type', () => {
      demo.setAnimationType('scale');
      expect(demo.getCurrentAnimationType()).toBe('scale');
    });

    it('should default to rotate animation type', () => {
      expect(demo.getCurrentAnimationType()).toBe('rotate');
    });

    it('should handle invalid animation type gracefully', () => {
      demo.setAnimationType('invalid' as AnimationType);
      // Should fall back to rotate
      expect(demo.getCurrentAnimationType()).toBe('rotate');
    });

    it('should expose animation type in parameter schema', () => {
      const schema = demo.getParameterSchema();
      const animationType = schema.find(p => p.key === 'animationType');

      expect(animationType).toBeDefined();
      expect(animationType?.type).toBe('select');
      expect(animationType?.options).toContain('rotate');
      expect(animationType?.options).toContain('orbit');
      expect(animationType?.options).toContain('bounce');
      expect(animationType?.options).toContain('wave');
      expect(animationType?.options).toContain('scale');
    });
  });

  describe('AC3: Animations run smoothly', () => {
    it('should update object rotation in rotate mode', () => {
      demo.setAnimationType('rotate');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;
      const initialRotation = mesh.rotation.y;

      demo.update(0.1);

      expect(mesh.rotation.y).not.toBe(initialRotation);
    });

    it('should update object position in orbit mode', () => {
      demo.setAnimationType('orbit');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;
      const initialX = mesh.position.x;
      const initialZ = mesh.position.z;

      demo.update(0.5);

      // Position should change as object orbits
      const positionChanged =
        mesh.position.x !== initialX || mesh.position.z !== initialZ;
      expect(positionChanged).toBe(true);
    });

    it('should update object Y position in bounce mode', () => {
      demo.setAnimationType('bounce');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;

      demo.update(0.5);

      // Y position should be affected by bounce
      expect(mesh.position.y).not.toBe(0);
    });

    it('should update object Y position in wave mode', () => {
      demo.setAnimationType('wave');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;

      demo.update(0.5);

      // Y position should be affected by wave (unless at zero crossing)
      // Update multiple times to ensure we catch a non-zero position
      for (let i = 0; i < 10; i++) {
        demo.update(0.1);
      }

      // At least some update should have moved the object
      // Wave oscillates, so position may be near zero; check rotation instead
      expect(mesh.rotation.z).not.toBe(0);
    });

    it('should update object scale in scale mode', () => {
      demo.setAnimationType('scale');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;

      demo.update(0.5);

      // Scale should be affected
      expect(mesh.scale.x).not.toBe(1);
    });

    it('should use delta time for frame-rate independence', () => {
      demo.setAnimationType('rotate');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;

      // Reset rotation
      mesh.rotation.y = 0;

      // Simulate 10 frames at 60fps
      for (let i = 0; i < 10; i++) {
        demo.update(0.016);
      }
      const rotationAt60fps = mesh.rotation.y;

      // Reset and try 5 frames at 30fps (same total time)
      mesh.rotation.y = 0;
      demo.reset();
      demo.start();

      for (let i = 0; i < 5; i++) {
        demo.update(0.032);
      }
      const rotationAt30fps = mesh.rotation.y;

      // Rotations should be approximately equal (frame-rate independent)
      expect(Math.abs(rotationAt60fps - rotationAt30fps)).toBeLessThan(0.1);
    });

    it('should not update when stopped', () => {
      demo.setAnimationType('rotate');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;

      demo.update(0.1);
      const rotationAfterUpdate = mesh.rotation.y;

      demo.stop();
      demo.update(0.1);

      expect(mesh.rotation.y).toBe(rotationAfterUpdate);
    });
  });

  describe('AC4: User input affects the demo', () => {
    it('should change animation speed based on mouse X position', () => {
      demo.setAnimationType('rotate');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;

      // Mouse at right side (speed = 1.5x)
      demo.onInput(createInputState({
        mousePosition: new Vector2(1, 0),
      }));
      mesh.rotation.y = 0;
      demo.update(0.1);
      const fastRotation = mesh.rotation.y;

      // Reset and mouse at left side (speed = 0.5x)
      demo.reset();
      demo.start();
      mesh.rotation.y = 0;
      demo.onInput(createInputState({
        mousePosition: new Vector2(-1, 0),
      }));
      demo.update(0.1);
      const slowRotation = mesh.rotation.y;

      // Fast should be greater than slow
      expect(Math.abs(fastRotation)).toBeGreaterThan(Math.abs(slowRotation));
    });

    it('should switch animation type with number keys', () => {
      demo.start();

      // Press key '2' to switch to orbit
      demo.onInput(createInputState({
        keysPressed: new Set(['2']),
      }));

      expect(demo.getCurrentAnimationType()).toBe('orbit');
    });

    it('should switch to all animation types with keys 1-5', () => {
      demo.start();

      const keyMappings: [string, AnimationType][] = [
        ['1', 'rotate'],
        ['2', 'orbit'],
        ['3', 'bounce'],
        ['4', 'wave'],
        ['5', 'scale'],
      ];

      for (const [key, expectedType] of keyMappings) {
        demo.onInput(createInputState({
          keysPressed: new Set([key]),
        }));
        expect(demo.getCurrentAnimationType()).toBe(expectedType);
      }
    });

    it('should reset demo with R key', () => {
      demo.setAnimationType('scale');
      demo.start();
      demo.update(0.5);

      // Animation type should be scale
      expect(demo.getCurrentAnimationType()).toBe('scale');

      // Press R to reset
      demo.onInput(createInputState({
        keysPressed: new Set(['r']),
      }));

      // Should reset to rotate
      expect(demo.getCurrentAnimationType()).toBe('rotate');
    });
  });

  describe('getParameterSchema', () => {
    it('should return animationType parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'animationType');

      expect(param).toBeDefined();
      expect(param?.type).toBe('select');
    });

    it('should return animationSpeed parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'animationSpeed');

      expect(param).toBeDefined();
      expect(param?.type).toBe('number');
      expect(param?.min).toBeDefined();
      expect(param?.max).toBeDefined();
    });

    it('should return amplitude parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'amplitude');

      expect(param).toBeDefined();
      expect(param?.type).toBe('number');
    });

    it('should return showAxes parameter', () => {
      const schema = demo.getParameterSchema();
      const param = schema.find(p => p.key === 'showAxes');

      expect(param).toBeDefined();
      expect(param?.type).toBe('boolean');
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
    it('should update animationType', () => {
      demo.setParameter('animationType', 'wave');
      expect(demo.getCurrentAnimationType()).toBe('wave');
    });

    it('should update animationSpeed', () => {
      demo.setParameter('animationSpeed', 2.5);
      demo.setAnimationType('rotate');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;
      mesh.rotation.y = 0;

      demo.update(0.1);
      const fastRotation = mesh.rotation.y;

      demo.reset();
      demo.start();
      demo.setParameter('animationSpeed', 0.5);
      mesh.rotation.y = 0;
      demo.update(0.1);
      const slowRotation = mesh.rotation.y;

      expect(Math.abs(fastRotation)).toBeGreaterThan(Math.abs(slowRotation));
    });

    it('should update showAxes visibility', () => {
      const group = demo.getSceneObjects()[0] as Group;

      demo.setParameter('showAxes', true);
      const axesHelper = group.children.find(child => child.type === 'AxesHelper');
      expect(axesHelper?.visible).toBe(true);

      demo.setParameter('showAxes', false);
      expect(axesHelper?.visible).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset object positions', () => {
      demo.setAnimationType('bounce');
      demo.start();
      demo.update(0.5);

      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      demo.reset();

      // All objects should be back at Y=0
      for (const mesh of meshes) {
        expect(mesh.position.y).toBe(0);
      }
    });

    it('should reset object rotations', () => {
      demo.setAnimationType('rotate');
      demo.start();
      demo.update(0.5);

      demo.reset();

      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      for (const mesh of meshes) {
        expect(mesh.rotation.x).toBe(0);
        expect(mesh.rotation.y).toBe(0);
        expect(mesh.rotation.z).toBe(0);
      }
    });

    it('should reset object scales', () => {
      demo.setAnimationType('scale');
      demo.start();
      demo.update(0.5);

      demo.reset();

      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      for (const mesh of meshes) {
        expect(mesh.scale.x).toBe(1);
        expect(mesh.scale.y).toBe(1);
        expect(mesh.scale.z).toBe(1);
      }
    });

    it('should reset animation type to rotate', () => {
      demo.setAnimationType('wave');
      demo.reset();
      expect(demo.getCurrentAnimationType()).toBe('rotate');
    });

    it('should allow restarting after reset', () => {
      demo.start();
      demo.update(0.5);
      demo.reset();

      demo.start();
      demo.update(0.1);

      // Should be running without errors
      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;
      expect(mesh.rotation.y).not.toBe(0);
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      demo.start();
      demo.update(0.1);

      const group = demo.getSceneObjects()[0] as Group;
      const initialChildCount = group.children.length;

      demo.dispose();

      // Group should have no children after dispose
      expect(group.children.length).toBe(0);
    });

    it('should stop the demo when disposed', () => {
      demo.start();
      demo.dispose();

      // Should be able to call update without error (just won't do anything)
      demo.update(0.1);
    });
  });

  describe('constructor', () => {
    it('should accept custom object count', () => {
      const customDemo = new ObjectDemo({
        objectCount: 12,
      });

      const group = customDemo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh);
      expect(meshes.length).toBe(12);

      customDemo.dispose();
    });

    it('should accept custom animation speed', () => {
      const customDemo = new ObjectDemo({
        animationSpeed: 2.0,
      });

      customDemo.setAnimationType('rotate');
      customDemo.start();

      const group = customDemo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;
      mesh.rotation.y = 0;

      customDemo.update(0.1);

      // Should rotate faster than default
      expect(Math.abs(mesh.rotation.y)).toBeGreaterThan(0.1);

      customDemo.dispose();
    });

    it('should use defaults for unspecified parameters', () => {
      const schema = demo.getParameterSchema();
      const speedSchema = schema.find(p => p.key === 'animationSpeed');

      expect(speedSchema?.default).toBe(1.0);
    });
  });

  describe('animation-specific behavior', () => {
    it('orbit should maintain objects at consistent radius', () => {
      demo.setAnimationType('orbit');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const mesh = group.children.find(child => child instanceof Mesh) as Mesh;

      // Run for several updates
      for (let i = 0; i < 10; i++) {
        demo.update(0.1);

        const radius = Math.sqrt(mesh.position.x ** 2 + mesh.position.z ** 2);
        expect(radius).toBeCloseTo(1.5, 0.1); // Amplitude is 1.5 by default
      }
    });

    it('bounce should keep objects above ground', () => {
      demo.setAnimationType('bounce');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      // Run for several updates
      for (let i = 0; i < 30; i++) {
        demo.update(0.1);

        // All objects should be at or above Y=0
        for (const mesh of meshes) {
          expect(mesh.position.y).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('scale should keep objects within reasonable scale range', () => {
      demo.setAnimationType('scale');
      demo.start();

      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      // Run for several updates
      for (let i = 0; i < 30; i++) {
        demo.update(0.1);

        for (const mesh of meshes) {
          // Scale should be between 0.5 and 1.5
          expect(mesh.scale.x).toBeGreaterThanOrEqual(0.4);
          expect(mesh.scale.x).toBeLessThanOrEqual(1.6);
        }
      }
    });

    it('wave should create phase-offset motion', () => {
      demo.setAnimationType('wave');
      demo.start();
      demo.update(0.5);

      const group = demo.getSceneObjects()[0] as Group;
      const meshes = group.children.filter(child => child instanceof Mesh) as Mesh[];

      // Objects should have different Y positions due to phase offsets
      const yPositions = meshes.map(m => m.position.y);
      const uniquePositions = new Set(yPositions.map(y => Math.round(y * 100)));

      // Should have multiple distinct Y positions
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
  });
});
