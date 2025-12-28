/**
 * Particle Steps Unit Tests
 *
 * Tests the particle wizard content against story-021 acceptance criteria:
 * - AC1: Micro-level particle concepts defined
 * - AC2: Medium-level particle concepts defined
 * - AC3: Advanced particle concepts defined
 * - AC4: Each step has code snippets from actual ParticleDemo
 * - AC5: Each step has explanatory annotations
 */

import { describe, it, expect } from 'vitest';
import {
  particleSteps,
  getMicroParticleSteps,
  getMediumParticleSteps,
  getAdvancedParticleSteps,
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
  allSteps,
  wizardRegistry,
  getTotalStepCount,
  getStepCountsByTier,
} from '../../src/wizard-data';
import { ComplexityTier } from '../../src/wizard/types';
import { DemoType } from '../../src/types';

describe('Particle Steps', () => {
  describe('AC1: Micro-level particle concepts', () => {
    it('should have 5 micro-level concepts', () => {
      const microSteps = getMicroParticleSteps();
      expect(microSteps).toHaveLength(5);
    });

    it('should include foundational topics', () => {
      const microSteps = getMicroParticleSteps();
      const titles = microSteps.map((s) => s.title);

      expect(titles).toContain('What is a Particle?');
      expect(titles).toContain('Particle Lifecycle');
      expect(titles).toContain('Emission Basics');
      expect(titles).toContain('Initial Velocity');
      expect(titles).toContain('BufferGeometry for Particles');
    });

    it('should all be ComplexityTier.Micro', () => {
      const microSteps = getMicroParticleSteps();
      microSteps.forEach((step) => {
        expect(step.tier).toBe(ComplexityTier.Micro);
      });
    });

    it('should all target particle demo', () => {
      const microSteps = getMicroParticleSteps();
      microSteps.forEach((step) => {
        expect(step.demoType).toBe(DemoType.Particles);
      });
    });
  });

  describe('AC2: Medium-level particle concepts', () => {
    it('should have 5 medium-level concepts', () => {
      const mediumSteps = getMediumParticleSteps();
      expect(mediumSteps).toHaveLength(5);
    });

    it('should include combined topics', () => {
      const mediumSteps = getMediumParticleSteps();
      const titles = mediumSteps.map((s) => s.title);

      expect(titles).toContain('Applying Forces');
      expect(titles).toContain('Color Over Lifetime');
      expect(titles).toContain('Size Over Lifetime');
      expect(titles).toContain('Object Pooling');
      expect(titles).toContain('Particle Materials');
    });

    it('should all be ComplexityTier.Medium', () => {
      const mediumSteps = getMediumParticleSteps();
      mediumSteps.forEach((step) => {
        expect(step.tier).toBe(ComplexityTier.Medium);
      });
    });
  });

  describe('AC3: Advanced particle concepts', () => {
    it('should have 3 advanced-level concepts', () => {
      const advancedSteps = getAdvancedParticleSteps();
      expect(advancedSteps).toHaveLength(3);
    });

    it('should include integration topics', () => {
      const advancedSteps = getAdvancedParticleSteps();
      const titles = advancedSteps.map((s) => s.title);

      expect(titles).toContain('Mouse Interaction');
      expect(titles).toContain('Performance Optimization');
      expect(titles).toContain('Putting It All Together');
    });

    it('should all be ComplexityTier.Advanced', () => {
      const advancedSteps = getAdvancedParticleSteps();
      advancedSteps.forEach((step) => {
        expect(step.tier).toBe(ComplexityTier.Advanced);
      });
    });
  });

  describe('AC4: Code snippets from ParticleDemo', () => {
    it('should have code snippets for all steps', () => {
      particleSteps.forEach((step) => {
        expect(step.codeSnippets.length).toBeGreaterThan(0);
      });
    });

    it('should reference ParticleDemo.ts', () => {
      particleSteps.forEach((step) => {
        step.codeSnippets.forEach((snippet) => {
          expect(snippet.sourceFile).toBe('demos/ParticleDemo.ts');
        });
      });
    });

    it('should have valid line numbers', () => {
      particleSteps.forEach((step) => {
        step.codeSnippets.forEach((snippet) => {
          expect(snippet.startLine).toBeGreaterThan(0);
          expect(snippet.endLine).toBeGreaterThan(0);
          expect(snippet.endLine).toBeGreaterThanOrEqual(snippet.startLine);
        });
      });
    });

    it('should have unique snippet IDs', () => {
      const allIds = particleSteps.flatMap((s) => s.codeSnippets.map((c) => c.id));
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('AC5: Explanatory annotations', () => {
    it('should have annotations for all steps', () => {
      particleSteps.forEach((step) => {
        expect(step.annotations.length).toBeGreaterThan(0);
      });
    });

    it('should have valid annotation line numbers', () => {
      particleSteps.forEach((step) => {
        step.annotations.forEach((annotation) => {
          expect(annotation.lineStart).toBeGreaterThan(0);
          expect(annotation.lineEnd).toBeGreaterThan(0);
          expect(annotation.lineEnd).toBeGreaterThanOrEqual(annotation.lineStart);
        });
      });
    });

    it('should have non-empty content', () => {
      particleSteps.forEach((step) => {
        step.annotations.forEach((annotation) => {
          expect(annotation.content.length).toBeGreaterThan(10);
        });
      });
    });

    it('should have valid highlight types', () => {
      const validTypes = ['concept', 'pattern', 'warning', 'tip'];
      particleSteps.forEach((step) => {
        step.annotations.forEach((annotation) => {
          expect(validTypes).toContain(annotation.highlightType);
        });
      });
    });

    it('should have unique annotation IDs', () => {
      const allIds = particleSteps.flatMap((s) => s.annotations.map((a) => a.id));
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('Step structure', () => {
    it('should have 13 total particle steps', () => {
      expect(particleSteps).toHaveLength(13);
    });

    it('should have unique step IDs', () => {
      const ids = particleSteps.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have correct order values', () => {
      for (let i = 0; i < particleSteps.length; i++) {
        expect(particleSteps[i].order).toBe(i + 1);
      }
    });

    it('should have learning objectives', () => {
      particleSteps.forEach((step) => {
        expect(step.learningObjectives.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty descriptions', () => {
      particleSteps.forEach((step) => {
        expect(step.description.length).toBeGreaterThan(50);
      });
    });
  });

  describe('Prerequisites', () => {
    it('should have a valid prerequisite chain', () => {
      // First step has no prerequisites
      expect(particleWhatIs.prerequisites).toBeUndefined();

      // Each subsequent step should reference a valid step ID
      const allIds = new Set(particleSteps.map((s) => s.id));

      particleSteps.forEach((step) => {
        if (step.prerequisites) {
          step.prerequisites.forEach((prereqId) => {
            expect(allIds.has(prereqId)).toBe(true);
          });
        }
      });
    });

    it('should have logical prerequisite ordering', () => {
      expect(particleLifecycle.prerequisites).toContain('particle-what-is');
      expect(particleEmission.prerequisites).toContain('particle-lifecycle');
      expect(particleVelocity.prerequisites).toContain('particle-emission');
      expect(particleGeometry.prerequisites).toContain('particle-velocity');
    });
  });

  describe('Parameter bindings', () => {
    it('should have parameter bindings for interactive steps', () => {
      // Emission step should have emissionRate binding
      expect(particleEmission.parameters).toBeDefined();
      expect(particleEmission.parameters?.length).toBeGreaterThan(0);
      expect(particleEmission.parameters?.[0].parameterKey).toBe('emissionRate');

      // Velocity step should have initialSpeed binding
      expect(particleVelocity.parameters).toBeDefined();
      expect(particleVelocity.parameters?.[0].parameterKey).toBe('initialSpeed');

      // Forces step should have gravity binding
      expect(particleForces.parameters).toBeDefined();
      expect(particleForces.parameters?.[0].parameterKey).toBe('gravity');
    });

    it('should have valid parameter binding structure', () => {
      particleSteps.forEach((step) => {
        if (step.parameters) {
          step.parameters.forEach((binding) => {
            expect(binding.parameterKey).toBeTruthy();
            expect(binding.variableName).toBeTruthy();
            expect(binding.explanation).toBeTruthy();
            expect(binding.codeLocation).toBeDefined();
            expect(binding.codeLocation.sourceFile).toBe('demos/ParticleDemo.ts');
          });
        }
      });
    });
  });
});

describe('Wizard Data Index', () => {
  describe('allSteps', () => {
    it('should contain all steps from all demos', () => {
      // 13 particle + 11 object + 11 fluid = 35 total
      expect(allSteps).toHaveLength(35);
      // First 13 should be particle steps
      expect(allSteps.slice(0, 13)).toEqual(particleSteps);
    });
  });

  describe('wizardRegistry', () => {
    it('should be a valid ConceptRegistry', () => {
      expect(wizardRegistry).toBeDefined();
      expect(typeof wizardRegistry.getStep).toBe('function');
      expect(typeof wizardRegistry.getAllSteps).toBe('function');
    });

    it('should contain all steps from all demos', () => {
      const registeredSteps = wizardRegistry.getAllSteps();
      // 13 particle + 11 object + 11 fluid = 35 total
      expect(registeredSteps).toHaveLength(35);
    });

    it('should be able to retrieve steps by ID', () => {
      const step = wizardRegistry.getStep('particle-what-is');
      expect(step).toBeDefined();
      expect(step?.title).toBe('What is a Particle?');
    });

    it('should be able to get steps by tier', () => {
      // Micro: 5 particle + 4 object + 4 fluid = 13
      const microSteps = wizardRegistry.getStepsByTier(ComplexityTier.Micro);
      expect(microSteps).toHaveLength(13);

      // Medium: 5 particle + 4 object + 4 fluid = 13
      const mediumSteps = wizardRegistry.getStepsByTier(ComplexityTier.Medium);
      expect(mediumSteps).toHaveLength(13);

      // Advanced: 3 particle + 3 object + 3 fluid = 9
      const advancedSteps = wizardRegistry.getStepsByTier(ComplexityTier.Advanced);
      expect(advancedSteps).toHaveLength(9);
    });
  });

  describe('helper functions', () => {
    it('getTotalStepCount should return 35', () => {
      // 13 particle + 11 object + 11 fluid = 35 total
      expect(getTotalStepCount()).toBe(35);
    });

    it('getStepCountsByTier should return correct counts', () => {
      const counts = getStepCountsByTier();
      // Micro: 5 particle + 4 object + 4 fluid = 13
      expect(counts.micro).toBe(13);
      // Medium: 5 particle + 4 object + 4 fluid = 13
      expect(counts.medium).toBe(13);
      // Advanced: 3 particle + 3 object + 3 fluid = 9
      expect(counts.advanced).toBe(9);
    });
  });

  describe('legacy exports', () => {
    it('sampleSteps should equal allSteps', async () => {
      const { sampleSteps } = await import('../../src/wizard-data');
      expect(sampleSteps).toEqual(allSteps);
    });

    it('sampleRegistry should equal wizardRegistry', async () => {
      const { sampleRegistry } = await import('../../src/wizard-data');
      expect(sampleRegistry).toBe(wizardRegistry);
    });
  });
});

describe('Individual step exports', () => {
  it('should export all 13 individual steps', () => {
    expect(particleWhatIs).toBeDefined();
    expect(particleLifecycle).toBeDefined();
    expect(particleEmission).toBeDefined();
    expect(particleVelocity).toBeDefined();
    expect(particleGeometry).toBeDefined();
    expect(particleForces).toBeDefined();
    expect(particleColorLifetime).toBeDefined();
    expect(particleSizeLifetime).toBeDefined();
    expect(particlePooling).toBeDefined();
    expect(particleMaterials).toBeDefined();
    expect(particleInteraction).toBeDefined();
    expect(particlePerformance).toBeDefined();
    expect(particleComplete).toBeDefined();
  });

  it('should have correct IDs for individual exports', () => {
    expect(particleWhatIs.id).toBe('particle-what-is');
    expect(particleLifecycle.id).toBe('particle-lifecycle');
    expect(particleEmission.id).toBe('particle-emission');
    expect(particleVelocity.id).toBe('particle-velocity');
    expect(particleGeometry.id).toBe('particle-geometry');
    expect(particleForces.id).toBe('particle-forces');
    expect(particleColorLifetime.id).toBe('particle-color-lifetime');
    expect(particleSizeLifetime.id).toBe('particle-size-lifetime');
    expect(particlePooling.id).toBe('particle-pooling');
    expect(particleMaterials.id).toBe('particle-materials');
    expect(particleInteraction.id).toBe('particle-interaction');
    expect(particlePerformance.id).toBe('particle-performance');
    expect(particleComplete.id).toBe('particle-complete');
  });
});
