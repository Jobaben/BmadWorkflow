/**
 * Async Module
 *
 * Provides the bridge layer between async content loading
 * and synchronous render loop access, plus loading state management
 * with threshold-based indicators.
 *
 * @see story-024 (ContentBuffer - Async/Sync Bridge)
 * @see story-025 (LoadingStateManager - Threshold Loading Indicators)
 */

export { ContentBuffer } from './ContentBuffer';
export { LoadingStateManager } from './LoadingStateManager';
export type { PreparedContent, LoadingState } from './types';
