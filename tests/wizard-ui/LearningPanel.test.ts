/**
 * LearningPanel Unit Tests
 *
 * Tests the learning panel component for story-017:
 * - AC1: Step description is displayed prominently
 * - AC2: Code snippets are displayed with syntax highlighting
 * - AC3: Annotations explain key concepts
 * - AC4: Learning objectives are listed
 * - AC5: Panel content is scrollable
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LearningPanel,
  getLearningPanelStyles,
  injectLearningPanelStyles,
} from '../../src/wizard-ui/LearningPanel';
import type { WizardStep, Annotation } from '../../src/wizard/types';
import type { HighlightedCode } from '../../src/wizard/CodeSnippetEngine';
import { ComplexityTier } from '../../src/wizard/types';
import { DemoType } from '../../src/types';

// Helper to create a mock wizard step
function createMockStep(overrides: Partial<WizardStep> = {}): WizardStep {
  return {
    id: 'test-step-1',
    title: 'Test Step Title',
    tier: ComplexityTier.Micro,
    demoType: DemoType.Particles,
    description: 'This is a test description with **bold** and `code`.',
    learningObjectives: ['Objective 1', 'Objective 2', 'Objective 3'],
    codeSnippets: [
      {
        id: 'snippet-1',
        sourceFile: 'demos/test.ts',
        startLine: 10,
        endLine: 20,
        title: 'Test Snippet',
      },
    ],
    annotations: [
      {
        id: 'ann-1',
        lineStart: 12,
        lineEnd: 14,
        content: 'This is a concept annotation',
        highlightType: 'concept',
      },
      {
        id: 'ann-2',
        lineStart: 16,
        lineEnd: 16,
        content: 'This is a tip annotation',
        highlightType: 'tip',
      },
    ],
    order: 1,
    ...overrides,
  };
}

// Helper to create mock highlighted code
function createMockHighlightedCode(overrides: Partial<HighlightedCode> = {}): HighlightedCode {
  return {
    html: '<pre><code>const x = 1;</code></pre>',
    plainText: 'const x = 1;',
    lineCount: 10,
    annotations: [],
    ...overrides,
  };
}

describe('LearningPanel', () => {
  let container: HTMLElement;
  let panel: LearningPanel;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (panel) {
      panel.dispose();
    }
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create panel structure', () => {
      panel = new LearningPanel(container);

      expect(container.querySelector('.learning-panel')).toBeTruthy();
    });

    it('should inject styles automatically', () => {
      panel = new LearningPanel(container);

      const styleElement = document.getElementById('learning-panel-styles');
      expect(styleElement).toBeTruthy();
    });

    it('should show empty state initially', () => {
      panel = new LearningPanel(container);

      const emptyState = container.querySelector('.learning-panel-empty');
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('Select a step');
    });
  });

  describe('getLearningPanelStyles()', () => {
    it('should return panel styles', () => {
      const styles = getLearningPanelStyles();

      expect(styles).toContain('.learning-panel');
      expect(styles).toContain('.learning-panel-header');
      expect(styles).toContain('.learning-panel-content');
    });

    it('should include tier badge styles', () => {
      const styles = getLearningPanelStyles();

      expect(styles).toContain('.learning-panel-tier-badge--micro');
      expect(styles).toContain('.learning-panel-tier-badge--medium');
      expect(styles).toContain('.learning-panel-tier-badge--advanced');
    });

    it('should include annotation type styles', () => {
      const styles = getLearningPanelStyles();

      expect(styles).toContain('.learning-panel-annotation--concept');
      expect(styles).toContain('.learning-panel-annotation--pattern');
      expect(styles).toContain('.learning-panel-annotation--warning');
      expect(styles).toContain('.learning-panel-annotation--tip');
    });
  });

  describe('renderStep() - AC1: Description displayed', () => {
    it('should display step description', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ description: 'Test description text' });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const description = container.querySelector('.learning-panel-description');
      expect(description).toBeTruthy();
      expect(description?.textContent).toContain('Test description text');
    });

    it('should parse markdown in description', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ description: 'Text with **bold** and `code`' });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const description = container.querySelector('.learning-panel-description');
      expect(description?.innerHTML).toContain('<strong>bold</strong>');
      expect(description?.innerHTML).toContain('<code>code</code>');
    });

    it('should display step title in header', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ title: 'My Step Title' });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const title = container.querySelector('.learning-panel-title');
      expect(title?.textContent).toBe('My Step Title');
    });
  });

  describe('renderStep() - AC2: Code snippets displayed', () => {
    it('should display code blocks', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const codeBlock = container.querySelector('.learning-panel-code-block');
      expect(codeBlock).toBeTruthy();
    });

    it('should display multiple code snippets', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({
        codeSnippets: [
          { id: 'snippet-1', sourceFile: 'test.ts', startLine: 1, endLine: 10, title: 'First' },
          { id: 'snippet-2', sourceFile: 'test.ts', startLine: 20, endLine: 30, title: 'Second' },
        ],
      });
      const code = [createMockHighlightedCode(), createMockHighlightedCode()];

      panel.renderStep(step, code);

      const codeBlocks = container.querySelectorAll('.learning-panel-code-block');
      expect(codeBlocks.length).toBe(2);
    });

    it('should use CodeDisplay component', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const codeDisplay = container.querySelector('.code-display');
      expect(codeDisplay).toBeTruthy();
    });
  });

  describe('renderStep() - AC3: Annotations displayed', () => {
    it('should display annotations section', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const annotations = container.querySelectorAll('.learning-panel-annotation');
      expect(annotations.length).toBe(2);
    });

    it('should style annotations by type', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({
        annotations: [
          { id: 'ann-1', lineStart: 1, lineEnd: 1, content: 'Concept', highlightType: 'concept' },
          { id: 'ann-2', lineStart: 2, lineEnd: 2, content: 'Pattern', highlightType: 'pattern' },
          { id: 'ann-3', lineStart: 3, lineEnd: 3, content: 'Warning', highlightType: 'warning' },
          { id: 'ann-4', lineStart: 4, lineEnd: 4, content: 'Tip', highlightType: 'tip' },
        ],
      });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      expect(container.querySelector('.learning-panel-annotation--concept')).toBeTruthy();
      expect(container.querySelector('.learning-panel-annotation--pattern')).toBeTruthy();
      expect(container.querySelector('.learning-panel-annotation--warning')).toBeTruthy();
      expect(container.querySelector('.learning-panel-annotation--tip')).toBeTruthy();
    });

    it('should display line references in annotations', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({
        annotations: [
          { id: 'ann-1', lineStart: 5, lineEnd: 5, content: 'Single', highlightType: 'concept' },
          { id: 'ann-2', lineStart: 10, lineEnd: 15, content: 'Range', highlightType: 'tip' },
        ],
      });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const lineRefs = container.querySelectorAll('.learning-panel-annotation-lines');
      expect(lineRefs[0]?.textContent).toBe('Line 5');
      expect(lineRefs[1]?.textContent).toBe('Lines 10-15');
    });

    it('should make annotations collapsible', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const annotation = container.querySelector('.learning-panel-annotation') as HTMLElement;
      const toggle = annotation.querySelector('.learning-panel-annotation-toggle');
      expect(toggle?.textContent).toContain('Hide');

      // Click to collapse
      annotation.click();
      expect(annotation.classList.contains('learning-panel-annotation--collapsed')).toBe(true);
      expect(toggle?.textContent).toContain('Show');

      // Click to expand
      annotation.click();
      expect(annotation.classList.contains('learning-panel-annotation--collapsed')).toBe(false);
    });
  });

  describe('renderStep() - AC4: Learning objectives displayed', () => {
    it('should display learning objectives', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({
        learningObjectives: ['Learn X', 'Understand Y', 'Apply Z'],
      });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const objectives = container.querySelectorAll('.learning-panel-objective');
      expect(objectives.length).toBe(3);
    });

    it('should display objective text correctly', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({
        learningObjectives: ['First objective', 'Second objective'],
      });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const objectives = container.querySelectorAll('.learning-panel-objective');
      expect(objectives[0]?.textContent).toContain('First objective');
      expect(objectives[1]?.textContent).toContain('Second objective');
    });

    it('should not display objectives section if empty', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ learningObjectives: [] });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const objectivesSection = container.querySelector('.learning-panel-objectives');
      expect(objectivesSection).toBeNull();
    });
  });

  describe('renderStep() - AC5: Content scrollable', () => {
    it('should have scrollable content area', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const content = container.querySelector('.learning-panel-content');
      expect(content).toBeTruthy();

      // Check that overflow-y is set in styles
      const styles = getLearningPanelStyles();
      expect(styles).toContain('overflow-y: auto');
    });
  });

  describe('Tier Badge Display', () => {
    it('should display micro tier badge', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ tier: ComplexityTier.Micro });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const badge = container.querySelector('.learning-panel-tier-badge--micro');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Micro');
    });

    it('should display medium tier badge', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ tier: ComplexityTier.Medium });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const badge = container.querySelector('.learning-panel-tier-badge--medium');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Medium');
    });

    it('should display advanced tier badge', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ tier: ComplexityTier.Advanced });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const badge = container.querySelector('.learning-panel-tier-badge--advanced');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Advanced');
    });
  });

  describe('Parameter Section', () => {
    it('should have parameter controls section', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const paramSection = container.querySelector('.learning-panel-parameter-section');
      expect(paramSection).toBeTruthy();
    });

    it('should show placeholder text when no parameters', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const placeholder = container.querySelector('.learning-panel-parameter-placeholder');
      expect(placeholder?.textContent).toContain('No adjustable parameters');
    });

    it('should provide parameter container via getter', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      const paramContainer = panel.getParameterContainer();
      expect(paramContainer).toBeTruthy();
      expect(paramContainer?.classList.contains('learning-panel-parameter-section')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle step with no code snippets', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ codeSnippets: [] });

      panel.renderStep(step, []);

      expect(container.querySelector('.learning-panel-code-block')).toBeNull();
    });

    it('should handle step with no annotations', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ annotations: [] });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      expect(container.querySelector('.learning-panel-annotation')).toBeNull();
    });

    it('should handle empty description', () => {
      panel = new LearningPanel(container);
      const step = createMockStep({ description: '' });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      // Should not have description section
      const sections = container.querySelectorAll('.learning-panel-section');
      let hasDescSection = false;
      sections.forEach((section) => {
        if (section.querySelector('.learning-panel-description')) {
          hasDescSection = true;
        }
      });
      expect(hasDescSection).toBe(false);
    });
  });

  describe('clear()', () => {
    it('should clear all content', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);
      expect(container.querySelector('.learning-panel-content')).toBeTruthy();

      panel.clear();
      expect(container.querySelector('.learning-panel-content')).toBeNull();
    });
  });

  describe('dispose()', () => {
    it('should remove panel from container', () => {
      panel = new LearningPanel(container);

      panel.dispose();

      expect(container.querySelector('.learning-panel')).toBeNull();
    });

    it('should clean up resources', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);
      panel.dispose();

      // Should not throw when called again
      expect(() => panel.dispose()).not.toThrow();
    });
  });

  describe('highlightParameter()', () => {
    it('should accept parameter key without error', () => {
      panel = new LearningPanel(container);
      const step = createMockStep();
      const code = [createMockHighlightedCode()];

      panel.renderStep(step, code);

      expect(() => panel.highlightParameter('testParam')).not.toThrow();
    });
  });

  describe('injectLearningPanelStyles()', () => {
    it('should inject styles only once', () => {
      panel = new LearningPanel(container);

      injectLearningPanelStyles();

      const styleElements = document.querySelectorAll('#learning-panel-styles');
      expect(styleElements.length).toBe(1);
    });
  });

  describe('Re-rendering', () => {
    it('should clear previous content when rendering new step', () => {
      panel = new LearningPanel(container);
      const step1 = createMockStep({ title: 'First Step' });
      const step2 = createMockStep({ title: 'Second Step' });
      const code = [createMockHighlightedCode()];

      panel.renderStep(step1, code);
      expect(container.querySelector('.learning-panel-title')?.textContent).toBe('First Step');

      panel.renderStep(step2, code);
      expect(container.querySelector('.learning-panel-title')?.textContent).toBe('Second Step');

      // Should only have one title
      const titles = container.querySelectorAll('.learning-panel-title');
      expect(titles.length).toBe(1);
    });
  });
});
