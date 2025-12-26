/**
 * ObjectDemo - 3D Object Animation Demonstration
 *
 * Demonstrates fundamental 3D transformation concepts including:
 * - Rotation: Objects spinning around their Y axis
 * - Orbital: Objects moving in circular paths around a center point
 * - Bounce: Objects moving up and down with easing
 * - Wave: Multiple objects creating a wave pattern with phase offsets
 * - Scale: Objects pulsing between minimum and maximum scale
 *
 * Each animation type demonstrates a different mathematical concept:
 * - Rotation uses continuous angle increment
 * - Orbital uses trigonometry (sine/cosine for circular motion)
 * - Bounce uses easing functions for natural motion
 * - Wave uses phase-shifted sine functions
 * - Scale uses sine wave for smooth pulsing
 *
 * The code is designed to be educational and well-commented.
 */

import {
  Group,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  Object3D,
  Color,
  Vector3,
  AxesHelper,
} from 'three';
import type {
  Demo,
  AnimationType,
  AnimatedObject,
  ObjectParams,
  ParameterSchema,
  InputState,
} from '../types';

/** Default number of objects in the demo */
const DEFAULT_OBJECT_COUNT = 8;

/** Default animation speed multiplier */
const DEFAULT_ANIMATION_SPEED = 1.0;

/** Default animation amplitude */
const DEFAULT_AMPLITUDE = 1.5;

/** Available animation types for cycling */
const ANIMATION_TYPES: AnimationType[] = ['rotate', 'orbit', 'bounce', 'wave', 'scale'];

/** Default parameters for the object demo */
const DEFAULT_PARAMS: ObjectParams = {
  objectCount: DEFAULT_OBJECT_COUNT,
  animationSpeed: DEFAULT_ANIMATION_SPEED,
  amplitude: DEFAULT_AMPLITUDE,
  showAxes: false,
};

/**
 * Easing function for bounce animation.
 * Uses a smooth sine-based ease-in-out for natural motion.
 *
 * @param t - Progress value from 0 to 1
 * @returns Eased value from 0 to 1
 */
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * ObjectDemo implements a 3D object animation demonstration.
 *
 * Features:
 * - Multiple 3D primitives (cubes, spheres) with lighting-responsive materials
 * - Five distinct animation types showcasing transformation concepts
 * - Mouse interaction: horizontal position affects animation speed
 * - Keyboard interaction: number keys (1-5) switch animation types
 * - Adjustable parameters via control panel
 *
 * @example
 * ```typescript
 * const demo = new ObjectDemo();
 * demo.start();
 * scene.add(...demo.getSceneObjects());
 *
 * // In animation loop:
 * demo.update(deltaTime);
 * demo.onInput(inputState);
 * ```
 */
export class ObjectDemo implements Demo {
  /** Current demo parameters */
  private params: ObjectParams;

  /** Container for all demo objects */
  private group: Group;

  /** Array of animated objects with their properties */
  private animatedObjects: AnimatedObject[] = [];

  /** Current animation type applied to all objects */
  private currentAnimationType: AnimationType = 'rotate';

  /** Elapsed time accumulator for animations (in seconds) */
  private elapsedTime: number = 0;

  /** Whether the demo is currently running */
  private running: boolean = false;

  /** Speed multiplier from mouse input (0.5 to 2.0) */
  private inputSpeedMultiplier: number = 1.0;

  /** Axes helper for visual reference (optional) */
  private axesHelper: AxesHelper | null = null;

  /** Initial positions of objects for reset */
  private initialPositions: Vector3[] = [];

  /** Initial scales of objects for reset */
  private initialScales: Vector3[] = [];

  /**
   * Creates a new ObjectDemo instance.
   * @param params - Optional initial parameters (uses defaults if not provided)
   */
  constructor(params?: Partial<ObjectParams>) {
    // Merge provided params with defaults
    this.params = {
      ...DEFAULT_PARAMS,
      ...params,
    };

    // Create container group
    this.group = new Group();

    // Create the animated objects
    this.createObjects();

    // Create axes helper (hidden by default)
    this.axesHelper = new AxesHelper(3);
    this.axesHelper.visible = this.params.showAxes;
    this.group.add(this.axesHelper);
  }

  /**
   * Starts the object demo.
   * Begins animation processing.
   */
  start(): void {
    this.running = true;
  }

