/**
 * CodeSnippetEngine Unit Tests
 *
 * Tests the main code snippet engine for story-014:
 * - AC1: Source files are bundled and extractable
 * - AC2: Code is syntax highlighted
 * - AC3: Specific line ranges can be extracted
 * - AC4: Focus lines can be emphasized
 * - AC5: Annotations can be overlaid on code
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  CodeSnippetEngine,
  SourceNotFoundError,
} from '../../src/wizard/CodeSnippetEngine';
import type { CodeSnippetRef, Annotation } from '../../src/wizard/types';

describe('CodeSnippetEngine', () => {
  // Create a mock source registry for testing
  const mockSourceRegistry = new Map<string, string>([
    [
      'test/sample.ts',
      `// Sample TypeScript file
const x: number = 42;
const y: string = 'hello';

function add(a: number, b: number): number {
  return a + b;
}

class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

export { Calculator, add };`,
    ],
    [
      'test/empty.ts',
      '',
    ],
    [
      'test/single.ts',
      'const single = true;',
    ],
  ]);

  let engine: CodeSnippetEngine;

  beforeEach(() => {
    engine = new CodeSnippetEngine(mockSourceRegistry);
  });

  afterEach(() => {
    engine.dispose();
  });

  describe('constructor', () => {
    it('should create engine with custom source registry', () => {
      expect(engine).toBeDefined();
    });

    it('should create engine without source registry (uses default)', () => {
      const defaultEngine = new CodeSnippetEngine();
      expect(defaultEngine).toBeDefined();
      defaultEngine.dispose();
    });
  });

  describe('initialize()', () => {
    it('should initialize the highlighter', async () => {
      await expect(engine.initialize()).resolves.not.toThrow();
    });

    it('should handle multiple initialize calls', async () => {
      await engine.initialize();
      await expect(engine.initialize()).resolves.not.toThrow();
    });
  });

  describe('hasSource()', () => {
    it('should return true for existing source', () => {
      expect(engine.hasSource('test/sample.ts')).toBe(true);
    });

    it('should return false for non-existing source', () => {
      expect(engine.hasSource('nonexistent.ts')).toBe(false);
    });
  });

  describe('getSnippet()', () => {
    it('should extract and highlight code (AC1, AC2)', async () => {
      const ref: CodeSnippetRef = {
        id: 'test-snippet',
        sourceFile: 'test/sample.ts',
        startLine: 2,
        endLine: 3,
      };

      const result = await engine.getSnippet(ref);

      expect(result.html).toContain('const');
      expect(result.plainText).toContain('const x: number = 42;');
      expect(result.lineCount).toBe(2);
    });

    it('should extract specific line ranges (AC3)', async () => {
      const ref: CodeSnippetRef = {
        id: 'function-snippet',
        sourceFile: 'test/sample.ts',
        startLine: 5,
        endLine: 7,
      };

      const result = await engine.getSnippet(ref);

      expect(result.plainText).toContain('function add');
      expect(result.plainText).toContain('return a + b');
      expect(result.lineCount).toBe(3);
    });

    it('should apply focus lines (AC4)', async () => {
      const ref: CodeSnippetRef = {
        id: 'focus-snippet',
        sourceFile: 'test/sample.ts',
        startLine: 5,
        endLine: 7,
        focusLines: [6],
      };

      const result = await engine.getSnippet(ref);

      expect(result.html).toContain('shiki-focus-line');
    });

    it('should include annotations (AC5)', async () => {
      const ref: CodeSnippetRef = {
        id: 'annotated-snippet',
        sourceFile: 'test/sample.ts',
        startLine: 5,
        endLine: 7,
      };

      const annotations: Annotation[] = [
        {
          id: 'ann-1',
          lineStart: 6,
          lineEnd: 6,
          content: 'This is the return statement',
          highlightType: 'concept',
        },
      ];

      const result = await engine.getSnippet(ref, annotations);

      expect(result.annotations).toHaveLength(1);
      // Annotation should be adjusted to snippet-relative line numbers
      expect(result.annotations[0].lineStart).toBe(2); // Line 6 becomes line 2 in snippet (5,6,7)
    });

    it('should filter out-of-range annotations', async () => {
      const ref: CodeSnippetRef = {
        id: 'partial-annotations',
        sourceFile: 'test/sample.ts',
        startLine: 5,
        endLine: 7,
      };

      const annotations: Annotation[] = [
        {
          id: 'in-range',
          lineStart: 6,
          lineEnd: 6,
          content: 'In range',
          highlightType: 'concept',
        },
        {
          id: 'out-of-range',
          lineStart: 1,
          lineEnd: 2,
          content: 'Out of range',
          highlightType: 'tip',
        },
      ];

      const result = await engine.getSnippet(ref, annotations);

      expect(result.annotations).toHaveLength(1);
      expect(result.annotations[0].id).toBe('in-range');
    });

    it('should throw SourceNotFoundError for missing file', async () => {
      const ref: CodeSnippetRef = {
        id: 'missing',
        sourceFile: 'nonexistent.ts',
        startLine: 1,
        endLine: 5,
      };

      await expect(engine.getSnippet(ref)).rejects.toThrow(SourceNotFoundError);
    });

    it('should handle empty source file', async () => {
      const ref: CodeSnippetRef = {
        id: 'empty',
        sourceFile: 'test/empty.ts',
        startLine: 1,
        endLine: 5,
      };

      const result = await engine.getSnippet(ref);

      expect(result.lineCount).toBe(1); // Empty file has 1 empty line
    });

    it('should handle single line file', async () => {
      const ref: CodeSnippetRef = {
        id: 'single',
        sourceFile: 'test/single.ts',
        startLine: 1,
        endLine: 1,
      };

      const result = await engine.getSnippet(ref);

      expect(result.plainText).toBe('const single = true;');
      expect(result.lineCount).toBe(1);
    });

    it('should cache snippets for performance', async () => {
      const ref: CodeSnippetRef = {
        id: 'cached',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 3,
      };

      const result1 = await engine.getSnippet(ref);
      const result2 = await engine.getSnippet(ref);

      // Results should be identical (same cached object or equal content)
      expect(result1.html).toBe(result2.html);
      expect(result1.plainText).toBe(result2.plainText);
    });
  });

  describe('clearCache()', () => {
    it('should clear the snippet cache', async () => {
      const ref: CodeSnippetRef = {
        id: 'test',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 3,
      };

      await engine.getSnippet(ref);
      engine.clearCache();

      // Should work fine after cache clear
      const result = await engine.getSnippet(ref);
      expect(result.html).toBeDefined();
    });
  });

  describe('dispose()', () => {
    it('should dispose engine resources', () => {
      expect(() => engine.dispose()).not.toThrow();
    });

    it('should allow re-use after dispose', async () => {
      engine.dispose();

      const ref: CodeSnippetRef = {
        id: 'after-dispose',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 3,
      };

      // Should work after dispose (re-initializes)
      const result = await engine.getSnippet(ref);
      expect(result.html).toBeDefined();
    });
  });

  describe('SourceNotFoundError', () => {
    it('should have correct name and message', () => {
      const error = new SourceNotFoundError('missing.ts');

      expect(error.name).toBe('SourceNotFoundError');
      expect(error.message).toBe('Source file not found: missing.ts');
      expect(error.sourceFile).toBe('missing.ts');
    });
  });

  describe('Language Detection', () => {
    it('should detect TypeScript from .ts extension', async () => {
      const ref: CodeSnippetRef = {
        id: 'ts',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 2,
      };

      const result = await engine.getSnippet(ref);
      expect(result.html).toBeDefined();
    });
  });

  describe('Focus Lines Edge Cases', () => {
    it('should handle focus lines outside snippet range', async () => {
      const ref: CodeSnippetRef = {
        id: 'focus-outside',
        sourceFile: 'test/sample.ts',
        startLine: 5,
        endLine: 7,
        focusLines: [1, 2, 100], // Lines 1, 2 are before snippet, 100 is after
      };

      const result = await engine.getSnippet(ref);
      // Should not throw and should not have focus styling
      expect(result.html).toBeDefined();
    });

    it('should handle empty focus lines array', async () => {
      const ref: CodeSnippetRef = {
        id: 'empty-focus',
        sourceFile: 'test/sample.ts',
        startLine: 5,
        endLine: 7,
        focusLines: [],
      };

      const result = await engine.getSnippet(ref);
      expect(result.html).toBeDefined();
    });
  });
});
