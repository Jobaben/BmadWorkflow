/**
 * Fluid Physics Wizard Steps
 *
 * Learning content for the fluid physics demo (FluidDemo.ts).
 * Organized into three complexity tiers: Micro, Medium, and Advanced.
 *
 * IMPORTANT: This is a simplified educational implementation.
 * Real SPH (Smoothed Particle Hydrodynamics) uses more complex math.
 * Each step notes where we've simplified from production implementations.
 *
 * @see FR-001, FR-002, FR-003, FR-006
 */

import { DemoType } from '../../types';
import { ComplexityTier, WizardStep } from '../../wizard/types';

// ============================================================================
// MICRO CONCEPTS (Foundational building blocks)
// ============================================================================

/**
 * Step 1: What is SPH?
 * Simplified explanation of the algorithm.
 */
export const fluidWhatIsSPH: WizardStep = {
  id: 'fluid-what-is-sph',
  title: 'What is SPH?',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Fluid,
  description: `**SPH (Smoothed Particle Hydrodynamics)** represents fluids as particles that
interact based on their neighbors.

The core idea:
- Each particle has properties (position, velocity, density, pressure)
- Particles influence nearby particles within a "smoothing radius"
- Forces push crowded particles apart, pull sparse particles together
- The result looks and behaves like flowing liquid

**Note**: This demo uses a simplified version for learning. Real SPH uses
more complex kernel functions and integration methods.`,
  learningObjectives: [
    'Understand the basic concept of SPH',
    'Learn what properties particles need',
    'Recognize this is a simplified educational version',
  ],
  codeSnippets: [
    {
      id: 'sph-intro',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 1,
      endLine: 42,
      title: 'SPH Overview',
      focusLines: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    },
  ],
  annotations: [
    {
      id: 'sph-properties',
      lineStart: 12,
      lineEnd: 16,
      content: 'The three key properties: density (crowdedness), pressure (push force), and viscosity (resistance to flow).',
      highlightType: 'concept',
    },
    {
      id: 'simplification-note',
      lineStart: 17,
      lineEnd: 32,
      content: 'Real SPH uses poly6/spiky kernels and symplectic integrators. We use linear falloff and Euler for clarity.',
      highlightType: 'warning',
    },
  ],
  order: 1,
};

/**
 * Step 2: Fluid Particles
 * The particle data structure.
 */
export const fluidParticles: WizardStep = {
  id: 'fluid-particles',
  title: 'Fluid Particles',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Fluid,
  description: `Each fluid particle stores:

- **Position**: Where the particle is in 3D space
- **Velocity**: How fast and in what direction it's moving
- **Acceleration**: Forces accumulated this frame
- **Density**: How crowded the local area is
- **Pressure**: Force to push neighbors away

The acceleration is reset each frame, forces are accumulated, then integrated
to update velocity and position.`,
  learningObjectives: [
    'Understand the particle data structure',
    'Learn how acceleration accumulates forces',
    'See how density/pressure relate to each other',
  ],
  codeSnippets: [
    {
      id: 'particle-interface',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 116,
      endLine: 126,
      title: 'Particle Data Structure',
      focusLines: [120, 121, 122, 123, 124, 125],
    },
  ],
  annotations: [
    {
      id: 'acceleration-field',
      lineStart: 122,
      lineEnd: 122,
      content: 'Acceleration is a Vector3 that accumulates all forces (gravity, pressure, viscosity) before integration.',
      highlightType: 'concept',
    },
    {
      id: 'index-field',
      lineStart: 124,
      lineEnd: 124,
      content: 'The index tracks this particle\'s position in the InstancedMesh for efficient rendering.',
      highlightType: 'pattern',
    },
  ],
  order: 2,
  prerequisites: ['fluid-what-is-sph'],
};

/**
 * Step 3: Gravity and Basic Motion
 * Applying forces and Euler integration.
 */