  /**
   * Stops the object demo.
   * Pauses animation but retains current state.
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Resets the demo to initial state.
   * Returns all objects to their starting positions and resets time.
   */
  reset(): void {
    this.elapsedTime = 0;
    this.inputSpeedMultiplier = 1.0;
    this.currentAnimationType = 'rotate';

    // Reset each object to its initial state
    for (let i = 0; i < this.animatedObjects.length; i++) {
      const obj = this.animatedObjects[i];

      // Reset position
      obj.mesh.position.copy(this.initialPositions[i]);

      // Reset rotation
      obj.mesh.rotation.set(0, 0, 0);

      // Reset scale
      obj.mesh.scale.copy(this.initialScales[i]);

      // Reset animation type
      obj.animationType = 'rotate';
    }
  }

  /**
   * Updates the object animations.
   * Called once per frame with delta time.
   *
   * @param deltaTime - Time elapsed since last frame (seconds)
   */
  update(deltaTime: number): void {
    if (!this.running) {
      return;
    }

    // Apply speed multipliers
    const effectiveSpeed =
      this.params.animationSpeed * this.inputSpeedMultiplier;
    const dt = deltaTime * effectiveSpeed;

    // Accumulate time for time-based animations
    this.elapsedTime += dt;

    // Update each animated object based on its animation type
    for (const obj of this.animatedObjects) {
      this.updateObject(obj, dt, this.elapsedTime);
    }
  }

  /**
   * Processes input state for interaction.
   *
   * - Mouse X position: Affects animation speed (left=slow, right=fast)
   * - Keys 1-5: Switch animation type
   * - Key R: Reset demo
   *
   * @param state - Current input state from InputManager
   */
  onInput(state: InputState): void {
    // Mouse X position affects speed (normalized from -1 to 1)
    // Map to speed multiplier (0.5 to 2.0)
    this.inputSpeedMultiplier = 1.0 + state.mousePosition.x * 0.5;

    // Number keys switch animation type
    for (let i = 0; i < ANIMATION_TYPES.length; i++) {
      const key = String(i + 1);
      if (state.keysPressed.has(key)) {
        this.setAnimationType(ANIMATION_TYPES[i]);
        break;
      }
    }

    // R key resets the demo
    if (state.keysPressed.has('r') || state.keysPressed.has('R')) {
      this.reset();
    }
  }

  /**
   * Returns the parameter schema for the control panel.
   *
   * @returns Array of parameter definitions
   */
  getParameterSchema(): ParameterSchema[] {
    return [
      {
        key: 'animationType',
        label: 'Animation Type',
        type: 'select',
        options: ANIMATION_TYPES,
        default: 'rotate',
      },
      {
        key: 'animationSpeed',
        label: 'Speed',
        type: 'number',
        min: 0.1,
        max: 3.0,
        step: 0.1,
        default: DEFAULT_PARAMS.animationSpeed,
      },
      {
        key: 'amplitude',
        label: 'Amplitude',
        type: 'number',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        default: DEFAULT_PARAMS.amplitude,
      },
      {
        key: 'showAxes',
        label: 'Show Axes',
        type: 'boolean',
        default: DEFAULT_PARAMS.showAxes,
      },
    ];
  }

  /**
   * Sets a parameter value.
   *
   * @param key - Parameter key from schema
   * @param value - New value to set
   */
  setParameter(key: string, value: unknown): void {
    switch (key) {
      case 'animationType':
        this.setAnimationType(value as AnimationType);
        break;
      case 'animationSpeed':
        this.params.animationSpeed = value as number;
        break;
      case 'amplitude':
        this.params.amplitude = value as number;
        break;
      case 'showAxes':
        this.params.showAxes = value as boolean;
        if (this.axesHelper) {
          this.axesHelper.visible = this.params.showAxes;
        }
        break;
    }
  }

  /**
   * Returns the Three.js objects for scene integration.
   *
   * @returns Array containing the group of objects
   */
  getSceneObjects(): Object3D[] {
    return [this.group];
  }

  /**
   * Sets the animation type for all objects.
   *
   * @param type - The animation type to apply
   */
  setAnimationType(type: AnimationType): void {
    if (!ANIMATION_TYPES.includes(type)) {
      console.warn(`Invalid animation type: ${type}. Defaulting to 'rotate'.`);
      type = 'rotate';
    }

    this.currentAnimationType = type;

    // Update all objects
    for (const obj of this.animatedObjects) {
      obj.animationType = type;
    }

    // Reset positions when switching animation types for cleaner transitions
    this.resetPositionsForAnimation();
  }

