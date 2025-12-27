/**
 * Snippet Extractor
 *
 * Utility for extracting specific line ranges from source code strings.
 * Handles edge cases like out-of-bounds lines and invalid ranges.
 *
 * @see FR-002 (Code Snippet Display)
 * @see AC3 (Specific line ranges can be extracted)
 */

/**
 * Result of a snippet extraction operation.
 */
export interface ExtractedSnippet {
  /** The extracted lines of code */
  lines: string[];
  /** The actual start line (1-indexed) after clamping to valid range */
  actualStartLine: number;
  /** The actual end line (1-indexed) after clamping to valid range */
  actualEndLine: number;
  /** Total lines in the original source */
  totalLines: number;
  /** Whether the requested range was partially out of bounds */
  wasClipped: boolean;
}

/**
 * Options for snippet extraction.
 */
export interface ExtractOptions {
  /** Preserve original indentation (default: true) */
  preserveIndentation?: boolean;
  /** Minimum indent to strip from all lines (auto-detect if not specified) */
  stripIndent?: number;
}

/**
 * Extract specific lines from source code.
 *
 * @param source - The full source code string
 * @param startLine - Starting line number (1-indexed)
 * @param endLine - Ending line number (1-indexed, inclusive)
 * @param options - Optional extraction options
 * @returns The extracted snippet with metadata
 *
 * @example
 * const source = "line1\nline2\nline3\nline4";
 * const snippet = extractLines(source, 2, 3);
 * // snippet.lines = ["line2", "line3"]
 */
export function extractLines(
  source: string,
  startLine: number,
  endLine: number,
  options: ExtractOptions = {}
): ExtractedSnippet {
  const { preserveIndentation = true } = options;

  // Split source into lines
  const allLines = source.split('\n');
  const totalLines = allLines.length;

  // Handle empty source
  if (totalLines === 0 || source.length === 0) {
    return {
      lines: [],
      actualStartLine: 0,
      actualEndLine: 0,
      totalLines: 0,
      wasClipped: false,
    };
  }

  // Validate and clamp line numbers (1-indexed)
  const clampedStart = Math.max(1, Math.min(startLine, totalLines));
  const clampedEnd = Math.max(clampedStart, Math.min(endLine, totalLines));

  // Check if range was clipped
  const wasClipped = clampedStart !== startLine || clampedEnd !== endLine;

  // Extract lines (convert to 0-indexed for array access)
  let lines = allLines.slice(clampedStart - 1, clampedEnd);

  // Handle indentation stripping
  if (!preserveIndentation && lines.length > 0) {
    const minIndent = options.stripIndent ?? detectMinIndent(lines);
    if (minIndent > 0) {
      lines = lines.map((line) => line.slice(minIndent));
    }
  }

  return {
    lines,
    actualStartLine: clampedStart,
    actualEndLine: clampedEnd,
    totalLines,
    wasClipped,
  };
}

/**
 * Detect the minimum indentation across all non-empty lines.
 *
 * @param lines - Array of code lines
 * @returns The minimum number of leading spaces/tabs
 */
export function detectMinIndent(lines: string[]): number {
  let minIndent = Infinity;

  for (const line of lines) {
    // Skip empty lines
    if (line.trim().length === 0) {
      continue;
    }

    // Count leading whitespace
    const match = line.match(/^(\s*)/);
    if (match) {
      minIndent = Math.min(minIndent, match[1].length);
    }
  }

  return minIndent === Infinity ? 0 : minIndent;
}

/**
 * Convert extracted lines to a single string.
 *
 * @param snippet - The extracted snippet
 * @returns The lines joined with newlines
 */
export function snippetToString(snippet: ExtractedSnippet): string {
  return snippet.lines.join('\n');
}

/**
 * Get line count from extracted snippet.
 *
 * @param snippet - The extracted snippet
 * @returns Number of lines in the snippet
 */
export function getSnippetLineCount(snippet: ExtractedSnippet): number {
  return snippet.lines.length;
}

/**
 * Check if a specific line (relative to snippet) should be focused.
 *
 * @param snippetLineIndex - 0-indexed line within the snippet
 * @param focusLines - Array of 1-indexed lines to focus (relative to original source)
 * @param snippetStartLine - The 1-indexed starting line of the snippet in original source
 * @returns true if the line should be focused
 */
export function isLineFocused(
  snippetLineIndex: number,
  focusLines: number[],
  snippetStartLine: number
): boolean {
  // Convert snippet line index to original source line number
  const originalLineNumber = snippetStartLine + snippetLineIndex;
  return focusLines.includes(originalLineNumber);
}
