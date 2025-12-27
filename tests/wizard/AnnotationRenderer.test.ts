/**
 * AnnotationRenderer Unit Tests
 *
 * Tests the AnnotationRenderer implementation against story-014 acceptance criteria:
 * - AC5: Annotations can be overlaid on code
 *
 * @see story-014.md Test Task 4
 */

import { describe, it, expect } from 'vitest';
import {
  ANNOTATION_CLASSES,
  calculateAnnotationPositions,
  renderAnnotationGutter,
  renderAnnotationContent,
  applyAnnotationsToLines,
  getAnnotationIcon,
  groupAnnotationsByLine,
} from '../../src/wizard/AnnotationRenderer';
import { Annotation } from '../../src/wizard/types';
import { HighlightedLine } from '../../src/wizard/CodeSnippetEngine';

describe('AnnotationRenderer', () => {
  // Sample annotations for testing
  const sampleAnnotations: Annotation[] = [
    {
      id: 'a1',
      lineStart: 5,
      lineEnd: 7,
      content: 'This is a concept annotation',
      highlightType: 'concept',
    },
    {
      id: 'a2',
      lineStart: 10,
      lineEnd: 12,
      content: 'This is a pattern annotation',
      highlightType: 'pattern',
    },
    {
      id: 'a3',
      lineStart: 15,
      lineEnd: 15,
      content: 'This is a warning',
      highlightType: 'warning',
    },
  ];

  describe('ANNOTATION_CLASSES', () => {
    it('should have class for concept', () => {
      expect(ANNOTATION_CLASSES.concept).toBe('wizard-annotation-concept');
    });

    it('should have class for pattern', () => {
      expect(ANNOTATION_CLASSES.pattern).toBe('wizard-annotation-pattern');
    });

    it('should have class for warning', () => {
      expect(ANNOTATION_CLASSES.warning).toBe('wizard-annotation-warning');
    });

    it('should have class for tip', () => {
      expect(ANNOTATION_CLASSES.tip).toBe('wizard-annotation-tip');
    });
  });

  describe('AC5: Annotations appear at correct positions', () => {
    describe('calculateAnnotationPositions()', () => {
      it('should calculate correct top position', () => {
        const annotations: Annotation[] = [
          {
            id: 'test',
            lineStart: 5,
            lineEnd: 5,
            content: 'Test',
            highlightType: 'concept',
          },
        ];

        const positions = calculateAnnotationPositions(annotations, {
          snippetStartLine: 1,
          snippetLineCount: 20,
        });

        expect(positions).toHaveLength(1);
        // Line 5 in a 20-line snippet starting at 1
        // Position should be (5-1)/20 * 100 = 20%
        expect(positions[0].topPosition).toBe(20);
      });

      it('should calculate correct height for single line', () => {
        const annotations: Annotation[] = [
          {
            id: 'test',
            lineStart: 5,
            lineEnd: 5,
            content: 'Test',
            highlightType: 'concept',
          },
        ];

        const positions = calculateAnnotationPositions(annotations, {
          snippetStartLine: 1,
          snippetLineCount: 20,
        });

        // Single line in 20-line snippet = 1/20 * 100 = 5%
        expect(positions[0].height).toBe(5);
      });

      it('should calculate correct height for multi-line annotation', () => {
        const annotations: Annotation[] = [
          {
            id: 'test',
            lineStart: 5,
            lineEnd: 9,
            content: 'Test',
            highlightType: 'concept',
          },
        ];

        const positions = calculateAnnotationPositions(annotations, {
          snippetStartLine: 1,
          snippetLineCount: 20,
        });

        // 5 lines (5,6,7,8,9) in 20-line snippet = 5/20 * 100 = 25%
        expect(positions[0].height).toBe(25);
      });

      it('should filter out annotations outside snippet range', () => {
        const annotations: Annotation[] = [
          {
            id: 'before',
            lineStart: 1,
            lineEnd: 3,
            content: 'Before',
            highlightType: 'concept',
          },
          {
            id: 'inside',
            lineStart: 10,
            lineEnd: 12,
            content: 'Inside',
            highlightType: 'pattern',
          },
          {
            id: 'after',
            lineStart: 25,
            lineEnd: 30,
            content: 'After',
            highlightType: 'warning',
          },
        ];

        const positions = calculateAnnotationPositions(annotations, {
          snippetStartLine: 5,
          snippetLineCount: 15, // Lines 5-19
        });

        expect(positions).toHaveLength(1);
        expect(positions[0].annotation.id).toBe('inside');
      });

      it('should clamp annotation to snippet bounds', () => {
        const annotations: Annotation[] = [
          {
            id: 'partial',
            lineStart: 1,
            lineEnd: 10,
            content: 'Partially visible',
            highlightType: 'concept',
          },
        ];

        const positions = calculateAnnotationPositions(annotations, {
          snippetStartLine: 5,
          snippetLineCount: 10, // Lines 5-14
        });

        expect(positions).toHaveLength(1);
        expect(positions[0].startLine).toBe(5);
        expect(positions[0].endLine).toBe(10);
      });

      it('should include correct CSS class', () => {
        const positions = calculateAnnotationPositions(sampleAnnotations, {
          snippetStartLine: 1,
          snippetLineCount: 20,
        });

        expect(positions[0].cssClass).toBe('wizard-annotation-concept');
        expect(positions[1].cssClass).toBe('wizard-annotation-pattern');
        expect(positions[2].cssClass).toBe('wizard-annotation-warning');
      });
    });

    describe('renderAnnotationGutter()', () => {
      it('should render empty gutter for no annotations', () => {
        const html = renderAnnotationGutter([], {
          snippetStartLine: 1,
          snippetLineCount: 10,
        });

        expect(html).toContain('wizard-annotation-gutter');
      });

      it('should render markers for each annotation', () => {
        const html = renderAnnotationGutter(
          [sampleAnnotations[0], sampleAnnotations[1]],
          {
            snippetStartLine: 1,
            snippetLineCount: 20,
          }
        );

        expect(html).toContain('wizard-annotation-marker');
        expect(html).toContain('data-annotation-id="a1"');
        expect(html).toContain('data-annotation-id="a2"');
      });

      it('should include position styles', () => {
        const html = renderAnnotationGutter([sampleAnnotations[0]], {
          snippetStartLine: 1,
          snippetLineCount: 20,
        });

        expect(html).toContain('top:');
        expect(html).toContain('height:');
      });

      it('should include CSS class for annotation type', () => {
        const html = renderAnnotationGutter([sampleAnnotations[0]], {
          snippetStartLine: 1,
          snippetLineCount: 20,
        });

        expect(html).toContain('wizard-annotation-concept');
      });
    });

    describe('renderAnnotationContent()', () => {
      it('should render content for each annotation', () => {
        const html = renderAnnotationContent(sampleAnnotations);

        expect(html).toContain('wizard-annotation-content');
        expect(html).toContain('annotation-content-a1');
        expect(html).toContain('annotation-content-a2');
        expect(html).toContain('annotation-content-a3');
      });

      it('should include annotation text', () => {
        const html = renderAnnotationContent(sampleAnnotations);

        expect(html).toContain('This is a concept annotation');
        expect(html).toContain('This is a pattern annotation');
        expect(html).toContain('This is a warning');
      });

      it('should include line range info', () => {
        const html = renderAnnotationContent([sampleAnnotations[0]]);

        expect(html).toContain('Lines 5-7');
      });

      it('should escape HTML in content', () => {
        const dangerous: Annotation[] = [
          {
            id: 'xss',
            lineStart: 1,
            lineEnd: 1,
            content: '<script>alert("xss")</script>',
            highlightType: 'warning',
          },
        ];

        const html = renderAnnotationContent(dangerous);

        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
      });

      it('should return empty string for no annotations', () => {
        const html = renderAnnotationContent([]);
        expect(html).toBe('');
      });
    });
  });

  describe('applyAnnotationsToLines()', () => {
    const mockLines: HighlightedLine[] = [
      { lineNumber: 5, html: 'line5', text: 'line5', isFocused: false, annotations: [] },
      { lineNumber: 6, html: 'line6', text: 'line6', isFocused: false, annotations: [] },
      { lineNumber: 7, html: 'line7', text: 'line7', isFocused: false, annotations: [] },
      { lineNumber: 8, html: 'line8', text: 'line8', isFocused: false, annotations: [] },
    ];

    it('should add annotation CSS class to annotated lines', () => {
      const annotation: Annotation = {
        id: 'a1',
        lineStart: 5,
        lineEnd: 6,
        content: 'Test',
        highlightType: 'concept',
      };

      const result = applyAnnotationsToLines(mockLines, [annotation]);

      expect(result[0].html).toContain('wizard-annotated-line');
      expect(result[0].html).toContain('wizard-annotation-concept');
      expect(result[1].html).toContain('wizard-annotated-line');
      expect(result[2].html).not.toContain('wizard-annotated-line');
    });

    it('should attach annotations to lines', () => {
      const annotation: Annotation = {
        id: 'a1',
        lineStart: 6,
        lineEnd: 7,
        content: 'Test',
        highlightType: 'pattern',
      };

      const result = applyAnnotationsToLines(mockLines, [annotation]);

      expect(result[0].annotations).toHaveLength(0);
      expect(result[1].annotations).toHaveLength(1);
      expect(result[2].annotations).toHaveLength(1);
      expect(result[3].annotations).toHaveLength(0);
    });

    it('should handle multiple annotations on same line', () => {
      const annotations: Annotation[] = [
        {
          id: 'a1',
          lineStart: 6,
          lineEnd: 6,
          content: 'First',
          highlightType: 'concept',
        },
        {
          id: 'a2',
          lineStart: 6,
          lineEnd: 6,
          content: 'Second',
          highlightType: 'tip',
        },
      ];

      const result = applyAnnotationsToLines(mockLines, annotations);

      expect(result[1].annotations).toHaveLength(2);
      expect(result[1].html).toContain('wizard-annotation-concept');
      expect(result[1].html).toContain('wizard-annotation-tip');
    });

    it('should not modify lines without annotations', () => {
      const result = applyAnnotationsToLines(mockLines, []);

      for (const line of result) {
        expect(line.html).not.toContain('wizard-annotated-line');
        expect(line.annotations).toHaveLength(0);
      }
    });
  });

  describe('getAnnotationIcon()', () => {
    it('should return icon for concept', () => {
      const icon = getAnnotationIcon('concept');
      expect(icon).toBe('💡');
    });

    it('should return icon for pattern', () => {
      const icon = getAnnotationIcon('pattern');
      expect(icon).toBe('🔷');
    });

    it('should return icon for warning', () => {
      const icon = getAnnotationIcon('warning');
      expect(icon).toBe('⚠️');
    });

    it('should return icon for tip', () => {
      const icon = getAnnotationIcon('tip');
      expect(icon).toBe('💬');
    });
  });

  describe('groupAnnotationsByLine()', () => {
    it('should group annotations by line number', () => {
      const annotations: Annotation[] = [
        {
          id: 'a1',
          lineStart: 5,
          lineEnd: 7,
          content: 'Spans 5-7',
          highlightType: 'concept',
        },
        {
          id: 'a2',
          lineStart: 6,
          lineEnd: 8,
          content: 'Spans 6-8',
          highlightType: 'pattern',
        },
      ];

      const grouped = groupAnnotationsByLine(annotations);

      expect(grouped.get(5)).toHaveLength(1);
      expect(grouped.get(6)).toHaveLength(2);
      expect(grouped.get(7)).toHaveLength(2);
      expect(grouped.get(8)).toHaveLength(1);
      expect(grouped.get(4)).toBeUndefined();
      expect(grouped.get(9)).toBeUndefined();
    });

    it('should return empty map for no annotations', () => {
      const grouped = groupAnnotationsByLine([]);
      expect(grouped.size).toBe(0);
    });

    it('should handle single-line annotations', () => {
      const annotations: Annotation[] = [
        {
          id: 'a1',
          lineStart: 10,
          lineEnd: 10,
          content: 'Single line',
          highlightType: 'tip',
        },
      ];

      const grouped = groupAnnotationsByLine(annotations);

      expect(grouped.size).toBe(1);
      expect(grouped.get(10)).toHaveLength(1);
    });
  });
});
