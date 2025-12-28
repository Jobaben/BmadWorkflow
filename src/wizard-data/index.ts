/**
 * Wizard Step Data
 *
 * Central registry of all wizard learning content.
 * Aggregates steps from individual demo-specific files.
 *
 * @see FR-001, FR-002, FR-003, FR-006
 */

import { ComplexityTier } from '../wizard/types';
import {
  ConceptRegistry,
  WizardStep,
} from '../wizard';

// Import step definitions from demo-specific files
import { particleSteps } from './steps/particle-steps';
import { objectSteps } from './steps/object-steps';
import { fluidSteps } from './steps/fluid-steps';

// Re-export individual step collections for direct access
export {
  particleSteps,
  getMicroParticleSteps,
  getMediumParticleSteps,
  getAdvancedParticleSteps,
} from './steps/particle-steps';

export {
  objectSteps,
  getMicroObjectSteps,
  getMediumObjectSteps,
  getAdvancedObjectSteps,
} from './steps/object-steps';

export {
  fluidSteps,
  getMicroFluidSteps,
  getMediumFluidSteps,
  getAdvancedFluidSteps,
} from './steps/fluid-steps';

// Re-export individual particle steps for testing/specific use
export {
  particleWhatIs,
  particleLifecycle,
  particleEmission,
  particleVelocity,
  particleGeometry,
  particleForces,
  particleColorLifetime,
  particleSizeLifetime,
  particlePooling,
  particleMaterials,
  particleInteraction,
  particlePerformance,
  particleComplete,
} from './steps/particle-steps';

// Re-export individual object steps for testing/specific use
export {
  objectTransformBasics,
  objectMesh,
  objectDeltaTime,
  objectRotation,
  objectOrbit,
  objectBounce,
  objectWave,
  objectScale,
  objectMultiType,
  objectInputDriven,
  objectGroups,
} from './steps/object-steps';

// Re-export individual fluid steps for testing/specific use
export {
  fluidWhatIsSPH,
  fluidParticles,
  fluidGravity,
  fluidInstancedMesh,
  fluidBoundaries,
  fluidDensity,
  fluidPressure,
  fluidViscosity,
  fluidSpatialHash,
  fluidInteraction,
  fluidPerformance,
} from './steps/fluid-steps';

/**
 * All wizard steps combined from all demos.
 * Includes particle, object, and fluid steps.
 */
export const allSteps: WizardStep[] = [
  ...particleSteps,
  ...objectSteps,
  ...fluidSteps,
];

/**
 * Pre-configured ConceptRegistry with all wizard steps.
 * Ready to use for the wizard application.
 */
export const wizardRegistry = new ConceptRegistry(allSteps);

/**
 * Get the total number of wizard steps.
 */
export function getTotalStepCount(): number {
  return allSteps.length;
}

/**
 * Get step counts by tier across all demos.
 */
export function getStepCountsByTier(): { micro: number; medium: number; advanced: number } {
  return {
    micro: allSteps.filter(s => s.tier === ComplexityTier.Micro).length,
    medium: allSteps.filter(s => s.tier === ComplexityTier.Medium).length,
    advanced: allSteps.filter(s => s.tier === ComplexityTier.Advanced).length,
  };
}

/**
 * Get step counts by demo type.
 */
export function getStepCountsByDemo(): { particle: number; object: number; fluid: number } {
  return {
    particle: particleSteps.length,
    object: objectSteps.length,
    fluid: fluidSteps.length,
  };
}

// Legacy exports for backward compatibility with existing tests
// These will be deprecated once tests are updated

/**
 * @deprecated Use allSteps or particleSteps instead
 */
export const sampleSteps: WizardStep[] = allSteps;

/**
 * @deprecated Use wizardRegistry instead
 */
export const sampleRegistry = wizardRegistry;
