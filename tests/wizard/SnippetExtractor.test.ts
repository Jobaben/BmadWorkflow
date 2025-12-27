/**
 * SnippetExtractor Unit Tests
 *
 * Tests the SnippetExtractor implementation against story-014 acceptance criteria:
 * - AC1: Source files are bundled and extractable
 * - AC3: Specific line ranges can be extracted
 *
 * @see story-014.md Test Task 1, Test Task 2
 */

import { describe, it, expect } from 'vitest';
import {
  extractLines,
  getLineCount,
  getLine,
  validateRange,
  getSpecificLines,
} from '../../src/wizard/SnippetExtractor';

describe('SnippetExtractor', () => {
  // Sample source code for testing
  const sampleSource = `line 1
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
    describe('AC3: Specific line ranges can be extracted', () => {
      it('should extract a range of lines correctly', () => {
        const result = extractLines(sampleSource, 2, 4);

        expect(result.content).toBe('line 2\nline 3\nline 4');
        expect(result.lineCount).toBe(3);
        expect(result.actualStartLine).toBe(2);
        expect(result.actualEndLine).toBe(4);
        expect(result.wasTruncated).toBe(false);
      });

      it('should extract a single line', () => {
        const result = extractLines(sampleSource, 5, 5);

        expect(result.content).toBe('line 5');
        expect(result.lineCount).toBe(1);
        expect(result.wasTruncated).toBe(false);
      });

      it('should extract first line', () => {
        const result = extractLines(sampleSource, 1, 1);

        expect(result.content).toBe('line 1');
        expect(result.actualStartLine).toBe(1);
      });

      it('should extract last line', () => {
        const result = extractLines(sampleSource, 10, 10);

        expect(result.content).toBe('line 10');
        expect(result.actualEndLine).toBe(10);
      });

      it('should extract entire source', () => {
        const result = extractLines(sampleSource, 1, 10);

        expect(result.content).toBe(sampleSource);
        expect(result.lineCount).toBe(10);
      });
    });

    describe('Edge Cases', () => {
      it('should truncate when end line exceeds source length', () => {
        const result = extractLines(sampleSource, 8, 20);

        expect(result.content).toBe('line 8\nline 9\nline 10');
        expect(result.lineCount).toBe(3);
        expect(result.actualEndLine).toBe(10);
        expect(result.wasTruncated).toBe(true);
      });

      it('should throw for empty source', () => {
        expect(() => extractLines('', 1, 5)).toThrow('EMPTY_SOURCE');
      });

      it('should throw for negative start line', () => {
        expect(() => extractLines(sampleSource, -1, 5)).toThrow('INVALID_RANGE');
      });

      it('should throw for zero start line', () => {
        expect(() => extractLines(sampleSource, 0, 5)).toThrow('INVALID_RANGE');
      });

      it('should throw when start > end', () => {
        expect(() => extractLines(sampleSource, 5, 2)).toThrow('INVALID_RANGE');
      });

      it('should throw when start line exceeds source length', () => {
        expect(() => extractLines(sampleSource, 20, 25)).toThrow('OUT_OF_BOUNDS');
      });

      it('should handle source with empty lines', () => {
        const sourceWithEmpty = 'line 1\n\nline 3';
        const result = extractLines(sourceWithEmpty, 1, 3);

        expect(result.content).toBe('line 1\n\nline 3');
        expect(result.lineCount).toBe(3);
      });

      it('should handle source with trailing newline', () => {
        const sourceWithTrailing = 'line 1\nline 2\n';
        const result = extractLines(sourceWithTrailing, 1, 3);

        expect(result.lineCount).toBe(3);
        // Last "line" is empty due to trailing newline
        expect(result.content).toBe('line 1\nline 2\n');
      });

      it('should handle source with unicode characters', () => {
        const unicodeSource = 'const π = 3.14;\nconst θ = 90°;\nconst emoji = 🎉;';
        const result = extractLines(unicodeSource, 2, 2);

        expect(result.content).toBe('const θ = 90°;');
      });
    });
  });

  describe('getLineCount()', () => {
    it('should return correct line count', () => {
      expect(getLineCount(sampleSource)).toBe(10);
    });

    it('should return 0 for empty source', () => {
      expect(getLineCount('')).toBe(0);
    });

    it('should return 1 for single line', () => {
      expect(getLineCount('single line')).toBe(1);
    });

    it('should count empty lines', () => {
      expect(getLineCount('line1\n\n\nline4')).toBe(4);
    });
  });

  describe('getLine()', () => {
    it('should return correct line', () => {
      expect(getLine(sampleSource, 5)).toBe('line 5');
    });

    it('should return undefined for out of bounds', () => {
      expect(getLine(sampleSource, 100)).toBeUndefined();
    });

    it('should return undefined for negative line', () => {
      expect(getLine(sampleSource, -1)).toBeUndefined();
    });

    it('should return undefined for empty source', () => {
      expect(getLine('', 1)).toBeUndefined();
    });
  });

  describe('validateRange()', () => {
    it('should return valid for correct range', () => {
      const result = validateRange(sampleSource, 2, 5);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty source', () => {
      const result = validateRange('', 1, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('EMPTY_SOURCE');
    });

    it('should return invalid for negative lines', () => {
      const result = validateRange(sampleSource, -1, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('INVALID_RANGE');
    });

    it('should return invalid when start > end', () => {
      const result = validateRange(sampleSource, 5, 2);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('INVALID_RANGE');
    });

    it('should return invalid for out of bounds start', () => {
      const result = validateRange(sampleSource, 100, 105);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('OUT_OF_BOUNDS');
    });
  });

  describe('getSpecificLines()', () => {
    it('should return requested lines', () => {
      const lines = getSpecificLines(sampleSource, [1, 3, 5]);

      expect(lines.size).toBe(3);
      expect(lines.get(1)).toBe('line 1');
      expect(lines.get(3)).toBe('line 3');
      expect(lines.get(5)).toBe('line 5');
    });

    it('should skip invalid line numbers', () => {
      const lines = getSpecificLines(sampleSource, [1, 100, 3]);

      expect(lines.size).toBe(2);
      expect(lines.has(100)).toBe(false);
    });

    it('should return empty map for empty input', () => {
      const lines = getSpecificLines(sampleSource, []);
      expect(lines.size).toBe(0);
    });

    it('should return empty map for empty source', () => {
      const lines = getSpecificLines('', [1, 2, 3]);
      expect(lines.size).toBe(0);
    });
  });
});
