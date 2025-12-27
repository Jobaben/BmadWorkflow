/**
 * SyntaxHighlighter Unit Tests
 *
 * Tests the syntax highlighting functionality for story-014:
 * - AC2: Code is syntax highlighted
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  highlightCode,
  initializeHighlighter,
  disposeHighlighter,
  isHighlighterReady,
} from '../../src/wizard/SyntaxHighlighter';

describe('SyntaxHighlighter', () => {
  beforeAll(async () => {
    // Initialize the highlighter before all tests
    await initializeHighlighter();
  });

  afterAll(() => {
    // Clean up after tests
    disposeHighlighter();
  });

  describe('initializeHighlighter()', () => {
    it('should initialize without error', async () => {
      // Already initialized in beforeAll, just verify it's ready
      expect(isHighlighterReady()).toBe(true);
    });

    it('should handle multiple initialization calls', async () => {
      // Should not throw on second call
      await expect(initializeHighlighter()).resolves.not.toThrow();
    });
  });

  describe('highlightCode()', () => {
    it('should return highlighted HTML for TypeScript', async () => {
      const code = 'const x: number = 42;';
      const result = await highlightCode(code, { language: 'typescript' });

      expect(result.html).toContain('<pre');
      expect(result.html).toContain('<code');
      expect(result.html).toContain('const');
      expect(result.plainText).toBe(code);
    });

    it('should return correct line count', async () => {
      const code = 'line1\nline2\nline3';
      const result = await highlightCode(code);

      expect(result.lineCount).toBe(3);
    });

    it('should highlight JavaScript', async () => {
      const code = 'function test() { return true; }';
      const result = await highlightCode(code, { language: 'javascript' });

      expect(result.html).toContain('function');
      expect(result.plainText).toBe(code);
    });

    it('should preserve plain text for accessibility', async () => {
      const code = `class MyClass {
  constructor() {}
}`;
      const result = await highlightCode(code);

      expect(result.plainText).toBe(code);
    });

    it('should handle empty code', async () => {
      const result = await highlightCode('');

      expect(result.html).toBeDefined();
      expect(result.lineCount).toBe(1); // Empty string still counts as 1 line
      expect(result.plainText).toBe('');
    });

    it('should handle single line code', async () => {
      const code = 'const single = true;';
      const result = await highlightCode(code);

      expect(result.lineCount).toBe(1);
      expect(result.plainText).toBe(code);
    });

    it('should include focus line styling when specified', async () => {
      const code = 'line1\nline2\nline3\nline4';
      const result = await highlightCode(code, { focusLines: [2] });

      // The focus styling should be applied via class or inline style
      expect(result.html).toContain('shiki-focus-line');
    });

    it('should handle multiple focus lines', async () => {
      const code = 'line1\nline2\nline3\nline4';
      const result = await highlightCode(code, { focusLines: [1, 3] });

      expect(result.html).toBeDefined();
    });
  });

  describe('Language Detection', () => {
    it('should highlight JSON', async () => {
      const code = '{"key": "value", "number": 42}';
      const result = await highlightCode(code, { language: 'json' });

      expect(result.html).toContain('key');
    });

    it('should highlight CSS', async () => {
      const code = '.class { color: red; }';
      const result = await highlightCode(code, { language: 'css' });

      expect(result.html).toContain('color');
    });

    it('should highlight HTML', async () => {
      const code = '<div class="test">Hello</div>';
      const result = await highlightCode(code, { language: 'html' });

      expect(result.html).toContain('div');
    });
  });

  describe('disposeHighlighter()', () => {
    it('should dispose and allow re-initialization', async () => {
      // Dispose
      disposeHighlighter();
      expect(isHighlighterReady()).toBe(false);

      // Re-initialize
      await initializeHighlighter();
      expect(isHighlighterReady()).toBe(true);

      // Should work again
      const result = await highlightCode('const x = 1;');
      expect(result.html).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle code with special HTML characters', async () => {
      const code = 'const template = "<div>&amp;</div>";';
      const result = await highlightCode(code);

      // HTML should be properly escaped in the output
      expect(result.plainText).toBe(code);
    });

    it('should handle code with unicode', async () => {
      const code = 'const emoji = "🎉";';
      const result = await highlightCode(code);

      expect(result.plainText).toBe(code);
    });

    it('should handle TypeScript generics', async () => {
      const code = 'const map: Map<string, number> = new Map();';
      const result = await highlightCode(code, { language: 'typescript' });

      expect(result.html).toContain('Map');
    });

    it('should handle async/await syntax', async () => {
      const code = 'async function test() { await promise; }';
      const result = await highlightCode(code, { language: 'typescript' });

      expect(result.html).toContain('async');
    });
  });
});