export const fluidGravity: WizardStep = {
  id: 'fluid-gravity',
  title: 'Gravity and Basic Motion',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Fluid,
  description: `The simplest force is **gravity** — a constant downward acceleration.

We use **Euler integration** (the simplest physics integration):
1. acceleration.y = -gravity
2. velocity += acceleration × dt
3. position += velocity × dt

Real physics simulations often use more stable integrators (Verlet, RK4),
but Euler is easier to understand and works fine for visual effects.`,
  learningObjectives: [
    'Understand gravity as constant acceleration',
    'Learn Euler integration for physics',
    'See velocity clamping for stability',
  ],
  codeSnippets: [
    {
      id: 'apply-gravity',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 638,
      endLine: 647,
      title: 'Applying Gravity',
      focusLines: [643, 644, 646, 647],
    },
    {
      id: 'euler-integration',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 730,
      endLine: 757,
      title: 'Euler Integration',
      focusLines: [740, 741, 742, 743, 744, 752, 753, 754, 755],
    },
  ],
  annotations: [
    {
      id: 'gravity-down',
      lineStart: 646,
      lineEnd: 647,
      content: 'Gravity is applied to Y axis (negative = down). This is added to acceleration, not velocity directly.',
      highlightType: 'concept',
    },
    {
      id: 'velocity-update',
      lineStart: 741,
      lineEnd: 744,
      content: 'v += a × dt: Velocity changes based on accumulated acceleration multiplied by time step.',
      highlightType: 'pattern',
    },
    {
      id: 'velocity-clamp',
      lineStart: 746,
      lineEnd: 749,
      content: 'Clamping velocity prevents instability when particles gain too much speed.',
      highlightType: 'warning',
    },
  ],
  parameters: [
    {
      parameterKey: 'gravity',
      codeLocation: {
        id: 'gravity-param',
        sourceFile: 'demos/FluidDemo.ts',
        startLine: 71,
        endLine: 71,
      },
      variableName: 'this.params.gravity',
      explanation: 'Strength of gravitational pull. Higher = particles fall faster.',
    },
  ],
  order: 3,
  prerequisites: ['fluid-particles'],
};

/**
 * Step 4: InstancedMesh for Performance
 * Efficient rendering of many particles.
 */
export const fluidInstancedMesh: WizardStep = {
  id: 'fluid-instanced-mesh',
  title: 'InstancedMesh for Performance',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Fluid,
  description: `Rendering hundreds of particles as individual meshes would be slow.
**InstancedMesh** renders many copies of the same geometry in a single draw call.

How it works:
1. Create ONE sphere geometry and ONE material
2. Create InstancedMesh with max instance count
3. For each particle, set a transform matrix
4. GPU renders all instances in one batch

This is orders of magnitude faster than creating separate mesh objects.`,
  learningObjectives: [
    'Understand why instancing is needed',
    'Learn how InstancedMesh works',
    'See transform matrix updates',
  ],
  codeSnippets: [
    {
      id: 'create-instanced',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 501,
      endLine: 532,
      title: 'Creating InstancedMesh',
      focusLines: [508, 509, 512, 513, 514, 515, 516, 517, 518, 522, 523, 524, 525, 526, 529],
    },
    {
      id: 'update-instances',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 801,
      endLine: 829,
      title: 'Updating Instances',
      focusLines: [810, 814, 815, 816, 817, 818, 821, 825],
    },
  ],
  annotations: [
    {
      id: 'single-geometry',
      lineStart: 508,
      lineEnd: 509,
      content: 'One geometry shared by all particles. The GPU reuses this data for every instance.',
      highlightType: 'concept',
    },
    {
      id: 'instance-count',
      lineStart: 522,
      lineEnd: 526,
      content: 'We allocate for the maximum particle count upfront. instance.count can be adjusted without recreating.',
      highlightType: 'pattern',
    },
    {
      id: 'matrix-update',
      lineStart: 814,
      lineEnd: 818,
      content: 'Each particle\'s position becomes a translation matrix. setMatrixAt updates that instance.',
      highlightType: 'tip',
    },
  ],
  order: 4,
  prerequisites: ['fluid-gravity'],
};

