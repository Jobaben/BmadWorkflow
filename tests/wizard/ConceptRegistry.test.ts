/**
 * ConceptRegistry Unit Tests
 *
 * Tests the ConceptRegistry implementation against story-013 acceptance criteria:
 * - AC4: ConceptRegistry provides step lookup methods
 * - AC5: ConceptRegistry provides ordered step list
 *
 * Also tests edge cases and error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConceptRegistry, ComplexityTier, WizardStep } from '../../src/wizard';
import { DemoType } from '../../src/types';

// Helper to create minimal valid WizardStep
function createStep(overrides: Partial<WizardStep> & Pick<WizardStep, 'id' | 'order'>): WizardStep {
  return {
    title: `Step ${overrides.id}`,
    tier: ComplexityTier.Micro,
    demoType: DemoType.Particles,
    description: 'Test step description',
    learningObjectives: ['Learn something'],
    codeSnippets: [],
    annotations: [],
    ...overrides,
  };
}

describe('ConceptRegistry', () => {
  let registry: ConceptRegistry;
  let testSteps: WizardStep[];

  beforeEach(() => {
    testSteps = [
      createStep({ id: 'step-1', order: 1, tier: ComplexityTier.Micro }),
      createStep({ id: 'step-2', order: 2, tier: ComplexityTier.Micro }),
      createStep({ id: 'step-3', order: 3, tier: ComplexityTier.Medium }),
      createStep({ id: 'step-4', order: 4, tier: ComplexityTier.Medium }),
      createStep({ id: 'step-5', order: 5, tier: ComplexityTier.Advanced }),
    ];
    registry = new ConceptRegistry(testSteps);
  });

  describe('AC4: ConceptRegistry provides step lookup methods', () => {
    describe('getStep()', () => {
      it('should return correct step by id', () => {
        const step = registry.getStep('step-1');
        expect(step).toBeDefined();
        expect(step?.id).toBe('step-1');
      });

      it('should return undefined for unknown id', () => {
        const step = registry.getStep('unknown-step');
        expect(step).toBeUndefined();
      });

      it('should return undefined for empty string id', () => {
        const step = registry.getStep('');
        expect(step).toBeUndefined();
      });

      it('should find all registered steps by id', () => {
        for (const testStep of testSteps) {
          const step = registry.getStep(testStep.id);
          expect(step).toBeDefined();
          expect(step?.id).toBe(testStep.id);
        }
      });
    });

    describe('getStepsByTier()', () => {
      it('should filter steps by micro tier', () => {
        const microSteps = registry.getStepsByTier(ComplexityTier.Micro);
        expect(microSteps).toHaveLength(2);
        expect(microSteps.every((s) => s.tier === ComplexityTier.Micro)).toBe(true);
      });

      it('should filter steps by medium tier', () => {
        const mediumSteps = registry.getStepsByTier(ComplexityTier.Medium);
        expect(mediumSteps).toHaveLength(2);
        expect(mediumSteps.every((s) => s.tier === ComplexityTier.Medium)).toBe(true);
      });

      it('should filter steps by advanced tier', () => {
        const advancedSteps = registry.getStepsByTier(ComplexityTier.Advanced);
        expect(advancedSteps).toHaveLength(1);
        expect(advancedSteps[0].tier).toBe(ComplexityTier.Advanced);
      });

      it('should return empty array for tier with no steps', () => {
        const emptyRegistry = new ConceptRegistry([
          createStep({ id: 'micro-only', order: 1, tier: ComplexityTier.Micro }),
        ]);
        const advancedSteps = emptyRegistry.getStepsByTier(ComplexityTier.Advanced);
        expect(advancedSteps).toHaveLength(0);
      });

      it('should return steps in order within tier', () => {
        const microSteps = registry.getStepsByTier(ComplexityTier.Micro);
        expect(microSteps[0].order).toBeLessThan(microSteps[1].order);
      });
    });
  });

  describe('AC5: ConceptRegistry provides ordered step list', () => {
    describe('getAllSteps()', () => {
      it('should return all steps', () => {
        const allSteps = registry.getAllSteps();
        expect(allSteps).toHaveLength(5);
      });

      it('should return steps in recommended learning order', () => {
        const allSteps = registry.getAllSteps();
        for (let i = 1; i < allSteps.length; i++) {
          expect(allSteps[i].order).toBeGreaterThan(allSteps[i - 1].order);
        }
      });

      it('should return a copy (not modify internal state)', () => {
        const steps1 = registry.getAllSteps();
        const steps2 = registry.getAllSteps();
        expect(steps1).not.toBe(steps2);
        expect(steps1).toEqual(steps2);
      });

      it('should handle unsorted input steps', () => {
        const unsortedSteps = [
          createStep({ id: 'last', order: 100 }),
          createStep({ id: 'first', order: 1 }),
          createStep({ id: 'middle', order: 50 }),
        ];
        const unsortedRegistry = new ConceptRegistry(unsortedSteps);
        const ordered = unsortedRegistry.getAllSteps();

        expect(ordered[0].id).toBe('first');
        expect(ordered[1].id).toBe('middle');
        expect(ordered[2].id).toBe('last');
      });
    });

    describe('getStepCount()', () => {
      it('should return correct count', () => {
        expect(registry.getStepCount()).toBe(5);
      });

      it('should return 0 for empty registry', () => {
        const emptyRegistry = new ConceptRegistry([]);
        expect(emptyRegistry.getStepCount()).toBe(0);
      });
    });

    describe('getNextStep()', () => {
      it('should return next step in sequence', () => {
        const nextStep = registry.getNextStep('step-1');
        expect(nextStep).toBeDefined();
        expect(nextStep?.id).toBe('step-2');
      });

      it('should return undefined for last step', () => {
        const nextStep = registry.getNextStep('step-5');
        expect(nextStep).toBeUndefined();
      });

      it('should return undefined for unknown step', () => {
        const nextStep = registry.getNextStep('unknown');
        expect(nextStep).toBeUndefined();
      });

      it('should work through entire sequence', () => {
        let current = registry.getStep('step-1');
        const visited: string[] = [];

        while (current) {
          visited.push(current.id);
          current = registry.getNextStep(current.id);
        }

        expect(visited).toEqual(['step-1', 'step-2', 'step-3', 'step-4', 'step-5']);
      });
    });

    describe('getPreviousStep()', () => {
      it('should return previous step in sequence', () => {
        const prevStep = registry.getPreviousStep('step-2');
        expect(prevStep).toBeDefined();
        expect(prevStep?.id).toBe('step-1');
      });

      it('should return undefined for first step', () => {
        const prevStep = registry.getPreviousStep('step-1');
        expect(prevStep).toBeUndefined();
      });

      it('should return undefined for unknown step', () => {
        const prevStep = registry.getPreviousStep('unknown');
        expect(prevStep).toBeUndefined();
      });

      it('should work through entire sequence backwards', () => {
        let current = registry.getStep('step-5');
        const visited: string[] = [];

        while (current) {
          visited.push(current.id);
          current = registry.getPreviousStep(current.id);
        }

        expect(visited).toEqual(['step-5', 'step-4', 'step-3', 'step-2', 'step-1']);
      });
    });
  });

  describe('getPrerequisites()', () => {
    beforeEach(() => {
      const stepsWithPrereqs = [
        createStep({ id: 'basics', order: 1 }),
        createStep({ id: 'intermediate', order: 2, prerequisites: ['basics'] }),
        createStep({
          id: 'advanced',
          order: 3,
          prerequisites: ['basics', 'intermediate'],
        }),
        createStep({ id: 'standalone', order: 4 }),
      ];
      registry = new ConceptRegistry(stepsWithPrereqs);
    });

    it('should return empty array for step without prerequisites', () => {
      const prereqs = registry.getPrerequisites('basics');
      expect(prereqs).toHaveLength(0);
    });

    it('should return single prerequisite', () => {
      const prereqs = registry.getPrerequisites('intermediate');
      expect(prereqs).toHaveLength(1);
      expect(prereqs[0].id).toBe('basics');
    });

    it('should return multiple prerequisites', () => {
      const prereqs = registry.getPrerequisites('advanced');
      expect(prereqs).toHaveLength(2);
      const prereqIds = prereqs.map((p) => p.id);
      expect(prereqIds).toContain('basics');
      expect(prereqIds).toContain('intermediate');
    });

    it('should return empty array for unknown step', () => {
      const prereqs = registry.getPrerequisites('unknown');
      expect(prereqs).toHaveLength(0);
    });

    it('should skip unknown prerequisite IDs', () => {
      const stepsWithBadPrereq = [
        createStep({ id: 'step', order: 1, prerequisites: ['nonexistent'] }),
      ];
      const registryWithBadPrereq = new ConceptRegistry(stepsWithBadPrereq);
      const prereqs = registryWithBadPrereq.getPrerequisites('step');
      expect(prereqs).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty registry', () => {
      const emptyRegistry = new ConceptRegistry([]);

      expect(emptyRegistry.getStepCount()).toBe(0);
      expect(emptyRegistry.getAllSteps()).toEqual([]);
      expect(emptyRegistry.getStep('any')).toBeUndefined();
      expect(emptyRegistry.getStepsByTier(ComplexityTier.Micro)).toEqual([]);
      expect(emptyRegistry.getNextStep('any')).toBeUndefined();
      expect(emptyRegistry.getPreviousStep('any')).toBeUndefined();
      expect(emptyRegistry.getPrerequisites('any')).toEqual([]);
    });

    it('should handle single step registry', () => {
      const singleStepRegistry = new ConceptRegistry([
        createStep({ id: 'only', order: 1 }),
      ]);

      expect(singleStepRegistry.getStepCount()).toBe(1);
      expect(singleStepRegistry.getStep('only')).toBeDefined();
      expect(singleStepRegistry.getNextStep('only')).toBeUndefined();
      expect(singleStepRegistry.getPreviousStep('only')).toBeUndefined();
    });

    it('should handle steps with same order (stable sort)', () => {
      const sameOrderSteps = [
        createStep({ id: 'a', order: 1 }),
        createStep({ id: 'b', order: 1 }),
        createStep({ id: 'c', order: 1 }),
      ];
      const sameOrderRegistry = new ConceptRegistry(sameOrderSteps);
      const allSteps = sameOrderRegistry.getAllSteps();

      expect(allSteps).toHaveLength(3);
      // All steps should be present (order may vary for same-order items)
      const ids = allSteps.map((s) => s.id);
      expect(ids).toContain('a');
      expect(ids).toContain('b');
      expect(ids).toContain('c');
    });
  });

  describe('Type Compilation', () => {
    it('should compile with all types', () => {
      // This test verifies TypeScript compilation works correctly
      const step: WizardStep = {
        id: 'test',
        title: 'Test',
        tier: ComplexityTier.Micro,
        demoType: DemoType.Particles,
        description: 'Test',
        learningObjectives: [],
        codeSnippets: [],
        annotations: [],
        order: 1,
      };

      const testRegistry = new ConceptRegistry([step]);
      expect(testRegistry.getStep('test')).toBeDefined();
    });
  });
});
