/**
 * Particle System Wizard Steps
 *
 * Learning content for the particle system demo (ParticleDemo.ts).
 * Organized into three complexity tiers: Micro, Medium, and Advanced.
 *
 * Each step references actual code from ParticleDemo.ts with line numbers,
 * annotations explaining "why", and parameter bindings for interactivity.
 *
 * @see FR-001, FR-002, FR-003, FR-006
 */

import { DemoType } from '../../types';
import { ComplexityTier, WizardStep } from '../../wizard/types';

// ============================================================================
// MICRO CONCEPTS (Foundational building blocks)
// ============================================================================

/**
 * Step 1: What is a Particle?
 * Introduces the particle data structure.
 */
export const particleWhatIs: WizardStep = {
  id: 'particle-what-is',
  title: 'What is a Particle?',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Particles,
  description: `A particle is simply a point in 3D space with properties that change over time.
Unlike solid objects, particles are lightweight data structures designed for rendering
thousands of points efficiently.

The key insight is that a particle system trades individual control for scale —
each particle follows simple rules, but together they create complex visual effects.`,
  learningObjectives: [
    'Understand the particle data structure',
    'Learn why particles use simple objects instead of classes',
    'Recognize the core properties every particle needs',
  ],
  codeSnippets: [
    {
      id: 'particle-data-interface',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 45,
      endLine: 52,
      title: 'Particle Data Structure',
      focusLines: [46, 47, 48, 49, 50],
    },
  ],
  annotations: [
    {
      id: 'particle-position',
      lineStart: 46,
      lineEnd: 46,
      content: 'Position is a Vector3 that stores the X, Y, Z coordinates where this particle exists in 3D space.',
      highlightType: 'concept',
    },
    {
      id: 'particle-velocity',
      lineStart: 47,
      lineEnd: 47,
      content: 'Velocity determines how fast and in what direction the particle moves each frame.',
      highlightType: 'concept',
    },
    {
      id: 'particle-age-lifetime',
      lineStart: 48,
      lineEnd: 49,
      content: 'Age tracks time since birth. When age exceeds lifetime, the particle "dies" and is recycled.',
      highlightType: 'pattern',
    },
    {
      id: 'particle-alive-flag',
      lineStart: 50,
      lineEnd: 50,
      content: 'The alive flag is an optimization — dead particles skip updates and can be reused immediately.',
      highlightType: 'tip',
    },
  ],
  order: 1,
};

/**
 * Step 2: Particle Lifecycle
 * Birth, update, death cycle.
 */
export const particleLifecycle: WizardStep = {
  id: 'particle-lifecycle',
  title: 'Particle Lifecycle',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Particles,
  description: `Every particle goes through the same lifecycle: birth, update, death.

**Birth**: A new particle is created with initial properties (position, velocity, lifetime).
**Update**: Each frame, the particle's position changes based on velocity and forces.
**Death**: When age exceeds lifetime, the particle is marked dead and can be recycled.

This simple cycle, repeated thousands of times, creates the continuous flow of a particle system.`,
  learningObjectives: [
    'Understand the three phases of particle life',
    'Learn how age and lifetime control particle death',
    'See why recycling matters for performance',
  ],
  codeSnippets: [
    {
      id: 'particle-death-check',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 493,
      endLine: 501,
      title: 'Death Check',
      focusLines: [494, 497, 498, 499],
    },
  ],
  annotations: [
    {
      id: 'age-update',
      lineStart: 494,
      lineEnd: 494,
      content: 'Every frame, we add deltaTime to age. This accumulates real elapsed time, not frame count.',
      highlightType: 'concept',
    },
    {
      id: 'death-condition',
      lineStart: 497,
      lineEnd: 500,
      content: 'When age >= lifetime, the particle is "dead". We mark it and queue it for removal. Dead particles are returned to the pool for reuse.',
      highlightType: 'pattern',
    },
  ],
  order: 2,
  prerequisites: ['particle-what-is'],
};

/**
 * Step 3: Emission Basics
 * Creating particles over time.
 */
