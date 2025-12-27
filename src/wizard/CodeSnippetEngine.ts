/**
 * Code Snippet Engine
 *
 * Central class for extracting, processing, and displaying code snippets
 * from demo source files with syntax highlighting and annotations.
 *
 * @see Architecture - Code Snippet Engine component
 * @see FR-002, FR-003, FR-005
 */

import { CodeSnippetRef, Annotation } from './types';
import { extractLines, validateRange, getLineCount } from './SnippetExtractor';
import { SyntaxHighlighter, getHighlighter } from './SyntaxHighlighter';

/**
 * Result of processing a code snippet.
 * Contains all data needed to render the snippet with highlighting and annotations.
 */
export interface HighlightedCode {
  /** Syntax-highlighted HTML string */
  html: string;
  /** Plain text version for accessibility and copying */
  plainText: string;
  /** Number of lines in the snippet */
  lineCount: number;
  /** Annotations for this snippet (filtered to visible lines) */
  annotations: Annotation[];
  /** Starting line number in original source */
  startLine: number;
  /** Ending line number in original source */
  endLine: number;
  /** Individual highlighted lines for fine-grained rendering */
  lines: HighlightedLine[];
}

/**
 * A single highlighted line with metadata.
 */
export interface HighlightedLine {
  /** Line number in the original source (1-indexed) */
  lineNumber: number;
  /** HTML content for this line (highlighted) */
  html: string;
  /** Plain text content */
  text: string;
  /** Whether this line is a focus line */
  isFocused: boolean;
  /** Annotations that apply to this line */
  annotations: Annotation[];
}

/**
 * Error thrown when a source file is not found in the registry.
 */
export class SourceNotFoundError extends Error {
  constructor(
    public readonly sourceFile: string,
    public readonly availableFiles: string[]
  ) {
    super(
      `Source file '${sourceFile}' not found. Available files: ${availableFiles.join(', ')}`
    );
    this.name = 'SourceNotFoundError';
  }
}

/**
 * Engine for extracting and highlighting code snippets from source files.
 *
 * @example
 * ```typescript
 * const registry = new Map([
 *   ['demos/ParticleDemo.ts', particleDemoSource],
 * ]);
 *
 * const engine = new CodeSnippetEngine(registry);
 * await engine.initialize();
 *
 * const snippet = await engine.getSnippet({
 *   id: 'particle-emission',
 *   sourceFile: 'demos/ParticleDemo.ts',
 *   startLine: 100,
 *   endLine: 120,
 *   focusLines: [105, 106, 107],
 * });
 *
 * document.innerHTML = snippet.html;
 * ```
 */
export class CodeSnippetEngine {
  private readonly sourceRegistry: Map<string, string>;
  private highlighter: SyntaxHighlighter | null = null;
  private initialized = false;

  /**
   * Creates a new CodeSnippetEngine.
   *
   * @param sourceRegistry - Map of file paths to source content
   */
  constructor(sourceRegistry: Map<string, string>) {
    this.sourceRegistry = sourceRegistry;
  }

