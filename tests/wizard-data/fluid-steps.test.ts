/**
 * Fluid Steps Tests
 *
 * Validates the fluid physics wizard step definitions.
 * Tests all acceptance criteria for story-022 (fluid portion).
 */

import { describe, it, expect } from 'vitest';
import { DemoType } from '../../src/types';
import { ComplexityTier } from '../../src/wizard/types';

// Use dynamic import for ES modules
const importFluidSteps = async () => {
  return import('../../src/wizard-data/steps/fluid-steps');
};

describe('Fluid Steps', () => {
  describe('AC2: Fluid physics concepts defined across all tiers', () => {
    it('should have 11 total fluid steps', async () => {
      const { fluidSteps } = await importFluidSteps();
      expect(fluidSteps).toHaveLength(11);
    });

    it('should have 4 micro-level concepts', async () => {
      const { getMicroFluidSteps } = await importFluidSteps();
      const microSteps = getMicroFluidSteps();
      expect(microSteps).toHaveLength(4);

      const titles = microSteps.map(s => s.title);
      expect(titles).toContain('What is SPH?');
      expect(titles).toContain('Fluid Particles');
      expect(titles).toContain('Gravity and Basic Motion');
      expect(titles).toContain('InstancedMesh for Performance');
    });

    it('should have 4 medium-level concepts', async () => {
      const { getMediumFluidSteps } = await importFluidSteps();
      const mediumSteps = getMediumFluidSteps();
      expect(mediumSteps).toHaveLength(4);

      const titles = mediumSteps.map(s => s.title);
      expect(titles).toContain('Boundary Collisions');
      expect(titles).toContain('Density Calculation');
      expect(titles).toContain('Pressure Forces');
      expect(titles).toContain('Viscosity');
    });

    it('should have 3 advanced-level concepts', async () => {
      const { getAdvancedFluidSteps } = await importFluidSteps();
      const advancedSteps = getAdvancedFluidSteps();
      expect(advancedSteps).toHaveLength(3);

      const titles = advancedSteps.map(s => s.title);
      expect(titles).toContain('Spatial Hashing');
      expect(titles).toContain('Mouse Interaction');
      expect(titles).toContain('Performance Tuning');
    });

    it('should all reference DemoType.Fluid', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        expect(step.demoType).toBe(DemoType.Fluid);
      });
    });
  });

  describe('AC3: Each step has code snippets from FluidDemo.ts', () => {
    it('should have at least one code snippet per step', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        expect(step.codeSnippets.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should reference FluidDemo.ts in all snippets', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        step.codeSnippets.forEach(snippet => {
          expect(snippet.sourceFile).toBe('demos/FluidDemo.ts');
        });
      });
    });

    it('should have valid line numbers in all snippets', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        step.codeSnippets.forEach(snippet => {
          expect(snippet.startLine).toBeGreaterThan(0);
          expect(snippet.endLine).toBeGreaterThanOrEqual(snippet.startLine);
        });
      });
    });

    it('should have unique snippet IDs', async () => {
      const { fluidSteps } = await importFluidSteps();
      const allIds = fluidSteps.flatMap(s => s.codeSnippets.map(c => c.id));
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('AC4: Each step has explanatory annotations', () => {
    it('should have at least one annotation per step', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        expect(step.annotations.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have valid line numbers in annotations', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        step.annotations.forEach(annotation => {
          expect(annotation.lineStart).toBeGreaterThan(0);
          expect(annotation.lineEnd).toBeGreaterThanOrEqual(annotation.lineStart);
        });
      });
    });

    it('should have non-empty content in annotations', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        step.annotations.forEach(annotation => {
          expect(annotation.content.length).toBeGreaterThan(10);
        });
      });
    });

    it('should have valid highlight types', async () => {
      const { fluidSteps } = await importFluidSteps();
      const validTypes = ['concept', 'pattern', 'warning', 'tip'];
      fluidSteps.forEach(step => {
        step.annotations.forEach(annotation => {
          expect(validTypes).toContain(annotation.highlightType);
        });
      });
    });

    it('should have unique annotation IDs', async () => {
      const { fluidSteps } = await importFluidSteps();
      const allIds = fluidSteps.flatMap(s => s.annotations.map(a => a.id));
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should include SPH simplification warnings', async () => {
      const { fluidWhatIsSPH } = await importFluidSteps();
      const hasSimplificationNote = fluidWhatIsSPH.annotations.some(
        a => a.highlightType === 'warning' && a.content.toLowerCase().includes('real sph')
      );
      expect(hasSimplificationNote).toBe(true);
    });
  });

  describe('AC5: Parameter bindings work', () => {
    it('should have parameter bindings for gravity', async () => {
      const { fluidGravity } = await importFluidSteps();
      expect(fluidGravity.parameters).toBeDefined();
      expect(fluidGravity.parameters!.length).toBeGreaterThan(0);

      const gravityParam = fluidGravity.parameters!.find(p => p.parameterKey === 'gravity');
      expect(gravityParam).toBeDefined();
      expect(gravityParam!.variableName).toContain('gravity');
    });

    it('should have parameter bindings for viscosity', async () => {
      const { fluidViscosity } = await importFluidSteps();
      expect(fluidViscosity.parameters).toBeDefined();

      const viscosityParam = fluidViscosity.parameters!.find(p => p.parameterKey === 'viscosity');
      expect(viscosityParam).toBeDefined();
      expect(viscosityParam!.explanation.length).toBeGreaterThan(10);
    });

    it('should have parameter bindings for restDensity', async () => {
      const { fluidPressure } = await importFluidSteps();
      expect(fluidPressure.parameters).toBeDefined();

      const densityParam = fluidPressure.parameters!.find(p => p.parameterKey === 'restDensity');
      expect(densityParam).toBeDefined();
    });

    it('should have parameter bindings for boundaryDamping', async () => {
      const { fluidBoundaries } = await importFluidSteps();
      expect(fluidBoundaries.parameters).toBeDefined();

      const dampingParam = fluidBoundaries.parameters!.find(p => p.parameterKey === 'boundaryDamping');
      expect(dampingParam).toBeDefined();
    });

    it('should have parameter bindings for particleCount', async () => {
      const { fluidPerformance } = await importFluidSteps();
      expect(fluidPerformance.parameters).toBeDefined();

      const countParam = fluidPerformance.parameters!.find(p => p.parameterKey === 'particleCount');
      expect(countParam).toBeDefined();
    });
  });

  describe('Step structure validation', () => {
    it('should have sequential order values', async () => {
      const { fluidSteps } = await importFluidSteps();
      const orders = fluidSteps.map(s => s.order).sort((a, b) => a - b);

      for (let i = 0; i < orders.length; i++) {
        expect(orders[i]).toBe(i + 1);
      }
    });

    it('should have unique step IDs', async () => {
      const { fluidSteps } = await importFluidSteps();
      const ids = fluidSteps.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty titles and descriptions', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.description.length).toBeGreaterThan(50);
      });
    });

    it('should have learning objectives', async () => {
      const { fluidSteps } = await importFluidSteps();
      fluidSteps.forEach(step => {
        expect(step.learningObjectives.length).toBeGreaterThanOrEqual(2);
        step.learningObjectives.forEach(obj => {
          expect(obj.length).toBeGreaterThan(10);
        });
      });
    });

    it('should have valid prerequisites referencing existing steps', async () => {
      const { fluidSteps } = await importFluidSteps();
      const allIds = new Set(fluidSteps.map(s => s.id));

      fluidSteps.forEach(step => {
        if (step.prerequisites) {
          step.prerequisites.forEach(prereq => {
            expect(allIds.has(prereq)).toBe(true);
          });
        }
      });
    });

    it('should have correct tier assignments', async () => {
      const { fluidSteps } = await importFluidSteps();

      // First 4 should be Micro
      fluidSteps.slice(0, 4).forEach(step => {
        expect(step.tier).toBe(ComplexityTier.Micro);
      });

      // Next 4 should be Medium
      fluidSteps.slice(4, 8).forEach(step => {
        expect(step.tier).toBe(ComplexityTier.Medium);
      });

      // Last 3 should be Advanced
      fluidSteps.slice(8, 11).forEach(step => {
        expect(step.tier).toBe(ComplexityTier.Advanced);
      });
    });
  });
});
