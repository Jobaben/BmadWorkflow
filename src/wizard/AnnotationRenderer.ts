/**
 * Annotation Renderer
 *
 * Generates HTML with annotation markers positioned relative to code lines.
 * Annotations appear at the correct line positions and can be styled
 * based on their highlight type.
 *
 * @see FR-003 (Explanatory Annotations)
 * @see AC-5
 */

import { Annotation } from './types';
import { HighlightedLine } from './CodeSnippetEngine';

/**
 * CSS classes for different annotation types.
 */
export const ANNOTATION_CLASSES: Record<Annotation['highlightType'], string> = {
  concept: 'wizard-annotation-concept',
  pattern: 'wizard-annotation-pattern',
  warning: 'wizard-annotation-warning',
  tip: 'wizard-annotation-tip',
};

/**
 * Rendered annotation data for display.
 */
export interface RenderedAnnotation {
  /** The original annotation */
  annotation: Annotation;
  /** CSS class for styling */
  cssClass: string;
  /** Relative position (percentage from top) */
  topPosition: number;
  /** Height (percentage of container) */
  height: number;
  /** Line number where annotation starts */
  startLine: number;
  /** Line number where annotation ends */
  endLine: number;
}

/**
 * Options for rendering annotations.
 */
export interface AnnotationRenderOptions {
  /** Line height in pixels (default 24) */
  lineHeight?: number;
  /** Starting line number of the snippet */
  snippetStartLine: number;
  /** Total number of lines in the snippet */
  snippetLineCount: number;
}

/**
 * Calculates annotation positions relative to the code display.
 *
 * @param annotations - Annotations to position
 * @param options - Rendering options
 * @returns Array of rendered annotations with position data
 */
export function calculateAnnotationPositions(
  annotations: Annotation[],
  options: AnnotationRenderOptions
): RenderedAnnotation[] {
  const { snippetStartLine, snippetLineCount, lineHeight = 24 } = options;

  const snippetEndLine = snippetStartLine + snippetLineCount - 1;
  const totalHeight = snippetLineCount * lineHeight;

  return annotations
    .filter((a) => {
      // Only include annotations that overlap with the snippet
      return a.lineEnd >= snippetStartLine && a.lineStart <= snippetEndLine;
    })
    .map((annotation) => {
      // Clamp annotation lines to snippet bounds
      const effectiveStart = Math.max(annotation.lineStart, snippetStartLine);
      const effectiveEnd = Math.min(annotation.lineEnd, snippetEndLine);

      // Calculate position relative to snippet (0-indexed in snippet)
      const relativeStart = effectiveStart - snippetStartLine;
      const relativeEnd = effectiveEnd - snippetStartLine;

      // Convert to percentage positions
      const topPosition = (relativeStart / snippetLineCount) * 100;
      const lineSpan = relativeEnd - relativeStart + 1;
      const height = (lineSpan / snippetLineCount) * 100;

      return {
        annotation,
        cssClass: ANNOTATION_CLASSES[annotation.highlightType],
        topPosition,
        height,
        startLine: effectiveStart,
        endLine: effectiveEnd,
      };
    });
}

/**
 * Generates HTML for annotation markers alongside code.
 *
 * @param annotations - Annotations to render
 * @param options - Rendering options
 * @returns HTML string for annotation gutter
 */
export function renderAnnotationGutter(
  annotations: Annotation[],
  options: AnnotationRenderOptions
): string {
  const positioned = calculateAnnotationPositions(annotations, options);

  if (positioned.length === 0) {
    return '<div class="wizard-annotation-gutter"></div>';
  }

  const markers = positioned
    .map(
      (ra) => `
      <div
        class="wizard-annotation-marker ${ra.cssClass}"
        style="top: ${ra.topPosition}%; height: ${ra.height}%"
        data-annotation-id="${ra.annotation.id}"
        data-line-start="${ra.startLine}"
        data-line-end="${ra.endLine}"
        title="${escapeHtml(ra.annotation.content)}"
      ></div>
    `
    )
    .join('');

  return `<div class="wizard-annotation-gutter">${markers}</div>`;
}

/**
 * Generates HTML for inline annotation tooltips/popovers.
 *
 * @param annotations - Annotations to render
 * @returns HTML string for hidden annotation content containers
 */
export function renderAnnotationContent(annotations: Annotation[]): string {
  if (annotations.length === 0) {
    return '';
  }

  const contents = annotations
    .map(
      (a) => `
      <div
        class="wizard-annotation-content ${ANNOTATION_CLASSES[a.highlightType]}"
        id="annotation-content-${a.id}"
        data-annotation-id="${a.id}"
      >
        <div class="wizard-annotation-header">
          <span class="wizard-annotation-type">${a.highlightType}</span>
          <span class="wizard-annotation-lines">Lines ${a.lineStart}-${a.lineEnd}</span>
        </div>
        <div class="wizard-annotation-body">
          ${escapeHtml(a.content)}
        </div>
      </div>
    `
    )
    .join('');

  return `<div class="wizard-annotation-contents">${contents}</div>`;
}

/**
 * Applies annotation highlighting to code lines.
 *
 * @param lines - Highlighted code lines
 * @param annotations - Annotations to apply
 * @returns Lines with annotation CSS classes added
 */
export function applyAnnotationsToLines(
  lines: HighlightedLine[],
  annotations: Annotation[]
): HighlightedLine[] {
  return lines.map((line) => {
    const lineAnnotations = annotations.filter(
      (a) => line.lineNumber >= a.lineStart && line.lineNumber <= a.lineEnd
    );

    if (lineAnnotations.length === 0) {
      return line;
    }

    // Get unique annotation types for this line
    const types = new Set(lineAnnotations.map((a) => a.highlightType));
    const typeClasses = Array.from(types)
      .map((t) => ANNOTATION_CLASSES[t])
      .join(' ');

    // Add CSS classes to the HTML
    const annotatedHtml = `<span class="wizard-annotated-line ${typeClasses}">${line.html}</span>`;

    return {
      ...line,
      html: annotatedHtml,
      annotations: lineAnnotations,
    };
  });
}

/**
 * Gets the appropriate icon for an annotation type.
 */
export function getAnnotationIcon(type: Annotation['highlightType']): string {
  const icons: Record<Annotation['highlightType'], string> = {
    concept: '💡', // Light bulb for concepts
    pattern: '🔷', // Diamond for patterns
    warning: '⚠️', // Warning for warnings
    tip: '💬', // Speech bubble for tips
  };
  return icons[type];
}

/**
 * Escapes HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Groups annotations by their start line for efficient lookup.
 */
export function groupAnnotationsByLine(
  annotations: Annotation[]
): Map<number, Annotation[]> {
  const grouped = new Map<number, Annotation[]>();

  for (const annotation of annotations) {
    for (let line = annotation.lineStart; line <= annotation.lineEnd; line++) {
      const existing = grouped.get(line) || [];
      existing.push(annotation);
      grouped.set(line, existing);
    }
  }

  return grouped;
}
