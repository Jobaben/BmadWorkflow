/**
 * SyntaxHighlighter Unit Tests
 *
 * Tests the syntax highlighting functionality for story-014:
 * - AC2: Code is syntax highlighted
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import {
  highlightCode,
  initializeHighlighter,
  disposeHighlighter,
  isHighlighterReady,
  SyntaxHighlighterComponent,
} from '../../src/wizard/SyntaxHighlighter';
import type { AsyncInitializable } from '../../src/async/types';

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

/**
 * SyntaxHighlighterComponent Tests (story-028 AC2)
 *
 * Tests that SyntaxHighlighterComponent implements AsyncInitializable
 * and can be used with ComponentInitializer.
 */
describe('SyntaxHighlighterComponent', () => {
  let component: SyntaxHighlighterComponent;

  beforeEach(() => {
    // Dispose any existing highlighter
    disposeHighlighter();
    component = new SyntaxHighlighterComponent();
  });

  afterEach(() => {
    disposeHighlighter();
  });

  describe('AsyncInitializable interface', () => {
    it('should have correct id', () => {
      expect(component.id).toBe('syntax-highlighter');
    });

    it('should have priority 1 (high priority)', () => {
      expect(component.priority).toBe(1);
    });

    it('should be marked as critical', () => {
      expect(component.isCritical).toBe(true);
    });

    it('should implement AsyncInitializable interface', () => {
      // Type check - if this compiles, the interface is implemented correctly
      const asyncInit: AsyncInitializable = component;
      expect(asyncInit.id).toBeDefined();
      expect(asyncInit.priority).toBeDefined();
      expect(asyncInit.isCritical).toBeDefined();
      expect(typeof asyncInit.initialize).toBe('function');
      expect(typeof asyncInit.isInitialized).toBe('boolean');
    });
  });

  describe('isInitialized', () => {
    it('should be false before initialization', () => {
      expect(component.isInitialized).toBe(false);
    });

    it('should be true after initialization', async () => {
      await component.initialize();
      expect(component.isInitialized).toBe(true);
    });

    it('should reflect module-level highlighter state', async () => {
      expect(isHighlighterReady()).toBe(false);
      await component.initialize();
      expect(isHighlighterReady()).toBe(true);
    });
  });

  describe('initialize()', () => {
    it('should initialize the Shiki highlighter', async () => {
      expect(isHighlighterReady()).toBe(false);
      await component.initialize();
      expect(isHighlighterReady()).toBe(true);
    });

    it('should be idempotent (can call multiple times)', async () => {
      await component.initialize();
      await component.initialize();
      expect(isHighlighterReady()).toBe(true);
    });

    it('should allow highlighting after initialization', async () => {
      await component.initialize();
      const result = await highlightCode('const x = 1;');
      expect(result.html).toContain('const');
    });
  });

  describe('integration with ComponentInitializer pattern', () => {
    it('should work with typical ComponentInitializer usage', async () => {
      // Simulate how ComponentInitializer would use it
      const components: AsyncInitializable[] = [component];

      // Sort by priority (ComponentInitializer does this)
      components.sort((a, b) => a.priority - b.priority);

      // Initialize each
      for (const comp of components) {
        if (!comp.isInitialized) {
          await comp.initialize();
        }
      }

      expect(component.isInitialized).toBe(true);
      expect(isHighlighterReady()).toBe(true);
    });
  });
});
