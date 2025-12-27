/**
 * Code Snippet Engine
 *
 * Main engine for extracting, processing, and displaying code snippets
 * from bundled demo source files with syntax highlighting.
 *
 * @see Architecture - Code Snippet Engine component
 * @see FR-002 (Code Snippet Display)
 * @see FR-003 (Explanatory Annotations)
 */

import type { CodeSnippetRef, Annotation } from './types';
import { extractLines, snippetToString } from './SnippetExtractor';
import {
  highlightCode,
  initializeHighlighter,
  disposeHighlighter,
  type HighlightOptions,
} from './SyntaxHighlighter';
import { getSourceFile, hasSourceFile } from './sourceRegistry';

/**
 * Result of a snippet retrieval operation.
 * Contains both the highlighted HTML and metadata.
 */
export interface HighlightedCode {
  /** Syntax-highlighted HTML for rendering */
  html: string;
  /** Plain text version for accessibility */
  plainText: string;
  /** Number of lines in the snippet */
  lineCount: number;
  /** Annotations to display with the code */
  annotations: Annotation[];
}

/**
 * Error thrown when a source file cannot be found.
 */
export class SourceNotFoundError extends Error {
  constructor(public readonly sourceFile: string) {
    super(`Source file not found: ${sourceFile}`);
    this.name = 'SourceNotFoundError';
  }
}

/**
 * CodeSnippetEngine provides the main interface for retrieving
 * and displaying code snippets from the demo source files.
 *
 * @example
 * ```typescript
 * // Create engine with default source registry
 * const engine = new CodeSnippetEngine();
 * await engine.initialize();
 *
 * // Get a highlighted snippet
 * const ref: CodeSnippetRef = {
 *   id: 'particle-emission',
 *   sourceFile: 'demos/ParticleDemo.ts',
 *   startLine: 100,
 *   endLine: 120,
 *   focusLines: [105, 106]
 * };
 * const result = await engine.getSnippet(ref);
 * document.innerHTML = result.html;
 * ```
 */
export class CodeSnippetEngine {
  /** Custom source registry (if provided) */
  private sourceRegistry: Map<string, string> | null;

  /** Whether the highlighter has been initialized */
  private initialized: boolean = false;

  /** Cached snippets for performance */
  private snippetCache: Map<string, HighlightedCode> = new Map();

  /**
   * Create a new CodeSnippetEngine.
   *
   * @param sourceRegistry - Optional custom source registry. If not provided,
   *                         uses the default bundled source registry.
   */
  constructor(sourceRegistry?: Map<string, string>) {
    this.sourceRegistry = sourceRegistry ?? null;
  }

  /**
   * Initialize the engine (pre-warms the syntax highlighter).
   * Call this early to avoid delays on first snippet request.
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await initializeHighlighter();
      this.initialized = true;
    }
  }

  /**
   * Get a highlighted code snippet.
   *
   * @param ref - Reference to the code snippet
   * @param annotations - Optional annotations to include with the snippet
   * @returns Promise resolving to the highlighted code
   * @throws SourceNotFoundError if the source file doesn't exist
   */
  async getSnippet(ref: CodeSnippetRef, annotations: Annotation[] = []): Promise<HighlightedCode> {
    // Check cache first
    const cacheKey = this.createCacheKey(ref, annotations);
    const cached = this.snippetCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Ensure highlighter is initialized
    await this.initialize();

    // Get source content
    const source = this.getSource(ref.sourceFile);
    if (source === undefined) {
      throw new SourceNotFoundError(ref.sourceFile);
    }

    // Extract the specified lines
    const extracted = extractLines(source, ref.startLine, ref.endLine);
    const plainText = snippetToString(extracted);

    // Prepare highlight options
    const highlightOptions: HighlightOptions = {
      language: this.detectLanguage(ref.sourceFile),
    };

    // Convert focus lines to snippet-relative if specified
    if (ref.focusLines && ref.focusLines.length > 0) {
      highlightOptions.focusLines = ref.focusLines
        .filter(
          (line) => line >= extracted.actualStartLine && line <= extracted.actualEndLine
        )
        .map((line) => line - extracted.actualStartLine + 1);
    }

    // Highlight the code
    const highlighted = await highlightCode(plainText, highlightOptions);

    // Filter annotations to those within the snippet range
    const relevantAnnotations = annotations.filter(
      (ann) =>
        ann.lineStart >= extracted.actualStartLine && ann.lineEnd <= extracted.actualEndLine
    );

    // Adjust annotation line numbers to be snippet-relative
    const adjustedAnnotations = relevantAnnotations.map((ann) => ({
      ...ann,
      lineStart: ann.lineStart - extracted.actualStartLine + 1,
      lineEnd: ann.lineEnd - extracted.actualStartLine + 1,
    }));

    const result: HighlightedCode = {
      html: highlighted.html,
      plainText: highlighted.plainText,
      lineCount: highlighted.lineCount,
      annotations: adjustedAnnotations,
    };

    // Cache the result
    this.snippetCache.set(cacheKey, result);

    return result;
  }

  /**
   * Highlight specific lines in an already-rendered snippet.
   * This is used for dynamic highlighting when parameters are focused.
   *
   * @param lineStart - First line to highlight (1-indexed, snippet-relative)
   * @param lineEnd - Last line to highlight (1-indexed, snippet-relative)
   */
  highlightLines(lineStart: number, lineEnd: number): void {
    // This method would interact with the DOM or emit events
    // For now, it's a placeholder for the parameter linking feature
    console.log(`Highlighting lines ${lineStart}-${lineEnd}`);
  }

  /**
   * Clear the snippet cache.
   * Call this when source files might have changed.
   */
  clearCache(): void {
    this.snippetCache.clear();
  }

  /**
   * Dispose of engine resources.
   */
  dispose(): void {
    disposeHighlighter();
    this.snippetCache.clear();
    this.initialized = false;
  }

  /**
   * Check if a source file exists.
   *
   * @param sourceFile - Relative path from src/
   * @returns true if the file exists
   */
  hasSource(sourceFile: string): boolean {
    if (this.sourceRegistry) {
      return this.sourceRegistry.has(sourceFile);
    }
    return hasSourceFile(sourceFile);
  }

  /**
   * Get source content for a file.
   *
   * @param sourceFile - Relative path from src/
   * @returns The source content or undefined
   */
  private getSource(sourceFile: string): string | undefined {
    if (this.sourceRegistry) {
      return this.sourceRegistry.get(sourceFile);
    }
    return getSourceFile(sourceFile);
  }

  /**
   * Detect the programming language from file extension.
   *
   * @param sourceFile - File path
   * @returns The detected language
   */
  private detectLanguage(
    sourceFile: string
  ): 'typescript' | 'javascript' | 'json' | 'css' | 'html' {
    const ext = sourceFile.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      default:
        return 'typescript';
    }
  }

  /**
   * Create a cache key for a snippet request.
   */
  private createCacheKey(ref: CodeSnippetRef, annotations: Annotation[]): string {
    return JSON.stringify({
      sourceFile: ref.sourceFile,
      startLine: ref.startLine,
      endLine: ref.endLine,
      focusLines: ref.focusLines,
      annotationIds: annotations.map((a) => a.id).sort(),
    });
  }
}