export const particleEmission: WizardStep = {
  id: 'particle-emission',
  title: 'Emission Basics',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Particles,
  description: `Emission is how new particles enter the system. The emission rate controls
how many particles spawn per second. This creates a continuous stream rather than spawning
all particles at once.

The key technique is using an **accumulator** — we add time each frame and spawn a particle
whenever we've accumulated enough time for one. This smooths out particle creation across
frames with varying delta times.`,
  learningObjectives: [
    'Understand emission rate as particles-per-second',
    'Learn the accumulator pattern for smooth spawning',
    'See how emission point controls where particles appear',
  ],
  codeSnippets: [
    {
      id: 'emit-particles-method',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 405,
      endLine: 418,
      title: 'Emission Logic',
      focusLines: [407, 410, 411, 412, 416],
    },
  ],
  annotations: [
    {
      id: 'accumulator-pattern',
      lineStart: 407,
      lineEnd: 407,
      content: 'The accumulator adds deltaTime each frame. This converts variable frame times into consistent emission.',
      highlightType: 'pattern',
    },
    {
      id: 'particles-to-emit',
      lineStart: 410,
      lineEnd: 412,
      content: 'We calculate how many whole particles to emit: accumulator × rate = particle count. Floor to get integers.',
      highlightType: 'concept',
    },
    {
      id: 'accumulator-subtract',
      lineStart: 416,
      lineEnd: 416,
      content: 'After emitting, we subtract the time "used" to emit those particles. The remainder carries over to next frame.',
      highlightType: 'tip',
    },
  ],
  parameters: [
    {
      parameterKey: 'emissionRate',
      codeLocation: {
        id: 'emission-rate-param',
        sourceFile: 'demos/ParticleDemo.ts',
        startLine: 33,
        endLine: 33,
      },
      variableName: 'this.params.emissionRate',
      explanation: 'How many particles spawn per second. Higher = denser effect, lower = sparse.',
    },
  ],
  order: 3,
  prerequisites: ['particle-lifecycle'],
};

/**
 * Step 4: Initial Velocity
 * Direction and spread.
 */
export const particleVelocity: WizardStep = {
  id: 'particle-velocity',
  title: 'Initial Velocity',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Particles,
  description: `When a particle is born, it needs an initial velocity — a direction and speed
to start moving. This determines the "shape" of the particle effect.

The code uses **spherical coordinates** (theta and phi angles) to create a cone-shaped
emission pattern. Theta rotates around the vertical axis (360°), while phi controls the
cone's angle from vertical.`,
  learningObjectives: [
    'Understand how velocity creates movement direction',
    'Learn spherical coordinates for directional spread',
    'See how initial speed scales the velocity vector',
  ],
  codeSnippets: [
    {
      id: 'velocity-init',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 431,
      endLine: 442,
      title: 'Velocity Initialization',
      focusLines: [432, 433, 436, 437, 438, 439, 440, 441],
    },
  ],
  annotations: [
    {
      id: 'theta-phi',
      lineStart: 432,
      lineEnd: 433,
      content: 'Theta is random 0-360°, phi is 0 to ~29°. Together they create a cone pointing upward with random spread.',
      highlightType: 'concept',
    },
    {
      id: 'velocity-components',
      lineStart: 436,
      lineEnd: 440,
      content: 'These formulas convert spherical (theta, phi) to Cartesian (x, y, z). The cos(phi) gives the upward component.',
      highlightType: 'pattern',
    },
    {
      id: 'speed-multiply',
      lineStart: 441,
      lineEnd: 441,
      content: 'multiplyScalar scales the unit direction by speed. Higher speed = particles move faster.',
      highlightType: 'tip',
    },
  ],
  parameters: [
    {
      parameterKey: 'initialSpeed',
      codeLocation: {
        id: 'speed-param',
        sourceFile: 'demos/ParticleDemo.ts',
        startLine: 35,
        endLine: 35,
      },
      variableName: 'this.params.initialSpeed',
      explanation: 'How fast particles move when born. Affects how far they travel before dying.',
    },
  ],
  order: 4,
  prerequisites: ['particle-emission'],
};

/**
 * Step 5: BufferGeometry for Particles
 * Efficient rendering with GPU buffers.
 */
