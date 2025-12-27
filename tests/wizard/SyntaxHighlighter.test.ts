/**
 * SyntaxHighlighter Unit Tests
 *
 * Tests the SyntaxHighlighter implementation against story-014 acceptance criteria:
 * - AC2: Code is syntax highlighted
 *
 * @see story-014.md Test Task 3
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  SyntaxHighlighter,
  getHighlighter,
} from '../../src/wizard/SyntaxHighlighter';

describe('SyntaxHighlighter', () => {
  let highlighter: SyntaxHighlighter;

  beforeAll(async () => {
    highlighter = await getHighlighter();
  });

  afterAll(() => {
    highlighter.dispose();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple getInstance calls', () => {
      const instance1 = SyntaxHighlighter.getInstance();
      const instance2 = SyntaxHighlighter.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('AC2: Code is syntax highlighted', () => {
    it('should produce valid HTML output', () => {
      const code = 'const x = 42;';
      const result = highlighter.highlight(code);

      expect(result.html).toBeDefined();
      expect(result.html).toContain('<pre');
      expect(result.html).toContain('<code');
      expect(result.html).toContain('</code>');
      expect(result.html).toContain('</pre>');
    });

    it('should highlight TypeScript keywords', () => {
      const code = 'const foo: string = "hello";';
      const result = highlighter.highlight(code);

      // Shiki adds spans with color styles for syntax
      expect(result.html).toContain('const');
      expect(result.html).toContain('string');
      // The HTML should have syntax highlighting (spans with styles)
      expect(result.html).toContain('<span');
    });

    it('should preserve plain text', () => {
      const code = 'const x = 42;';
      const result = highlighter.highlight(code);

      expect(result.plainText).toBe(code);
    });

    it('should count lines correctly', () => {
      const code = 'line1\nline2\nline3';
      const result = highlighter.highlight(code);

      expect(result.lineCount).toBe(3);
    });

    it('should handle multi-line code', () => {
      const code = `function test() {
  const x = 1;
  return x + 1;
}`;
      const result = highlighter.highlight(code);

      expect(result.html).toContain('function');
      expect(result.html).toContain('return');
      expect(result.lineCount).toBe(4);
    });

    it('should highlight TypeScript-specific syntax', () => {
      const code = `interface User {
  name: string;
  age: number;
}`;
      const result = highlighter.highlight(code);

      expect(result.html).toContain('interface');
      expect(result.html).toContain('User');
    });

    it('should handle empty code', () => {
      const result = highlighter.highlight('');

      expect(result.html).toBeDefined();
      expect(result.plainText).toBe('');
      expect(result.lineCount).toBe(1);
    });
  });

  describe('highlightToLines()', () => {
    it('should return array of line HTML', () => {
      const code = 'line1\nline2\nline3';
      const lines = highlighter.highlightToLines(code);

      expect(lines).toHaveLength(3);
      expect(lines[0]).toContain('line1');
      expect(lines[1]).toContain('line2');
      expect(lines[2]).toContain('line3');
    });

    it('should highlight each line', () => {
      const code = 'const x = 1;\nconst y = 2;';
      const lines = highlighter.highlightToLines(code);

      expect(lines[0]).toContain('const');
      expect(lines[1]).toContain('const');
    });
  });

  describe('Focus Lines', () => {
    it('should apply focus class to specified lines', () => {
      const code = 'line1\nline2\nline3\nline4';
      const result = highlighter.highlight(code, {
        focusLines: [2, 3],
        startLineNumber: 1,
      });

      expect(result.html).toContain('wizard-code-focus');
    });
  });

  describe('getSupportedLanguages()', () => {
    it('should include typescript', () => {
      const langs = highlighter.getSupportedLanguages();
      expect(langs).toContain('typescript');
    });

    it('should include javascript', () => {
      const langs = highlighter.getSupportedLanguages();
      expect(langs).toContain('javascript');
    });
  });

  describe('getSupportedThemes()', () => {
    it('should include github-dark', () => {
      const themes = highlighter.getSupportedThemes();
      expect(themes).toContain('github-dark');
    });

    it('should include github-light', () => {
      const themes = highlighter.getSupportedThemes();
      expect(themes).toContain('github-light');
    });
  });

  describe('Error Handling', () => {
    it('should throw if not initialized', () => {
      // Create new instance without initializing
      const freshHighlighter = new (SyntaxHighlighter as any)();

      expect(() => freshHighlighter.highlight('code')).toThrow(
        'not initialized'
      );
    });
  });

  describe('getHighlighter() convenience function', () => {
    it('should return initialized highlighter', async () => {
      const h = await getHighlighter();
      expect(h.isInitialized()).toBe(true);
    });
  });
});