// ============================================================================
// MEDIUM CONCEPTS (Combined patterns)
// ============================================================================

/**
 * Step 5: Boundary Collisions
 * Container walls and bouncing.
 */
export const fluidBoundaries: WizardStep = {
  id: 'fluid-boundaries',
  title: 'Boundary Collisions',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Fluid,
  description: `Particles need to stay inside the container. When a particle crosses a boundary:

1. **Clamp position**: Move it back inside
2. **Reflect velocity**: Reverse the velocity component (bounce)
3. **Apply damping**: Reduce velocity to simulate energy loss

The damping factor (0-1) controls how much energy is lost on each bounce.
Higher damping = particles settle faster.`,
  learningObjectives: [
    'Understand boundary collision detection',
    'Learn velocity reflection for bouncing',
    'See how damping affects behavior',
  ],
  codeSnippets: [
    {
      id: 'boundary-handling',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 759,
      endLine: 799,
      title: 'Boundary Collisions',
      focusLines: [768, 769, 772, 773, 774, 775, 776, 777, 778, 782, 783, 784, 785, 792, 793, 794, 795],
    },
  ],
  annotations: [
    {
      id: 'bound-calc',
      lineStart: 768,
      lineEnd: 769,
      content: 'The bound is container size minus particle radius, so particles don\'t poke through walls.',
      highlightType: 'concept',
    },
    {
      id: 'position-clamp',
      lineStart: 773,
      lineEnd: 774,
      content: 'If past the boundary, snap position back to the edge. This prevents particles escaping.',
      highlightType: 'pattern',
    },
    {
      id: 'velocity-reflect',
      lineStart: 775,
      lineEnd: 775,
      content: 'Multiply velocity by -damping: negative reverses direction, damping < 1 reduces speed.',
      highlightType: 'tip',
    },
  ],
  parameters: [
    {
      parameterKey: 'boundaryDamping',
      codeLocation: {
        id: 'damping-param',
        sourceFile: 'demos/FluidDemo.ts',
        startLine: 80,
        endLine: 80,
      },
      variableName: 'this.params.boundaryDamping',
      explanation: 'Energy retained after hitting a wall. 1.0 = perfect bounce, 0.5 = lose half energy.',
    },
  ],
  order: 5,
  prerequisites: ['fluid-instanced-mesh'],
};

/**
 * Step 6: Density Calculation
 * Counting neighbors with distance weighting.
 */
export const fluidDensity: WizardStep = {
  id: 'fluid-density',
  title: 'Density Calculation',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Fluid,
  description: `**Density** measures how crowded a particle's neighborhood is.

For each particle, we:
1. Find all neighbors within the smoothing radius
2. Weight each neighbor by distance (closer = more influence)
3. Sum the weights to get density

Real SPH uses kernel functions (poly6, spiky) for accurate weighting.
We use simple linear falloff: weight = 1 - (distance / radius).`,
  learningObjectives: [
    'Understand density as neighbor count',
    'Learn distance-based weighting',
    'See the simplified kernel function',
  ],
  codeSnippets: [
    {
      id: 'density-calc',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 584,
      endLine: 628,
      title: 'Density Calculation',
      focusLines: [605, 606, 607, 608, 609, 610, 614, 615, 616, 617, 618, 619, 620, 622],
    },
  ],
  annotations: [
    {
      id: 'neighbor-query',
      lineStart: 606,
      lineEnd: 611,
      content: 'Spatial hash returns neighbors within smoothing radius. This is much faster than checking all particles.',
      highlightType: 'pattern',
    },
    {
      id: 'linear-weight',
      lineStart: 616,
      lineEnd: 619,
      content: 'Linear falloff: full weight (1) at center, zero at smoothing radius. Real SPH uses smoother kernels.',
      highlightType: 'concept',
    },
    {
      id: 'density-sum',
      lineStart: 620,
      lineEnd: 622,
      content: 'Sum all weights to get density. Higher density = more crowded = more pressure.',
      highlightType: 'tip',
    },
  ],
  order: 6,
  prerequisites: ['fluid-boundaries'],
};

