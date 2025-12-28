/**
 * Object Animation Wizard Steps
 *
 * Learning content for the object animation demo (ObjectDemo.ts).
 * Organized into three complexity tiers: Micro, Medium, and Advanced.
 *
 * Each step references actual code from ObjectDemo.ts with line numbers,
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
 * Step 1: 3D Transformations Basics
 * Position, rotation, scale fundamentals.
 */
export const objectTransformBasics: WizardStep = {
  id: 'object-transform-basics',
  title: '3D Transformations Basics',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Objects,
  description: `Every 3D object has three fundamental transformations:

- **Position**: Where the object is in 3D space (x, y, z coordinates)
- **Rotation**: How the object is oriented (angles around each axis)
- **Scale**: How large the object is (multipliers for each dimension)

These three properties define the object's "transform" — its complete spatial state.
In Three.js, every Object3D has .position, .rotation, and .scale properties.`,
  learningObjectives: [
    'Understand the three fundamental transformations',
    'Learn how position, rotation, and scale work in 3D',
    'See how transformations are stored in Three.js objects',
  ],
  codeSnippets: [
    {
      id: 'mesh-position',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 409,
      endLine: 418,
      title: 'Setting Object Position',
      focusLines: [410, 411, 412, 413, 414],
    },
  ],
  annotations: [
    {
      id: 'position-circle',
      lineStart: 410,
      lineEnd: 414,
      content: 'Position is set using x, y, z coordinates. Here we use trigonometry to arrange objects in a circle.',
      highlightType: 'concept',
    },
    {
      id: 'angle-calculation',
      lineStart: 410,
      lineEnd: 411,
      content: 'The angle is calculated by dividing the full circle (2π) by the object count, giving even spacing.',
      highlightType: 'pattern',
    },
  ],
  order: 1,
};

/**
 * Step 2: The Mesh Object
 * Geometry + Material = Mesh.
 */
export const objectMesh: WizardStep = {
  id: 'object-mesh',
  title: 'The Mesh Object',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Objects,
  description: `A **Mesh** is the basic visible 3D object in Three.js. It combines two things:

1. **Geometry**: The shape (vertices, faces, edges)
2. **Material**: The appearance (color, shininess, texture)

Think of geometry as the skeleton and material as the skin. The same geometry
can look completely different with different materials — a chrome cube vs a wooden cube.`,
  learningObjectives: [
    'Understand the Mesh = Geometry + Material pattern',
    'Learn about common geometry types (Box, Sphere)',
    'See how materials affect appearance',
  ],
  codeSnippets: [
    {
      id: 'create-mesh',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 386,
      endLine: 407,
      title: 'Creating Mesh Objects',
      focusLines: [389, 390, 391, 392, 400, 401, 402, 403, 404, 407],
    },
  ],
  annotations: [
    {
      id: 'geometry-types',
      lineStart: 389,
      lineEnd: 392,
      content: 'BoxGeometry creates a cube, SphereGeometry creates a ball. The parameters control size and detail level.',
      highlightType: 'concept',
    },
    {
      id: 'material-properties',
      lineStart: 400,
      lineEnd: 404,
      content: 'MeshStandardMaterial responds to lights. Roughness controls shininess, metalness makes it reflective.',
      highlightType: 'pattern',
    },
    {
      id: 'mesh-creation',
      lineStart: 407,
      lineEnd: 407,
      content: 'new Mesh(geometry, material) combines them into a renderable object.',
      highlightType: 'tip',
    },
  ],
  order: 2,
  prerequisites: ['object-transform-basics'],
};

/**
 * Step 3: Delta Time for Smooth Animation
 * Frame-rate independent movement.
 */
