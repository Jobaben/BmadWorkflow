/**
 * ParticleDemo - Particle System Demonstration
 *
 * Demonstrates particle system concepts including:
 * - Particle emission from a configurable source
 * - Particle lifecycle management (spawn, age, die)
 * - Physics forces (gravity, velocity)
 * - Mouse interaction (emission point follows mouse)
 * - Efficient rendering with Three.js Points and BufferGeometry
 *
 * This implementation uses ObjectPool to avoid garbage collection
 * pauses during animation, ensuring smooth 30+ FPS performance.
 */

import {
  Vector3,
  Color,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Object3D,
  AdditiveBlending,
} from 'three';
import type { Demo, ParticleParams, ParameterSchema, InputState } from '../types';
import { ObjectPool } from '../utils/ObjectPool';

/** Maximum number of particles to prevent performance issues */
const MAX_PARTICLES = 5000;

/** Default particle configuration */
const DEFAULT_PARAMS: ParticleParams = {
  emissionRate: 100, // particles per second
  lifetime: 3.0, // seconds
  initialSpeed: 3.0, // units per second
  gravity: new Vector3(0, -2.0, 0), // downward gravity
  size: 0.1, // world units
  color: new Color(0xffaa00), // orange
};

/**
 * Internal particle data structure for pool management.
 * Uses simple objects rather than class instances for performance.
 */
interface ParticleData {
  position: Vector3;
  velocity: Vector3;
  age: number;
  lifetime: number;
  alive: boolean;
}

/**
 * Factory function for creating particle data objects.
 * Used by ObjectPool to create new particle instances.
 */
function createParticleData(): ParticleData {
  return {
    position: new Vector3(),
    velocity: new Vector3(),
    age: 0,
    lifetime: 0,
    alive: false,
  };
}

/**
 * Reset function for particle data.
 * Called when a particle is released back to the pool.
 */
function resetParticleData(p: ParticleData): void {
  p.position.set(0, 0, 0);
  p.velocity.set(0, 0, 0);
  p.age = 0;
  p.lifetime = 0;
  p.alive = false;
}

/**
 * ParticleDemo implements a complete particle system demonstration.
 *
 * Features:
 * - Continuous particle emission from a point source
 * - Particles move according to velocity and gravity
 * - Particles fade out and die after their lifetime
 * - Mouse position controls emission point
 * - Adjustable parameters via control panel
 *
 * @example
 * ```typescript
 * const demo = new ParticleDemo();
 * demo.start();
 * scene.add(...demo.getSceneObjects());
 *
 * // In animation loop:
 * demo.update(deltaTime);
 * demo.onInput(inputState);
 * ```
 */
export class ParticleDemo implements Demo {
  /** Current particle parameters */
  private params: ParticleParams;

  /** Object pool for particle data management */
  private particlePool: ObjectPool<ParticleData>;

  /** Array of currently active particles */
  private activeParticles: ParticleData[] = [];

  /** Three.js Points object for rendering */
  private points: Points;

  /** BufferGeometry for particle positions */
  private geometry: BufferGeometry;

  /** Position buffer attribute (Float32Array) */
  private positionAttribute: Float32BufferAttribute;

  /** Color buffer attribute for particle colors */
  private colorAttribute: Float32BufferAttribute;

  /** Size buffer attribute for particle sizes */
  private sizeAttribute: Float32BufferAttribute;

  /** Point at which particles are emitted */
  private emissionPoint: Vector3;

  /** Accumulator for emission timing */
  private emissionAccumulator: number = 0;

  /** Whether the demo is currently running */
  private running: boolean = false;

  /** Last known mouse world position for interaction */
  private mouseWorldPosition: Vector3;

  /** Whether mouse is currently down (for attractor effect) */
  private isMouseDown: boolean = false;

