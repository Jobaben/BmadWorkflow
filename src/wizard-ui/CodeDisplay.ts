/**
 * Code Display Component
 *
 * Renders syntax-highlighted code snippets with line numbers,
 * focus line styling, and annotation overlays.
 *
 * @see FR-002 (Code Snippet Display)
 * @see FR-003 (Explanatory Annotations)
 * @see AC4 (Focus lines can be emphasized)
 * @see AC5 (Annotations can be overlaid on code)
 */

import type { HighlightedCode } from '../wizard/CodeSnippetEngine';
import type { Annotation } from '../wizard/types';

/**
 * Options for code display rendering.
 */
export interface CodeDisplayOptions {
  /** Show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Starting line number for display (1-indexed, default: 1) */
  startLineNumber?: number;
  /** Maximum height before scrolling (default: '400px') */
  maxHeight?: string;
  /** Title to show above the code block */
  title?: string;
  /** Whether to show annotations inline (default: true) */
  showAnnotations?: boolean;
}

/**
 * Create a CSS class string for annotation styling.
 */
function getAnnotationClass(type: Annotation['highlightType']): string {
  switch (type) {
    case 'concept':
      return 'code-annotation code-annotation-concept';
    case 'pattern':
      return 'code-annotation code-annotation-pattern';
    case 'warning':
      return 'code-annotation code-annotation-warning';
    case 'tip':
      return 'code-annotation code-annotation-tip';
    default:
      return 'code-annotation';
  }
}

/**
 * Generate the CSS styles for the code display component.
 * These are injected once when the component is first used.
 */
export function getCodeDisplayStyles(): string {
  return `
    .code-display {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.5;
      border-radius: 8px;
      overflow: hidden;
      background-color: #0d1117;
    }

    .code-display-header {
      background-color: #161b22;
      padding: 8px 16px;
      border-bottom: 1px solid #30363d;
      color: #c9d1d9;
      font-weight: 500;
    }

    .code-display-content {
      display: flex;
      overflow-x: auto;
    }

    .code-display-lines {
      flex-shrink: 0;
      padding: 16px 0;
      background-color: #0d1117;
      text-align: right;
      user-select: none;
      border-right: 1px solid #30363d;
    }

    .code-display-line-number {
      display: block;
      padding: 0 16px;
      color: #6e7681;
      font-size: 12px;
    }

    .code-display-line-number.focused {
      background-color: rgba(255, 255, 0, 0.1);
      color: #c9d1d9;
    }

    .code-display-code {
      flex-grow: 1;
      padding: 16px;
      overflow-x: auto;
    }

    .code-display-code pre {
      margin: 0;
      padding: 0;
    }

    .code-display-code code {
      font-family: inherit;
    }

    .shiki-focus-line {
      background-color: rgba(255, 255, 0, 0.1) !important;
      display: block;
      margin: 0 -16px;
      padding: 0 16px;
    }

    /* Annotation styles */
    .code-annotation {
      position: relative;
      display: block;
      margin: 8px 0;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.4;
    }

    .code-annotation-concept {
      background-color: rgba(56, 139, 253, 0.15);
      border-left: 3px solid #388bfd;
      color: #a5d6ff;
    }

    .code-annotation-pattern {
      background-color: rgba(163, 113, 247, 0.15);
      border-left: 3px solid #a371f7;
      color: #d2a8ff;
    }

    .code-annotation-warning {
      background-color: rgba(210, 153, 34, 0.15);
      border-left: 3px solid #d29922;
      color: #e3b341;
    }

    .code-annotation-tip {
      background-color: rgba(46, 160, 67, 0.15);
      border-left: 3px solid #2ea043;
      color: #7ee787;
    }

    .code-annotation-line-ref {
      font-weight: 600;
      margin-right: 8px;
    }

    .code-display-annotations {
      padding: 12px 16px;
      background-color: #161b22;
      border-top: 1px solid #30363d;
    }
  `;
}

/**
 * Inject code display styles into the document head.
 * Uses DOM check to determine if already injected, making it test-friendly.
 */