export const objectDeltaTime: WizardStep = {
  id: 'object-delta-time',
  title: 'Delta Time for Smooth Animation',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Objects,
  description: `Animation should look the same on all computers, regardless of frame rate.
**Delta time** (dt) is the time elapsed since the last frame.

Instead of moving "5 units per frame" (inconsistent), we move "5 units per second × dt".
This makes animation smooth whether you're running at 30fps or 144fps.

The formula: **new_value = old_value + (speed × deltaTime)**`,
  learningObjectives: [
    'Understand why delta time matters for animation',
    'Learn the time-based animation formula',
    'See how elapsed time accumulates for cyclic animations',
  ],
  codeSnippets: [
    {
      id: 'update-delta',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 196,
      endLine: 213,
      title: 'Using Delta Time',
      focusLines: [202, 203, 204, 207],
    },
  ],
  annotations: [
    {
      id: 'speed-calculation',
      lineStart: 202,
      lineEnd: 204,
      content: 'We combine the base animation speed with an input multiplier, then multiply by deltaTime to get the actual time step.',
      highlightType: 'pattern',
    },
    {
      id: 'elapsed-time',
      lineStart: 207,
      lineEnd: 207,
      content: 'Elapsed time accumulates for animations that depend on "total time" rather than "time since last frame".',
      highlightType: 'concept',
    },
  ],
  parameters: [
    {
      parameterKey: 'animationSpeed',
      codeLocation: {
        id: 'speed-param',
        sourceFile: 'demos/ObjectDemo.ts',
        startLine: 45,
        endLine: 45,
      },
      variableName: 'this.params.animationSpeed',
      explanation: 'Multiplier for animation speed. 1.0 is normal, 0.5 is half speed, 2.0 is double.',
    },
  ],
  order: 3,
  prerequisites: ['object-mesh'],
};

/**
 * Step 4: Rotation Animation
 * Continuous spinning with euler angles.
 */
export const objectRotation: WizardStep = {
  id: 'object-rotation',
  title: 'Rotation Animation',
  tier: ComplexityTier.Micro,
  demoType: DemoType.Objects,
  description: `Rotation in Three.js uses **Euler angles** — rotations around X, Y, and Z axes
measured in radians (not degrees).

To make an object spin, we add to its rotation each frame:
\`mesh.rotation.y += rotationSpeed × deltaTime\`

One full rotation = 2π radians ≈ 6.28. So π/3 radians per second = 60° per second.`,
  learningObjectives: [
    'Understand Euler angles for rotation',
    'Learn to animate rotation over time',
    'See how rotation speed is measured in radians/second',
  ],
  codeSnippets: [
    {
      id: 'apply-rotation',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 469,
      endLine: 485,
      title: 'Rotation Animation',
      focusLines: [479, 480, 481, 484],
    },
  ],
  annotations: [
    {
      id: 'rotation-speed',
      lineStart: 479,
      lineEnd: 481,
      content: 'Math.PI / 3 = 60° per second. We multiply by deltaTime for frame-rate independence.',
      highlightType: 'concept',
    },
    {
      id: 'multi-axis',
      lineStart: 484,
      lineEnd: 484,
      content: 'Adding rotation on multiple axes creates a more complex tumbling motion.',
      highlightType: 'tip',
    },
  ],
  order: 4,
  prerequisites: ['object-delta-time'],
};

// ============================================================================
// MEDIUM CONCEPTS (Combined patterns)
// ============================================================================

/**
 * Step 5: Orbital Motion
 * Circular paths using trigonometry.
 */
export const objectOrbit: WizardStep = {
  id: 'object-orbit',
  title: 'Orbital Motion',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Objects,
  description: `To make an object move in a circle, we use the **parametric circle equation**:

- x = radius × cos(angle)
- z = radius × sin(angle)

As the angle increases over time, the object traces a circular path.
The **phase offset** lets multiple objects orbit with different starting positions.`,
  learningObjectives: [
    'Understand parametric circle equations',
    'Learn how phase offsets create staggered motion',
    'See trigonometry applied to animation',
  ],
  codeSnippets: [
    {
      id: 'orbit-animation',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 487,
      endLine: 519,
      title: 'Orbital Motion',
      focusLines: [506, 507, 508, 511, 512, 518],
    },
  ],
  annotations: [
    {
      id: 'angle-phase',
      lineStart: 506,
      lineEnd: 508,
      content: 'The angle combines time (continuous motion) with phase (starting offset). Each object has a unique phase.',
      highlightType: 'concept',
    },
    {
      id: 'parametric-circle',
      lineStart: 511,
      lineEnd: 512,
      content: 'cos(angle) gives X, sin(angle) gives Z. Multiplying by amplitude sets the orbit radius.',
      highlightType: 'pattern',
    },
    {
      id: 'face-direction',
      lineStart: 518,
      lineEnd: 518,
      content: 'Setting rotation.y to the negative angle makes the object face its direction of travel.',
      highlightType: 'tip',
    },
  ],
  parameters: [
    {
      parameterKey: 'amplitude',
      codeLocation: {
        id: 'amplitude-param',
        sourceFile: 'demos/ObjectDemo.ts',
        startLine: 48,
        endLine: 48,
      },
      variableName: 'this.params.amplitude',
      explanation: 'Controls the radius of the orbit. Larger = wider circle.',
    },
  ],
  order: 5,
  prerequisites: ['object-rotation'],
};

