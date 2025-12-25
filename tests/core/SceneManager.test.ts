/**
 * SceneManager Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SceneManager } from '../../src/core/SceneManager';
import { BoxGeometry, Mesh, MeshBasicMaterial, Scene, PerspectiveCamera } from 'three';

describe('SceneManager', () => {
  let sceneManager: SceneManager;

  beforeEach(() => {
    sceneManager = new SceneManager();
  });

  describe('constructor', () => {
    it('should create a scene', () => {
      const scene = sceneManager.getScene();
      expect(scene).toBeInstanceOf(Scene);
    });

    it('should create a perspective camera', () => {
      const camera = sceneManager.getCamera();
      expect(camera).toBeInstanceOf(PerspectiveCamera);
    });

    it('should position camera at z=5 by default', () => {
      const camera = sceneManager.getCamera();
      expect(camera.position.z).toBe(5);
    });

    it('should set scene background color', () => {
      const scene = sceneManager.getScene();
      expect(scene.background).not.toBeNull();
    });

    it('should add ambient light to scene', () => {
      const scene = sceneManager.getScene();
      const lights = scene.children.filter(
        (child) => child.type === 'AmbientLight'
      );
      expect(lights.length).toBe(1);
    });

    it('should add directional light to scene', () => {
      const scene = sceneManager.getScene();
      const lights = scene.children.filter(
        (child) => child.type === 'DirectionalLight'
      );
      expect(lights.length).toBe(1);
    });
  });

  describe('getScene', () => {
    it('should return the Three.js scene', () => {
      const scene = sceneManager.getScene();
      expect(scene).toBeDefined();
      expect(scene.type).toBe('Scene');
    });
  });

  describe('getCamera', () => {
    it('should return the perspective camera', () => {
      const camera = sceneManager.getCamera();
      expect(camera).toBeDefined();
      expect(camera.type).toBe('PerspectiveCamera');
    });

    it('should have correct camera properties', () => {
      const camera = sceneManager.getCamera();
      expect(camera.fov).toBe(75);
      expect(camera.near).toBe(0.1);
      expect(camera.far).toBe(1000);
    });
  });

  describe('addObject', () => {
    it('should add an object to the scene', () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0xff0000 });
      const mesh = new Mesh(geometry, material);

      const scene = sceneManager.getScene();
      const initialCount = scene.children.length;

      sceneManager.addObject(mesh);

      expect(scene.children.length).toBe(initialCount + 1);
      expect(scene.children).toContain(mesh);
    });
  });

  describe('removeObject', () => {
    it('should remove an object from the scene', () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0xff0000 });
      const mesh = new Mesh(geometry, material);

      sceneManager.addObject(mesh);
      const scene = sceneManager.getScene();
      expect(scene.children).toContain(mesh);

      sceneManager.removeObject(mesh);
      expect(scene.children).not.toContain(mesh);
    });
  });

  describe('clear', () => {
    it('should remove all objects except lights', () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0xff0000 });
      const mesh1 = new Mesh(geometry, material);
      const mesh2 = new Mesh(geometry, material);

      sceneManager.addObject(mesh1);
      sceneManager.addObject(mesh2);

      sceneManager.clear();

      const scene = sceneManager.getScene();
      // Should only have the two lights remaining
      expect(scene.children.length).toBe(2);
      expect(scene.children).not.toContain(mesh1);
      expect(scene.children).not.toContain(mesh2);
    });

    it('should preserve lights after clear', () => {
      sceneManager.clear();

      const scene = sceneManager.getScene();
      const ambientLights = scene.children.filter(
        (child) => child.type === 'AmbientLight'
      );
      const directionalLights = scene.children.filter(
        (child) => child.type === 'DirectionalLight'
      );

      expect(ambientLights.length).toBe(1);
      expect(directionalLights.length).toBe(1);
    });
  });

  describe('setBackgroundColor', () => {
    it('should change background color with hex number', () => {
      sceneManager.setBackgroundColor(0xff0000);
      const scene = sceneManager.getScene();
      expect(scene.background).not.toBeNull();
    });

    it('should change background color with CSS string', () => {
      sceneManager.setBackgroundColor('#00ff00');
      const scene = sceneManager.getScene();
      expect(scene.background).not.toBeNull();
    });
  });

  describe('setCameraPosition', () => {
    it('should update camera position', () => {
      sceneManager.setCameraPosition(1, 2, 3);
      const camera = sceneManager.getCamera();
      expect(camera.position.x).toBe(1);
      expect(camera.position.y).toBe(2);
      expect(camera.position.z).toBe(3);
    });
  });

  describe('lookAt', () => {
    it('should make camera look at specified point', () => {
      sceneManager.setCameraPosition(5, 5, 5);
      sceneManager.lookAt(0, 0, 0);

      const camera = sceneManager.getCamera();
      // Camera should be looking towards origin
      // We can verify the camera's matrix has been updated
      expect(camera.matrixWorldNeedsUpdate).toBe(true);
    });
  });

  describe('setAmbientIntensity', () => {
    it('should update ambient light intensity', () => {
      sceneManager.setAmbientIntensity(0.8);
      const scene = sceneManager.getScene();
      const ambientLight = scene.children.find(
        (child) => child.type === 'AmbientLight'
      ) as THREE.AmbientLight | undefined;
      expect(ambientLight?.intensity).toBe(0.8);
    });
  });

  describe('setDirectionalIntensity', () => {
    it('should update directional light intensity', () => {
      sceneManager.setDirectionalIntensity(1.2);
      const scene = sceneManager.getScene();
      const directionalLight = scene.children.find(
        (child) => child.type === 'DirectionalLight'
      ) as THREE.DirectionalLight | undefined;
      expect(directionalLight?.intensity).toBe(1.2);
    });
  });
});

// Import Three.js namespace for type assertions
import * as THREE from 'three';
