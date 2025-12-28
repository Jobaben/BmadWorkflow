---
id: story-025
title: "LoadingStateManager - Threshold Loading Indicators"
status: Ready
priority: P0
estimate: S
created: 2025-12-28
updated: 2025-12-28
assignee:
pr_link:
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

- [ ] **AC1**: Loading indicators delayed by 100ms threshold
  - Given: An async operation starts
  - When: The operation takes >100ms
  - Then: Loading indicator is shown after 100ms

- [ ] **AC2**: Fast operations show no indicator
  - Given: An async operation starts
  - When: The operation completes within 100ms
  - Then: No loading indicator is ever shown

- [ ] **AC3**: Indicators clear immediately on completion
  - Given: Loading indicator is visible
  - When: The operation completes
  - Then: Indicator is hidden immediately (no delay)

- [ ] **AC4**: Multiple concurrent loading states supported
  - Given: Multiple async operations in progress
  - When: Each has unique ID
  - Then: Each is tracked independently

- [ ] **AC5**: Navigation clears pending indicators
  - Given: Loading is in progress
  - When: User navigates away
  - Then: Pending indicators are cleared

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create LoadingState type (AC: 4)
  - [ ] Subtask 1.1: Add LoadingState to `src/async/types.ts`
  - [ ] Subtask 1.2: Define id, startTime, timeoutId, isVisible fields

- [ ] **Task 2**: Create LoadingStateManager class (AC: 1, 2, 3, 4)
  - [ ] Subtask 2.1: Create `src/async/LoadingStateManager.ts`
  - [ ] Subtask 2.2: Implement startLoading(id) with 100ms setTimeout
  - [ ] Subtask 2.3: Implement stopLoading(id) with immediate clear
  - [ ] Subtask 2.4: Implement isLoading(id) query method
  - [ ] Subtask 2.5: Add onShowIndicator callback support
  - [ ] Subtask 2.6: Add onHideIndicator callback support

- [ ] **Task 3**: Implement cleanup (AC: 5)
  - [ ] Subtask 3.1: Implement clearAll() method
  - [ ] Subtask 3.2: Clear pending timeouts on stopLoading
  - [ ] Subtask 3.3: Add dispose() for cleanup

- [ ] **Task 4**: Export from async module (AC: 1)
  - [ ] Subtask 4.1: Add export to `src/async/index.ts`

### Testing Tasks

- [ ] **Test Task 1**: Test 100ms threshold behavior
- [ ] **Test Task 2**: Test fast operation (no indicator flash)
- [ ] **Test Task 3**: Test immediate clear on completion
- [ ] **Test Task 4**: Test concurrent loading states

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

- [ ] All tasks checked off
- [ ] All acceptance criteria verified
- [ ] Code implemented following project patterns
- [ ] Unit tests written and passing
- [ ] Integration tests written (if applicable)
- [ ] All existing tests still pass (no regressions)
- [ ] File List section updated
- [ ] Dev Agent Record completed

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

- **Model**:
- **Session Date**:
- **Tasks Completed**:
- **Implementation Notes**:

### Decisions Made
- [Decision 1]: [Rationale]

### Issues Encountered
- [Issue 1]: [Resolution]

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `path/to/new/file` - [description]

### Modified Files
- `path/to/existing/file` - [what changed]

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-28 | - | Ready | Scrum | Created |

---

## Notes

The 100ms threshold is based on perceived performance research - operations under 100ms feel "instant" to users. Showing a loading indicator for these creates visual noise and makes the UI feel slower.

ADR-002 documents this decision.

---

**Workflow**:
- `/dev story-025` to implement
- `/qa story-025` to review
