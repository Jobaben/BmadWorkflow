/**
 * Wizard Step Data
 *
 * Central registry of all wizard learning content.
 * Aggregates steps from individual demo-specific files.
 *
 * @see FR-001, FR-002, FR-003, FR-006
 */

import {
  ConceptRegistry,
  WizardStep,
} from '../wizard';

// Import step definitions from demo-specific files
import {
  particleSteps,
  getMicroParticleSteps,
  getMediumParticleSteps,
  getAdvancedParticleSteps,
} from './steps/particle-steps';

// Re-export individual step collections for direct access
export {
  particleSteps,
  getMicroParticleSteps,
  getMediumParticleSteps,
  getAdvancedParticleSteps,
} from './steps/particle-steps';

// Re-export individual steps for testing/specific use
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

/**
 * All wizard steps combined from all demos.
 * Currently includes particle steps only.
 * Object and fluid steps will be added in future stories.
 */
export const allSteps: WizardStep[] = [
  ...particleSteps,
  // Future: ...objectSteps,
  // Future: ...fluidSteps,
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
 * Get step counts by tier.
 */
export function getStepCountsByTier(): { micro: number; medium: number; advanced: number } {
  return {
    micro: getMicroParticleSteps().length,
    medium: getMediumParticleSteps().length,
    advanced: getAdvancedParticleSteps().length,
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
