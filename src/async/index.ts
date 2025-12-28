/**
 * Async Module
 *
 * Provides the bridge layer between async content loading
 * and synchronous render loop access, loading state management
 * with threshold-based indicators, and idle-time component initialization.
 *
 * @see story-024 (ContentBuffer - Async/Sync Bridge)
 * @see story-025 (LoadingStateManager - Threshold Loading Indicators)
 * @see story-026 (ComponentInitializer - Idle-Time Pre-warming)
 */

export { ContentBuffer } from './ContentBuffer';
export { LoadingStateManager } from './LoadingStateManager';
export { ComponentInitializer } from './ComponentInitializer';
export type { PreparedContent, LoadingState, AsyncInitializable, InitStatus } from './types';
