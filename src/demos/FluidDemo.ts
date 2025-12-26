/**
 * FluidDemo - Fluid-Like Physics Demonstration
 *
 * Demonstrates a simplified SPH-like (Smoothed Particle Hydrodynamics) fluid
 * simulation. This is an educational implementation that prioritizes clarity
 * and understandability over physical accuracy.
 *
 * ## What is SPH?
 *
 * Real SPH (Smoothed Particle Hydrodynamics) is a computational method for
 * simulating fluid dynamics. It represents fluid as particles that interact
 * based on:
 * - Density: How crowded particles are locally
 * - Pressure: Force pushing particles apart when density is high
 * - Viscosity: Resistance to flow (averaging velocities of neighbors)
 *
 * ## Simplifications in This Implementation
 *
 * 1. **Kernel Functions**: Real SPH uses smooth kernel functions (like poly6,
 *    spiky) for accurate force calculations. We use simple linear falloff.
 *
 * 2. **Density Calculation**: Real SPH sums weighted masses. We count
 *    neighbors with distance-based weighting.
 *
 * 3. **Pressure**: Real SPH uses equations of state (like Tait equation).
 *    We use a simple linear relationship: pressure = k * (density - restDensity)
 *
 * 4. **Integration**: Real SPH uses careful symplectic integrators. We use
 *    simple Euler integration, which is less stable but easier to understand.
 *
 * 5. **Neighbor Search**: We use a basic spatial hash, which is good but
 *    production code might use more sophisticated approaches.
 *
 * ## Why These Simplifications?
 *
 * - The math is easier to follow
 * - The code runs faster (important for learning/experimentation)
 * - The visual result is still "fluid-like" and satisfying
 * - You can understand every line without fluid dynamics expertise
 *
 * @see {@link https://en.wikipedia.org/wiki/Smoothed-particle_hydrodynamics}
 */

import {
  Group,
  InstancedMesh,
  SphereGeometry,
  MeshStandardMaterial,
  Object3D,
  Matrix4,
  Vector3,
  Color,
} from 'three';
import type {
  Demo,
  FluidParticle,
  FluidParams,
  ParameterSchema,
  InputState,
} from '../types';
import { ObjectPool, SpatialHash } from '../utils';

// =============================================================================
// Constants
// =============================================================================

/** Default number of particles */
const DEFAULT_PARTICLE_COUNT = 200;

/** Default gravity strength (downward) */
const DEFAULT_GRAVITY = 9.8;

/** Default viscosity (resistance to flow) */
const DEFAULT_VISCOSITY = 0.1;

/** Default rest density (equilibrium state) */
const DEFAULT_REST_DENSITY = 1.0;

/** Default damping when hitting boundaries */
const DEFAULT_BOUNDARY_DAMPING = 0.6;

/** Particle visual radius */
const PARTICLE_RADIUS = 0.08;

/** Interaction radius for SPH calculations (how far to look for neighbors) */
const SMOOTHING_RADIUS = 0.4;

/** Pressure multiplier (how strongly particles repel when crowded) */
const PRESSURE_MULTIPLIER = 50.0;

/** Container half-size (boundary box extends from -SIZE to +SIZE) */
const CONTAINER_SIZE = 2.0;

/** Maximum velocity to prevent particles from escaping */
const MAX_VELOCITY = 10.0;

/** Force applied when user clicks */
const CLICK_FORCE_STRENGTH = 8.0;

/** Radius of user click force effect */
const CLICK_FORCE_RADIUS = 1.0;

/** Default parameters */
const DEFAULT_PARAMS: FluidParams = {
  particleCount: DEFAULT_PARTICLE_COUNT,
  gravity: DEFAULT_GRAVITY,
  viscosity: DEFAULT_VISCOSITY,
  restDensity: DEFAULT_REST_DENSITY,
  boundaryDamping: DEFAULT_BOUNDARY_DAMPING,
};

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Internal particle data structure with additional simulation state.
 * Extends FluidParticle with acceleration for physics integration.
 */
