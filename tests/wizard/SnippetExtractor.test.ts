/**
 * SnippetExtractor Unit Tests
 *
 * Tests the snippet extraction functionality for story-014:
 * - AC1: Source files are bundled and extractable
 * - AC3: Specific line ranges can be extracted
 */

import { describe, it, expect } from 'vitest';
import {
  extractLines,
  snippetToString,
  getSnippetLineCount,
  isLineFocused,
  detectMinIndent,
} from '../../src/wizard/SnippetExtractor';

describe('SnippetExtractor', () => {
  const sampleCode = `line 1
line 2
line 3
line 4
line 5
line 6
line 7
line 8
line 9
line 10`;

  describe('extractLines()', () => {
    it('should extract specific line range', () => {
      const result = extractLines(sampleCode, 3, 6);

      expect(result.lines).toHaveLength(4);
      expect(result.lines[0]).toBe('line 3');
      expect(result.lines[3]).toBe('line 6');
      expect(result.actualStartLine).toBe(3);
      expect(result.actualEndLine).toBe(6);
      expect(result.wasClipped).toBe(false);
    });

    it('should handle single line extraction', () => {
      const result = extractLines(sampleCode, 5, 5);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0]).toBe('line 5');
      expect(result.actualStartLine).toBe(5);
      expect(result.actualEndLine).toBe(5);
    });

    it('should clamp start line below 1', () => {
      const result = extractLines(sampleCode, -5, 3);

      expect(result.actualStartLine).toBe(1);
      expect(result.lines[0]).toBe('line 1');
      expect(result.wasClipped).toBe(true);
    });

    it('should clamp end line beyond file length', () => {
      const result = extractLines(sampleCode, 8, 100);

      expect(result.actualEndLine).toBe(10);
      expect(result.lines).toHaveLength(3);
      expect(result.wasClipped).toBe(true);
    });

    it('should handle reversed line range', () => {
      const result = extractLines(sampleCode, 7, 3);

      // Start is clamped first (to 7), then end is clamped to at least start (7)
      expect(result.actualStartLine).toBe(7);
      expect(result.actualEndLine).toBe(7);
      expect(result.lines).toHaveLength(1);
    });

    it('should handle empty source', () => {
      const result = extractLines('', 1, 5);

      expect(result.lines).toHaveLength(0);
      expect(result.totalLines).toBe(0);
      expect(result.wasClipped).toBe(false);
    });

    it('should report total lines correctly', () => {
      const result = extractLines(sampleCode, 1, 3);

      expect(result.totalLines).toBe(10);
    });

    it('should handle first line extraction', () => {
      const result = extractLines(sampleCode, 1, 1);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0]).toBe('line 1');
    });

    it('should handle last line extraction', () => {
      const result = extractLines(sampleCode, 10, 10);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0]).toBe('line 10');
    });

    it('should extract entire file when range covers all lines', () => {
      const result = extractLines(sampleCode, 1, 10);

      expect(result.lines).toHaveLength(10);
      expect(result.wasClipped).toBe(false);
    });
  });

  describe('extractLines() with indentation', () => {
    const indentedCode = `  function test() {
    const x = 1;
    const y = 2;
    return x + y;
  }`;

    it('should preserve indentation by default', () => {
      const result = extractLines(indentedCode, 2, 4);

      expect(result.lines[0]).toBe('    const x = 1;');
      expect(result.lines[1]).toBe('    const y = 2;');
    });

    it('should strip indentation when preserveIndentation is false', () => {
      const result = extractLines(indentedCode, 2, 4, { preserveIndentation: false });

      expect(result.lines[0]).toBe('const x = 1;');
      expect(result.lines[1]).toBe('const y = 2;');
    });

    it('should use custom stripIndent value', () => {
      const result = extractLines(indentedCode, 2, 4, {
        preserveIndentation: false,
        stripIndent: 2,
      });

      expect(result.lines[0]).toBe('  const x = 1;');
    });
  });

  describe('detectMinIndent()', () => {
    it('should detect minimum indentation', () => {
      const lines = ['    line1', '  line2', '      line3'];
      expect(detectMinIndent(lines)).toBe(2);
    });

    it('should skip empty lines', () => {
      const lines = ['  line1', '', '  line2'];
      expect(detectMinIndent(lines)).toBe(2);
    });

    it('should handle no indentation', () => {
      const lines = ['line1', 'line2', 'line3'];
      expect(detectMinIndent(lines)).toBe(0);
    });

    it('should handle empty array', () => {
      expect(detectMinIndent([])).toBe(0);
    });

    it('should handle only empty lines', () => {
      const lines = ['', '   ', '\t\t'];
      expect(detectMinIndent(lines)).toBe(0);
    });
  });

  describe('snippetToString()', () => {
    it('should join lines with newlines', () => {
      const snippet = {
        lines: ['line 1', 'line 2', 'line 3'],
        actualStartLine: 1,
        actualEndLine: 3,
        totalLines: 10,
        wasClipped: false,
      };

      expect(snippetToString(snippet)).toBe('line 1\nline 2\nline 3');
    });

    it('should handle empty lines array', () => {
      const snippet = {
        lines: [],
        actualStartLine: 0,
        actualEndLine: 0,
        totalLines: 0,
        wasClipped: false,
      };

      expect(snippetToString(snippet)).toBe('');
    });

    it('should handle single line', () => {
      const snippet = {
        lines: ['single line'],
        actualStartLine: 1,
        actualEndLine: 1,
        totalLines: 1,
        wasClipped: false,
      };

      expect(snippetToString(snippet)).toBe('single line');
    });
  });

  describe('getSnippetLineCount()', () => {
    it('should return correct line count', () => {
      const snippet = {
        lines: ['a', 'b', 'c'],
        actualStartLine: 1,
        actualEndLine: 3,
        totalLines: 10,
        wasClipped: false,
      };

      expect(getSnippetLineCount(snippet)).toBe(3);
    });

    it('should return 0 for empty snippet', () => {
      const snippet = {
        lines: [],
        actualStartLine: 0,
        actualEndLine: 0,
        totalLines: 0,
        wasClipped: false,
      };

      expect(getSnippetLineCount(snippet)).toBe(0);
    });
  });

  describe('isLineFocused()', () => {
    it('should return true for focused line', () => {
      // Snippet starts at line 10, checking index 2 (which is line 12)
      expect(isLineFocused(2, [12], 10)).toBe(true);
    });

    it('should return false for non-focused line', () => {
      expect(isLineFocused(2, [5, 6, 7], 10)).toBe(false);
    });

    it('should handle multiple focus lines', () => {
      expect(isLineFocused(0, [10, 11, 12], 10)).toBe(true);
      expect(isLineFocused(1, [10, 11, 12], 10)).toBe(true);
      expect(isLineFocused(2, [10, 11, 12], 10)).toBe(true);
    });

    it('should handle empty focus lines', () => {
      expect(isLineFocused(0, [], 10)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle code with unicode characters', () => {
      const unicodeCode = `const emoji = '🎉';
const chinese = '中文';
const arrow = '→';`;

      const result = extractLines(unicodeCode, 1, 3);

      expect(result.lines).toHaveLength(3);
      expect(result.lines[0]).toContain('🎉');
      expect(result.lines[1]).toContain('中文');
    });

    it('should handle code with tabs', () => {
      const tabbedCode = 'line1\n\tline2\n\t\tline3';
      const result = extractLines(tabbedCode, 1, 3);

      expect(result.lines[1]).toBe('\tline2');
      expect(result.lines[2]).toBe('\t\tline3');
    });

    it('should handle code with carriage returns', () => {
      const crlfCode = 'line1\r\nline2\r\nline3';
      const result = extractLines(crlfCode, 1, 3);

      // After split on \n, lines may contain trailing \r
      expect(result.lines).toHaveLength(3);
    });

    it('should handle very long lines', () => {
      const longLine = 'x'.repeat(10000);
      const result = extractLines(longLine, 1, 1);

      expect(result.lines[0].length).toBe(10000);
    });
  });
});
