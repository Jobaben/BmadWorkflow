/**
 * ContentBuffer
 *
 * Bridge data structure for async-to-sync data handoff.
 * Allows async content loading to prepare data for synchronous
 * render loop access.
 *
 * Key design principle: All reads are synchronous (no async/await).
 * The async zone writes to it; the sync zone reads from it.
 *
 * @see story-024 (ContentBuffer - Async/Sync Bridge)
 * @see Architecture - Pure data structure, Map-based storage
 */

import type { PreparedContent } from './types';

/**
 * ContentBuffer provides instant synchronous access to prepared content.
 * Content is stored by key and can be retrieved without any async operations.
 *
 * @example
 * ```typescript
 * const buffer = new ContentBuffer();
 *
 * // Async zone: prepare and store content
 * buffer.set('step-1', preparedContent);
 *
 * // Sync zone: instant retrieval
 * const content = buffer.get('step-1');
 * ```
 */
export class ContentBuffer {
  /** Internal storage using Map for O(1) access */
  private readonly storage = new Map<string, PreparedContent>();

  /**
   * Store prepared content by key.
   *
   * @param key - Unique identifier for the content (typically stepId)
   * @param content - The prepared content to store
   *
   * @see AC1: ContentBuffer stores prepared content by key
   */
  set(key: string, content: PreparedContent): void {
    this.storage.set(key, content);
  }

  /**
   * Retrieve content by key synchronously.
   * Returns undefined if key does not exist.
   *
   * @param key - The key to look up
   * @returns The prepared content or undefined
   *
   * @see AC2: ContentBuffer provides instant synchronous reads
   */
  get(key: string): PreparedContent | undefined {
    return this.storage.get(key);
  }

  /**
   * Check if content exists for a given key.
   *
   * @param key - The key to check
   * @returns True if content exists for the key
   *
   * @see AC3: ContentBuffer manages content lifecycle
   */
  has(key: string): boolean {
    return this.storage.has(key);
  }

  /**
   * Remove content for a specific key.
   *
   * @param key - The key to remove
   * @returns True if the key existed and was removed
   *
   * @see AC3: ContentBuffer manages content lifecycle
   */
  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Clear all content from the buffer.
   *
   * @see AC3: ContentBuffer manages content lifecycle
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Get the number of entries in the buffer.
   */
  get size(): number {
    return this.storage.size;
  }
}
