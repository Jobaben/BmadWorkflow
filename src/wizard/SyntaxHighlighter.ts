/**
 * Syntax Highlighter
 *
 * Provides VSCode-quality syntax highlighting using Shiki.
 * Supports TypeScript and JavaScript with customizable themes.
 *
 * @see ADR-003 (Static Syntax Highlighting with Shiki)
 * @see FR-002 (Code Snippet Display)
 * @see AC2 (Code is syntax highlighted)
 */

import { createHighlighter, type Highlighter, type BundledTheme } from 'shiki';

/**
 * Options for syntax highlighting.
 */
export interface HighlightOptions {
  /** Programming language (default: 'typescript') */
  language?: 'typescript' | 'javascript' | 'json' | 'css' | 'html';
  /** Color theme (default: 'github-dark') */
  theme?: BundledTheme;
  /** Lines to emphasize (1-indexed relative to snippet) */
  focusLines?: number[];
}

/**
 * Result of syntax highlighting operation.
 */
export interface HighlightResult {
  /** Syntax-highlighted HTML string */
  html: string;
  /** Plain text version (for accessibility) */
  plainText: string;
  /** Number of lines in the highlighted code */
  lineCount: number;
}

/** The Shiki highlighter instance (lazily initialized) */
let highlighterInstance: Highlighter | null = null;

/** Promise for highlighter initialization (to prevent duplicate init) */
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Default theme for syntax highlighting.
 * Uses a dark theme that matches typical IDE appearances.
 */
const DEFAULT_THEME: BundledTheme = 'github-dark';

/**
 * Supported languages for syntax highlighting.
 */
const SUPPORTED_LANGUAGES = ['typescript', 'javascript', 'json', 'css', 'html'] as const;

/**
 * Initialize the Shiki highlighter.
 * This is called automatically on first highlight, but can be called
 * explicitly to pre-warm the highlighter.
 *
 * @returns Promise that resolves when the highlighter is ready
 */
export async function initializeHighlighter(): Promise<void> {
  if (highlighterInstance) {
    return;
  }

  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [DEFAULT_THEME, 'github-light'],
      langs: [...SUPPORTED_LANGUAGES],
    });
  }

  highlighterInstance = await highlighterPromise;
}

/**
 * Get the highlighter instance, initializing if necessary.
 *
 * @returns Promise that resolves with the highlighter
 */
async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    await initializeHighlighter();
  }
  return highlighterInstance!;
}

/**
 * Highlight code with syntax coloring.
 *
 * @param code - The code string to highlight
 * @param options - Highlighting options
 * @returns Promise that resolves with the highlighted result
 *
 * @example
 * const result = await highlightCode('const x = 42;', { language: 'typescript' });
 * document.innerHTML = result.html;
 */
export async function highlightCode(
  code: string,
  options: HighlightOptions = {}
): Promise<HighlightResult> {
  const { language = 'typescript', theme = DEFAULT_THEME, focusLines = [] } = options;

  const highlighter = await getHighlighter();

  // Generate highlighted HTML
  let html = highlighter.codeToHtml(code, {
    lang: language,
    theme: theme,
  });

  // Apply focus line styling if specified
  if (focusLines.length > 0) {
    html = applyFocusLineStyles(html, focusLines);
  }

  // Count lines
  const lineCount = code.split('\n').length;

  return {
    html,
    plainText: code,
    lineCount,
  };
}

/**
 * Apply visual emphasis to specific lines in the highlighted HTML.
 *
 * @param html - The highlighted HTML string
 * @param focusLines - Array of 1-indexed line numbers to emphasize
 * @returns Modified HTML with focus styling applied
 */
function applyFocusLineStyles(html: string, focusLines: number[]): string {
  // Parse the HTML and add focus classes to specific lines
  const lines = html.split('\n');
  const focusSet = new Set(focusLines);

  // Find lines within the <code> block and add focus class
  let lineNumber = 0;
  let inCode = false;

  const modifiedLines = lines.map((line) => {
    // Track when we're inside the <code> element
    if (line.includes('<code>') || line.includes('<code ')) {
      inCode = true;
    }

    // Count actual code lines (span elements with content)
    if (inCode && line.includes('<span class="line"')) {
      lineNumber++;

      if (focusSet.has(lineNumber)) {
        // Add focus class to the line span
        return line.replace(
          '<span class="line"',
          '<span class="line shiki-focus-line" style="background-color: rgba(255, 255, 0, 0.1); display: block;"'
        );
      }
    }

    if (line.includes('</code>')) {
      inCode = false;
    }

    return line;
  });

  return modifiedLines.join('\n');
}

/**
 * Dispose of the highlighter instance to free memory.
 * Call this when the wizard is unmounted to release resources.
 */
export function disposeHighlighter(): void {
  if (highlighterInstance) {
    highlighterInstance.dispose();
    highlighterInstance = null;
    highlighterPromise = null;
  }
}

/**
 * Check if the highlighter is initialized.
 *
 * @returns true if the highlighter is ready to use
 */
export function isHighlighterReady(): boolean {
  return highlighterInstance !== null;
}
