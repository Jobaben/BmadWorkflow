/**
 * Code Display Component
 *
 * Renders highlighted code snippets to the DOM with line numbers,
 * scrollable containers, and annotation support.
 *
 * @see FR-002 (Code Snippet Display)
 * @see AC-2, AC-4, AC-5
 */

import { HighlightedCode, HighlightedLine } from '../wizard/CodeSnippetEngine';
import { Annotation } from '../wizard/types';
import {
  renderAnnotationGutter,
  renderAnnotationContent,
  applyAnnotationsToLines,
  getAnnotationIcon,
} from '../wizard/AnnotationRenderer';

/**
 * Configuration options for CodeDisplay.
 */
export interface CodeDisplayOptions {
  /** Show line numbers (default true) */
  showLineNumbers?: boolean;
  /** Maximum height before scrolling (CSS value, default 400px) */
  maxHeight?: string;
  /** Show annotation gutter (default true) */
  showAnnotations?: boolean;
  /** Whether to wrap long lines (default false) */
  wrapLines?: boolean;
  /** CSS class prefix (default 'wizard') */
  classPrefix?: string;
  /** Title to display above the code */
  title?: string;
}

const DEFAULT_OPTIONS: Required<CodeDisplayOptions> = {
  showLineNumbers: true,
  maxHeight: '400px',
  showAnnotations: true,
  wrapLines: false,
  classPrefix: 'wizard',
  title: '',
};

/**
 * Code Display component for rendering highlighted code.
 * Manages a DOM container with syntax-highlighted code, line numbers,
 * and optional annotations.
 */
export class CodeDisplay {
  private readonly container: HTMLElement;
  private readonly options: Required<CodeDisplayOptions>;
  private currentSnippet: HighlightedCode | null = null;
  private highlightedLineNumber: number | null = null;

  /**
   * Creates a new CodeDisplay instance.
   *
   * @param container - The DOM element to render into
   * @param options - Display configuration options
   */
  constructor(container: HTMLElement, options: CodeDisplayOptions = {}) {
    this.container = container;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.applyBaseStyles();
  }

  /**
   * Renders a code snippet to the container.
   *
   * @param snippet - The highlighted code snippet to display
   */
  render(snippet: HighlightedCode): void {
    this.currentSnippet = snippet;
    this.container.innerHTML = this.buildHTML(snippet);
    this.attachEventListeners();
  }

  /**
   * Clears the display.
   */
  clear(): void {
    this.currentSnippet = null;
    this.container.innerHTML = '';
  }

