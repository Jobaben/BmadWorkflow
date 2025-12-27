/**
 * CombinedDemo - Multi-System Integration Demonstration
 *
 * Demonstrates how to integrate multiple animation systems in a single scene:
 * - ParticleDemo: Particle emission and lifecycle
 * - ObjectDemo: 3D object transformations
 * - FluidDemo: Fluid-like physics simulation
 *
 * ## Key Concepts Demonstrated
 *
 * 1. **Composition Pattern**: CombinedDemo contains instances of other demos
 *    rather than duplicating their logic. This promotes code reuse and
 *    maintains separation of concerns.
 *
 * 2. **Spatial Separation**: Each demo is positioned in a different region
 *    of the scene to prevent visual confusion and demonstrate how multiple
 *    systems can coexist.
 *
 * 3. **Coordinated Updates**: All sub-demos receive the same delta time,
 *    ensuring consistent animation timing across systems.
 *
 * 4. **Performance Considerations**: Uses reduced complexity settings for
 *    each sub-demo to maintain 30+ FPS when all systems run together.
 *
 * ## Layout
 *
 * The scene is divided into three regions:
 * - Left: Particles (offset by -3 on X axis)
 * - Center: Objects (at origin)
 * - Right: Fluid (offset by +3 on X axis)
 *
 * @see ParticleDemo
 * @see ObjectDemo
 * @see FluidDemo
 */

import { Object3D, Group, Vector3 } from 'three';
import type { Demo, ParameterSchema, InputState } from '../types';
import { ParticleDemo } from './ParticleDemo';
import { ObjectDemo } from './ObjectDemo';
import { FluidDemo } from './FluidDemo';

// =============================================================================
// Constants
// =============================================================================

/** Offset for particle demo position (left side) */
const PARTICLE_OFFSET = new Vector3(-3, 0, 0);

/** Offset for object demo position (center, slightly back) */
const OBJECT_OFFSET = new Vector3(0, 0, 0);

/** Offset for fluid demo position (right side) */
const FLUID_OFFSET = new Vector3(3, 0, 0);

/**
 * Reduced particle emission rate for combined demo (50% of default).
 * Default is 100, so we use 50.
 */
const COMBINED_PARTICLE_EMISSION_RATE = 50;

/**
 * Reduced object count for combined demo.
 * Default is 8, we use 4 for better performance.
 */
const COMBINED_OBJECT_COUNT = 4;

/**
 * Reduced fluid particle count for combined demo (50% of default).
 * Default is 200, so we use 100.
 */
const COMBINED_FLUID_PARTICLE_COUNT = 100;

// =============================================================================
// CombinedDemo Class
// =============================================================================

/**
 * CombinedDemo orchestrates multiple demo systems working together.
 *
 * This demo demonstrates integration patterns for running multiple
 * animation systems simultaneously without conflicts.
 *
 * @example
 * ```typescript
 * const demo = new CombinedDemo();
 * demo.start();
 * scene.add(...demo.getSceneObjects());
 *
 * // In animation loop:
 * demo.update(deltaTime);
 * demo.onInput(inputState);
 * ```
 */
export class CombinedDemo implements Demo {
  // -------------------------------------------------------------------------
  // Sub-Demos
  // -------------------------------------------------------------------------

  /** Particle system demo instance */
  private particleDemo: ParticleDemo;

  /** Object animation demo instance */
  private objectDemo: ObjectDemo;

  /** Fluid physics demo instance */
  private fluidDemo: FluidDemo;

  // -------------------------------------------------------------------------
  // Scene Objects
  // -------------------------------------------------------------------------

  /** Container group for all sub-demo objects */
  private group: Group;

  /** Container for particle demo (offset left) */
  private particleContainer: Group;

  /** Container for object demo (center) */
  private objectContainer: Group;

