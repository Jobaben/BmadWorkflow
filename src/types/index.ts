/**
 * Core Type Definitions for 3D Animation Learning Foundation
 *
 * This file contains all shared type definitions used across the application.
 * Types are organized by domain: particles, objects, fluids, input, and UI.
 */

import type { Vector2, Vector3, Color, Mesh, Object3D } from 'three';

// =============================================================================
// Particle System Types
// =============================================================================

/**
 * Represents a single particle in the particle system.
 * Particles have position, velocity, and lifecycle properties.
 */
export interface Particle {
  /** Current position in 3D space */
  position: Vector3;
  /** Current velocity vector */
  velocity: Vector3;
  /** Time since particle was spawned (seconds) */
  age: number;
  /** Total lifespan of the particle (seconds) */
  lifetime: number;
  /** Visual size of the particle (world units) */
  size: number;
  /** Color of the particle */
  color: Color;
  /** Whether the particle is currently active */
  alive: boolean;
}

/**
 * Configuration parameters for particle system behavior.
 */
export interface ParticleParams {
  /** Number of particles emitted per second */
  emissionRate: number;
  /** Lifespan of each particle (seconds) */
  lifetime: number;
  /** Initial speed when particle is spawned (units per second) */
  initialSpeed: number;
  /** Gravity acceleration applied to particles */
  gravity: Vector3;
  /** Visual size of particles (world units) */
  size: number;
  /** Base color for particles */
  color: Color;
}

// =============================================================================
// Object Animation Types
// =============================================================================

/**
 * Available animation types for 3D objects.
 */
export type AnimationType = 'rotate' | 'orbit' | 'bounce' | 'wave' | 'scale';

/**
 * Represents a 3D object with animation properties.
 */
export interface AnimatedObject {
  /** The Three.js mesh object */
  mesh: Mesh;
  /** Type of animation applied to this object */
  animationType: AnimationType;
  /** Phase offset for animation (prevents all objects animating in sync) */
  phase: number;
  /** Animation speed multiplier */
  speed: number;
  /** Animation amplitude (intensity of movement) */
  amplitude: number;
}

/**
 * Configuration parameters for object animation demo.
 */
export interface ObjectParams {
  /** Number of objects in the scene */
  objectCount: number;
  /** Global animation speed multiplier */
  animationSpeed: number;
  /** Global animation amplitude */
  amplitude: number;
  /** Whether to display coordinate axes */
  showAxes: boolean;
}

// =============================================================================
// Fluid Physics Types
// =============================================================================

/**
 * Represents a single particle in the fluid simulation.
 * Uses simplified SPH-like properties.
 */
export interface FluidParticle {
  /** Current position in 3D space */
  position: Vector3;
  /** Current velocity vector */
  velocity: Vector3;
  /** Local density at this particle's position */
  density: number;
  /** Pressure derived from density */
  pressure: number;
}

/**
 * Configuration parameters for fluid simulation.
 */
export interface FluidParams {
  /** Number of particles in the simulation */
  particleCount: number;
  /** Gravity strength */
  gravity: number;
  /** Fluid viscosity (resistance to flow) */
  viscosity: number;
  /** Rest density (target density when at equilibrium) */
  restDensity: number;
  /** Damping applied at container boundaries */
  boundaryDamping: number;
}

// =============================================================================
// Input Types
// =============================================================================

/**
 * Current state of user input devices.
 */
export interface InputState {
  /** Normalized mouse position (-1 to 1) on screen */
  mousePosition: Vector2;
  /** Mouse position projected into 3D world space */
  mouseWorldPosition: Vector3;
  /** Whether the primary mouse button is pressed */
  isMouseDown: boolean;
  /** Set of currently pressed keyboard keys */
  keysPressed: Set<string>;
}

// =============================================================================
// Demo Types
// =============================================================================

/**
 * Available demo types in the application.
 */
export enum DemoType {
  Particle = 'particle',
  Object = 'object',
  Fluid = 'fluid',
  Combined = 'combined',
}

/**
 * Runtime state of a demo instance.
 */
export interface DemoState {
  /** Type identifier for this demo */
  id: DemoType;
  /** Whether the demo is currently running */
  isRunning: boolean;
  /** Current parameter values */
  parameters: Map<string, unknown>;
  /** Three.js objects managed by this demo */
  objects: Object3D[];
}

/**
 * Base interface that all demo modules must implement.
 */
export interface Demo {
  // Lifecycle methods
  /** Initialize and start the demo */
  start(): void;
  /** Stop and cleanup the demo */
  stop(): void;
  /** Reset demo to initial state */
  reset(): void;

  // Per-frame update
  /** Called each frame with delta time in seconds */
  update(deltaTime: number): void;

  // Input handling
  /** Process current input state */
  onInput(state: InputState): void;

  // Parameter management
  /** Get the parameter schema for the control panel */
  getParameterSchema(): ParameterSchema[];
  /** Update a parameter value */
  setParameter(key: string, value: unknown): void;

  // Scene integration
  /** Get Three.js objects to add to the scene */
  getSceneObjects(): Object3D[];
}

// =============================================================================
// UI Types
// =============================================================================

/**
 * Defines a configurable parameter for the control panel.
 */
export interface ParameterSchema {
  /** Unique identifier for this parameter */
  key: string;
  /** Human-readable label */
  label: string;
  /** Type of control to render */
  type: 'number' | 'boolean' | 'select';
  /** Minimum value (for number type) */
  min?: number;
  /** Maximum value (for number type) */
  max?: number;
  /** Step increment (for number type) */
  step?: number;
  /** Available options (for select type) */
  options?: string[];
  /** Default value */
  default: unknown;
}