export const particleGeometry: WizardStep = {
  id: 'particle-geometry',
  title: 'BufferGeometry for Particles',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Particles,
  description: `To render thousands of particles efficiently, we use **BufferGeometry** —
a Three.js structure that stores vertex data in typed arrays for direct GPU upload.

Instead of creating individual objects for each particle, we use a single Points object
backed by Float32Arrays for positions, colors, and sizes. The GPU receives all data in
one batch, dramatically improving performance.`,
  learningObjectives: [
    'Understand why BufferGeometry is efficient for particles',
    'Learn about Float32Array for GPU data',
    'See how buffer attributes work',
  ],
  codeSnippets: [
    {
      id: 'buffer-setup',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 165,
      endLine: 196,
      title: 'Buffer Initialization',
      focusLines: [166, 169, 170, 171, 185, 186, 187],
    },
  ],
  annotations: [
    {
      id: 'typed-arrays',
      lineStart: 169,
      lineEnd: 171,
      content: 'Float32Array holds raw binary data the GPU can read directly. Each particle needs 3 floats for position (x,y,z).',
      highlightType: 'concept',
    },
    {
      id: 'buffer-attribute',
      lineStart: 185,
      lineEnd: 187,
      content: 'Float32BufferAttribute wraps the array and tells Three.js how to interpret it. The "3" means read 3 values per vertex.',
      highlightType: 'pattern',
    },
    {
      id: 'dynamic-usage',
      lineStart: 186,
      lineEnd: 186,
      content: 'DynamicDrawUsage (35048) hints to WebGL that this buffer updates frequently, optimizing GPU memory allocation.',
      highlightType: 'tip',
    },
  ],
  order: 5,
  prerequisites: ['particle-velocity'],
};

// ============================================================================
// MEDIUM CONCEPTS (Combined patterns)
// ============================================================================

/**
 * Step 6: Applying Forces
 * Gravity and acceleration.
 */
export const particleForces: WizardStep = {
  id: 'particle-forces',
  title: 'Applying Forces',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Particles,
  description: `Forces like gravity make particles behave realistically. We apply forces by
modifying velocity each frame — this is **Euler integration**, the simplest physics simulation.

The formula is: velocity += force × deltaTime. Over many frames, this accumulates into
natural-looking motion: particles arc upward then fall back down.`,
  learningObjectives: [
    'Understand how forces modify velocity over time',
    'Learn Euler integration for physics simulation',
    'See how gravity creates parabolic trajectories',
  ],
  codeSnippets: [
    {
      id: 'gravity-application',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 461,
      endLine: 472,
      title: 'Applying Gravity',
      focusLines: [462, 468, 469, 470, 471],
    },
  ],
  annotations: [
    {
      id: 'gravity-vector',
      lineStart: 462,
      lineEnd: 462,
      content: 'Gravity is a Vector3. Default is (0, -2, 0) — purely downward. You can make it diagonal or even upward!',
      highlightType: 'concept',
    },
    {
      id: 'velocity-update',
      lineStart: 468,
      lineEnd: 471,
      content: 'We add gravity × deltaTime to velocity. This is Euler integration — simple but effective for games.',
      highlightType: 'pattern',
    },
  ],
  parameters: [
    {
      parameterKey: 'gravity',
      codeLocation: {
        id: 'gravity-param',
        sourceFile: 'demos/ParticleDemo.ts',
        startLine: 36,
        endLine: 36,
      },
      variableName: 'this.params.gravity.y',
      explanation: 'Vertical gravity force. Negative = down, positive = up. Zero = particles float.',
    },
  ],
  order: 6,
  prerequisites: ['particle-geometry'],
};

/**
 * Step 7: Color Over Lifetime
 * Fading and color changes.
 */
