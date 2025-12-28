---
id: story-027
title: "AsyncContentLoader - Wizard Content Pipeline"
status: QA Pass
priority: P0
estimate: M
created: 2025-12-28
updated: 2025-12-28
assignee: Dev Agent
pr_link:
epic: Async Optimization
depends_on: [story-024, story-025]
blocks: [story-028]
prd_requirement: FR-001, NFR-002
---

# Story: AsyncContentLoader - Wizard Content Pipeline

## User Story

**As a** learner,
**I want to** navigate between wizard steps without animation stuttering,
**So that** I can focus on learning without UI freezes.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [x] **AC1**: Content loads asynchronously without blocking animation
  - Given: Animation is running at 60fps
  - When: User navigates to a new wizard step
  - Then: Animation continues smoothly during content load

- [x] **AC2**: Pending loads are cancellable
  - Given: Content load is in progress
  - When: User navigates to a different step
  - Then: Previous load is cancelled (AbortController)

- [x] **AC3**: Race conditions are prevented
  - Given: User rapidly clicks through steps
  - When: Multiple loads are triggered
  - Then: Only the latest navigation result is used

- [x] **AC4**: Loaded content is stored in ContentBuffer
  - Given: Content finishes loading
  - When: The promise resolves
  - Then: Content is written to ContentBuffer for sync access

- [x] **AC5**: Loading state is coordinated with LoadingStateManager
  - Given: Content load starts/completes
  - When: The operation progresses
  - Then: LoadingStateManager is notified

- [x] **AC6**: Content preloading is supported
  - Given: User is on step N
  - When: Idle time is available
  - Then: Steps N+1, N-1 can be preloaded

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create StepContent type (AC: 4)
  - [x] Subtask 1.1: Add StepContent to `src/async/types.ts`
  - [x] Subtask 1.2: Include snippets, annotations, metadata

- [x] **Task 2**: Create AsyncContentLoader class (AC: 1, 4)
  - [x] Subtask 2.1: Create `src/async/AsyncContentLoader.ts`
  - [x] Subtask 2.2: Accept ContentBuffer, LoadingStateManager, CodeSnippetEngine in constructor
  - [x] Subtask 2.3: Implement loadStep(stepId): Promise<StepContent>
  - [x] Subtask 2.4: Write to ContentBuffer on completion

- [x] **Task 3**: Implement cancellation (AC: 2, 3)
  - [x] Subtask 3.1: Add AbortController per load operation
  - [x] Subtask 3.2: Implement cancelPending() method
  - [x] Subtask 3.3: Cancel previous load when new one starts
  - [x] Subtask 3.4: Handle AbortError gracefully

- [x] **Task 4**: Integrate LoadingStateManager (AC: 5)
  - [x] Subtask 4.1: Call startLoading() when load begins
  - [x] Subtask 4.2: Call stopLoading() when load ends
  - [x] Subtask 4.3: Handle both success and error cases

- [x] **Task 5**: Implement preloading (AC: 6)
  - [x] Subtask 5.1: Add preloadSteps(stepIds: string[]) method
  - [x] Subtask 5.2: Use requestIdleCallback for preloading
  - [x] Subtask 5.3: Skip already-loaded steps

- [x] **Task 6**: Add event callbacks (AC: 1)
  - [x] Subtask 6.1: Add onLoadStart callback
  - [x] Subtask 6.2: Add onLoadComplete callback
  - [x] Subtask 6.3: Add onLoadError callback

- [x] **Task 7**: Export from async module
  - [x] Subtask 7.1: Add export to `src/async/index.ts`

### Testing Tasks

- [x] **Test Task 1**: Test basic load/store flow
- [x] **Test Task 2**: Test cancellation prevents race conditions
- [x] **Test Task 3**: Test LoadingStateManager integration
- [x] **Test Task 4**: Test preloading during idle time

---

## Technical Notes

### Architecture Reference
- **Component**: AsyncContentLoader
- **Section**: Components - AsyncContentLoader
- **Patterns**: AbortController, Promise-based pipeline

### Implementation Approach
Coordinate between CodeSnippetEngine (async snippets), LoadingStateManager (loading UI), and ContentBuffer (storage). Use AbortController for cancellation. Each loadStep() call cancels any pending load first.