  /**
   * Gets the current animation type.
   *
   * @returns The current animation type
   */
  getCurrentAnimationType(): AnimationType {
    return this.currentAnimationType;
  }

  /**
   * Disposes of all resources used by this demo.
   * Call this when the demo is no longer needed.
   */
  dispose(): void {
    this.stop();

    // Dispose of geometries and materials
    for (const obj of this.animatedObjects) {
      const mesh = obj.mesh;
      mesh.geometry.dispose();
      if (mesh.material instanceof MeshStandardMaterial) {
        mesh.material.dispose();
      }
    }

    // Clear references
    this.animatedObjects = [];
    this.initialPositions = [];
    this.initialScales = [];

    // Clear the group
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }

  /**
   * Creates the animated 3D objects.
   * Alternates between cubes and spheres, arranged in a circular pattern.
   */
  private createObjects(): void {
    const count = this.params.objectCount;

    // Create alternating cubes and spheres
    for (let i = 0; i < count; i++) {
      const isEven = i % 2 === 0;

      // Create geometry - cubes for even indices, spheres for odd
      const geometry = isEven
        ? new BoxGeometry(0.5, 0.5, 0.5)
        : new SphereGeometry(0.3, 32, 16);

      // Create material with distinct colors
      // Use HSL for visually pleasing color distribution
      const hue = (i / count) * 360;
      const color = new Color();
      color.setHSL(hue / 360, 0.7, 0.5);

      const material = new MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.3,
      });

      // Create mesh
      const mesh = new Mesh(geometry, material);

      // Position in a circle for initial layout
      const angle = (i / count) * Math.PI * 2;
      const radius = 2;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = 0;
      mesh.position.z = Math.sin(angle) * radius;

      // Store initial position and scale
      this.initialPositions.push(mesh.position.clone());
      this.initialScales.push(mesh.scale.clone());

      // Create animated object with phase offset
      const animatedObj: AnimatedObject = {
        mesh: mesh,
        animationType: this.currentAnimationType,
        phase: (i / count) * Math.PI * 2, // Distribute phases evenly
        speed: 1.0,
        amplitude: this.params.amplitude,
      };