/**
 * Step 7: Pressure Forces
 * Pushing particles apart when crowded.
 */
export const fluidPressure: WizardStep = {
  id: 'fluid-pressure',
  title: 'Pressure Forces',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Fluid,
  description: `**Pressure** pushes particles apart when density exceeds the rest density.

\`pressure = k × (density - restDensity)\`

- If density > restDensity: positive pressure (push apart)
- If density < restDensity: negative pressure (pull together)

The force direction is always along the line between particles.
Real SPH uses symmetrized pressure gradients; we average pressure between pairs.`,
  learningObjectives: [
    'Understand pressure as density response',
    'Learn the pressure force calculation',
    'See why rest density matters',
  ],
  codeSnippets: [
    {
      id: 'pressure-calc',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 622,
      endLine: 628,
      title: 'Pressure from Density',
      focusLines: [624, 625, 626, 627],
    },
    {
      id: 'pressure-force',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 667,
      endLine: 681,
      title: 'Applying Pressure Force',
      focusLines: [671, 672, 673, 674, 676, 678, 679, 680],
    },
  ],
  annotations: [
    {
      id: 'pressure-formula',
      lineStart: 625,
      lineEnd: 627,
      content: 'Pressure = multiplier × (density - restDensity). Negative pressure means underdensity = attraction.',
      highlightType: 'concept',
    },
    {
      id: 'average-pressure',
      lineStart: 672,
      lineEnd: 672,
      content: 'Averaging pressure between particles makes forces symmetric: A pushes B as much as B pushes A.',
      highlightType: 'pattern',
    },
    {
      id: 'force-direction',
      lineStart: 664,
      lineEnd: 665,
      content: 'Force direction is along the line connecting particles. We normalize to get unit direction.',
      highlightType: 'tip',
    },
  ],
  parameters: [
    {
      parameterKey: 'restDensity',
      codeLocation: {
        id: 'rest-density-param',
        sourceFile: 'demos/FluidDemo.ts',
        startLine: 77,
        endLine: 77,
      },
      variableName: 'this.params.restDensity',
      explanation: 'Target density. Above this = push apart, below = pull together.',
    },
  ],
  order: 7,
  prerequisites: ['fluid-density'],
};

/**
 * Step 8: Viscosity
 * Smoothing velocities between neighbors.
 */
export const fluidViscosity: WizardStep = {
  id: 'fluid-viscosity',
  title: 'Viscosity',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Fluid,
  description: `**Viscosity** makes nearby particles move together, like honey vs water.

The idea: blend each particle's velocity toward its neighbors' velocities.
Higher viscosity = more blending = thicker fluid.

\`acceleration += (neighborVelocity - myVelocity) × viscosity × weight\`

This creates the smooth, coherent flow characteristic of viscous liquids.`,
  learningObjectives: [
    'Understand viscosity as velocity smoothing',
    'Learn how viscosity affects fluid behavior',
    'See the simplified viscosity calculation',
  ],
  codeSnippets: [
    {
      id: 'viscosity-force',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 683,
      endLine: 695,
      title: 'Viscosity Force',
      focusLines: [686, 687, 690, 692, 693, 694],
    },
  ],
  annotations: [
    {
      id: 'viscosity-weight',
      lineStart: 687,
      lineEnd: 687,
      content: 'Viscosity strength falls off with distance and is scaled by the viscosity parameter.',
      highlightType: 'concept',
    },
    {
      id: 'velocity-diff',
      lineStart: 690,
      lineEnd: 690,
      content: 'We calculate the velocity difference: how much faster/slower is the neighbor moving?',
      highlightType: 'pattern',
    },
    {
      id: 'blend-toward',
      lineStart: 692,
      lineEnd: 694,
      content: 'Adding the weighted difference pulls our velocity toward the neighbor\'s velocity.',
      highlightType: 'tip',
    },
  ],
  parameters: [
    {
      parameterKey: 'viscosity',
      codeLocation: {
        id: 'viscosity-param',
        sourceFile: 'demos/FluidDemo.ts',
        startLine: 74,
        endLine: 74,
      },
      variableName: 'this.params.viscosity',
      explanation: 'How much particles influence each other\'s velocity. 0 = water-like, 1 = honey-like.',
    },
  ],
  order: 8,
  prerequisites: ['fluid-pressure'],
};