export const particleColorLifetime: WizardStep = {
  id: 'particle-color-lifetime',
  title: 'Color Over Lifetime',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Particles,
  description: `Particles that fade out over their lifetime look more natural than those that
pop out of existence. We calculate an **alpha** (opacity) value based on how much life remains.

By multiplying the base color by alpha, particles start bright and fade to black. Combined
with additive blending, this creates the glowing, fading trails typical of fire or sparks.`,
  learningObjectives: [
    'Understand life ratio as a 0-1 value',
    'Learn how to fade color based on age',
    'See the connection between color and alpha',
  ],
  codeSnippets: [
    {
      id: 'color-fade',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 529,
      endLine: 537,
      title: 'Color Fading',
      focusLines: [530, 531, 534, 535, 536],
    },
  ],
  annotations: [
    {
      id: 'life-ratio',
      lineStart: 530,
      lineEnd: 530,
      content: 'lifeRatio goes from 0 (just born) to 1 (about to die). We use this to control visual properties.',
      highlightType: 'concept',
    },
    {
      id: 'alpha-calculation',
      lineStart: 531,
      lineEnd: 531,
      content: 'alpha = 1 - lifeRatio means: start at full brightness (1), fade to zero as the particle ages.',
      highlightType: 'pattern',
    },
    {
      id: 'color-multiply',
      lineStart: 534,
      lineEnd: 536,
      content: 'Multiplying RGB by alpha dims the color. With additive blending, faded particles add less light.',
      highlightType: 'tip',
    },
  ],
  order: 7,
  prerequisites: ['particle-forces'],
};

/**
 * Step 8: Size Over Lifetime
 * Growing and shrinking particles.
 */
export const particleSizeLifetime: WizardStep = {
  id: 'particle-size-lifetime',
  title: 'Size Over Lifetime',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Particles,
  description: `Like color fading, particles can shrink as they age. This reinforces the visual
impression of particles "dying" — they fade out AND shrink away.

We use a formula that keeps particles at partial size even at death (0.5 + 0.5 × alpha),
so they don't fully vanish before being removed. This smooths the visual transition.`,
  learningObjectives: [
    'Understand size scaling based on life',
    'Learn to combine size with alpha for smooth death',
    'See how small details improve visual quality',
  ],
  codeSnippets: [
    {
      id: 'size-over-life',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 538,
      endLine: 540,
      title: 'Size Fading',
      focusLines: [539],
    },
  ],
  annotations: [
    {
      id: 'size-formula',
      lineStart: 539,
      lineEnd: 539,
      content: 'The formula 0.5 + 0.5×alpha means: start at full size (1.0), shrink to half size (0.5) at death.',
      highlightType: 'pattern',
    },
  ],
  parameters: [
    {
      parameterKey: 'size',
      codeLocation: {
        id: 'size-param',
        sourceFile: 'demos/ParticleDemo.ts',
        startLine: 37,
        endLine: 37,
      },
      variableName: 'this.params.size',
      explanation: 'Base particle size in world units. Actual size varies over lifetime.',
    },
  ],
  order: 8,
  prerequisites: ['particle-color-lifetime'],
};

/**
 * Step 9: Object Pooling
 * Memory efficiency.
 */
export const particlePooling: WizardStep = {
  id: 'particle-pooling',
  title: 'Object Pooling',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Particles,
  description: `Creating and destroying thousands of objects per second triggers **garbage
collection** pauses that cause stuttering. Object pooling solves this by reusing dead particles.

When a particle dies, instead of being deleted, it's "released" back to the pool. When we need
a new particle, we "acquire" from the pool. The same objects cycle endlessly — no allocation,
no garbage collection.`,
  learningObjectives: [
    'Understand why garbage collection causes stutters',
    'Learn the acquire/release pattern for pooling',
    'See how pooling enables smooth animation',
  ],
  codeSnippets: [
    {
      id: 'pool-creation',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 157,
      endLine: 163,
      title: 'Pool Initialization',
      focusLines: [158, 159, 160, 161, 162],
    },
    {
      id: 'pool-acquire',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 425,
      endLine: 427,
      title: 'Acquiring from Pool',
      focusLines: [426],
    },
  ],
  annotations: [
    {
      id: 'pool-constructor',
      lineStart: 158,
      lineEnd: 162,
      content: 'Pool takes: factory function, initial size, reset function, and batch growth size. Pre-allocates 500 particles.',
      highlightType: 'pattern',
    },
    {
      id: 'acquire-usage',
      lineStart: 426,
      lineEnd: 426,
      content: 'acquire() returns a reset particle from the pool. No "new" keyword = no allocation = no GC.',
      highlightType: 'tip',
    },
  ],
  order: 9,
  prerequisites: ['particle-size-lifetime'],
};

/**
 * Step 10: Particle Materials
 * PointsMaterial configuration.
 */
