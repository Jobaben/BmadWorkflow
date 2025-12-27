/**
 * Syntax Highlighter
 *
 * Wrapper around Shiki for VSCode-quality syntax highlighting.
 * Provides TypeScript/JavaScript highlighting with customizable themes.
 *
 * @see ADR-003 (Static Syntax Highlighting with Shiki)
 * @see FR-002 (Code Snippet Display)
 */

import { createHighlighter, Highlighter, BundledLanguage, BundledTheme } from 'shiki';

/**
 * Highlighted code output structure.
 */
export interface HighlightedOutput {
  /** Syntax-highlighted HTML string */
  html: string;
  /** Plain text version for accessibility */
  plainText: string;
  /** Number of lines in the code */
  lineCount: number;
}

/**
 * Options for syntax highlighting.
 */
export interface HighlightOptions {
  /** Programming language for syntax highlighting */
  language?: BundledLanguage;
  /** Color theme to use */
  theme?: BundledTheme;
  /** Line numbers to specially emphasize (1-indexed) */
  focusLines?: number[];
  /** Starting line number for display (default 1) */
  startLineNumber?: number;
}

/**
 * Singleton class for syntax highlighting.
 * Manages Shiki highlighter instance with lazy initialization.
 */
export class SyntaxHighlighter {
  private static instance: SyntaxHighlighter | null = null;
  private highlighter: Highlighter | null = null;
  private initPromise: Promise<void> | null = null;

  /** Default theme for dark mode (matches VSCode dark+) */
  private readonly defaultTheme: BundledTheme = 'github-dark';

  /** Default language for TypeScript files */
  private readonly defaultLanguage: BundledLanguage = 'typescript';

  /** CSS class for focused lines */
  private readonly focusLineClass = 'wizard-code-focus';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Gets the singleton instance of SyntaxHighlighter.
   */
  static getInstance(): SyntaxHighlighter {
    if (!SyntaxHighlighter.instance) {
      SyntaxHighlighter.instance = new SyntaxHighlighter();
    }
    return SyntaxHighlighter.instance;
  }

  /**
   * Initializes the Shiki highlighter.
   * Safe to call multiple times - will only initialize once.
   */
  async initialize(): Promise<void> {
    if (this.highlighter) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['typescript', 'javascript', 'json'],
    });
  }

  /**
   * Checks if the highlighter is initialized.
   */
  isInitialized(): boolean {
    return this.highlighter !== null;
  }

  /**
   * Highlights code with syntax coloring.
   *
   * @param code - The source code to highlight
   * @param options - Optional highlighting configuration
   * @returns HighlightedOutput with HTML and plain text
   * @throws Error if highlighter is not initialized
   *
   * @example
   * ```typescript
   * const highlighter = SyntaxHighlighter.getInstance();
   * await highlighter.initialize();
   *
   * const result = highlighter.highlight(`
   *   const x = 42;
   *   console.log(x);
   * `);
   * document.innerHTML = result.html;
   * ```
   */
  highlight(code: string, options: HighlightOptions = {}): HighlightedOutput {
    if (!this.highlighter) {
      throw new Error(
        'SyntaxHighlighter not initialized. Call initialize() first.'
      );
    }

    const {
      language = this.defaultLanguage,
      theme = this.defaultTheme,
      focusLines,
      startLineNumber = 1,
    } = options;

    // Generate highlighted HTML
    let html = this.highlighter.codeToHtml(code, {
      lang: language,
      theme: theme,
    });

    // Apply focus line highlighting if specified
    if (focusLines && focusLines.length > 0) {
      html = this.applyFocusLines(html, focusLines, startLineNumber);
    }

    // Calculate line count
    const lineCount = code.split('\n').length;

    return {
      html,
      plainText: code,
      lineCount,
    };
  }

  /**
   * Highlights code and returns individual line elements.
   * Useful for adding line numbers or per-line decorations.
   *
   * @param code - The source code to highlight
   * @param options - Optional highlighting configuration
   * @returns Array of line HTML strings
   */
  highlightToLines(code: string, options: HighlightOptions = {}): string[] {
    if (!this.highlighter) {
      throw new Error(
        'SyntaxHighlighter not initialized. Call initialize() first.'
      );
    }

    const {
      language = this.defaultLanguage,
      theme = this.defaultTheme,
    } = options;

    const lines = code.split('\n');
    const highlightedLines: string[] = [];

    // Highlight each line individually for maximum control
    for (const line of lines) {
      const html = this.highlighter.codeToHtml(line || ' ', {
        lang: language,
        theme: theme,
      });
      // Extract just the inner content from the pre/code wrapper
      const innerMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
      highlightedLines.push(innerMatch ? innerMatch[1] : line);
    }

    return highlightedLines;
  }

  /**
   * Gets the supported languages.
   */
  getSupportedLanguages(): BundledLanguage[] {
    return ['typescript', 'javascript', 'json'];
  }

  /**
   * Gets the supported themes.
   */
  getSupportedThemes(): BundledTheme[] {
    return ['github-dark', 'github-light'];
  }

  /**
   * Disposes of the highlighter resources.
   * After calling this, initialize() must be called again before use.
   */
  dispose(): void {
    if (this.highlighter) {
      this.highlighter.dispose();
      this.highlighter = null;
      this.initPromise = null;
    }
  }

  /**
   * Applies focus highlighting to specific lines in the HTML output.
   */
  private applyFocusLines(
    html: string,
    focusLines: number[],
    startLineNumber: number
  ): string {
    // Convert absolute line numbers to relative (0-indexed in output)
    const relativeLines = new Set(
      focusLines.map((ln) => ln - startLineNumber)
    );

    // Split HTML into lines within the code block
    // Shiki outputs: <pre ...><code ...>line1\nline2\n...</code></pre>
    const codeMatch = html.match(/(<pre[^>]*><code[^>]*>)([\s\S]*?)(<\/code><\/pre>)/);

    if (!codeMatch) {
      return html;
    }

    const [, prefix, content, suffix] = codeMatch;
    const lines = content.split('\n');

    const processedLines = lines.map((line, index) => {
      if (relativeLines.has(index)) {
        return `<span class="${this.focusLineClass}">${line}</span>`;
      }
      return line;
    });

    return prefix + processedLines.join('\n') + suffix;
  }
}

/**
 * Convenience function to get a pre-configured highlighter.
 * Initializes the highlighter if not already done.
 *
 * @returns Promise resolving to the initialized SyntaxHighlighter
 */
export async function getHighlighter(): Promise<SyntaxHighlighter> {
  const highlighter = SyntaxHighlighter.getInstance();
  await highlighter.initialize();
  return highlighter;
}