      this.animatedObjects.push(animatedObj);
      this.group.add(mesh);
    }
  }

  /**
   * Updates a single animated object based on its animation type.
   *
   * @param obj - The animated object to update
   * @param deltaTime - Time step for this frame
   * @param totalTime - Total elapsed time
   */
  private updateObject(
    obj: AnimatedObject,
    deltaTime: number,
    totalTime: number
  ): void {
    const mesh = obj.mesh;
    const phase = obj.phase;
    const amplitude = this.params.amplitude;

    switch (obj.animationType) {
      case 'rotate':
        this.applyRotation(mesh, deltaTime);
        break;
      case 'orbit':
        this.applyOrbit(mesh, totalTime, phase, amplitude);
        break;
      case 'bounce':
        this.applyBounce(mesh, totalTime, phase, amplitude);
        break;
      case 'wave':
        this.applyWave(mesh, totalTime, phase, amplitude);
        break;
      case 'scale':
        this.applyScale(mesh, totalTime, phase);
        break;
    }
  }

  /**
   * Applies rotation animation to a mesh.
   * Rotates the object continuously around its Y axis.
   *
   * Mathematical concept: Continuous angle increment
   *
   * @param mesh - The mesh to rotate
   * @param deltaTime - Time step
   */
  private applyRotation(mesh: Mesh, deltaTime: number): void {
    // Rotate around Y axis at ~60 degrees per second
    const rotationSpeed = Math.PI / 3;
    mesh.rotation.y += rotationSpeed * deltaTime;

    // Also add slight rotation on X for visual interest
    mesh.rotation.x += rotationSpeed * 0.3 * deltaTime;
  }

  /**
   * Applies orbital animation to a mesh.
   * Moves the object in a circular path around the center.
   *
   * Mathematical concept: Parametric circle equation
   * x = radius * cos(angle)
   * z = radius * sin(angle)
   *
   * @param mesh - The mesh to animate
   * @param time - Total elapsed time
   * @param phase - Phase offset for this object
   * @param amplitude - Orbit radius
   */
  private applyOrbit(
    mesh: Mesh,
    time: number,
    phase: number,
    amplitude: number
  ): void {
    // Calculate angle based on time and phase
    const orbitSpeed = 1.0; // Radians per second
    const angle = time * orbitSpeed + phase;

    // Update position using parametric circle equation
    mesh.position.x = Math.cos(angle) * amplitude;
    mesh.position.z = Math.sin(angle) * amplitude;

    // Keep Y at base level (can add vertical oscillation if desired)
    mesh.position.y = 0;

    // Optional: Make the object face the direction of motion
    mesh.rotation.y = -angle + Math.PI / 2;
  }

  /**
   * Applies bounce animation to a mesh.
   * Moves the object up and down with easing for natural motion.
   *
   * Mathematical concept: Sine wave with easing function
   *
   * @param mesh - The mesh to animate
   * @param time - Total elapsed time
   * @param phase - Phase offset for this object
   * @param amplitude - Bounce height
   */
  private applyBounce(
    mesh: Mesh,
    time: number,
    phase: number,
    amplitude: number
  ): void {
    // Calculate bounce cycle (2 seconds per bounce)
    const cycleTime = 2.0;
    const t = ((time + phase * cycleTime / (Math.PI * 2)) % cycleTime) / cycleTime;

    // Apply easing for natural bounce feel
    // Use a modified sine curve that emphasizes the "up" motion
    const easedT = easeInOutSine(t);
    const bounceValue = Math.abs(Math.sin(easedT * Math.PI));

    // Apply to Y position
    mesh.position.y = bounceValue * amplitude;

    // Slight squash at bottom of bounce
    const squashFactor = 1 - bounceValue * 0.2;
    mesh.scale.y = 1 / squashFactor;
    mesh.scale.x = squashFactor;
    mesh.scale.z = squashFactor;
  }

  /**
   * Applies wave animation to objects.
   * Creates a traveling wave pattern across all objects.
   *
   * Mathematical concept: Phase-shifted sine waves
   * y = amplitude * sin(time + phase)
   *
   * @param mesh - The mesh to animate
   * @param time - Total elapsed time
   * @param phase - Phase offset for this object
   * @param amplitude - Wave height
   */
  private applyWave(
    mesh: Mesh,
    time: number,
    phase: number,
    amplitude: number
  ): void {
    // Wave travels across objects via phase offset
    const waveSpeed = 2.0; // Radians per second
    const waveValue = Math.sin(time * waveSpeed + phase);

    // Apply to Y position
    mesh.position.y = waveValue * amplitude * 0.5;

    // Objects tilt based on wave position (derivative of position)
    const tilt = Math.cos(time * waveSpeed + phase) * 0.3;
    mesh.rotation.z = tilt;
  }

  /**
   * Applies scale animation to a mesh.
   * Makes the object pulse between minimum and maximum scale.
   *
   * Mathematical concept: Smooth oscillation with sine wave
   * scale = base + amplitude * sin(time)
   *
   * @param mesh - The mesh to animate
   * @param time - Total elapsed time
   * @param phase - Phase offset for this object
   */
  private applyScale(mesh: Mesh, time: number, phase: number): void {
    // Pulse parameters
    const pulseSpeed = 2.0; // Radians per second
    const minScale = 0.5;
    const maxScale = 1.5;

    // Calculate scale using sine wave
    const scaleRange = (maxScale - minScale) / 2;
    const baseScale = (maxScale + minScale) / 2;
    const scaleValue = baseScale + scaleRange * Math.sin(time * pulseSpeed + phase);

    // Apply uniform scale
    mesh.scale.setScalar(scaleValue);
  }

  /**
   * Resets object positions when switching animation types.
   * Provides cleaner transitions between animation modes.
   */
  private resetPositionsForAnimation(): void {
    for (let i = 0; i < this.animatedObjects.length; i++) {
      const obj = this.animatedObjects[i];
      const mesh = obj.mesh;

      // Reset rotation
      mesh.rotation.set(0, 0, 0);

      // Reset scale
      mesh.scale.copy(this.initialScales[i]);

      // For orbit, keep current positions; for others, reset to initial
      if (this.currentAnimationType !== 'orbit') {
        mesh.position.copy(this.initialPositions[i]);
      }
    }
  }
}
