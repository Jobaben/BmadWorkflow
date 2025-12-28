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

/**
 * Loading state for an individual async operation.
 * Tracks the operation's loading indicator visibility.
 *
 * @see story-025 (LoadingStateManager - Threshold Loading Indicators)
 */
export interface LoadingState {
  /** Unique identifier for this loading operation */
  id: string;

  /** Timestamp when the operation started (ms since epoch) */
  startTime: number;

  /** Timeout ID for delayed indicator display, null if indicator already visible */
  timeoutId: ReturnType<typeof setTimeout> | null;

  /** Whether the loading indicator is currently visible */
  isVisible: boolean;
}

/**
 * Interface for components that can be initialized asynchronously.
 * Components implementing this interface can register with ComponentInitializer
 * for idle-time pre-warming.
 *
 * @see story-026 (ComponentInitializer - Idle-Time Pre-warming)
 */
export interface AsyncInitializable {
  /** Unique identifier for this component */
  readonly id: string;

  /** Priority for initialization order (lower = earlier) */
  readonly priority: number;

  /** Whether this component is critical (affects initialization strategy) */
  readonly isCritical: boolean;

  /** Async initialization method */
  initialize(): Promise<void>;

  /** Whether the component has been initialized */
  readonly isInitialized: boolean;
}

/**
 * Status of a component's initialization.
 *
 * @see story-026 (ComponentInitializer - Idle-Time Pre-warming)
 */
export type InitStatus = 'pending' | 'initializing' | 'initialized' | 'failed';

/**
 * Content for a wizard step, loaded asynchronously.
 * Contains highlighted code snippets and annotations ready for display.
 *
 * @see story-027 (AsyncContentLoader - Wizard Content Pipeline)
 */
export interface StepContent {
  /** The wizard step ID this content belongs to */
  stepId: string;

  /** Syntax-highlighted code snippets ready for display */
  snippets: HighlightedCode[];

  /** Annotations to display with the code */
  annotations: Annotation[];

  /** Timestamp when this content was loaded (ms since epoch) */
  loadedAt: number;
}
