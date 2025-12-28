---
id: story-025
title: "LoadingStateManager - Threshold Loading Indicators"
status: Done
priority: P0
estimate: S
created: 2025-12-28
updated: 2025-12-28
assignee: Dev Agent
pr_link: https://github.com/Jobaben/BmadWorkflow/pull/35
epic: Async Optimization
depends_on: []
blocks: [story-027]
prd_requirement: FR-002, NFR-004
---

# Story: LoadingStateManager - Threshold Loading Indicators

## User Story

**As a** learner,
**I want to** see loading indicators only for slow operations,
**So that** fast operations feel instant without visual noise.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [x] **AC1**: Loading indicators delayed by 100ms threshold
  - Given: An async operation starts
  - When: The operation takes >100ms
  - Then: Loading indicator is shown after 100ms

- [x] **AC2**: Fast operations show no indicator
  - Given: An async operation starts
  - When: The operation completes within 100ms
  - Then: No loading indicator is ever shown

- [x] **AC3**: Indicators clear immediately on completion
  - Given: Loading indicator is visible
  - When: The operation completes
  - Then: Indicator is hidden immediately (no delay)

- [x] **AC4**: Multiple concurrent loading states supported
  - Given: Multiple async operations in progress
  - When: Each has unique ID
  - Then: Each is tracked independently

- [x] **AC5**: Navigation clears pending indicators
  - Given: Loading is in progress
  - When: User navigates away
  - Then: Pending indicators are cleared

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create LoadingState type (AC: 4)
  - [x] Subtask 1.1: Add LoadingState to `src/async/types.ts`
  - [x] Subtask 1.2: Define id, startTime, timeoutId, isVisible fields

- [x] **Task 2**: Create LoadingStateManager class (AC: 1, 2, 3, 4)
  - [x] Subtask 2.1: Create `src/async/LoadingStateManager.ts`
  - [x] Subtask 2.2: Implement startLoading(id) with 100ms setTimeout
  - [x] Subtask 2.3: Implement stopLoading(id) with immediate clear
  - [x] Subtask 2.4: Implement isLoading(id) query method
  - [x] Subtask 2.5: Add onShowIndicator callback support
  - [x] Subtask 2.6: Add onHideIndicator callback support

- [x] **Task 3**: Implement cleanup (AC: 5)
  - [x] Subtask 3.1: Implement clearAll() method
  - [x] Subtask 3.2: Clear pending timeouts on stopLoading
  - [x] Subtask 3.3: Add dispose() for cleanup

- [x] **Task 4**: Export from async module (AC: 1)
  - [x] Subtask 4.1: Add export to `src/async/index.ts`

### Testing Tasks

- [x] **Test Task 1**: Test 100ms threshold behavior
- [x] **Test Task 2**: Test fast operation (no indicator flash)
- [x] **Test Task 3**: Test immediate clear on completion
- [x] **Test Task 4**: Test concurrent loading states

---

## Technical Notes

### Architecture Reference
- **Component**: LoadingStateManager
- **Section**: Components - LoadingStateManager
- **Patterns**: Threshold display, callback arrays

### Implementation Approach
Use setTimeout for the 100ms delay. Track each loading operation by ID with its own timeout. Cancel timeout when operation completes before threshold. Use callback pattern (not events) matching existing codebase patterns.

### API Contracts
```typescript
interface LoadingState {
  id: string;
  startTime: number;
  timeoutId: number | null;
  isVisible: boolean;
}

class LoadingStateManager {
  startLoading(id: string): void;
  stopLoading(id: string): void;
  isLoading(id: string): boolean;
  clearAll(): void;

  onShowIndicator(callback: (id: string) => void): void;
  offShowIndicator(callback: (id: string) => void): void;
  onHideIndicator(callback: (id: string) => void): void;
  offHideIndicator(callback: (id: string) => void): void;

  dispose(): void;
}
```

### Files Likely Affected
- `src/async/types.ts` - add LoadingState
- `src/async/LoadingStateManager.ts` - new file
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
1. **Happy Path**: Start loading, wait >100ms, verify indicator shown
2. **Error Case**: Start/stop within 100ms, verify no callback fired
3. **Edge Case**: Multiple concurrent loads with different timing

### Edge Cases to Cover
- Stop before start (should not error)
- Same ID started twice
- Clear all with pending timeouts
- Dispose with active loading states

### Test Data Requirements
- Use fake timers (vi.useFakeTimers) for deterministic timing

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| None | - | - | Foundation component |

---

## Dev Agent Record

> Populated by Dev agent during implementation

- **Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Session Date**: 2025-12-28
- **Tasks Completed**: All 4 implementation tasks, all 4 testing tasks
- **Implementation Notes**: Created LoadingStateManager following existing ContentBuffer patterns. Used Map for O(1) state lookup, Set for callback storage to ensure uniqueness.

### Decisions Made
- Used `ReturnType<typeof setTimeout>` for timeoutId type for cross-platform compatibility
- Added `isIndicatorVisible(id)` helper method beyond API contract for convenience
- Added `activeCount` getter for debugging/monitoring purposes
- Used default threshold of 100ms with constructor parameter for customization

### Issues Encountered
- None - straightforward implementation following existing patterns

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/async/LoadingStateManager.ts` - LoadingStateManager class implementation with threshold-based loading indicators
- `tests/async/LoadingStateManager.test.ts` - Comprehensive test suite with 39 tests covering all acceptance criteria and edge cases

### Modified Files
- `src/async/types.ts` - Added LoadingState interface
- `src/async/index.ts` - Added exports for LoadingStateManager and LoadingState type

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-28 | - | Ready | Scrum | Created |
| 2025-12-28 | Ready | In Progress | Dev Agent | Started implementation |
| 2025-12-28 | In Progress | In Review | Dev Agent | All tasks complete, 39 tests passing, ready for QA |
| 2025-12-28 | In Review | QA Pass | QA Agent | All ACs verified, code quality approved, ready for ship |
| 2025-12-28 | QA Pass | Done | Ship | Merged PR #35 to main |

---

## Notes

The 100ms threshold is based on perceived performance research - operations under 100ms feel "instant" to users. Showing a loading indicator for these creates visual noise and makes the UI feel slower.

ADR-002 documents this decision.

---

**Workflow**:
- `/dev story-025` to implement
- `/qa story-025` to review