export const particleMaterials: WizardStep = {
  id: 'particle-materials',
  title: 'Particle Materials',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Particles,
  description: `Three.js renders particles using **PointsMaterial** — a material designed
specifically for point clouds. Key settings control blending, transparency, and depth.

**Additive blending** makes overlapping particles brighter (like fire). **depthWrite: false**
prevents particles from blocking each other. These settings create the glowing,
translucent look typical of particle effects.`,
  learningObjectives: [
    'Understand PointsMaterial for particle rendering',
    'Learn additive blending for glowing effects',
    'See why depth settings matter for transparency',
  ],
  codeSnippets: [
    {
      id: 'material-setup',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 197,
      endLine: 207,
      title: 'Material Configuration',
      focusLines: [199, 200, 201, 202, 203, 204, 205],
    },
  ],
  annotations: [
    {
      id: 'vertex-colors',
      lineStart: 200,
      lineEnd: 200,
      content: 'vertexColors: true means each particle can have its own color from the color buffer attribute.',
      highlightType: 'concept',
    },
    {
      id: 'additive-blending',
      lineStart: 203,
      lineEnd: 203,
      content: 'AdditiveBlending adds pixel colors together. Overlapping particles become brighter — perfect for fire/glow.',
      highlightType: 'pattern',
    },
    {
      id: 'depth-write',
      lineStart: 204,
      lineEnd: 204,
      content: 'depthWrite: false means particles don\'t block each other in the depth buffer. Essential for transparency.',
      highlightType: 'tip',
    },
  ],
  order: 10,
  prerequisites: ['particle-pooling'],
};

// ============================================================================
// ADVANCED CONCEPTS (Full integration)
// ============================================================================

/**
 * Step 11: Mouse Interaction
 * Attractor/repulsor effects.
 */
export const particleInteraction: WizardStep = {
  id: 'particle-interaction',
  title: 'Mouse Interaction',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Particles,
  description: `Making particles respond to mouse input creates an engaging, interactive effect.
When the mouse is down, particles are attracted toward the cursor position.

The attraction uses an **inverse square** force — stronger when close, weaker when far.
This mimics real physics like gravity. A cap prevents infinite force at zero distance.`,
  learningObjectives: [
    'Understand how input state controls particle behavior',
    'Learn inverse square attraction for physics',
    'See how mouse position maps to 3D world space',
  ],
  codeSnippets: [
    {
      id: 'input-handler',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 277,
      endLine: 287,
      title: 'Input Handling',
      focusLines: [279, 280, 281, 282, 283, 284, 286],
    },
    {
      id: 'attraction-force',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 473,
      endLine: 486,
      title: 'Attraction Effect',
      focusLines: [474, 475, 476, 477, 478, 480, 481, 482, 483, 484],
    },
  ],
  annotations: [
    {
      id: 'mouse-emission',
      lineStart: 280,
      lineEnd: 284,
      content: 'Emission point follows the mouse. Particles spawn where you point!',
      highlightType: 'concept',
    },
    {
      id: 'attraction-calc',
      lineStart: 481,
      lineEnd: 482,
      content: 'Inverse square: strength = k/(distance²). Capped at 3 to prevent crazy forces when very close.',
      highlightType: 'pattern',
    },
    {
      id: 'velocity-add',
      lineStart: 484,
      lineEnd: 484,
      content: 'We add the attraction to velocity, not replace it. This lets particles curve toward the mouse gradually.',
      highlightType: 'tip',
    },
  ],
  order: 11,
  prerequisites: ['particle-materials'],
};

/**
 * Step 12: Performance Optimization
 * Max particles and culling.
 */
