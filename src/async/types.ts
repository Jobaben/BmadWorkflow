/**
 * Async Module Types
 *
 * Type definitions for the async-to-sync bridge layer.
 * These types define the structure for prepared content that bridges
 * asynchronous content loading with synchronous render loop access.
 *
 * @see story-024 (ContentBuffer - Async/Sync Bridge)
 */

import type { Annotation } from '../wizard/types';
import type { HighlightedCode } from '../wizard/CodeSnippetEngine';

/**
 * Content prepared asynchronously for synchronous access.
 * Stored in ContentBuffer and retrieved without await during render.
 *
 * @see AC4: ContentBuffer handles PreparedContent type
 */
export interface PreparedContent {
  /** The wizard step ID this content belongs to */
  stepId: string;

  /** Syntax-highlighted code snippets ready for display */
  snippets: HighlightedCode[];

  /** Annotations to display with the code */
  annotations: Annotation[];

  /** Timestamp when this content was prepared (ms since epoch) */
  preparedAt: number;

  /** Optional expiration timestamp (ms since epoch), null for no expiration */
  expiresAt: number | null;
}