interface InternalParticle extends FluidParticle {
  /** Accumulated acceleration this frame */
  acceleration: Vector3;
  /** Index in the InstancedMesh */
  index: number;
}

// =============================================================================
// FluidDemo Class
// =============================================================================

/**
 * FluidDemo implements a fluid-like particle simulation.
 *
 * Features:
 * - Particles that flow under gravity
 * - Boundary collision with bouncing/pooling
 * - Simplified SPH-like density and pressure forces
 * - Viscosity that makes particles move together
 * - Mouse interaction to stir the fluid
 *
 * @example
 * ```typescript
 * const demo = new FluidDemo();
 * demo.start();
 * scene.add(...demo.getSceneObjects());
 *
 * // In animation loop:
 * demo.update(deltaTime);
 * demo.onInput(inputState);
 * ```
 */
export class FluidDemo implements Demo {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  /** Current parameters */
  private params: FluidParams;

  /** Container for all demo objects */
  private group: Group;

  /** Instanced mesh for efficient particle rendering */
  private instancedMesh: InstancedMesh | null = null;

  /** Pool of particle objects */
  private particlePool: ObjectPool<InternalParticle>;

  /** Active particles in the simulation */
  private particles: InternalParticle[] = [];

  /** Spatial hash for efficient neighbor queries */
  private spatialHash: SpatialHash<InternalParticle>;

  /** Whether the demo is currently running */
  private running: boolean = false;

  /** Reusable matrix for instance transforms */
  private tempMatrix: Matrix4 = new Matrix4();

  /** Reusable vectors for physics calculations */
  private tempVec1: Vector3 = new Vector3();
  private tempVec2: Vector3 = new Vector3();