/**
 * Step 6: Bounce Animation
 * Easing functions for natural motion.
 */
export const objectBounce: WizardStep = {
  id: 'object-bounce',
  title: 'Bounce Animation',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Objects,
  description: `A simple sine wave creates smooth up-and-down motion, but **easing functions**
make it feel more natural. Objects accelerate and decelerate like real physics.

The easeInOutSine function:
\`-(cos(π × t) - 1) / 2\`

This creates slow-fast-slow motion, perfect for bouncing.`,
  learningObjectives: [
    'Understand easing functions for natural motion',
    'Learn how to combine sine waves with easing',
    'See how squash/stretch adds polish',
  ],
  codeSnippets: [
    {
      id: 'ease-function',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 62,
      endLine: 70,
      title: 'Easing Function',
      focusLines: [68, 69],
    },
    {
      id: 'bounce-animation',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 521,
      endLine: 555,
      title: 'Bounce Animation',
      focusLines: [539, 540, 544, 545, 548, 551, 552, 553, 554],
    },
  ],
  annotations: [
    {
      id: 'ease-formula',
      lineStart: 68,
      lineEnd: 69,
      content: 'This sine-based easing creates smooth acceleration at the start and deceleration at the end.',
      highlightType: 'pattern',
    },
    {
      id: 'cycle-time',
      lineStart: 539,
      lineEnd: 540,
      content: 'The modulo operator (%) makes the animation loop every 2 seconds, creating continuous bouncing.',
      highlightType: 'concept',
    },
    {
      id: 'squash-stretch',
      lineStart: 551,
      lineEnd: 554,
      content: 'Squash and stretch: at the bottom of the bounce, the object flattens slightly. This adds realism.',
      highlightType: 'tip',
    },
  ],
  order: 6,
  prerequisites: ['object-orbit'],
};

/**
 * Step 7: Wave Motion
 * Phase-shifted sine waves across objects.
 */
export const objectWave: WizardStep = {
  id: 'object-wave',
  title: 'Wave Motion',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Objects,
  description: `A **wave** is created when multiple objects oscillate with **phase offsets**.

Each object follows the same sine wave, but starts at a different point:
\`y = amplitude × sin(time × speed + phase)\`

The phase offset creates the traveling wave effect — peaks and troughs
rippling through the group of objects.`,
  learningObjectives: [
    'Understand phase offsets for wave patterns',
    'Learn how sine waves create oscillation',
    'See how waves can affect rotation too',
  ],
  codeSnippets: [
    {
      id: 'wave-animation',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 557,
      endLine: 585,
      title: 'Wave Animation',
      focusLines: [575, 576, 577, 580, 582, 583, 584],
    },
  ],
  annotations: [
    {
      id: 'phase-offset',
      lineStart: 575,
      lineEnd: 577,
      content: 'Adding phase to the sine argument shifts when each object reaches its peak. This creates the wave.',
      highlightType: 'concept',
    },
    {
      id: 'wave-tilt',
      lineStart: 582,
      lineEnd: 584,
      content: 'Tilting objects based on the wave derivative (cosine) makes them lean into the wave motion.',
      highlightType: 'pattern',
    },
  ],
  order: 7,
  prerequisites: ['object-bounce'],
};

/**
 * Step 8: Scale Animation
 * Pulsing effects with sine waves.
 */