### API Contracts
```typescript
interface StepContent {
  stepId: string;
  snippets: HighlightedCode[];
  annotations: Annotation[];
  loadedAt: number;
}

class AsyncContentLoader {
  constructor(
    buffer: ContentBuffer,
    loadingManager: LoadingStateManager,
    snippetEngine: CodeSnippetEngine
  );

  loadStep(stepId: string): Promise<StepContent>;
  cancelPending(): void;
  preloadSteps(stepIds: string[]): void;

  onLoadStart(callback: (stepId: string) => void): void;
  offLoadStart(callback: (stepId: string) => void): void;
  onLoadComplete(callback: (stepId: string, content: StepContent) => void): void;
  offLoadComplete(callback: (stepId: string, content: StepContent) => void): void;
  onLoadError(callback: (stepId: string, error: Error) => void): void;
  offLoadError(callback: (stepId: string, error: Error) => void): void;

  dispose(): void;
}
```

### Data Flow
```
loadStep(stepId)
  → loadingManager.startLoading(stepId)
  → snippetEngine.getSnippet(refs) [async, cancellable]
  → buffer.set(stepId, content)
  → loadingManager.stopLoading(stepId)
  → onLoadComplete callback
```

### Files Likely Affected
- `src/async/types.ts` - add StepContent
- `src/async/AsyncContentLoader.ts` - new file
- `src/async/index.ts` - add export

---

## Definition of Done

> All items must be checked before moving to "In Review"

- [x] All tasks checked off
- [x] All acceptance criteria verified
- [x] Code implemented following project patterns
- [x] Unit tests written and passing
- [x] Integration tests written (if applicable)
- [x] All existing tests still pass (no regressions)
- [x] File List section updated
- [x] Dev Agent Record completed

---

## Testing Notes

### Test Scenarios
1. **Happy Path**: Load step, verify in buffer, verify callbacks fired
2. **Error Case**: Load fails, verify error callback, loading state cleared
3. **Edge Case**: Rapid navigation, verify only final result used

### Edge Cases to Cover
- Load cancelled mid-flight
- Same step loaded twice
- Preload already-loaded step (skip)
- Error during snippet retrieval

### Test Data Requirements
- Mock CodeSnippetEngine
- Mock WizardStep data
- Use fake timers for preload testing

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-024 | Must complete first | Ready | ContentBuffer required |
| story-025 | Must complete first | Ready | LoadingStateManager required |

---

## Dev Agent Record

> Populated by Dev agent during implementation

- **Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Session Date**: 2025-12-28
- **Tasks Completed**: All 7 implementation tasks, all 4 testing tasks
- **Implementation Notes**: Created AsyncContentLoader that coordinates between CodeSnippetEngine, LoadingStateManager, and ContentBuffer. Uses AbortController for cancellation and requestIdleCallback for preloading.

### Decisions Made
- Used StepProvider interface to decouple from ConceptRegistry for easier testing
- Preloading runs in idle time without loading indicators to avoid visual noise
- All load operations automatically cancel previous pending loads to prevent race conditions

### Issues Encountered
- Promise rejection warnings in tests due to async nature of AbortController - Fixed by attaching .catch() handlers immediately after promise creation

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/async/AsyncContentLoader.ts` - AsyncContentLoader class with load/cancel/preload functionality
- `tests/async/AsyncContentLoader.test.ts` - Comprehensive test suite with 32 tests covering all ACs

### Modified Files
- `src/async/types.ts` - Added StepContent interface
- `src/async/index.ts` - Added exports for AsyncContentLoader, StepProvider, and StepContent

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-28 | - | Ready | Scrum | Created |
| 2025-12-28 | Ready | In Progress | Dev Agent | Started implementation |
| 2025-12-28 | In Progress | In Review | Dev Agent | All tasks complete, 32 tests passing, ready for QA |

---

## Notes

This is the main coordination component that brings together async content loading. It depends on ContentBuffer and LoadingStateManager. The AbortController pattern (ADR-004) is critical for preventing race conditions during rapid navigation.

---

**Workflow**:
- `/dev story-027` to implement
- `/qa story-027` to review