  /** Container for fluid demo (offset right) */
  private fluidContainer: Group;

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  /** Whether the demo is currently running */
  private running: boolean = false;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Creates a new CombinedDemo instance.
   *
   * Initializes all three sub-demos with reduced complexity settings
   * for better performance when running together.
   */
  constructor() {
    // Create the main container group
    this.group = new Group();

    // Create containers for each sub-demo
    this.particleContainer = new Group();
    this.objectContainer = new Group();
    this.fluidContainer = new Group();

    // Position containers in their designated regions
    this.particleContainer.position.copy(PARTICLE_OFFSET);
    this.objectContainer.position.copy(OBJECT_OFFSET);
    this.fluidContainer.position.copy(FLUID_OFFSET);

    // Add containers to main group
    this.group.add(this.particleContainer);
    this.group.add(this.objectContainer);
    this.group.add(this.fluidContainer);

    // Initialize sub-demos with reduced complexity
    this.particleDemo = new ParticleDemo({
      emissionRate: COMBINED_PARTICLE_EMISSION_RATE,
    });

    this.objectDemo = new ObjectDemo({
      objectCount: COMBINED_OBJECT_COUNT,
    });

    this.fluidDemo = new FluidDemo({
      particleCount: COMBINED_FLUID_PARTICLE_COUNT,
    });

    // Add sub-demo scene objects to their containers
    this.addSubDemoObjects();
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Starts all sub-demos.
   */
  start(): void {
    this.running = true;
    this.particleDemo.start();
    this.objectDemo.start();
    this.fluidDemo.start();
  }

  /**
   * Stops all sub-demos.
   */
  stop(): void {
    this.running = false;
    this.particleDemo.stop();
    this.objectDemo.stop();
    this.fluidDemo.stop();
  }

  /**
   * Resets all sub-demos to their initial state.
   */
  reset(): void {
    this.particleDemo.reset();
    this.objectDemo.reset();
    this.fluidDemo.reset();
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Update
  // -------------------------------------------------------------------------

  /**
   * Updates all sub-demos with the same delta time.
   *
   * This ensures consistent timing across all animation systems.
   *
   * @param deltaTime - Time elapsed since last frame (seconds)
   */
  update(deltaTime: number): void {
    if (!this.running) {
      return;
    }

    // Update all sub-demos with the same delta time
    this.particleDemo.update(deltaTime);
    this.objectDemo.update(deltaTime);
    this.fluidDemo.update(deltaTime);
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Input
  // -------------------------------------------------------------------------

  /**
   * Routes input to all sub-demos.
   *
   * Each sub-demo receives the same input state and processes it
   * according to its own input handling logic. The input coordinates
   * are not adjusted for sub-demo offsets, so interactions will be
   * most effective near each demo's region.
   *
   * @param state - Current input state from InputManager
   */
  onInput(state: InputState): void {
    // Create adjusted input states for each sub-demo
    // by offsetting the mouse world position

    // Adjust for particle demo (left offset)
    const particleInput = this.createAdjustedInput(state, PARTICLE_OFFSET);
    this.particleDemo.onInput(particleInput);

    // Object demo uses original input (centered)
    this.objectDemo.onInput(state);

    // Adjust for fluid demo (right offset)
    const fluidInput = this.createAdjustedInput(state, FLUID_OFFSET);
    this.fluidDemo.onInput(fluidInput);
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Parameters
  // -------------------------------------------------------------------------

  /**
   * Returns the combined parameter schema for all sub-demos.
   *
   * Parameters are grouped by sub-demo with prefixes:
   * - particle_* for particle demo parameters
   * - object_* for object demo parameters
   * - fluid_* for fluid demo parameters
   */
  getParameterSchema(): ParameterSchema[] {
    // Get schemas from each sub-demo
    const particleSchema = this.particleDemo.getParameterSchema();
    const objectSchema = this.objectDemo.getParameterSchema();
    const fluidSchema = this.fluidDemo.getParameterSchema();

    // Prefix keys to avoid conflicts and group by demo
    const prefixedSchemas: ParameterSchema[] = [];

    // Add particle parameters with prefix
    for (const param of particleSchema) {
      prefixedSchemas.push({
        ...param,
        key: `particle_${param.key}`,
        label: `[P] ${param.label}`,
      });
    }

    // Add object parameters with prefix
    for (const param of objectSchema) {
      prefixedSchemas.push({
        ...param,
        key: `object_${param.key}`,
        label: `[O] ${param.label}`,
      });
    }

    // Add fluid parameters with prefix
    for (const param of fluidSchema) {
      prefixedSchemas.push({
        ...param,
        key: `fluid_${param.key}`,
        label: `[F] ${param.label}`,
      });
    }

    return prefixedSchemas;
  }

  /**
   * Sets a parameter value on the appropriate sub-demo.
   *
   * The key prefix determines which sub-demo receives the update:
   * - particle_* goes to ParticleDemo
   * - object_* goes to ObjectDemo
   * - fluid_* goes to FluidDemo
   *
   * @param key - Parameter key with prefix
   * @param value - New value to set
   */
  setParameter(key: string, value: unknown): void {
    if (key.startsWith('particle_')) {
      const actualKey = key.replace('particle_', '');
      this.particleDemo.setParameter(actualKey, value);
    } else if (key.startsWith('object_')) {
      const actualKey = key.replace('object_', '');
      this.objectDemo.setParameter(actualKey, value);
    } else if (key.startsWith('fluid_')) {
      const actualKey = key.replace('fluid_', '');
      this.fluidDemo.setParameter(actualKey, value);
    }
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Scene Objects
  // -------------------------------------------------------------------------

  /**
   * Returns the Three.js objects for scene integration.
   *
   * Returns a single group containing all sub-demo objects
   * in their positioned containers.
   */
  getSceneObjects(): Object3D[] {
    return [this.group];
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Disposes of all resources used by this demo and its sub-demos.
   */
  dispose(): void {
    this.stop();

    // Dispose all sub-demos
    this.particleDemo.dispose();
    this.objectDemo.dispose();
    this.fluidDemo.dispose();

    // Clear all containers
    while (this.particleContainer.children.length > 0) {
      this.particleContainer.remove(this.particleContainer.children[0]);
    }
    while (this.objectContainer.children.length > 0) {
      this.objectContainer.remove(this.objectContainer.children[0]);
    }
    while (this.fluidContainer.children.length > 0) {
      this.fluidContainer.remove(this.fluidContainer.children[0]);
    }
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }

  /**
   * Gets reference to the particle sub-demo for advanced control.
   */
  getParticleDemo(): ParticleDemo {
    return this.particleDemo;
  }

  /**
   * Gets reference to the object sub-demo for advanced control.
   */
  getObjectDemo(): ObjectDemo {
    return this.objectDemo;
  }

  /**
   * Gets reference to the fluid sub-demo for advanced control.
   */
  getFluidDemo(): FluidDemo {
    return this.fluidDemo;
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------

  /**
   * Adds sub-demo scene objects to their respective containers.
   */
  private addSubDemoObjects(): void {
    // Add particle demo objects to particle container
    const particleObjects = this.particleDemo.getSceneObjects();
    for (const obj of particleObjects) {
      this.particleContainer.add(obj);
    }

    // Add object demo objects to object container
    const objectObjects = this.objectDemo.getSceneObjects();
    for (const obj of objectObjects) {
      this.objectContainer.add(obj);
    }

    // Add fluid demo objects to fluid container
    const fluidObjects = this.fluidDemo.getSceneObjects();
    for (const obj of fluidObjects) {
      this.fluidContainer.add(obj);
    }
  }

  /**
   * Creates an adjusted input state with mouse position offset.
   *
   * This compensates for the sub-demo's position offset so that
   * interactions feel natural within each demo's region.
   *
   * @param originalState - Original input state
   * @param offset - Position offset to compensate for
   * @returns Adjusted input state
   */
  private createAdjustedInput(
    originalState: InputState,
    offset: Vector3
  ): InputState {
    // Clone the mouse world position and adjust for offset
    const adjustedWorldPos = originalState.mouseWorldPosition.clone();
    adjustedWorldPos.x -= offset.x;
    adjustedWorldPos.y -= offset.y;
    adjustedWorldPos.z -= offset.z;

    return {
      mousePosition: originalState.mousePosition,
      mouseWorldPosition: adjustedWorldPos,
      isMouseDown: originalState.isMouseDown,
      keysPressed: originalState.keysPressed,
    };
  }
}