// ============================================================================
// ADVANCED CONCEPTS (Full integration)
// ============================================================================

/**
 * Step 9: Spatial Hashing
 * Efficient neighbor lookup.
 */
export const fluidSpatialHash: WizardStep = {
  id: 'fluid-spatial-hash',
  title: 'Spatial Hashing',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Fluid,
  description: `Finding neighbors by checking every particle would be O(n²) — too slow.
**Spatial hashing** divides space into a grid of cells.

How it works:
1. Hash each particle's position to find its cell
2. Insert particle into that cell's list
3. To find neighbors, only check nearby cells (typically 27 in 3D)

This reduces neighbor search to O(n) on average, enabling real-time simulation.`,
  learningObjectives: [
    'Understand why spatial hashing is needed',
    'Learn how cells partition space',
    'See the clear/insert/query pattern',
  ],
  codeSnippets: [
    {
      id: 'spatial-hash-init',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 202,
      endLine: 204,
      title: 'Spatial Hash Initialization',
      focusLines: [202, 203, 204],
    },
    {
      id: 'spatial-hash-update',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 279,
      endLine: 284,
      title: 'Rebuilding Spatial Hash',
      focusLines: [280, 281, 282, 283],
    },
  ],
  annotations: [
    {
      id: 'cell-size',
      lineStart: 203,
      lineEnd: 204,
      content: 'Cell size = 2 × smoothing radius ensures we only need to check ~27 cells (3×3×3) for neighbors.',
      highlightType: 'concept',
    },
    {
      id: 'clear-rebuild',
      lineStart: 280,
      lineEnd: 283,
      content: 'Each frame: clear the hash, reinsert all particles at their new positions. Simple but effective.',
      highlightType: 'pattern',
    },
  ],
  order: 9,
  prerequisites: ['fluid-viscosity'],
};

/**
 * Step 10: Mouse Interaction
 * Stirring the fluid.
 */
export const fluidInteraction: WizardStep = {
  id: 'fluid-interaction',
  title: 'Mouse Interaction',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Fluid,
  description: `Interactive fluid responds to user input, making it engaging.

When the mouse is down:
1. Map mouse position to world coordinates
2. Find particles within a force radius
3. Apply radial force pushing particles outward

The force strength falls off with distance for a natural "stirring" effect.`,
  learningObjectives: [
    'Understand mouse-to-world coordinate mapping',
    'Learn radial force application',
    'See distance-based force falloff',
  ],
  codeSnippets: [
    {
      id: 'user-interaction',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 699,
      endLine: 728,
      title: 'Mouse Interaction',
      focusLines: [702, 703, 704, 707, 710, 711, 712, 713, 714, 715, 717, 718, 719, 722, 723, 725],
    },
  ],
  annotations: [
    {
      id: 'mouse-check',
      lineStart: 702,
      lineEnd: 705,
      content: 'Only apply force when mouse is down. currentInputState is updated by onInput().',
      highlightType: 'concept',
    },
    {
      id: 'distance-check',
      lineStart: 717,
      lineEnd: 717,
      content: 'Only affect particles within the force radius. Skip particles that are too far.',
      highlightType: 'pattern',
    },
    {
      id: 'radial-push',
      lineStart: 722,
      lineEnd: 725,
      content: 'Force pushes outward from mouse position. Upward bias adds a splashing effect.',
      highlightType: 'tip',
    },
  ],
  order: 10,
  prerequisites: ['fluid-spatial-hash'],
};

