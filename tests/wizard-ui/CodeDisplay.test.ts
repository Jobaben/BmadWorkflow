/**
 * CodeDisplay Unit Tests
 *
 * Tests the code display component for story-014:
 * - AC2: Code is syntax highlighted (rendering)
 * - AC4: Focus lines can be emphasized (visual)
 * - AC5: Annotations can be overlaid on code
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  CodeDisplay,
  getCodeDisplayStyles,
  injectCodeDisplayStyles,
} from '../../src/wizard-ui/CodeDisplay';
import type { HighlightedCode } from '../../src/wizard/CodeSnippetEngine';

describe('CodeDisplay', () => {
  let dom: JSDOM;
  let document: Document;
  let container: HTMLElement;

  beforeEach(() => {
    // Set up jsdom environment
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    document = dom.window.document;
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock global document for style injection
    vi.stubGlobal('document', document);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Sample highlighted code for testing
  const sampleHighlightedCode: HighlightedCode = {
    html: '<pre class="shiki"><code><span class="line">const x = 42;</span>\n<span class="line">const y = 24;</span></code></pre>',
    plainText: 'const x = 42;\nconst y = 24;',
    lineCount: 2,
    annotations: [],
  };

  describe('constructor', () => {
    it('should create a CodeDisplay instance', () => {
      const display = new CodeDisplay(container);
      expect(display).toBeDefined();
    });

    it('should inject styles on first creation', () => {
      new CodeDisplay(container);
      const styleElement = document.getElementById('code-display-styles');
      expect(styleElement).toBeDefined();
    });

    it('should accept custom options', () => {
      const display = new CodeDisplay(container, {
        showLineNumbers: false,
        maxHeight: '200px',
      });
      expect(display).toBeDefined();
    });
  });

  describe('render()', () => {
    it('should render code into the container', () => {
      const display = new CodeDisplay(container);
      display.render(sampleHighlightedCode);

      expect(container.innerHTML).toContain('code-display');
      expect(container.innerHTML).toContain('const x = 42');
    });

    it('should show line numbers by default', () => {
      const display = new CodeDisplay(container);
      display.render(sampleHighlightedCode);

      expect(container.innerHTML).toContain('code-display-lines');
      expect(container.innerHTML).toContain('code-display-line-number');
    });

    it('should hide line numbers when disabled', () => {
      const display = new CodeDisplay(container, { showLineNumbers: false });
      display.render(sampleHighlightedCode);

      expect(container.innerHTML).not.toContain('code-display-lines');
    });

    it('should display title when provided', () => {
      const display = new CodeDisplay(container, { title: 'Sample Code' });
      display.render(sampleHighlightedCode);

      expect(container.innerHTML).toContain('code-display-header');
      expect(container.innerHTML).toContain('Sample Code');
    });

    it('should not display title when not provided', () => {
      const display = new CodeDisplay(container);
      display.render(sampleHighlightedCode);

      expect(container.innerHTML).not.toContain('code-display-header');
    });

    it('should set maxHeight on content', () => {
      const display = new CodeDisplay(container, { maxHeight: '300px' });
      display.render(sampleHighlightedCode);

      const content = container.querySelector('.code-display-content') as HTMLElement;
      expect(content.style.maxHeight).toBe('300px');
    });

    it('should use custom start line number', () => {
      const display = new CodeDisplay(container, { startLineNumber: 10 });
      display.render(sampleHighlightedCode);

      expect(container.innerHTML).toContain('10');
      expect(container.innerHTML).toContain('11');
    });
  });

  describe('annotations rendering (AC5)', () => {
    const codeWithAnnotations: HighlightedCode = {
      html: '<pre><code>line1\nline2\nline3</code></pre>',
      plainText: 'line1\nline2\nline3',
      lineCount: 3,
      annotations: [
        {
          id: 'ann-1',
          lineStart: 1,
          lineEnd: 1,
          content: 'This is a concept explanation',
          highlightType: 'concept',
        },
        {
          id: 'ann-2',
          lineStart: 2,
          lineEnd: 3,
          content: 'This is a pattern',
          highlightType: 'pattern',
        },
      ],
    };

    it('should render annotations section', () => {
      const display = new CodeDisplay(container);
      display.render(codeWithAnnotations);

      expect(container.innerHTML).toContain('code-display-annotations');
    });

    it('should display annotation content', () => {
      const display = new CodeDisplay(container);
      display.render(codeWithAnnotations);

      expect(container.innerHTML).toContain('This is a concept explanation');
      expect(container.innerHTML).toContain('This is a pattern');
    });

    it('should apply correct annotation classes', () => {
      const display = new CodeDisplay(container);
      display.render(codeWithAnnotations);

      expect(container.innerHTML).toContain('code-annotation-concept');
      expect(container.innerHTML).toContain('code-annotation-pattern');
    });

    it('should hide annotations when disabled', () => {
      const display = new CodeDisplay(container, { showAnnotations: false });
      display.render(codeWithAnnotations);

      expect(container.innerHTML).not.toContain('code-display-annotations');
    });

    it('should not render annotations section when empty', () => {
      const display = new CodeDisplay(container);
      display.render(sampleHighlightedCode);

      expect(container.innerHTML).not.toContain('code-display-annotations');
    });
  });

  describe('updateOptions()', () => {
    it('should update options without re-rendering', () => {
      const display = new CodeDisplay(container, { showLineNumbers: true });
      display.updateOptions({ showLineNumbers: false });

      // Options are updated but not re-rendered yet
      expect(container.innerHTML).toBe('');
    });

    it('should use updated options on next render', () => {
      const display = new CodeDisplay(container, { showLineNumbers: true });
      display.render(sampleHighlightedCode);
      expect(container.innerHTML).toContain('code-display-lines');

      display.updateOptions({ showLineNumbers: false });
      display.render(sampleHighlightedCode);
      expect(container.innerHTML).not.toContain('code-display-lines');
    });
  });

  describe('clear()', () => {
    it('should clear the container', () => {
      const display = new CodeDisplay(container);
      display.render(sampleHighlightedCode);
      expect(container.innerHTML).not.toBe('');

      display.clear();
      expect(container.innerHTML).toBe('');
    });
  });

  describe('getCodeDisplayStyles()', () => {
    it('should return CSS string', () => {
      const styles = getCodeDisplayStyles();

      expect(styles).toContain('.code-display');
      expect(styles).toContain('.code-display-line-number');
      expect(styles).toContain('.code-annotation');
    });

    it('should include annotation type styles', () => {
      const styles = getCodeDisplayStyles();

      expect(styles).toContain('.code-annotation-concept');
      expect(styles).toContain('.code-annotation-pattern');
      expect(styles).toContain('.code-annotation-warning');
      expect(styles).toContain('.code-annotation-tip');
    });
  });

  describe('override options on render', () => {
    it('should accept override options on render call', () => {
      const display = new CodeDisplay(container, { showLineNumbers: true });
      display.render(sampleHighlightedCode, { showLineNumbers: false });

      expect(container.innerHTML).not.toContain('code-display-lines');
    });

    it('should not permanently change base options with override', () => {
      const display = new CodeDisplay(container, { showLineNumbers: true });
      display.render(sampleHighlightedCode, { showLineNumbers: false });
      display.render(sampleHighlightedCode);

      // Back to original option
      expect(container.innerHTML).toContain('code-display-lines');
    });
  });

  describe('Edge Cases', () => {
    it('should handle code with no lines', () => {
      const emptyCode: HighlightedCode = {
        html: '<pre><code></code></pre>',
        plainText: '',
        lineCount: 0,
        annotations: [],
      };

      const display = new CodeDisplay(container);
      display.render(emptyCode);

      expect(container.innerHTML).toContain('code-display');
    });

    it('should handle code with many lines', () => {
      const manyLines = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`);
      const manyLinesCode: HighlightedCode = {
        html: `<pre><code>${manyLines.join('\n')}</code></pre>`,
        plainText: manyLines.join('\n'),
        lineCount: 100,
        annotations: [],
      };

      const display = new CodeDisplay(container);
      display.render(manyLinesCode);

      expect(container.innerHTML).toContain('100');
    });

    it('should handle annotation on multiple lines', () => {
      const multiLineAnnotation: HighlightedCode = {
        html: '<pre><code>line1\nline2\nline3</code></pre>',
        plainText: 'line1\nline2\nline3',
        lineCount: 3,
        annotations: [
          {
            id: 'multi',
            lineStart: 1,
            lineEnd: 3,
            content: 'Spans multiple lines',
            highlightType: 'pattern',
          },
        ],
      };

      const display = new CodeDisplay(container, { startLineNumber: 1 });
      display.render(multiLineAnnotation);

      expect(container.innerHTML).toContain('Lines 1-3');
    });
  });
});