export const objectScale: WizardStep = {
  id: 'object-scale',
  title: 'Scale Animation',
  tier: ComplexityTier.Medium,
  demoType: DemoType.Objects,
  description: `**Scale animation** makes objects pulse larger and smaller.
Using a sine wave ensures smooth, continuous motion:

\`scale = baseScale + range × sin(time × speed + phase)\`

The minScale and maxScale define the pulsing range. Phase offsets create
a rippling pulse effect across multiple objects.`,
  learningObjectives: [
    'Understand scale animation principles',
    'Learn to map sine waves to a range',
    'See uniform scaling vs per-axis scaling',
  ],
  codeSnippets: [
    {
      id: 'scale-animation',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 587,
      endLine: 611,
      title: 'Scale Animation',
      focusLines: [599, 600, 601, 602, 605, 606, 607, 610],
    },
  ],
  annotations: [
    {
      id: 'scale-range',
      lineStart: 599,
      lineEnd: 602,
      content: 'minScale (0.5) to maxScale (1.5) defines the pulsing range. baseScale is the midpoint (1.0).',
      highlightType: 'concept',
    },
    {
      id: 'sine-mapping',
      lineStart: 605,
      lineEnd: 607,
      content: 'sin() returns -1 to 1. Multiplying by scaleRange and adding baseScale maps it to 0.5-1.5.',
      highlightType: 'pattern',
    },
    {
      id: 'uniform-scale',
      lineStart: 610,
      lineEnd: 610,
      content: 'setScalar applies the same scale to X, Y, and Z for uniform scaling.',
      highlightType: 'tip',
    },
  ],
  order: 8,
  prerequisites: ['object-wave'],
};

// ============================================================================
// ADVANCED CONCEPTS (Full integration)
// ============================================================================

/**
 * Step 9: Multiple Animation Types
 * Switching between modes.
 */
export const objectMultiType: WizardStep = {
  id: 'object-multi-type',
  title: 'Multiple Animation Types',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Objects,
  description: `Real applications often support multiple animation modes.
The key is using a **switch statement** or similar dispatch pattern to select
the right update function based on current mode.

Each animation type can have its own parameters while sharing common state
like elapsed time and phase offsets.`,
  learningObjectives: [
    'Understand animation mode switching patterns',
    'Learn to organize multiple animation types',
    'See how to reset state on mode change',
  ],
  codeSnippets: [
    {
      id: 'animation-switch',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 441,
      endLine: 467,
      title: 'Animation Type Dispatch',
      focusLines: [450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466],
    },
    {
      id: 'set-animation-type',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 321,
      endLine: 340,
      title: 'Changing Animation Type',
      focusLines: [325, 326, 327, 328, 331, 334, 335, 336, 339],
    },
  ],
  annotations: [
    {
      id: 'switch-dispatch',
      lineStart: 450,
      lineEnd: 466,
      content: 'Each case calls a specialized animation method. This keeps the update logic organized.',
      highlightType: 'pattern',
    },
    {
      id: 'type-validation',
      lineStart: 326,
      lineEnd: 329,
      content: 'Always validate input. If an invalid type is passed, default to a known good state.',
      highlightType: 'warning',
    },
    {
      id: 'reset-on-change',
      lineStart: 339,
      lineEnd: 339,
      content: 'Resetting positions when switching provides cleaner transitions between animation modes.',
      highlightType: 'tip',
    },
  ],
  order: 9,
  prerequisites: ['object-scale'],
};

/**
 * Step 10: Input-Driven Animation
 * Mouse and keyboard control.
 */