/**
 * Step 11: Performance Tuning
 * Balancing quality and speed.
 */
export const fluidPerformance: WizardStep = {
  id: 'fluid-performance',
  title: 'Performance Tuning',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Fluid,
  description: `Fluid simulation has many performance tradeoffs:

- **Particle count**: More = prettier but slower
- **Smoothing radius**: Larger = more neighbors to check
- **Time step**: Smaller = more stable but more updates needed
- **Spatial hash cell size**: Should match smoothing radius

This demo clamps deltaTime to prevent instability when frame rate drops.
Production code might use fixed time steps with accumulation.`,
  learningObjectives: [
    'Understand the main performance factors',
    'Learn about time step stability',
    'See practical optimization techniques',
  ],
  codeSnippets: [
    {
      id: 'constants',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 63,
      endLine: 102,
      title: 'Simulation Constants',
      focusLines: [68, 83, 86, 89, 92, 95],
    },
    {
      id: 'time-clamp',
      sourceFile: 'demos/FluidDemo.ts',
      startLine: 271,
      endLine: 278,
      title: 'Time Step Clamping',
      focusLines: [276, 277, 278],
    },
  ],
  annotations: [
    {
      id: 'particle-limit',
      lineStart: 68,
      lineEnd: 68,
      content: '200 particles is a good balance for learning. Production might use 1000+ with better optimization.',
      highlightType: 'concept',
    },
    {
      id: 'smoothing-radius',
      lineStart: 86,
      lineEnd: 86,
      content: 'Larger radius = more accurate but more neighbors to check. 0.4 works well for our particle count.',
      highlightType: 'pattern',
    },
    {
      id: 'dt-clamp',
      lineStart: 277,
      lineEnd: 277,
      content: 'Clamping dt to 0.033 (30fps minimum) prevents huge jumps that cause instability.',
      highlightType: 'warning',
    },
  ],
  parameters: [
    {
      parameterKey: 'particleCount',
      codeLocation: {
        id: 'count-param',
        sourceFile: 'demos/FluidDemo.ts',
        startLine: 68,
        endLine: 68,
      },
      variableName: 'this.params.particleCount',
      explanation: 'Number of fluid particles. More = prettier but slower simulation.',
    },
  ],
  order: 11,
  prerequisites: ['fluid-interaction'],
};

// ============================================================================
// EXPORT ALL STEPS
// ============================================================================

/**
 * All fluid wizard steps in order.
 */
export const fluidSteps: WizardStep[] = [
  // Micro concepts (1-4)
  fluidWhatIsSPH,
  fluidParticles,
  fluidGravity,
  fluidInstancedMesh,
  // Medium concepts (5-8)
  fluidBoundaries,
  fluidDensity,
  fluidPressure,
  fluidViscosity,
  // Advanced concepts (9-11)
  fluidSpatialHash,
  fluidInteraction,
  fluidPerformance,
];

/**
 * Get all micro-level fluid steps.
 */
export function getMicroFluidSteps(): WizardStep[] {
  return fluidSteps.filter((s) => s.tier === ComplexityTier.Micro);
}

/**
 * Get all medium-level fluid steps.
 */
export function getMediumFluidSteps(): WizardStep[] {
  return fluidSteps.filter((s) => s.tier === ComplexityTier.Medium);
}

/**
 * Get all advanced-level fluid steps.
 */
export function getAdvancedFluidSteps(): WizardStep[] {
  return fluidSteps.filter((s) => s.tier === ComplexityTier.Advanced);
}
