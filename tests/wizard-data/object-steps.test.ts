/**
 * Object Steps Tests
 *
 * Validates the object animation wizard step definitions.
 * Tests all acceptance criteria for story-022 (object portion).
 */

import { describe, it, expect } from 'vitest';
import { DemoType } from '../../src/types';
import { ComplexityTier } from '../../src/wizard/types';

// Use dynamic import for ES modules
const importObjectSteps = async () => {
  return import('../../src/wizard-data/steps/object-steps');
};

describe('Object Steps', () => {
  describe('AC1: Object animation concepts defined across all tiers', () => {
    it('should have 11 total object steps', async () => {
      const { objectSteps } = await importObjectSteps();
      expect(objectSteps).toHaveLength(11);
    });

    it('should have 4 micro-level concepts', async () => {
      const { getMicroObjectSteps } = await importObjectSteps();
      const microSteps = getMicroObjectSteps();
      expect(microSteps).toHaveLength(4);

      const titles = microSteps.map(s => s.title);
      expect(titles).toContain('3D Transformations Basics');
      expect(titles).toContain('The Mesh Object');
      expect(titles).toContain('Delta Time for Smooth Animation');
      expect(titles).toContain('Rotation Animation');
    });

    it('should have 4 medium-level concepts', async () => {
      const { getMediumObjectSteps } = await importObjectSteps();
      const mediumSteps = getMediumObjectSteps();
      expect(mediumSteps).toHaveLength(4);

      const titles = mediumSteps.map(s => s.title);
      expect(titles).toContain('Orbital Motion');
      expect(titles).toContain('Bounce Animation');
      expect(titles).toContain('Wave Motion');
      expect(titles).toContain('Scale Animation');
    });

    it('should have 3 advanced-level concepts', async () => {
      const { getAdvancedObjectSteps } = await importObjectSteps();
      const advancedSteps = getAdvancedObjectSteps();
      expect(advancedSteps).toHaveLength(3);

      const titles = advancedSteps.map(s => s.title);
      expect(titles).toContain('Multiple Animation Types');
      expect(titles).toContain('Input-Driven Animation');
      expect(titles).toContain('Object Groups and Hierarchies');
    });

    it('should all reference DemoType.Objects', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        expect(step.demoType).toBe(DemoType.Objects);
      });
    });
  });

  describe('AC3: Each step has code snippets from ObjectDemo.ts', () => {
    it('should have at least one code snippet per step', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        expect(step.codeSnippets.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should reference ObjectDemo.ts in all snippets', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        step.codeSnippets.forEach(snippet => {
          expect(snippet.sourceFile).toBe('demos/ObjectDemo.ts');
        });
      });
    });

    it('should have valid line numbers in all snippets', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        step.codeSnippets.forEach(snippet => {
          expect(snippet.startLine).toBeGreaterThan(0);
          expect(snippet.endLine).toBeGreaterThanOrEqual(snippet.startLine);
        });
      });
    });

    it('should have unique snippet IDs', async () => {
      const { objectSteps } = await importObjectSteps();
      const allIds = objectSteps.flatMap(s => s.codeSnippets.map(c => c.id));
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('AC4: Each step has explanatory annotations', () => {
    it('should have at least one annotation per step', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        expect(step.annotations.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have valid line numbers in annotations', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        step.annotations.forEach(annotation => {
          expect(annotation.lineStart).toBeGreaterThan(0);
          expect(annotation.lineEnd).toBeGreaterThanOrEqual(annotation.lineStart);
        });
      });
    });

    it('should have non-empty content in annotations', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        step.annotations.forEach(annotation => {
          expect(annotation.content.length).toBeGreaterThan(10);
        });
      });
    });

    it('should have valid highlight types', async () => {
      const { objectSteps } = await importObjectSteps();
      const validTypes = ['concept', 'pattern', 'warning', 'tip'];
      objectSteps.forEach(step => {
        step.annotations.forEach(annotation => {
          expect(validTypes).toContain(annotation.highlightType);
        });
      });
    });

    it('should have unique annotation IDs', async () => {
      const { objectSteps } = await importObjectSteps();
      const allIds = objectSteps.flatMap(s => s.annotations.map(a => a.id));
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('AC5: Parameter bindings work', () => {
    it('should have parameter bindings for animationSpeed', async () => {
      const { objectDeltaTime } = await importObjectSteps();
      expect(objectDeltaTime.parameters).toBeDefined();
      expect(objectDeltaTime.parameters!.length).toBeGreaterThan(0);

      const speedParam = objectDeltaTime.parameters!.find(p => p.parameterKey === 'animationSpeed');
      expect(speedParam).toBeDefined();
      expect(speedParam!.variableName).toContain('animationSpeed');
    });

    it('should have parameter bindings for amplitude', async () => {
      const { objectOrbit } = await importObjectSteps();
      expect(objectOrbit.parameters).toBeDefined();

      const ampParam = objectOrbit.parameters!.find(p => p.parameterKey === 'amplitude');
      expect(ampParam).toBeDefined();
      expect(ampParam!.explanation.length).toBeGreaterThan(10);
    });
  });

  describe('Step structure validation', () => {
    it('should have sequential order values', async () => {
      const { objectSteps } = await importObjectSteps();
      const orders = objectSteps.map(s => s.order).sort((a, b) => a - b);

      for (let i = 0; i < orders.length; i++) {
        expect(orders[i]).toBe(i + 1);
      }
    });

    it('should have unique step IDs', async () => {
      const { objectSteps } = await importObjectSteps();
      const ids = objectSteps.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty titles and descriptions', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.description.length).toBeGreaterThan(50);
      });
    });

    it('should have learning objectives', async () => {
      const { objectSteps } = await importObjectSteps();
      objectSteps.forEach(step => {
        expect(step.learningObjectives.length).toBeGreaterThanOrEqual(2);
        step.learningObjectives.forEach(obj => {
          expect(obj.length).toBeGreaterThan(10);
        });
      });
    });

    it('should have valid prerequisites referencing existing steps', async () => {
      const { objectSteps } = await importObjectSteps();
      const allIds = new Set(objectSteps.map(s => s.id));

      objectSteps.forEach(step => {
        if (step.prerequisites) {
          step.prerequisites.forEach(prereq => {
            expect(allIds.has(prereq)).toBe(true);
          });
        }
      });
    });

    it('should have correct tier assignments', async () => {
      const { objectSteps } = await importObjectSteps();

      // First 4 should be Micro
      objectSteps.slice(0, 4).forEach(step => {
        expect(step.tier).toBe(ComplexityTier.Micro);
      });

      // Next 4 should be Medium
      objectSteps.slice(4, 8).forEach(step => {
        expect(step.tier).toBe(ComplexityTier.Medium);
      });

      // Last 3 should be Advanced
      objectSteps.slice(8, 11).forEach(step => {
        expect(step.tier).toBe(ComplexityTier.Advanced);
      });
    });
  });
});
