/**
 * ContentBuffer Unit Tests
 *
 * Tests the ContentBuffer for async-to-sync data handoff.
 * Validates all acceptance criteria from story-024.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentBuffer } from '../../src/async/ContentBuffer';
import type { PreparedContent } from '../../src/async/types';

// Mock HighlightedCode objects
const mockHighlightedCode = (id: string) => ({
  html: `<pre><code>${id}</code></pre>`,
  plainText: id,
  lineCount: 5,
  annotations: [],
});

// Mock Annotation objects
const mockAnnotation = (id: string) => ({
  id,
  lineStart: 1,
  lineEnd: 5,
  content: `Annotation for ${id}`,
  highlightType: 'concept' as const,
});

// Helper to create mock PreparedContent
const createMockContent = (stepId: string): PreparedContent => ({
  stepId,
  snippets: [mockHighlightedCode(`snippet-${stepId}`)],
  annotations: [mockAnnotation(`annotation-${stepId}`)],
  preparedAt: Date.now(),
  expiresAt: null,
});

describe('ContentBuffer', () => {
  let buffer: ContentBuffer;

  beforeEach(() => {
    buffer = new ContentBuffer();
  });

  describe('AC1: ContentBuffer stores prepared content by key', () => {
    it('should store content and make it retrievable', () => {
      const content = createMockContent('step-1');

      buffer.set('step-1', content);

      expect(buffer.get('step-1')).toBe(content);
    });

    it('should store multiple entries with different keys', () => {
      const content1 = createMockContent('step-1');
      const content2 = createMockContent('step-2');
      const content3 = createMockContent('step-3');

      buffer.set('step-1', content1);
      buffer.set('step-2', content2);
      buffer.set('step-3', content3);

      expect(buffer.get('step-1')).toBe(content1);
      expect(buffer.get('step-2')).toBe(content2);
      expect(buffer.get('step-3')).toBe(content3);
    });

    it('should overwrite content when setting same key twice', () => {
      const content1 = createMockContent('step-1');
      const content2 = createMockContent('step-1-updated');

      buffer.set('key', content1);
      buffer.set('key', content2);

      expect(buffer.get('key')).toBe(content2);
      expect(buffer.size).toBe(1);
    });

    it('should report correct size after insertions', () => {
      expect(buffer.size).toBe(0);

      buffer.set('step-1', createMockContent('step-1'));
      expect(buffer.size).toBe(1);

      buffer.set('step-2', createMockContent('step-2'));
      expect(buffer.size).toBe(2);
    });
  });

  describe('AC2: ContentBuffer provides instant synchronous reads', () => {
    it('should return content immediately without Promise', () => {
      const content = createMockContent('step-1');
      buffer.set('step-1', content);

      const result = buffer.get('step-1');

      // Result is not a Promise
      expect(result).not.toBeInstanceOf(Promise);
      expect(result).toBe(content);
    });

    it('should return undefined for non-existent key', () => {
      const result = buffer.get('non-existent');

      expect(result).toBeUndefined();
    });

    it('should return undefined when getting from empty buffer', () => {
      expect(buffer.get('anything')).toBeUndefined();
    });

    it('should return exact same object reference', () => {
      const content = createMockContent('step-1');
      buffer.set('step-1', content);

      const retrieved = buffer.get('step-1');

      expect(retrieved).toBe(content);
      expect(Object.is(retrieved, content)).toBe(true);
    });
  });

  describe('AC3: ContentBuffer manages content lifecycle', () => {
    describe('has(key)', () => {
      it('should return true for existing key', () => {
        buffer.set('step-1', createMockContent('step-1'));

        expect(buffer.has('step-1')).toBe(true);
      });

      it('should return false for non-existent key', () => {
        expect(buffer.has('non-existent')).toBe(false);
      });

      it('should return false after key is deleted', () => {
        buffer.set('step-1', createMockContent('step-1'));
        buffer.delete('step-1');

        expect(buffer.has('step-1')).toBe(false);
      });
    });

    describe('delete(key)', () => {
      it('should remove content and return true for existing key', () => {
        buffer.set('step-1', createMockContent('step-1'));

        const result = buffer.delete('step-1');

        expect(result).toBe(true);
        expect(buffer.get('step-1')).toBeUndefined();
        expect(buffer.size).toBe(0);
      });

      it('should return false for non-existent key', () => {
        const result = buffer.delete('non-existent');

        expect(result).toBe(false);
      });

      it('should only remove the specified key', () => {
        buffer.set('step-1', createMockContent('step-1'));
        buffer.set('step-2', createMockContent('step-2'));

        buffer.delete('step-1');

        expect(buffer.has('step-1')).toBe(false);
        expect(buffer.has('step-2')).toBe(true);
        expect(buffer.size).toBe(1);
      });
    });

    describe('clear()', () => {
      it('should remove all entries', () => {
        buffer.set('step-1', createMockContent('step-1'));
        buffer.set('step-2', createMockContent('step-2'));
        buffer.set('step-3', createMockContent('step-3'));

        buffer.clear();

        expect(buffer.size).toBe(0);
        expect(buffer.get('step-1')).toBeUndefined();
        expect(buffer.get('step-2')).toBeUndefined();
        expect(buffer.get('step-3')).toBeUndefined();
      });

      it('should be safe to call on empty buffer', () => {
        buffer.clear();

        expect(buffer.size).toBe(0);
      });

      it('should allow new insertions after clear', () => {
        buffer.set('step-1', createMockContent('step-1'));
        buffer.clear();

        const newContent = createMockContent('step-2');
        buffer.set('step-2', newContent);

        expect(buffer.get('step-2')).toBe(newContent);
        expect(buffer.size).toBe(1);
      });
    });
  });

  describe('AC4: ContentBuffer handles PreparedContent type', () => {
    it('should preserve all PreparedContent fields', () => {
      const content: PreparedContent = {
        stepId: 'particle-emission',
        snippets: [
          mockHighlightedCode('snippet-1'),
          mockHighlightedCode('snippet-2'),
        ],
        annotations: [
          mockAnnotation('annotation-1'),
          mockAnnotation('annotation-2'),
        ],
        preparedAt: 1703764800000,
        expiresAt: 1703768400000,
      };

      buffer.set('particle-emission', content);
      const retrieved = buffer.get('particle-emission');

      expect(retrieved?.stepId).toBe('particle-emission');
      expect(retrieved?.snippets).toHaveLength(2);
      expect(retrieved?.annotations).toHaveLength(2);
      expect(retrieved?.preparedAt).toBe(1703764800000);
      expect(retrieved?.expiresAt).toBe(1703768400000);
    });

    it('should handle content with null expiresAt', () => {
      const content: PreparedContent = {
        stepId: 'step-1',
        snippets: [],
        annotations: [],
        preparedAt: Date.now(),
        expiresAt: null,
      };

      buffer.set('step-1', content);
      const retrieved = buffer.get('step-1');

      expect(retrieved?.expiresAt).toBeNull();
    });

    it('should handle content with empty snippets and annotations', () => {
      const content: PreparedContent = {
        stepId: 'empty-step',
        snippets: [],
        annotations: [],
        preparedAt: Date.now(),
        expiresAt: null,
      };

      buffer.set('empty-step', content);
      const retrieved = buffer.get('empty-step');

      expect(retrieved?.snippets).toEqual([]);
      expect(retrieved?.annotations).toEqual([]);
    });

    it('should handle content with many snippets', () => {
      const manySnippets = Array.from({ length: 50 }, (_, i) =>
        mockHighlightedCode(`snippet-${i}`)
      );
      const content: PreparedContent = {
        stepId: 'many-snippets',
        snippets: manySnippets,
        annotations: [],
        preparedAt: Date.now(),
        expiresAt: null,
      };

      buffer.set('many-snippets', content);
      const retrieved = buffer.get('many-snippets');

      expect(retrieved?.snippets).toHaveLength(50);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const content = createMockContent('empty-key');

      buffer.set('', content);

      expect(buffer.get('')).toBe(content);
      expect(buffer.has('')).toBe(true);
    });

    it('should handle unicode keys', () => {
      const content = createMockContent('unicode');

      buffer.set('步骤-1', content);
      buffer.set('étape-2', content);
      buffer.set('шаг-3', content);

      expect(buffer.has('步骤-1')).toBe(true);
      expect(buffer.has('étape-2')).toBe(true);
      expect(buffer.has('шаг-3')).toBe(true);
      expect(buffer.size).toBe(3);
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(10000);
      const content = createMockContent('long-key');

      buffer.set(longKey, content);

      expect(buffer.get(longKey)).toBe(content);
    });

    it('should handle rapid set/get cycles', () => {
      for (let i = 0; i < 1000; i++) {
        const key = `key-${i}`;
        const content = createMockContent(key);
        buffer.set(key, content);
        expect(buffer.get(key)).toBe(content);
      }

      expect(buffer.size).toBe(1000);
    });

    it('should maintain consistency through mixed operations', () => {
      buffer.set('a', createMockContent('a'));
      buffer.set('b', createMockContent('b'));
      buffer.set('c', createMockContent('c'));

      buffer.delete('b');
      buffer.set('d', createMockContent('d'));
      buffer.set('a', createMockContent('a-updated'));

      expect(buffer.size).toBe(3);
      expect(buffer.has('a')).toBe(true);
      expect(buffer.has('b')).toBe(false);
      expect(buffer.has('c')).toBe(true);
      expect(buffer.has('d')).toBe(true);
    });
  });

  describe('size property', () => {
    it('should start at 0', () => {
      expect(buffer.size).toBe(0);
    });

    it('should increment on set', () => {
      buffer.set('a', createMockContent('a'));
      expect(buffer.size).toBe(1);

      buffer.set('b', createMockContent('b'));
      expect(buffer.size).toBe(2);
    });

    it('should not increment on overwrite', () => {
      buffer.set('a', createMockContent('a'));
      buffer.set('a', createMockContent('a'));

      expect(buffer.size).toBe(1);
    });

    it('should decrement on delete', () => {
      buffer.set('a', createMockContent('a'));
      buffer.set('b', createMockContent('b'));

      buffer.delete('a');

      expect(buffer.size).toBe(1);
    });

    it('should reset to 0 on clear', () => {
      buffer.set('a', createMockContent('a'));
      buffer.set('b', createMockContent('b'));

      buffer.clear();

      expect(buffer.size).toBe(0);
    });
  });
});