export const particlePerformance: WizardStep = {
  id: 'particle-performance',
  title: 'Performance Optimization',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Particles,
  description: `Particle systems can easily tank performance if unchecked. Key optimizations:

1. **MAX_PARTICLES cap**: Hard limit prevents runaway particle counts
2. **Hidden particles off-screen**: Dead slots are moved to y=-1000 instead of removed
3. **frustumCulled: false**: Skip Three.js culling since particles are everywhere
4. **Buffer reuse**: Same Float32Arrays are updated, never reallocated`,
  learningObjectives: [
    'Understand particle count limits for performance',
    'Learn techniques to hide instead of remove',
    'See how buffer reuse prevents allocation',
  ],
  codeSnippets: [
    {
      id: 'max-particles',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 28,
      endLine: 29,
      title: 'Particle Limit',
      focusLines: [29],
    },
    {
      id: 'hide-particles',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 542,
      endLine: 545,
      title: 'Hiding Dead Particles',
      focusLines: [543, 544],
    },
  ],
  annotations: [
    {
      id: 'max-limit',
      lineStart: 29,
      lineEnd: 29,
      content: '5000 particles is a reasonable limit. Going higher risks dropping below 30 FPS on mid-range hardware.',
      highlightType: 'warning',
    },
    {
      id: 'hide-technique',
      lineStart: 543,
      lineEnd: 544,
      content: 'Moving to y=-1000 hides particles below the view. Faster than resizing arrays or removing elements.',
      highlightType: 'pattern',
    },
  ],
  order: 12,
  prerequisites: ['particle-interaction'],
};

/**
 * Step 13: Putting It All Together
 * Complete particle system integration.
 */
export const particleComplete: WizardStep = {
  id: 'particle-complete',
  title: 'Putting It All Together',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Particles,
  description: `A complete particle system combines all the concepts we've learned:

- **Data structure** defines what a particle IS
- **Lifecycle** manages birth, update, death
- **Emission** controls when/where particles spawn
- **Physics** (velocity, forces) creates movement
- **Rendering** (buffers, materials) displays particles
- **Optimization** (pooling, limits) ensures performance

The update loop ties it all together: emit → update physics → sync buffers → render.`,
  learningObjectives: [
    'See how all particle concepts work together',
    'Understand the main update loop structure',
    'Recognize patterns for building your own systems',
  ],
  codeSnippets: [
    {
      id: 'update-loop',
      sourceFile: 'demos/ParticleDemo.ts',
      startLine: 259,
      endLine: 270,
      title: 'Main Update Loop',
      focusLines: [261, 262, 263, 266, 269],
    },
  ],
  annotations: [
    {
      id: 'emit-step',
      lineStart: 261,
      lineEnd: 263,
      content: 'Step 1: Emit new particles (only when running). This populates the particle array.',
      highlightType: 'concept',
    },
    {
      id: 'update-step',
      lineStart: 266,
      lineEnd: 266,
      content: 'Step 2: Update all particles — physics, aging, death checks. This is where the simulation happens.',
      highlightType: 'concept',
    },
    {
      id: 'sync-step',
      lineStart: 269,
      lineEnd: 269,
      content: 'Step 3: Sync data to GPU buffers. This prepares the visual representation for rendering.',
      highlightType: 'concept',
    },
  ],
  parameters: [
    {
      parameterKey: 'lifetime',
      codeLocation: {
        id: 'lifetime-param',
        sourceFile: 'demos/ParticleDemo.ts',
        startLine: 34,
        endLine: 34,
      },
      variableName: 'this.params.lifetime',
      explanation: 'How long particles live in seconds. Longer = more particles visible, shorter = quicker turnover.',
    },
  ],
  order: 13,
  prerequisites: ['particle-performance'],
};

// ============================================================================
// EXPORT ALL STEPS
// ============================================================================

/**
 * All particle wizard steps in order.
 */
export const particleSteps: WizardStep[] = [
  // Micro concepts (1-5)
  particleWhatIs,
  particleLifecycle,
  particleEmission,
  particleVelocity,
  particleGeometry,
  // Medium concepts (6-10)
  particleForces,
  particleColorLifetime,
  particleSizeLifetime,
  particlePooling,
  particleMaterials,
  // Advanced concepts (11-13)
  particleInteraction,
  particlePerformance,
  particleComplete,
];

/**
 * Get all micro-level particle steps.
 */
export function getMicroParticleSteps(): WizardStep[] {
  return particleSteps.filter((s) => s.tier === ComplexityTier.Micro);
}

/**
 * Get all medium-level particle steps.
 */
export function getMediumParticleSteps(): WizardStep[] {
  return particleSteps.filter((s) => s.tier === ComplexityTier.Medium);
}

/**
 * Get all advanced-level particle steps.
 */
export function getAdvancedParticleSteps(): WizardStep[] {
  return particleSteps.filter((s) => s.tier === ComplexityTier.Advanced);
}
