/**
 * CodeSnippetEngine Unit Tests
 *
 * Tests the CodeSnippetEngine implementation against story-014 acceptance criteria:
 * - AC1: Source files are bundled and extractable
 * - AC2: Code is syntax highlighted
 * - AC3: Specific line ranges can be extracted
 * - AC4: Focus lines can be emphasized
 *
 * @see story-014.md
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  CodeSnippetEngine,
  createCodeSnippetEngine,
  SourceNotFoundError,
} from '../../src/wizard/CodeSnippetEngine';
import { CodeSnippetRef, Annotation } from '../../src/wizard/types';

describe('CodeSnippetEngine', () => {
  // Test source registry
  const testSourceRegistry = new Map<string, string>([
    [
      'test/sample.ts',
      `line 1: import { foo } from 'bar';
line 2: const x = 42;
line 3: function test() {
line 4:   return x;
line 5: }
line 6: export default test;`,
    ],
    [
      'test/multiline.ts',
      `// Comment on line 1
interface User {
  name: string;
  age: number;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }
}`,
    ],
  ]);

  let engine: CodeSnippetEngine;

  beforeAll(async () => {
    engine = await createCodeSnippetEngine(testSourceRegistry);
  });

  afterAll(() => {
    engine.dispose();
  });

  describe('Initialization', () => {
    it('should initialize correctly', async () => {
      const newEngine = new CodeSnippetEngine(testSourceRegistry);
      expect(newEngine.isInitialized()).toBe(false);

      await newEngine.initialize();
      expect(newEngine.isInitialized()).toBe(true);

      newEngine.dispose();
    });

    it('should handle multiple initialize calls', async () => {
      const newEngine = new CodeSnippetEngine(testSourceRegistry);

      await newEngine.initialize();
      await newEngine.initialize(); // Should not throw

      expect(newEngine.isInitialized()).toBe(true);
      newEngine.dispose();
    });
  });

  describe('AC1: Source files are extractable', () => {
    it('should have source files available', () => {
      expect(engine.hasSource('test/sample.ts')).toBe(true);
      expect(engine.hasSource('test/multiline.ts')).toBe(true);
    });

    it('should return false for unknown sources', () => {
      expect(engine.hasSource('nonexistent.ts')).toBe(false);
    });

    it('should list available files', () => {
      const files = engine.getAvailableFiles();
      expect(files).toContain('test/sample.ts');
      expect(files).toContain('test/multiline.ts');
    });

    it('should return source line count', () => {
      expect(engine.getSourceLineCount('test/sample.ts')).toBe(6);
      expect(engine.getSourceLineCount('nonexistent.ts')).toBe(0);
    });
  });

  describe('AC2 & AC3: Code extraction and highlighting', () => {
    it('should extract and highlight a range of lines', async () => {
      const ref: CodeSnippetRef = {
        id: 'test-snippet',
        sourceFile: 'test/sample.ts',
        startLine: 2,
        endLine: 4,
      };

      const result = await engine.getSnippet(ref);

      expect(result.plainText).toContain('const x = 42');
      expect(result.plainText).toContain('function test');
      expect(result.plainText).toContain('return x');
      expect(result.lineCount).toBe(3);
      expect(result.startLine).toBe(2);
      expect(result.endLine).toBe(4);
    });

    it('should produce highlighted HTML', async () => {
      const ref: CodeSnippetRef = {
        id: 'test-snippet',
        sourceFile: 'test/sample.ts',
        startLine: 2,
        endLine: 3,
      };

      const result = await engine.getSnippet(ref);

      expect(result.html).toContain('<pre');
      expect(result.html).toContain('<code');
      expect(result.html).toContain('<span');
    });

    it('should extract single line', async () => {
      const ref: CodeSnippetRef = {
        id: 'single-line',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 1,
      };

      const result = await engine.getSnippet(ref);

      expect(result.lineCount).toBe(1);
      expect(result.plainText).toContain('import');
    });

    it('should throw SourceNotFoundError for missing file', async () => {
      const ref: CodeSnippetRef = {
        id: 'missing',
        sourceFile: 'nonexistent.ts',
        startLine: 1,
        endLine: 5,
      };

      await expect(engine.getSnippet(ref)).rejects.toBeInstanceOf(
        SourceNotFoundError
      );
    });

    it('should include available files in error', async () => {
      const ref: CodeSnippetRef = {
        id: 'missing',
        sourceFile: 'nonexistent.ts',
        startLine: 1,
        endLine: 5,
      };

      try {
        await engine.getSnippet(ref);
      } catch (error) {
        expect(error).toBeInstanceOf(SourceNotFoundError);
        expect((error as SourceNotFoundError).availableFiles).toContain(
          'test/sample.ts'
        );
      }
    });

    it('should throw for invalid range', async () => {
      const ref: CodeSnippetRef = {
        id: 'invalid',
        sourceFile: 'test/sample.ts',
        startLine: 100,
        endLine: 200,
      };

      await expect(engine.getSnippet(ref)).rejects.toThrow();
    });
  });

  describe('AC4: Focus lines can be emphasized', () => {
    it('should mark focus lines in result', async () => {
      const ref: CodeSnippetRef = {
        id: 'focus-test',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 5,
        focusLines: [2, 3],
      };

      const result = await engine.getSnippet(ref);

      // Check individual lines
      const focusedLines = result.lines.filter((l) => l.isFocused);
      expect(focusedLines).toHaveLength(2);
      expect(focusedLines[0].lineNumber).toBe(2);
      expect(focusedLines[1].lineNumber).toBe(3);
    });

    it('should not mark unfocused lines', async () => {
      const ref: CodeSnippetRef = {
        id: 'focus-test',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 5,
        focusLines: [3],
      };

      const result = await engine.getSnippet(ref);

      const unfocusedLines = result.lines.filter((l) => !l.isFocused);
      expect(unfocusedLines).toHaveLength(4);
    });

    it('should handle no focus lines', async () => {
      const ref: CodeSnippetRef = {
        id: 'no-focus',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 3,
      };

      const result = await engine.getSnippet(ref);

      const focusedLines = result.lines.filter((l) => l.isFocused);
      expect(focusedLines).toHaveLength(0);
    });
  });

  describe('Individual Lines', () => {
    it('should return array of highlighted lines', async () => {
      const ref: CodeSnippetRef = {
        id: 'lines-test',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 3,
      };

      const result = await engine.getSnippet(ref);

      expect(result.lines).toHaveLength(3);
      expect(result.lines[0].lineNumber).toBe(1);
      expect(result.lines[1].lineNumber).toBe(2);
      expect(result.lines[2].lineNumber).toBe(3);
    });

    it('should include text and html for each line', async () => {
      const ref: CodeSnippetRef = {
        id: 'lines-content',
        sourceFile: 'test/sample.ts',
        startLine: 2,
        endLine: 2,
      };

      const result = await engine.getSnippet(ref);
      const line = result.lines[0];

      expect(line.text).toBeDefined();
      expect(line.html).toBeDefined();
      expect(line.text).toContain('const x = 42');
    });
  });

  describe('Annotations', () => {
    it('should filter annotations to visible lines', async () => {
      const ref: CodeSnippetRef = {
        id: 'annotated',
        sourceFile: 'test/sample.ts',
        startLine: 2,
        endLine: 4,
      };

      const annotations: Annotation[] = [
        {
          id: 'a1',
          lineStart: 2,
          lineEnd: 3,
          content: 'Visible annotation',
          highlightType: 'concept',
        },
        {
          id: 'a2',
          lineStart: 10,
          lineEnd: 12,
          content: 'Out of range',
          highlightType: 'tip',
        },
      ];

      const result = await engine.getSnippet(ref, annotations);

      expect(result.annotations).toHaveLength(1);
      expect(result.annotations[0].id).toBe('a1');
    });

    it('should include annotations on individual lines', async () => {
      const ref: CodeSnippetRef = {
        id: 'line-annotated',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 5,
      };

      const annotations: Annotation[] = [
        {
          id: 'a1',
          lineStart: 2,
          lineEnd: 3,
          content: 'Spans lines 2-3',
          highlightType: 'pattern',
        },
      ];

      const result = await engine.getSnippet(ref, annotations);

      // Lines 2 and 3 should have the annotation
      expect(result.lines[1].annotations).toHaveLength(1);
      expect(result.lines[2].annotations).toHaveLength(1);
      // Lines 1, 4, 5 should not
      expect(result.lines[0].annotations).toHaveLength(0);
      expect(result.lines[3].annotations).toHaveLength(0);
      expect(result.lines[4].annotations).toHaveLength(0);
    });
  });

  describe('highlightLines()', () => {
    it('should update focus state for specified lines', async () => {
      const ref: CodeSnippetRef = {
        id: 'test',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 5,
      };

      const snippet = await engine.getSnippet(ref);
      const highlighted = engine.highlightLines(2, 3, snippet);

      const focused = highlighted.lines.filter((l) => l.isFocused);
      expect(focused).toHaveLength(2);
      expect(focused[0].lineNumber).toBe(2);
      expect(focused[1].lineNumber).toBe(3);
    });

    it('should not modify original snippet', async () => {
      const ref: CodeSnippetRef = {
        id: 'test',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 5,
      };

      const original = await engine.getSnippet(ref);
      engine.highlightLines(2, 3, original);

      // Original should be unchanged
      const focused = original.lines.filter((l) => l.isFocused);
      expect(focused).toHaveLength(0);
    });
  });

  describe('clearHighlighting()', () => {
    it('should clear all focus states', async () => {
      const ref: CodeSnippetRef = {
        id: 'test',
        sourceFile: 'test/sample.ts',
        startLine: 1,
        endLine: 5,
        focusLines: [2, 3, 4],
      };

      const snippet = await engine.getSnippet(ref);
      const cleared = engine.clearHighlighting(snippet);

      const focused = cleared.lines.filter((l) => l.isFocused);
      expect(focused).toHaveLength(0);
    });
  });

  describe('createCodeSnippetEngine factory', () => {
    it('should return initialized engine', async () => {
      const newEngine = await createCodeSnippetEngine(testSourceRegistry);

      expect(newEngine.isInitialized()).toBe(true);
      newEngine.dispose();
    });
  });
});
