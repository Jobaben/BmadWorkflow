/**
 * Snippet Extractor
 *
 * Utility for extracting line ranges from source code strings.
 * Handles edge cases like out-of-bounds line numbers and invalid ranges.
 *
 * @see FR-002 (Code Snippet Display)
 * @see AC-1, AC-3
 */

/**
 * Result of a snippet extraction operation.
 */
export interface ExtractionResult {
  /** The extracted lines as a string (with newlines preserved) */
  content: string;
  /** The actual starting line number in the source (1-indexed) */
  actualStartLine: number;
  /** The actual ending line number in the source (1-indexed) */
  actualEndLine: number;
  /** Total number of lines extracted */
  lineCount: number;
  /** Whether the extraction was truncated due to bounds */
  wasTruncated: boolean;
}

/**
 * Error codes for extraction failures.
 */
export type ExtractionError =
  | 'EMPTY_SOURCE'
  | 'INVALID_RANGE'
  | 'OUT_OF_BOUNDS';

/**
 * Extracts a range of lines from source code.
 *
 * Line numbers are 1-indexed (matching how editors display lines).
 * If the range extends beyond the source, available lines are returned
 * with wasTruncated set to true.
 *
 * @param source - The complete source code string
 * @param startLine - Starting line number (1-indexed, inclusive)
 * @param endLine - Ending line number (1-indexed, inclusive)
 * @returns ExtractionResult with the extracted content
 * @throws Error if source is empty or range is invalid
 *
 * @example
 * ```typescript
 * const source = "line 1\nline 2\nline 3\nline 4\nline 5";
 * const result = extractLines(source, 2, 4);
 * // result.content = "line 2\nline 3\nline 4"
 * // result.lineCount = 3
 * ```
 */
export function extractLines(
  source: string,
  startLine: number,
  endLine: number
): ExtractionResult {
  // Validate source
  if (!source || source.length === 0) {
    throw new Error('EMPTY_SOURCE: Cannot extract from empty source');
  }

  // Validate range
  if (startLine < 1 || endLine < 1) {
    throw new Error('INVALID_RANGE: Line numbers must be positive (1-indexed)');
  }

  if (startLine > endLine) {
    throw new Error(
      `INVALID_RANGE: Start line (${startLine}) cannot be greater than end line (${endLine})`
    );
  }

  // Split source into lines
  const lines = source.split('\n');
  const totalLines = lines.length;

  // Handle out-of-bounds start
  if (startLine > totalLines) {
    throw new Error(
      `OUT_OF_BOUNDS: Start line ${startLine} exceeds source length of ${totalLines} lines`
    );
  }

  // Calculate actual range (clamp end to available lines)
  const actualStartLine = startLine;
  const actualEndLine = Math.min(endLine, totalLines);
  const wasTruncated = endLine > totalLines;

  // Extract lines (convert to 0-indexed for array access)
  const extractedLines = lines.slice(actualStartLine - 1, actualEndLine);
  const content = extractedLines.join('\n');

  return {
    content,
    actualStartLine,
    actualEndLine,
    lineCount: extractedLines.length,
    wasTruncated,
  };
}

/**
 * Gets the total number of lines in a source string.
 *
 * @param source - The source code string
 * @returns The number of lines (minimum 1 for non-empty source)
 */
export function getLineCount(source: string): number {
  if (!source || source.length === 0) {
    return 0;
  }
  return source.split('\n').length;
}

/**
 * Gets a single line from source code.
 *
 * @param source - The source code string
 * @param lineNumber - Line number to retrieve (1-indexed)
 * @returns The line content, or undefined if out of bounds
 */
export function getLine(source: string, lineNumber: number): string | undefined {
  if (!source || source.length === 0 || lineNumber < 1) {
    return undefined;
  }

  const lines = source.split('\n');
  if (lineNumber > lines.length) {
    return undefined;
  }

  return lines[lineNumber - 1];
}

/**
 * Validates that a line range is valid for a given source.
 *
 * @param source - The source code string
 * @param startLine - Starting line number (1-indexed)
 * @param endLine - Ending line number (1-indexed)
 * @returns Object with isValid flag and optional error message
 */
export function validateRange(
  source: string,
  startLine: number,
  endLine: number
): { isValid: boolean; error?: ExtractionError; message?: string } {
  if (!source || source.length === 0) {
    return { isValid: false, error: 'EMPTY_SOURCE', message: 'Source is empty' };
  }

  if (startLine < 1 || endLine < 1) {
    return {
      isValid: false,
      error: 'INVALID_RANGE',
      message: 'Line numbers must be positive',
    };
  }

  if (startLine > endLine) {
    return {
      isValid: false,
      error: 'INVALID_RANGE',
      message: 'Start line cannot exceed end line',
    };
  }

  const totalLines = source.split('\n').length;
  if (startLine > totalLines) {
    return {
      isValid: false,
      error: 'OUT_OF_BOUNDS',
      message: `Start line ${startLine} exceeds ${totalLines} total lines`,
    };
  }

  return { isValid: true };
}

/**
 * Gets specific lines by their line numbers.
 *
 * @param source - The source code string
 * @param lineNumbers - Array of line numbers to retrieve (1-indexed)
 * @returns Map of line number to content (only includes valid lines)
 */
export function getSpecificLines(
  source: string,
  lineNumbers: number[]
): Map<number, string> {
  const result = new Map<number, string>();

  if (!source || source.length === 0 || lineNumbers.length === 0) {
    return result;
  }

  const lines = source.split('\n');

  for (const lineNum of lineNumbers) {
    if (lineNum >= 1 && lineNum <= lines.length) {
      result.set(lineNum, lines[lineNum - 1]);
    }
  }

  return result;
}