  /**
   * Initializes the engine (loads syntax highlighter).
   * Must be called before getSnippet().
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.highlighter = await getHighlighter();
    this.initialized = true;
  }

  /**
   * Checks if the engine is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Gets a highlighted code snippet.
   *
   * @param ref - Reference to the code snippet to extract
   * @param annotations - Optional annotations to apply to the snippet
   * @returns Promise resolving to HighlightedCode
   * @throws SourceNotFoundError if source file is not registered
   * @throws Error if line range is invalid
   */
  async getSnippet(
    ref: CodeSnippetRef,
    annotations: Annotation[] = []
  ): Promise<HighlightedCode> {
    if (!this.initialized || !this.highlighter) {
      await this.initialize();
    }

    const { sourceFile, startLine, endLine, focusLines } = ref;

    // Get source content
    const source = this.sourceRegistry.get(sourceFile);
    if (!source) {
      throw new SourceNotFoundError(
        sourceFile,
        Array.from(this.sourceRegistry.keys())
      );
    }

    // Validate range
    const validation = validateRange(source, startLine, endLine);
    if (!validation.isValid) {
      throw new Error(
        `Invalid line range: ${validation.message} (${validation.error})`
      );
    }

    // Extract lines
    const extracted = extractLines(source, startLine, endLine);

    // Highlight the code
    const highlighted = this.highlighter!.highlight(extracted.content, {
      language: 'typescript',
      focusLines: focusLines?.map((ln) => ln - startLine + 1), // Convert to relative
      startLineNumber: startLine,
    });

    // Get individual highlighted lines
    const highlightedLines = this.highlighter!.highlightToLines(
      extracted.content,
      { language: 'typescript' }
    );

    // Build line-by-line data with annotations
    const focusSet = new Set(focusLines || []);
    const lines: HighlightedLine[] = [];

    const sourceLines = extracted.content.split('\n');
    for (let i = 0; i < sourceLines.length; i++) {
      const lineNumber = startLine + i;
      const lineAnnotations = annotations.filter(
        (a) => lineNumber >= a.lineStart && lineNumber <= a.lineEnd
      );

      lines.push({
        lineNumber,
        html: highlightedLines[i] || '',
        text: sourceLines[i],
        isFocused: focusSet.has(lineNumber),
        annotations: lineAnnotations,
      });
    }

    // Filter annotations to those relevant to this snippet
    const relevantAnnotations = annotations.filter(
      (a) => a.lineEnd >= startLine && a.lineStart <= endLine
    );

    return {
      html: highlighted.html,
      plainText: extracted.content,
      lineCount: extracted.lineCount,
      annotations: relevantAnnotations,
      startLine: extracted.actualStartLine,
      endLine: extracted.actualEndLine,
      lines,
    };
  }

  /**
   * Highlights specific lines in an already-highlighted snippet.
   * Used for live parameter highlighting.
   *
   * @param lineStart - First line to highlight (1-indexed in source)
   * @param lineEnd - Last line to highlight (1-indexed in source)
   * @param snippet - The snippet to apply highlighting to
   * @returns Updated snippet with highlight applied
   */
  highlightLines(
    lineStart: number,
    lineEnd: number,
    snippet: HighlightedCode
  ): HighlightedCode {
    // Update line focus state
    const updatedLines = snippet.lines.map((line) => ({
      ...line,
      isFocused:
        line.lineNumber >= lineStart && line.lineNumber <= lineEnd,
    }));

    return {
      ...snippet,
      lines: updatedLines,
    };
  }

  /**
   * Clears line highlighting from a snippet.
   *
   * @param snippet - The snippet to clear highlighting from
   * @returns Updated snippet with no focus
   */
  clearHighlighting(snippet: HighlightedCode): HighlightedCode {
    const updatedLines = snippet.lines.map((line) => ({
      ...line,
      isFocused: false,
    }));

    return {
      ...snippet,
      lines: updatedLines,
    };
  }

  /**
   * Checks if a source file is available.
   *
   * @param sourceFile - File path to check
   * @returns True if the file is in the registry
   */
  hasSource(sourceFile: string): boolean {
    return this.sourceRegistry.has(sourceFile);
  }

  /**
   * Gets all registered source files.
   *
   * @returns Array of available file paths
   */
  getAvailableFiles(): string[] {
    return Array.from(this.sourceRegistry.keys());
  }

  /**
   * Gets the total line count for a source file.
   *
   * @param sourceFile - File path to check
   * @returns Number of lines, or 0 if file not found
   */
  getSourceLineCount(sourceFile: string): number {
    const source = this.sourceRegistry.get(sourceFile);
    if (!source) {
      return 0;
    }
    return getLineCount(source);
  }

  /**
   * Disposes of engine resources.
   */
  dispose(): void {
    // SyntaxHighlighter is a singleton, don't dispose it here
    this.initialized = false;
    this.highlighter = null;
  }
}

/**
 * Factory function to create a CodeSnippetEngine with the default source registry.
 *
 * @returns Promise resolving to an initialized CodeSnippetEngine
 */
export async function createCodeSnippetEngine(
  sourceRegistry: Map<string, string>
): Promise<CodeSnippetEngine> {
  const engine = new CodeSnippetEngine(sourceRegistry);
  await engine.initialize();
  return engine;
}
