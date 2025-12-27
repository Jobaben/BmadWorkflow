/**
 * Concept Registry
 *
 * Central repository for wizard step definitions and concept metadata.
 * Provides efficient lookup by ID, filtering by tier, and ordered traversal.
 *
 * Uses Map for O(1) lookup by ID and pre-sorted array for ordered access.
 *
 * @see ARCHITECTURE.md - Concept Registry component
 * @see FR-001, FR-003, FR-006
 */

import { ComplexityTier, WizardStep } from './types';

/**
 * Registry for wizard learning steps.
 * Provides centralized access to step definitions with multiple lookup methods.
 */
export class ConceptRegistry {
  /** Map for O(1) lookup by step ID */
  private readonly stepsById: Map<string, WizardStep>;

  /** Array of steps sorted by order property */
  private readonly orderedSteps: WizardStep[];

  /**
   * Creates a new ConceptRegistry with the given steps.
   *
   * @param steps - Array of wizard step definitions to register
   */
  constructor(steps: WizardStep[]) {
    // Build ID lookup map
    this.stepsById = new Map();
    for (const step of steps) {
      this.stepsById.set(step.id, step);
    }

    // Create sorted copy for ordered access
    this.orderedSteps = [...steps].sort((a, b) => a.order - b.order);
  }

  /**
   * Retrieves a step by its unique identifier.
   *
   * @param stepId - The unique step ID to look up
   * @returns The step if found, undefined otherwise
   */
  getStep(stepId: string): WizardStep | undefined {
    return this.stepsById.get(stepId);
  }

  /**
   * Returns all steps matching the specified complexity tier.
   *
   * @param tier - The complexity tier to filter by
   * @returns Array of steps in that tier, in order
   */
  getStepsByTier(tier: ComplexityTier): WizardStep[] {
    return this.orderedSteps.filter((step) => step.tier === tier);
  }

  /**
   * Returns all steps in recommended learning order.
   *
   * @returns Array of all steps sorted by order property
   */
  getAllSteps(): WizardStep[] {
    return [...this.orderedSteps];
  }

  /**
   * Returns the total number of registered steps.
   *
   * @returns Count of steps in the registry
   */
  getStepCount(): number {
    return this.orderedSteps.length;
  }

  /**
   * Gets the next step in the learning sequence.
   *
   * @param currentId - ID of the current step
   * @returns The next step if it exists, undefined otherwise
   */
  getNextStep(currentId: string): WizardStep | undefined {
    const currentIndex = this.orderedSteps.findIndex(
      (step) => step.id === currentId
    );
    if (currentIndex === -1 || currentIndex >= this.orderedSteps.length - 1) {
      return undefined;
    }
    return this.orderedSteps[currentIndex + 1];
  }

  /**
   * Gets the previous step in the learning sequence.
   *
   * @param currentId - ID of the current step
   * @returns The previous step if it exists, undefined otherwise
   */
  getPreviousStep(currentId: string): WizardStep | undefined {
    const currentIndex = this.orderedSteps.findIndex(
      (step) => step.id === currentId
    );
    if (currentIndex <= 0) {
      return undefined;
    }
    return this.orderedSteps[currentIndex - 1];
  }

  /**
   * Gets all prerequisite steps for a given step.
   * Resolves prerequisite IDs to full step objects.
   *
   * @param stepId - ID of the step to get prerequisites for
   * @returns Array of prerequisite steps (empty if none or step not found)
   */
  getPrerequisites(stepId: string): WizardStep[] {
    const step = this.stepsById.get(stepId);
    if (!step || !step.prerequisites || step.prerequisites.length === 0) {
      return [];
    }

    const prerequisites: WizardStep[] = [];
    for (const prereqId of step.prerequisites) {
      const prereqStep = this.stepsById.get(prereqId);
      if (prereqStep) {
        prerequisites.push(prereqStep);
      }
    }
    return prerequisites;
  }
}