export const objectInputDriven: WizardStep = {
  id: 'object-input-driven',
  title: 'Input-Driven Animation',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Objects,
  description: `Interactive animations respond to user input. Common patterns:

- **Mouse position → speed**: Horizontal mouse position affects animation rate
- **Key presses → mode**: Number keys switch animation types
- **Reset key**: A dedicated key returns to initial state

Input handling should be responsive but not overwhelming — smoothing
or thresholds prevent jittery behavior.`,
  learningObjectives: [
    'Understand input-to-animation mapping',
    'Learn keyboard handling patterns',
    'See how mouse position can drive parameters',
  ],
  codeSnippets: [
    {
      id: 'input-handling',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 215,
      endLine: 242,
      title: 'Processing Input',
      focusLines: [225, 226, 227, 229, 230, 231, 232, 233, 234, 235, 236, 239, 240, 241],
    },
  ],
  annotations: [
    {
      id: 'mouse-speed',
      lineStart: 225,
      lineEnd: 227,
      content: 'Mouse X position (-1 to 1) is mapped to speed multiplier (0.5 to 1.5). Left = slow, right = fast.',
      highlightType: 'concept',
    },
    {
      id: 'key-detection',
      lineStart: 229,
      lineEnd: 236,
      content: 'We loop through possible keys (1-5) and check if each is pressed. First match wins.',
      highlightType: 'pattern',
    },
    {
      id: 'reset-key',
      lineStart: 239,
      lineEnd: 241,
      content: 'The R key resets the demo. Checking both cases (r, R) ensures it works regardless of caps lock.',
      highlightType: 'tip',
    },
  ],
  order: 10,
  prerequisites: ['object-multi-type'],
};

/**
 * Step 11: Object Groups and Hierarchies
 * Parent-child relationships.
 */
export const objectGroups: WizardStep = {
  id: 'object-groups',
  title: 'Object Groups and Hierarchies',
  tier: ComplexityTier.Advanced,
  demoType: DemoType.Objects,
  description: `Three.js uses a **scene graph** — objects can have children.
When you transform a parent, all children move with it.

A **Group** is a container that holds multiple objects:
- Add meshes to a group
- Transform the group (all children move together)
- Children can have their own transforms (relative to parent)

This enables complex animations like orbiting moons around a moving planet.`,
  learningObjectives: [
    'Understand parent-child transforms',
    'Learn to use Group for organization',
    'See how hierarchies simplify complex motion',
  ],
  codeSnippets: [
    {
      id: 'group-creation',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 128,
      endLine: 145,
      title: 'Creating Object Groups',
      focusLines: [135, 136, 142, 143, 144],
    },
    {
      id: 'group-add',
      sourceFile: 'demos/ObjectDemo.ts',
      startLine: 429,
      endLine: 431,
      title: 'Adding Objects to Group',
      focusLines: [430],
    },
  ],
  annotations: [
    {
      id: 'group-container',
      lineStart: 135,
      lineEnd: 136,
      content: 'A Group is an invisible container. Its only purpose is to hold and transform other objects.',
      highlightType: 'concept',
    },
    {
      id: 'axes-helper',
      lineStart: 142,
      lineEnd: 144,
      content: 'AxesHelper visualizes the coordinate system. Useful for debugging transforms.',
      highlightType: 'tip',
    },
    {
      id: 'add-child',
      lineStart: 430,
      lineEnd: 430,
      content: 'group.add(mesh) makes the mesh a child. Now mesh.position is relative to the group.',
      highlightType: 'pattern',
    },
  ],
  order: 11,
  prerequisites: ['object-input-driven'],
};

// ============================================================================
// EXPORT ALL STEPS
// ============================================================================

/**
 * All object wizard steps in order.
 */
export const objectSteps: WizardStep[] = [
  // Micro concepts (1-4)
  objectTransformBasics,
  objectMesh,
  objectDeltaTime,
  objectRotation,
  // Medium concepts (5-8)
  objectOrbit,
  objectBounce,
  objectWave,
  objectScale,
  // Advanced concepts (9-11)
  objectMultiType,
  objectInputDriven,
  objectGroups,
];

/**
 * Get all micro-level object steps.
 */
export function getMicroObjectSteps(): WizardStep[] {
  return objectSteps.filter((s) => s.tier === ComplexityTier.Micro);
}

/**
 * Get all medium-level object steps.
 */
export function getMediumObjectSteps(): WizardStep[] {
  return objectSteps.filter((s) => s.tier === ComplexityTier.Medium);
}

/**
 * Get all advanced-level object steps.
 */
export function getAdvancedObjectSteps(): WizardStep[] {
  return objectSteps.filter((s) => s.tier === ComplexityTier.Advanced);
}