export function injectCodeDisplayStyles(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Check DOM for existing style element (test-friendly approach)
  if (document.getElementById('code-display-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'code-display-styles';
  styleElement.textContent = getCodeDisplayStyles();
  document.head.appendChild(styleElement);
}

/**
 * CodeDisplay renders a syntax-highlighted code snippet with
 * line numbers and optional annotations.
 *
 * @example
 * ```typescript
 * const display = new CodeDisplay(container);
 * display.render(highlightedCode, { showLineNumbers: true });
 * ```
 */
export class CodeDisplay {
  private container: HTMLElement;
  private options: Required<CodeDisplayOptions>;

  /**
   * Create a new CodeDisplay.
   *
   * @param container - The HTML element to render into
   * @param options - Display options
   */
  constructor(container: HTMLElement, options: CodeDisplayOptions = {}) {
    this.container = container;
    this.options = {
      showLineNumbers: options.showLineNumbers ?? true,
      startLineNumber: options.startLineNumber ?? 1,
      maxHeight: options.maxHeight ?? '400px',
      title: options.title ?? '',
      showAnnotations: options.showAnnotations ?? true,
    };

    // Inject styles on first use
    injectCodeDisplayStyles();
  }

  /**
   * Render highlighted code into the container.
   *
   * @param code - The highlighted code to display
   * @param options - Optional override options for this render
   */
  render(code: HighlightedCode, options?: Partial<CodeDisplayOptions>): void {
    const renderOptions = { ...this.options, ...options };

    // Clear container
    this.container.innerHTML = '';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-display';

    // Add header if title is provided
    if (renderOptions.title) {
      const header = document.createElement('div');
      header.className = 'code-display-header';
      header.textContent = renderOptions.title;
      wrapper.appendChild(header);
    }

    // Create content container
    const content = document.createElement('div');
    content.className = 'code-display-content';
    content.style.maxHeight = renderOptions.maxHeight;
    content.style.overflowY = 'auto';

    // Add line numbers if enabled
    if (renderOptions.showLineNumbers) {
      const lineNumbers = this.createLineNumbers(code, renderOptions);
      content.appendChild(lineNumbers);
    }

    // Add code content
    const codeContent = document.createElement('div');
    codeContent.className = 'code-display-code';
    codeContent.innerHTML = code.html;
    content.appendChild(codeContent);

    wrapper.appendChild(content);

    // Add annotations if present and enabled
    if (renderOptions.showAnnotations && code.annotations.length > 0) {
      const annotationsDiv = this.createAnnotations(code.annotations, renderOptions);
      wrapper.appendChild(annotationsDiv);
    }

    this.container.appendChild(wrapper);
  }

  /**
   * Create line number elements.
   */
  private createLineNumbers(
    code: HighlightedCode,
    options: Required<CodeDisplayOptions>
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'code-display-lines';

    for (let i = 0; i < code.lineCount; i++) {
      const lineNum = document.createElement('span');
      lineNum.className = 'code-display-line-number';
      lineNum.textContent = String(options.startLineNumber + i);
      container.appendChild(lineNum);
    }

    return container;
  }

  /**
   * Create annotation elements.
   */
  private createAnnotations(
    annotations: HighlightedCode['annotations'],
    options: Required<CodeDisplayOptions>
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'code-display-annotations';

    for (const annotation of annotations) {
      const element = document.createElement('div');
      element.className = getAnnotationClass(annotation.highlightType);

      // Line reference
      const lineRef = document.createElement('span');
      lineRef.className = 'code-annotation-line-ref';
      lineRef.textContent =
        annotation.lineStart === annotation.lineEnd
          ? `Line ${annotation.lineStart + options.startLineNumber - 1}:`
          : `Lines ${annotation.lineStart + options.startLineNumber - 1}-${annotation.lineEnd + options.startLineNumber - 1}:`;

      element.appendChild(lineRef);
      element.appendChild(document.createTextNode(annotation.content));
      container.appendChild(element);
    }

    return container;
  }

  /**
   * Update options without re-rendering.
   */
  updateOptions(options: Partial<CodeDisplayOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Clear the display.
   */
  clear(): void {
    this.container.innerHTML = '';
  }
}