  /** Current input state for interaction */
  private currentInputState: InputState | null = null;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Creates a new FluidDemo instance.
   * @param params - Optional initial parameters
   */
  constructor(params?: Partial<FluidParams>) {
    this.params = { ...DEFAULT_PARAMS, ...params };

    // Create container group
    this.group = new Group();

    // Initialize spatial hash with cell size = 2 * smoothing radius
    // This ensures we check ~27 cells for neighbor queries (optimal)
    this.spatialHash = new SpatialHash<InternalParticle>(SMOOTHING_RADIUS * 2);

    // Initialize particle pool
    this.particlePool = new ObjectPool<InternalParticle>(
      () => this.createParticle(),
      this.params.particleCount,
      (p) => this.resetParticle(p)
    );

    // Create the instanced mesh for rendering
    this.createInstancedMesh();

    // Initialize particles
    this.initializeParticles();
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Starts the fluid simulation.
   */
  start(): void {
    this.running = true;
  }

  /**
   * Stops the fluid simulation.
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Resets the simulation to initial state.
   */
  reset(): void {
    // Release all particles
    for (const particle of this.particles) {
      this.particlePool.release(particle);
    }
    this.particles = [];

    // Reinitialize
    this.initializeParticles();
    this.spatialHash.clear();
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Update
  // -------------------------------------------------------------------------

  /**
   * Updates the fluid simulation.
   *
   * The simulation loop follows these steps:
   * 1. Clear spatial hash and rebuild with current positions
   * 2. Calculate density and pressure for each particle
   * 3. Calculate and apply forces (pressure, viscosity, gravity)
   * 4. Apply user interaction forces
   * 5. Integrate velocities and positions
   * 6. Handle boundary collisions
   * 7. Update visual representation
   *
   * @param deltaTime - Time elapsed since last frame (seconds)
   */
  update(deltaTime: number): void {
    if (!this.running || this.particles.length === 0) {
      return;
    }

    // Clamp delta time to prevent instability
    const dt = Math.min(deltaTime, 0.033); // Cap at ~30fps minimum

    // Step 1: Rebuild spatial hash with current positions
    this.spatialHash.clear();
    for (const particle of this.particles) {
      this.spatialHash.insert(particle.position, particle);
    }

    // Step 2: Calculate density and pressure
    this.computeDensityPressure();

    // Step 3: Calculate forces
    this.computeForces();

    // Step 4: Apply user interaction
    this.applyUserInteraction();

    // Step 5: Integrate (update velocities and positions)
    this.integrate(dt);

    // Step 6: Handle boundaries
    this.handleBoundaries();

    // Step 7: Update instanced mesh
    this.updateInstancedMesh();
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Input
  // -------------------------------------------------------------------------

  /**
   * Processes input for user interaction.
   *
   * When the mouse is down, particles near the mouse position
   * receive a force that pushes them away, creating a "stir" effect.
   *
   * @param state - Current input state
   */
  onInput(state: InputState): void {
    this.currentInputState = state;
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Parameters
  // -------------------------------------------------------------------------

  /**
   * Returns the parameter schema for the control panel.
   */
  getParameterSchema(): ParameterSchema[] {
    return [
      {
        key: 'particleCount',
        label: 'Particle Count',
        type: 'number',
        min: 50,
        max: 500,
        step: 50,
        default: DEFAULT_PARAMS.particleCount,
      },
      {
        key: 'gravity',
        label: 'Gravity',
        type: 'number',
        min: 0,
        max: 20,
        step: 1,
        default: DEFAULT_PARAMS.gravity,
      },
      {
        key: 'viscosity',
        label: 'Viscosity',
        type: 'number',
        min: 0,
        max: 1,
        step: 0.05,
        default: DEFAULT_PARAMS.viscosity,
      },
      {
        key: 'restDensity',
        label: 'Rest Density',
        type: 'number',
        min: 0.1,
        max: 5,
        step: 0.1,
        default: DEFAULT_PARAMS.restDensity,
      },
      {
        key: 'boundaryDamping',
        label: 'Boundary Damping',
        type: 'number',
        min: 0.1,
        max: 1,
        step: 0.1,
        default: DEFAULT_PARAMS.boundaryDamping,
      },
    ];
  }

  /**
   * Sets a parameter value.
   *
   * @param key - Parameter key
   * @param value - New value
   */
  setParameter(key: string, value: unknown): void {
    switch (key) {
      case 'particleCount':
        this.setParticleCount(value as number);
        break;
      case 'gravity':
        this.params.gravity = value as number;
        break;
      case 'viscosity':
        this.params.viscosity = value as number;
        break;
      case 'restDensity':
        this.params.restDensity = value as number;
        break;
      case 'boundaryDamping':
        this.params.boundaryDamping = value as number;
        break;
    }
  }

  // -------------------------------------------------------------------------
  // Demo Interface: Scene Objects
  // -------------------------------------------------------------------------

  /**
   * Returns the Three.js objects for scene integration.
   */
  getSceneObjects(): Object3D[] {
    return [this.group];
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Applies an external force at a position.
   * Useful for programmatic interaction.
   *
   * @param position - Position to apply force at
   * @param force - Force vector to apply
   * @param radius - Radius of effect
   */
  applyForce(position: Vector3, force: Vector3, radius: number = 1.0): void {
    const radiusSq = radius * radius;

    for (const particle of this.particles) {
      const dx = particle.position.x - position.x;
      const dy = particle.position.y - position.y;
      const dz = particle.position.z - position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < radiusSq && distSq > 0.0001) {
        // Linear falloff
        const dist = Math.sqrt(distSq);
        const factor = 1 - dist / radius;

        particle.acceleration.x += force.x * factor;
        particle.acceleration.y += force.y * factor;
        particle.acceleration.z += force.z * factor;
      }
    }
  }

  /**
   * Disposes of all resources.
   */
  dispose(): void {
    this.stop();

    // Dispose instanced mesh
    if (this.instancedMesh) {
      this.instancedMesh.geometry.dispose();
      if (this.instancedMesh.material instanceof MeshStandardMaterial) {
        this.instancedMesh.material.dispose();
      }
    }

    // Clear particles
    this.particles = [];
    this.particlePool.dispose();

    // Clear group
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }

  // -------------------------------------------------------------------------
  // Private: Initialization
  // -------------------------------------------------------------------------

  /**
   * Creates a new particle instance (factory for ObjectPool).
   */
  private createParticle(): InternalParticle {
    return {
      position: new Vector3(),
      velocity: new Vector3(),
      acceleration: new Vector3(),
      density: 0,
      pressure: 0,
      index: -1,
    };
  }

  /**
   * Resets a particle to default state (reset function for ObjectPool).
   */
  private resetParticle(p: InternalParticle): void {
    p.position.set(0, 0, 0);
    p.velocity.set(0, 0, 0);
    p.acceleration.set(0, 0, 0);
    p.density = 0;
    p.pressure = 0;
    p.index = -1;
  }

  /**
   * Creates the instanced mesh for efficient particle rendering.
   *
   * InstancedMesh allows rendering many copies of the same geometry
   * in a single draw call, which is much faster than individual meshes.
   */
  private createInstancedMesh(): void {
    // Create sphere geometry for each particle
    const geometry = new SphereGeometry(PARTICLE_RADIUS, 16, 8);

    // Semi-transparent blue material for fluid appearance
    const material = new MeshStandardMaterial({
      color: new Color(0x4488ff),
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
    });

    // Create instanced mesh with max particle count
    // We allocate for the maximum to avoid recreating the mesh
    this.instancedMesh = new InstancedMesh(
      geometry,
      material,
      this.params.particleCount
    );

    // Enable matrix updates
    this.instancedMesh.instanceMatrix.setUsage(35048); // THREE.DynamicDrawUsage

    this.group.add(this.instancedMesh);
  }

  /**
   * Initializes particles in a grid formation at the top of the container.
   */
  private initializeParticles(): void {
    const count = this.params.particleCount;
    const spacing = SMOOTHING_RADIUS * 0.5;

    // Calculate grid dimensions
    const gridSize = Math.ceil(Math.cbrt(count));

    // Start position (upper portion of container)
    const startX = -spacing * (gridSize - 1) * 0.5;
    const startY = CONTAINER_SIZE * 0.3; // Start above center
    const startZ = -spacing * (gridSize - 1) * 0.5;

    let created = 0;
    for (let x = 0; x < gridSize && created < count; x++) {
      for (let y = 0; y < gridSize && created < count; y++) {
        for (let z = 0; z < gridSize && created < count; z++) {
          const particle = this.particlePool.acquire();
          particle.index = created;

          // Position in grid with small random offset
          particle.position.set(
            startX + x * spacing + (Math.random() - 0.5) * 0.05,
            startY + y * spacing + (Math.random() - 0.5) * 0.05,
            startZ + z * spacing + (Math.random() - 0.5) * 0.05
          );

          // Small random initial velocity
          particle.velocity.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
          );

          this.particles.push(particle);
          created++;
        }
      }
    }

    // Update instanced mesh to show initial positions
    this.updateInstancedMesh();
  }

  // -------------------------------------------------------------------------
  // Private: Physics Simulation
  // -------------------------------------------------------------------------

  /**
   * Computes density and pressure for each particle.
   *
   * ## SPH Density Calculation (Simplified)
   *
   * Real SPH: density_i = sum_j(m_j * W(|r_i - r_j|, h))
   * Where W is a smoothing kernel function.
   *
   * Our simplification:
   * - Count neighbors with distance-based weighting
   * - Use linear falloff instead of kernel function
   *
   * ## Pressure Calculation
   *
   * We use a simple linear relationship:
   * pressure = k * (density - restDensity)
   *
   * When density > restDensity, pressure is positive (push apart)
   * When density < restDensity, pressure is negative (pull together)
   */
  private computeDensityPressure(): void {
    for (const particle of this.particles) {
      // Query neighbors within smoothing radius
      const neighbors = this.spatialHash.queryWithDistance(
        particle.position,
        SMOOTHING_RADIUS,
        (p) => p.position
      );

      // Calculate density based on neighbor count and distance
      let density = 0;
      for (const { distanceSq } of neighbors) {
        const dist = Math.sqrt(distanceSq);
        // Linear falloff: full weight at center, zero at smoothing radius
        const weight = 1 - dist / SMOOTHING_RADIUS;
        density += weight;
      }

      particle.density = density;

      // Calculate pressure (negative means underdensity = attraction)
      particle.pressure =
        PRESSURE_MULTIPLIER * (density - this.params.restDensity);
    }
  }

  /**
   * Computes and applies forces to particles.
   *
   * Forces include:
   * - Pressure: Pushes particles apart when crowded
   * - Viscosity: Makes nearby particles move together
   * - Gravity: Pulls particles downward
   */
  private computeForces(): void {
    const gravity = this.params.gravity;
    const viscosity = this.params.viscosity;

    for (const particle of this.particles) {
      // Reset acceleration
      particle.acceleration.set(0, 0, 0);

      // Apply gravity (downward along Y axis)
      particle.acceleration.y -= gravity;

      // Get neighbors for pressure and viscosity forces
      const neighbors = this.spatialHash.queryWithDistance(
        particle.position,
        SMOOTHING_RADIUS,
        (p) => p.position
      );

      for (const { item: neighbor, distanceSq } of neighbors) {
        // Skip self
        if (neighbor === particle) continue;

        const dist = Math.sqrt(distanceSq);
        if (dist < 0.0001) continue; // Prevent division by zero

        // Direction from neighbor to this particle
        this.tempVec1.subVectors(particle.position, neighbor.position);
        this.tempVec1.divideScalar(dist);

        // -------------------------------------------------------------------
        // Pressure Force
        // -------------------------------------------------------------------
        // Real SPH: F_pressure = -sum_j(m_j * (p_i + p_j)/(2*rho_j) * gradW)
        // Our simplification: symmetric pressure average with linear gradient
        const avgPressure = (particle.pressure + neighbor.pressure) * 0.5;
        const pressureWeight = 1 - dist / SMOOTHING_RADIUS;

        // Force magnitude (negative pressure = attraction)
        const pressureForce = avgPressure * pressureWeight * 0.1;

        particle.acceleration.x += this.tempVec1.x * pressureForce;
        particle.acceleration.y += this.tempVec1.y * pressureForce;
        particle.acceleration.z += this.tempVec1.z * pressureForce;

        // -------------------------------------------------------------------
        // Viscosity Force
        // -------------------------------------------------------------------
        // Real SPH: F_viscosity = mu * sum_j(m_j * (v_j - v_i)/rho_j * laplacianW)
        // Our simplification: blend velocities based on distance
        const viscosityWeight = (1 - dist / SMOOTHING_RADIUS) * viscosity;

        // Velocity difference
        this.tempVec2.subVectors(neighbor.velocity, particle.velocity);

        particle.acceleration.x += this.tempVec2.x * viscosityWeight;
        particle.acceleration.y += this.tempVec2.y * viscosityWeight;
        particle.acceleration.z += this.tempVec2.z * viscosityWeight;
      }
    }
  }

  /**
   * Applies force based on user input (mouse click/drag).
   */
  private applyUserInteraction(): void {
    if (!this.currentInputState || !this.currentInputState.isMouseDown) {
      return;
    }

    const mousePos = this.currentInputState.mouseWorldPosition;

    // Apply radial force from mouse position
    for (const particle of this.particles) {
      const dx = particle.position.x - mousePos.x;
      const dy = particle.position.y - mousePos.y;
      // Note: mouseWorldPosition is on z=0 plane, so we use 2D distance
      const distSq = dx * dx + dy * dy;
      const radiusSq = CLICK_FORCE_RADIUS * CLICK_FORCE_RADIUS;

      if (distSq < radiusSq && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const factor = (1 - dist / CLICK_FORCE_RADIUS) * CLICK_FORCE_STRENGTH;

        // Push outward from mouse position
        particle.acceleration.x += (dx / dist) * factor;
        particle.acceleration.y += (dy / dist) * factor;
        // Also add some upward force for visual interest
        particle.acceleration.y += factor * 0.5;
      }
    }
  }

  /**
   * Integrates velocities and positions using Euler integration.
   *
   * Real simulations often use more sophisticated integrators like
   * Leapfrog or Verlet for better stability. Euler is simpler to
   * understand but can be less stable at high velocities.
   *
   * @param dt - Time step
   */
  private integrate(dt: number): void {
    for (const particle of this.particles) {
      // Update velocity: v += a * dt
      particle.velocity.x += particle.acceleration.x * dt;
      particle.velocity.y += particle.acceleration.y * dt;
      particle.velocity.z += particle.acceleration.z * dt;

      // Clamp velocity to prevent instability
      const speed = particle.velocity.length();
      if (speed > MAX_VELOCITY) {
        particle.velocity.multiplyScalar(MAX_VELOCITY / speed);
      }

      // Update position: p += v * dt
      particle.position.x += particle.velocity.x * dt;
      particle.position.y += particle.velocity.y * dt;
      particle.position.z += particle.velocity.z * dt;
    }
  }

  /**
   * Handles boundary collisions.
   *
   * When a particle hits a wall:
   * 1. Move it back inside the boundary
   * 2. Reflect its velocity (bounce)
   * 3. Apply damping to simulate energy loss
   */
  private handleBoundaries(): void {
    const damping = this.params.boundaryDamping;
    const bound = CONTAINER_SIZE - PARTICLE_RADIUS;

    for (const particle of this.particles) {
      // X boundaries
      if (particle.position.x < -bound) {
        particle.position.x = -bound;
        particle.velocity.x *= -damping;
      } else if (particle.position.x > bound) {
        particle.position.x = bound;
        particle.velocity.x *= -damping;
      }

      // Y boundaries (floor and ceiling)
      if (particle.position.y < -bound) {
        particle.position.y = -bound;
        particle.velocity.y *= -damping;
      } else if (particle.position.y > bound) {
        particle.position.y = bound;
        particle.velocity.y *= -damping;
      }

      // Z boundaries
      if (particle.position.z < -bound) {
        particle.position.z = -bound;
        particle.velocity.z *= -damping;
      } else if (particle.position.z > bound) {
        particle.position.z = bound;
        particle.velocity.z *= -damping;
      }
    }
  }

  /**
   * Updates the instanced mesh with current particle positions.
   *
   * Each particle's position is encoded as a transformation matrix.
   * We also optionally color particles based on velocity or pressure.
   */
  private updateInstancedMesh(): void {
    if (!this.instancedMesh) return;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Create transform matrix for this particle
      this.tempMatrix.makeTranslation(
        particle.position.x,
        particle.position.y,
        particle.position.z
      );

      // Set the matrix for this instance
      this.instancedMesh.setMatrixAt(i, this.tempMatrix);
    }

    // Mark the matrix as needing update for GPU upload
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Set instance count to actual particle count
    this.instancedMesh.count = this.particles.length;
  }

  /**
   * Changes the particle count, reinitializing if necessary.
   */
  private setParticleCount(count: number): void {
    if (count === this.params.particleCount) return;

    this.params.particleCount = count;

    // Recreate instanced mesh with new capacity
    if (this.instancedMesh) {
      this.group.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      if (this.instancedMesh.material instanceof MeshStandardMaterial) {
        this.instancedMesh.material.dispose();
      }
    }

    // Recreate pool with new capacity
    this.particlePool.dispose();
    this.particlePool = new ObjectPool<InternalParticle>(
      () => this.createParticle(),
      count,
      (p) => this.resetParticle(p)
    );

    // Clear current particles
    this.particles = [];

    // Recreate mesh and particles
    this.createInstancedMesh();
    this.initializeParticles();
  }
}
