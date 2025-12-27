/**
 * Wizard Step Data
 *
 * Placeholder step definitions for testing the wizard system.
 * These will be replaced with full content in later stories.
 */

import { DemoType } from '../types';
import {
  ComplexityTier,
  WizardStep,
  ConceptRegistry,
} from '../wizard';

/**
 * Sample wizard steps for testing.
 * Covers all three tiers and demonstrates prerequisite relationships.
 */
export const sampleSteps: WizardStep[] = [
  {
    id: 'particle-basics',
    title: 'Introduction to Particles',
    tier: ComplexityTier.Micro,
    demoType: DemoType.Particles,
    description:
      'Learn the fundamentals of particle systems and how individual particles are represented in 3D space.',
    learningObjectives: [
      'Understand what a particle system is',
      'Learn how particles are positioned in 3D space',
      'Recognize the basic properties of a particle',
    ],
    codeSnippets: [
      {
        id: 'particle-interface',
        sourceFile: 'types/index.ts',
        startLine: 18,
        endLine: 33,
        title: 'Particle Interface',
      },
    ],
    annotations: [
      {
        id: 'position-annotation',
        lineStart: 20,
        lineEnd: 21,
        content: 'The position vector defines where the particle exists in 3D space.',
        highlightType: 'concept',
      },
    ],
    order: 1,
  },
  {
    id: 'particle-emission',
    title: 'Particle Emission',
    tier: ComplexityTier.Micro,
    demoType: DemoType.Particles,
    description:
      'Understand how particles are spawned into the system at a controlled rate.',
    learningObjectives: [
      'Understand emission rate concept',
      'Learn how new particles are created',
    ],
    codeSnippets: [
      {
        id: 'emission-rate',
        sourceFile: 'types/index.ts',
        startLine: 38,
        endLine: 51,
        title: 'Particle Parameters',
      },
    ],
    annotations: [
      {
        id: 'emission-annotation',
        lineStart: 40,
        lineEnd: 41,
        content: 'Emission rate controls how many particles spawn per second.',
        highlightType: 'concept',
      },
    ],
    parameters: [
      {
        parameterKey: 'emissionRate',
        codeLocation: {
          id: 'emission-param-loc',
          sourceFile: 'types/index.ts',
          startLine: 40,
          endLine: 41,
        },
        variableName: 'emissionRate',
        explanation: 'Number of particles emitted per second',
      },
    ],
    order: 2,
    prerequisites: ['particle-basics'],
  },
  {
    id: 'particle-lifecycle',
    title: 'Particle Lifecycle',
    tier: ComplexityTier.Medium,
    demoType: DemoType.Particles,
    description:
      'Learn how particles age and eventually die, creating the dynamic flow of a particle system.',
    learningObjectives: [
      'Understand particle aging',
      'Learn about particle lifetime',
      'See how particles are recycled',
    ],
    codeSnippets: [
      {
        id: 'particle-age',
        sourceFile: 'types/index.ts',
        startLine: 26,
        endLine: 30,
        title: 'Age and Lifetime',
      },
    ],
    annotations: [
      {
        id: 'age-annotation',
        lineStart: 26,
        lineEnd: 28,
        content: 'Age tracks how long a particle has existed. When age exceeds lifetime, the particle dies.',
        highlightType: 'pattern',
      },
    ],
    order: 3,
    prerequisites: ['particle-emission'],
  },
  {
    id: 'object-animation-types',
    title: 'Animation Types',
    tier: ComplexityTier.Micro,
    demoType: DemoType.Objects,
    description:
      'Explore the different types of animations that can be applied to 3D objects.',
    learningObjectives: [
      'Learn about different animation types',
      'Understand how animations transform objects',
    ],
    codeSnippets: [
      {
        id: 'animation-type-enum',
        sourceFile: 'types/index.ts',
        startLine: 60,
        endLine: 60,
        title: 'Animation Types',
      },
    ],
    annotations: [
      {
        id: 'animation-types-annotation',
        lineStart: 60,
        lineEnd: 60,
        content: 'Each animation type produces a different visual effect.',
        highlightType: 'concept',
      },
    ],
    order: 4,
  },
  {
    id: 'combined-systems',
    title: 'Combining Multiple Systems',
    tier: ComplexityTier.Advanced,
    demoType: DemoType.Combined,
    description:
      'See how particles, objects, and fluid simulations can work together in a single scene.',
    learningObjectives: [
      'Understand system composition',
      'Learn integration patterns',
      'See performance considerations',
    ],
    codeSnippets: [],
    annotations: [],
    order: 5,
    prerequisites: ['particle-lifecycle', 'object-animation-types'],
  },
];

/**
 * Pre-configured ConceptRegistry with sample steps.
 * Ready to use for development and testing.
 */
export const sampleRegistry = new ConceptRegistry(sampleSteps);