  /**
   * Highlights a specific line (for parameter linking).
   *
   * @param lineNumber - Line number to highlight (1-indexed)
   */
  highlightLine(lineNumber: number): void {
    this.clearLineHighlight();

    const lineElement = this.container.querySelector(
      `[data-line-number="${lineNumber}"]`
    );

    if (lineElement) {
      lineElement.classList.add(`${this.options.classPrefix}-line-highlight`);
      this.highlightedLineNumber = lineNumber;

      // Scroll line into view if needed
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Clears any line highlighting.
   */
  clearLineHighlight(): void {
    if (this.highlightedLineNumber !== null) {
      const lineElement = this.container.querySelector(
        `[data-line-number="${this.highlightedLineNumber}"]`
      );
      if (lineElement) {
        lineElement.classList.remove(
          `${this.options.classPrefix}-line-highlight`
        );
      }
      this.highlightedLineNumber = null;
    }
  }

  /**
   * Scrolls to a specific line.
   *
   * @param lineNumber - Line number to scroll to (1-indexed)
   */
  scrollToLine(lineNumber: number): void {
    const lineElement = this.container.querySelector(
      `[data-line-number="${lineNumber}"]`
    );

    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Gets the currently displayed snippet.
   */
  getCurrentSnippet(): HighlightedCode | null {
    return this.currentSnippet;
  }

  /**
   * Updates the display options.
   */
  updateOptions(options: Partial<CodeDisplayOptions>): void {
    Object.assign(this.options, options);
    if (this.currentSnippet) {
      this.render(this.currentSnippet);
    }
  }

  /**
   * Builds the complete HTML for the code display.
   */
  private buildHTML(snippet: HighlightedCode): string {
    const { classPrefix, showLineNumbers, showAnnotations, maxHeight, title } =
      this.options;

    // Apply annotations to lines if present
    const lines =
      showAnnotations && snippet.annotations.length > 0
        ? applyAnnotationsToLines(snippet.lines, snippet.annotations)
        : snippet.lines;

    const linesHtml = lines
      .map((line) => this.buildLineHTML(line, showLineNumbers))
      .join('');

    const annotationGutter = showAnnotations
      ? renderAnnotationGutter(snippet.annotations, {
          snippetStartLine: snippet.startLine,
          snippetLineCount: snippet.lineCount,
        })
      : '';

    const annotationContent = showAnnotations
      ? renderAnnotationContent(snippet.annotations)
      : '';

    const titleHtml = title
      ? `<div class="${classPrefix}-code-title">${this.escapeHtml(title)}</div>`
      : '';

    return `
      <div class="${classPrefix}-code-display">
        ${titleHtml}
        <div class="${classPrefix}-code-container" style="max-height: ${maxHeight}">
          ${annotationGutter}
          <div class="${classPrefix}-code-content">
            <pre class="${classPrefix}-code-pre"><code class="${classPrefix}-code">${linesHtml}</code></pre>
          </div>
        </div>
        ${annotationContent}
      </div>
    `;
  }

  /**
   * Builds HTML for a single line.
   */
  private buildLineHTML(line: HighlightedLine, showLineNumbers: boolean): string {
    const { classPrefix } = this.options;

    const focusClass = line.isFocused ? `${classPrefix}-line-focused` : '';
    const annotationClass =
      line.annotations.length > 0 ? `${classPrefix}-line-annotated` : '';

    const lineNumberHtml = showLineNumbers
      ? `<span class="${classPrefix}-line-number">${line.lineNumber}</span>`
      : '';

    const annotationIndicator =
      line.annotations.length > 0
        ? `<span class="${classPrefix}-annotation-indicator" title="${line.annotations.length} annotation(s)">${getAnnotationIcon(line.annotations[0].highlightType)}</span>`
        : '';

    return `
      <div
        class="${classPrefix}-line ${focusClass} ${annotationClass}"
        data-line-number="${line.lineNumber}"
      >
        ${lineNumberHtml}
        ${annotationIndicator}
        <span class="${classPrefix}-line-content">${line.html}</span>
      </div>
    `;
  }

  /**
   * Applies base CSS styles to the container.
   */
  private applyBaseStyles(): void {
    // Create style element if it doesn't exist
    const styleId = `${this.options.classPrefix}-code-display-styles`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = this.getBaseStyles();
      document.head.appendChild(style);
    }
  }

  /**
   * Returns the base CSS styles for the code display.
   */
  private getBaseStyles(): string {
    const p = this.options.classPrefix;

    return `
      .${p}-code-display {
        font-family: 'SF Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;
        font-size: 14px;
        line-height: 1.5;
        background: #0d1117;
        border-radius: 8px;
        overflow: hidden;
      }

      .${p}-code-title {
        padding: 8px 16px;
        background: #161b22;
        color: #c9d1d9;
        font-size: 12px;
        border-bottom: 1px solid #30363d;
      }

      .${p}-code-container {
        display: flex;
        overflow: auto;
        position: relative;
      }

      .${p}-code-content {
        flex: 1;
        overflow-x: auto;
      }

      .${p}-code-pre {
        margin: 0;
        padding: 16px;
        background: transparent;
      }

      .${p}-code {
        display: block;
      }

      .${p}-line {
        display: flex;
        align-items: flex-start;
        min-height: 24px;
        padding: 0 8px;
        margin: 0 -8px;
        transition: background-color 0.15s;
      }

      .${p}-line:hover {
        background: rgba(56, 139, 253, 0.1);
      }

      .${p}-line-number {
        flex-shrink: 0;
        width: 40px;
        padding-right: 16px;
        text-align: right;
        color: #484f58;
        user-select: none;
      }

      .${p}-line-content {
        flex: 1;
        white-space: pre;
      }

      .${p}-line-focused {
        background: rgba(187, 128, 9, 0.15) !important;
        border-left: 3px solid #bb8009;
        padding-left: 5px;
      }

      .${p}-line-highlight {
        background: rgba(56, 139, 253, 0.2) !important;
        border-left: 3px solid #388bfd;
        padding-left: 5px;
      }

      .${p}-line-annotated {
        background: rgba(136, 46, 224, 0.1);
      }

      .${p}-annotation-indicator {
        flex-shrink: 0;
        width: 20px;
        cursor: pointer;
        font-size: 12px;
      }

      .${p}-annotation-gutter {
        width: 8px;
        flex-shrink: 0;
        background: #161b22;
        position: relative;
      }

      .${p}-annotation-marker {
        position: absolute;
        left: 0;
        width: 4px;
        border-radius: 2px;
        cursor: pointer;
        transition: width 0.15s;
      }

      .${p}-annotation-marker:hover {
        width: 8px;
      }

      .${p}-annotation-concept {
        background: #3fb950;
      }

      .${p}-annotation-pattern {
        background: #58a6ff;
      }

      .${p}-annotation-warning {
        background: #d29922;
      }

      .${p}-annotation-tip {
        background: #a371f7;
      }

      .${p}-annotation-contents {
        display: none;
      }

      .${p}-annotation-content {
        padding: 12px;
        background: #161b22;
        border-radius: 6px;
        margin: 8px 0;
        border-left: 3px solid;
      }

      .${p}-annotation-content.${p}-annotation-concept {
        border-color: #3fb950;
      }

      .${p}-annotation-content.${p}-annotation-pattern {
        border-color: #58a6ff;
      }

      .${p}-annotation-content.${p}-annotation-warning {
        border-color: #d29922;
      }

      .${p}-annotation-content.${p}-annotation-tip {
        border-color: #a371f7;
      }

      .${p}-annotation-header {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #8b949e;
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      .${p}-annotation-body {
        color: #c9d1d9;
      }
    `;
  }

  /**
   * Attaches event listeners for interactivity.
   */
  private attachEventListeners(): void {
    const { classPrefix } = this.options;

    // Annotation marker hover/click
    const markers = this.container.querySelectorAll(
      `.${classPrefix}-annotation-marker`
    );

    markers.forEach((marker) => {
      marker.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const annotationId = target.dataset.annotationId;
        if (annotationId) {
          this.showAnnotation(annotationId);
        }
      });
    });

    // Line click for annotation indicators
    const indicators = this.container.querySelectorAll(
      `.${classPrefix}-annotation-indicator`
    );

    indicators.forEach((indicator) => {
      indicator.addEventListener('click', (e) => {
        const line = (e.target as HTMLElement).closest(`.${classPrefix}-line`);
        if (line) {
          const lineNumber = parseInt(line.getAttribute('data-line-number') || '0');
          this.toggleLineAnnotations(lineNumber);
        }
      });
    });
  }

  /**
   * Shows an annotation popover.
   */
  private showAnnotation(annotationId: string): void {
    // For now, just log - full popover implementation would go here
    console.log('Show annotation:', annotationId);
  }

  /**
   * Toggles annotation display for a line.
   */
  private toggleLineAnnotations(lineNumber: number): void {
    // For now, just log - full toggle implementation would go here
    console.log('Toggle annotations for line:', lineNumber);
  }

  /**
   * Escapes HTML special characters.
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}

/**
 * Factory function to create a CodeDisplay attached to a container.
 *
 * @param containerId - DOM element ID to attach to
 * @param options - Display configuration options
 * @returns The created CodeDisplay instance
 */
export function createCodeDisplay(
  containerId: string,
  options: CodeDisplayOptions = {}
): CodeDisplay {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container element with id '${containerId}' not found`);
  }
  return new CodeDisplay(container, options);
}
