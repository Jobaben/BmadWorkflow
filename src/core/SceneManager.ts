/**
 * SceneManager - Three.js Scene and Camera Management
 *
 * Provides a configured Three.js Scene with perspective camera
 * and basic lighting for the 3D Animation Learning Foundation.
 */

import {
  Scene,
  PerspectiveCamera,
  Object3D,
  Color,
  AmbientLight,
  DirectionalLight,
} from 'three';

/** Default camera field of view in degrees */
const DEFAULT_FOV = 75;

/** Default camera near clipping plane */
const DEFAULT_NEAR = 0.1;

/** Default camera far clipping plane */
const DEFAULT_FAR = 1000;

/** Default camera Z position */
const DEFAULT_CAMERA_Z = 5;

/** Default scene background color */
const DEFAULT_BACKGROUND_COLOR = 0x1a1a2e;

/** Default ambient light intensity */
const DEFAULT_AMBIENT_INTENSITY = 0.4;

/** Default directional light intensity */
const DEFAULT_DIRECTIONAL_INTENSITY = 0.8;

/**
 * SceneManager handles Three.js Scene, Camera, and basic lighting setup.
 *
 * Features:
 * - Configured perspective camera with sensible defaults
 * - Scene with dark background
 * - Basic lighting (ambient + directional)
 * - Object management (add/remove/clear)
 */
export class SceneManager {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private ambientLight: AmbientLight;
  private directionalLight: DirectionalLight;

  /**
   * Creates a new SceneManager with default configuration.
   */
  constructor() {
    // Create scene with dark background
    this.scene = new Scene();
    this.scene.background = new Color(DEFAULT_BACKGROUND_COLOR);

    // Create perspective camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(
      DEFAULT_FOV,
      aspect,
      DEFAULT_NEAR,
      DEFAULT_FAR
    );
    this.camera.position.z = DEFAULT_CAMERA_Z;

    // Add ambient light (soft overall illumination)
    this.ambientLight = new AmbientLight(0xffffff, DEFAULT_AMBIENT_INTENSITY);
    this.scene.add(this.ambientLight);

    // Add directional light (simulates sun/main light source)
    this.directionalLight = new DirectionalLight(
      0xffffff,
      DEFAULT_DIRECTIONAL_INTENSITY
    );
    this.directionalLight.position.set(5, 10, 7.5);
    this.scene.add(this.directionalLight);
  }

  /**
   * Gets the Three.js Scene instance.
   * @returns The scene
   */
  getScene(): Scene {
    return this.scene;
  }

  /**
   * Gets the perspective camera.
   * @returns The camera
   */
  getCamera(): PerspectiveCamera {
    return this.camera;
  }

  /**
   * Adds an object to the scene.
   * @param object - The Object3D to add
   */
  addObject(object: Object3D): void {
    this.scene.add(object);
  }

  /**
   * Removes an object from the scene.
   * @param object - The Object3D to remove
   */
  removeObject(object: Object3D): void {
    this.scene.remove(object);
  }

  /**
   * Removes all objects from the scene except lights and camera.
   * Useful for resetting demos.
   */
  clear(): void {
    // Collect objects to remove (skip lights)
    const objectsToRemove: Object3D[] = [];
    this.scene.traverse((child) => {
      if (
        child !== this.scene &&
        child !== this.ambientLight &&
        child !== this.directionalLight
      ) {
        objectsToRemove.push(child);
      }
    });

    // Remove collected objects
    for (const obj of objectsToRemove) {
      // Only remove direct children to avoid issues with nested removal
      if (obj.parent === this.scene) {
        this.scene.remove(obj);
      }
    }
  }

  /**
   * Sets the scene background color.
   * @param color - The color value (hex number, CSS string, or Color)
   */
  setBackgroundColor(color: number | string | Color): void {
    if (color instanceof Color) {
      this.scene.background = color;
    } else {
      this.scene.background = new Color(color);
    }
  }

  /**
   * Sets the ambient light intensity.
   * @param intensity - Light intensity (0 to 1)
   */
  setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = intensity;
  }

  /**
   * Sets the directional light intensity.
   * @param intensity - Light intensity (0 to 1)
   */
  setDirectionalIntensity(intensity: number): void {
    this.directionalLight.intensity = intensity;
  }

  /**
   * Updates camera position.
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   */
  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  /**
   * Makes the camera look at a specific point.
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   */
  lookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
  }
}