  /**
   * Creates a new ParticleDemo instance.
   * @param params - Optional initial parameters (uses defaults if not provided)
   */
  constructor(params?: Partial<ParticleParams>) {
    // Merge provided params with defaults
    this.params = {
      ...DEFAULT_PARAMS,
      ...params,
      gravity: params?.gravity?.clone() ?? DEFAULT_PARAMS.gravity.clone(),
      color: params?.color?.clone() ?? DEFAULT_PARAMS.color.clone(),
    };

    // Initialize emission point at origin
    this.emissionPoint = new Vector3(0, 2, 0);
    this.mouseWorldPosition = new Vector3(0, 0, 0);

    // Create particle pool with pre-allocated particles
    this.particlePool = new ObjectPool<ParticleData>(
      createParticleData,
      Math.min(MAX_PARTICLES, 500), // Initial pool size
      resetParticleData,
      100 // Batch size for growth
    );

    // Initialize geometry with position buffer
    this.geometry = new BufferGeometry();

    // Create typed arrays for particle attributes
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const sizes = new Float32Array(MAX_PARTICLES);

    // Initialize all positions off-screen
    for (let i = 0; i < MAX_PARTICLES; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -1000; // Hidden below view
      positions[i * 3 + 2] = 0;
      colors[i * 3] = this.params.color.r;
      colors[i * 3 + 1] = this.params.color.g;
      colors[i * 3 + 2] = this.params.color.b;
      sizes[i] = this.params.size;
    }

    // Create buffer attributes
    this.positionAttribute = new Float32BufferAttribute(positions, 3);
    this.positionAttribute.setUsage(35048); // THREE.DynamicDrawUsage for frequent updates
    this.geometry.setAttribute('position', this.positionAttribute);

    this.colorAttribute = new Float32BufferAttribute(colors, 3);
    this.colorAttribute.setUsage(35048);
    this.geometry.setAttribute('color', this.colorAttribute);

    this.sizeAttribute = new Float32BufferAttribute(sizes, 1);
    this.sizeAttribute.setUsage(35048);
    this.geometry.setAttribute('size', this.sizeAttribute);

    // Create material for particles
    const material = new PointsMaterial({
      size: this.params.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    // Create the Points object
    this.points = new Points(this.geometry, material);
    this.points.frustumCulled = false; // Particles may be anywhere
  }

  /**
   * Starts the particle demo.
   * Initializes emission and begins particle generation.
   */
  start(): void {
    this.running = true;
    this.emissionAccumulator = 0;
  }

  /**
   * Stops the particle demo.
   * Pauses emission but doesn't clear existing particles.
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Resets the demo to initial state.
   * Clears all active particles and resets emission.
   */
  reset(): void {
    // Release all active particles back to pool
    for (const particle of this.activeParticles) {
      this.particlePool.release(particle);
    }
    this.activeParticles = [];
    this.emissionAccumulator = 0;

    // Reset position buffer to hide all particles
    const positions = this.positionAttribute.array as Float32Array;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      positions[i * 3 + 1] = -1000;
    }
    this.positionAttribute.needsUpdate = true;

    // Reset emission point
    this.emissionPoint.set(0, 2, 0);
  }

  /**
   * Updates the particle system.
   * Called once per frame with delta time.
   *
   * @param deltaTime - Time elapsed since last frame (seconds)
   */
  update(deltaTime: number): void {
    // Emit new particles only when running
    if (this.running) {
      this.emitParticles(deltaTime);
    }

    // Always update existing particles (for decay)
    this.updateParticles(deltaTime);

    // Sync particle data to GPU buffer
    this.syncBuffers();
  }

  /**
   * Processes input state for mouse interaction.
   *
   * @param state - Current input state from InputManager
   */
  onInput(state: InputState): void {
    // Update emission point to follow mouse
    this.mouseWorldPosition.copy(state.mouseWorldPosition);
    this.emissionPoint.set(
      state.mouseWorldPosition.x,
      state.mouseWorldPosition.y,
      0
    );

    this.isMouseDown = state.isMouseDown;
  }

  /**
   * Returns the parameter schema for the control panel.
   *
   * @returns Array of parameter definitions
   */
  getParameterSchema(): ParameterSchema[] {
    return [
      {
        key: 'emissionRate',
        label: 'Emission Rate',
        type: 'number',
        min: 10,
        max: 500,
        step: 10,
        default: DEFAULT_PARAMS.emissionRate,
      },
      {
        key: 'lifetime',
        label: 'Lifetime (s)',
        type: 'number',
        min: 0.5,
        max: 10,
        step: 0.5,
        default: DEFAULT_PARAMS.lifetime,
      },
      {
        key: 'initialSpeed',
        label: 'Initial Speed',
        type: 'number',
        min: 0.5,
        max: 10,
        step: 0.5,
        default: DEFAULT_PARAMS.initialSpeed,
      },
      {
        key: 'gravity',
        label: 'Gravity',
        type: 'number',
        min: -10,
        max: 10,
        step: 0.5,
        default: DEFAULT_PARAMS.gravity.y,
      },
      {
        key: 'size',
        label: 'Particle Size',
        type: 'number',
        min: 0.02,
        max: 0.5,
        step: 0.02,
        default: DEFAULT_PARAMS.size,
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
      case 'emissionRate':
        this.params.emissionRate = value as number;
        break;
      case 'lifetime':
        this.params.lifetime = value as number;
        break;
      case 'initialSpeed':
        this.params.initialSpeed = value as number;
        break;
      case 'gravity':
        this.params.gravity.y = value as number;
        break;
      case 'size':
        this.params.size = value as number;
        // Update material size
        (this.points.material as PointsMaterial).size = value as number;
        break;
    }
  }

  /**
   * Returns the Three.js objects for scene integration.
   *
   * @returns Array containing the Points object
   */
  getSceneObjects(): Object3D[] {
    return [this.points];
  }

  /**
   * Disposes of all resources used by this demo.
   * Call this when the demo is no longer needed.
   */
  dispose(): void {
    this.stop();
    this.reset();
    this.geometry.dispose();
    (this.points.material as PointsMaterial).dispose();
    this.particlePool.dispose();
  }

  /**
   * Gets the current particle count for performance monitoring.
   *
   * @returns Number of active particles
   */
  getActiveParticleCount(): number {
    return this.activeParticles.length;
  }

  /**
   * Emits new particles based on emission rate and delta time.
   */
  private emitParticles(deltaTime: number): void {
    // Accumulate time for emission
    this.emissionAccumulator += deltaTime;

    // Calculate how many particles to emit this frame
    const particlesToEmit = Math.floor(
      this.emissionAccumulator * this.params.emissionRate
    );

    // Decrease accumulator
    if (particlesToEmit > 0) {
      this.emissionAccumulator -= particlesToEmit / this.params.emissionRate;
    }

    // Emit particles (respecting max limit)
    for (let i = 0; i < particlesToEmit; i++) {
      if (this.activeParticles.length >= MAX_PARTICLES) {
        break;
      }

      // Acquire particle from pool
      const particle = this.particlePool.acquire();

      // Set initial position at emission point
      particle.position.copy(this.emissionPoint);

      // Generate random direction in a cone pattern
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * 0.5; // Cone angle (0 to ~29 degrees)

      const sinPhi = Math.sin(phi);
      particle.velocity.set(
        Math.cos(theta) * sinPhi,
        Math.cos(phi), // Mostly upward
        Math.sin(theta) * sinPhi
      );
      particle.velocity.multiplyScalar(this.params.initialSpeed);

      // If mouse is down, add some velocity variation for attraction effect
      if (this.isMouseDown) {
        // Double emission rate effect and add some spread
        particle.velocity.multiplyScalar(1.5);
      }

      // Set lifetime with some variation
      particle.lifetime = this.params.lifetime * (0.8 + Math.random() * 0.4);
      particle.age = 0;
      particle.alive = true;

      this.activeParticles.push(particle);
    }
  }

  /**
   * Updates all active particles' positions and states.
   */
  private updateParticles(deltaTime: number): void {
    const gravity = this.params.gravity;
    const particlesToRemove: number[] = [];

    for (let i = 0; i < this.activeParticles.length; i++) {
      const particle = this.activeParticles[i];

      // Apply gravity to velocity
      particle.velocity.x += gravity.x * deltaTime;
      particle.velocity.y += gravity.y * deltaTime;
      particle.velocity.z += gravity.z * deltaTime;

      // Apply attractor effect when mouse is down
      if (this.isMouseDown) {
        const toMouse = new Vector3()
          .copy(this.mouseWorldPosition)
          .sub(particle.position);
        const distance = toMouse.length();

        if (distance > 0.1) {
          // Apply attraction force (inverse square, capped)
          const attractStrength = Math.min(5 / (distance * distance), 3);
          toMouse.normalize().multiplyScalar(attractStrength * deltaTime);
          particle.velocity.add(toMouse);
        }
      }

      // Update position
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.position.z += particle.velocity.z * deltaTime;

      // Update age
      particle.age += deltaTime;

      // Check if particle is dead
      if (particle.age >= particle.lifetime) {
        particle.alive = false;
        particlesToRemove.push(i);
      }
    }

    // Remove dead particles (iterate backwards to preserve indices)
    for (let i = particlesToRemove.length - 1; i >= 0; i--) {
      const index = particlesToRemove[i];
      const particle = this.activeParticles[index];
      this.particlePool.release(particle);
      this.activeParticles.splice(index, 1);
    }
  }

  /**
   * Syncs particle data to the GPU buffers for rendering.
   */
  private syncBuffers(): void {
    const positions = this.positionAttribute.array as Float32Array;
    const colors = this.colorAttribute.array as Float32Array;
    const sizes = this.sizeAttribute.array as Float32Array;

    // Update buffer for each active particle
    for (let i = 0; i < this.activeParticles.length; i++) {
      const particle = this.activeParticles[i];

      // Position
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      // Calculate alpha based on age (fade out near end of life)
      const lifeRatio = particle.age / particle.lifetime;
      const alpha = 1 - lifeRatio;

      // Color with alpha applied
      colors[i * 3] = this.params.color.r * alpha;
      colors[i * 3 + 1] = this.params.color.g * alpha;
      colors[i * 3 + 2] = this.params.color.b * alpha;

      // Size (shrink near end of life)
      sizes[i] = this.params.size * (0.5 + 0.5 * alpha);
    }

    // Hide unused particle slots
    for (let i = this.activeParticles.length; i < MAX_PARTICLES; i++) {
      positions[i * 3 + 1] = -1000; // Move off-screen
    }

    // Mark buffers for GPU upload
    this.positionAttribute.needsUpdate = true;
    this.colorAttribute.needsUpdate = true;
    this.sizeAttribute.needsUpdate = true;
  }
}
