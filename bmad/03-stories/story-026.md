---
id: story-026
title: "ComponentInitializer - Idle-Time Pre-warming"
status: Ready
priority: P1
estimate: S
created: 2025-12-28
updated: 2025-12-28
assignee:
pr_link:
epic: Async Optimization
depends_on: []
blocks: [story-027]
prd_requirement: FR-003, NFR-002
---

# Story: ComponentInitializer - Idle-Time Pre-warming

## User Story

**As a** developer,
**I want to** initialize non-critical components during browser idle time,
**So that** expensive initialization doesn't block user interaction.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Components can register for idle-time initialization
  - Given: A component implements AsyncInitializable interface
  - When: I register it with ComponentInitializer
  - Then: It is queued for initialization

- [ ] **AC2**: Initialization uses requestIdleCallback
  - Given: Components are registered
  - When: Browser is idle
  - Then: Components initialize during idle time

- [ ] **AC3**: Safari fallback uses setTimeout
  - Given: requestIdleCallback is not available
  - When: Components need initialization
  - Then: setTimeout fallback is used

- [ ] **AC4**: Critical components initialize first
  - Given: Components with different priority values
  - When: Initialization runs
  - Then: Lower priority numbers initialize first

- [ ] **AC5**: Initialization status is trackable
  - Given: A component is registered
  - When: I query its status
  - Then: I can see if it's initialized or pending

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create AsyncInitializable interface (AC: 1)
  - [ ] Subtask 1.1: Add interface to `src/async/types.ts`
  - [ ] Subtask 1.2: Define id, priority, isCritical, initialize(), isInitialized

- [ ] **Task 2**: Create ComponentInitializer class (AC: 1, 2, 4)
  - [ ] Subtask 2.1: Create `src/async/ComponentInitializer.ts`
  - [ ] Subtask 2.2: Implement register(component) method
  - [ ] Subtask 2.3: Implement initializeAll() with requestIdleCallback
  - [ ] Subtask 2.4: Sort by priority before initializing
  - [ ] Subtask 2.5: Add onInitialized callback support
  - [ ] Subtask 2.6: Add onInitFailed callback support

- [ ] **Task 3**: Implement Safari fallback (AC: 3)
  - [ ] Subtask 3.1: Detect requestIdleCallback availability
  - [ ] Subtask 3.2: Create setTimeout-based fallback
  - [ ] Subtask 3.3: Use consistent API for both

- [ ] **Task 4**: Implement status tracking (AC: 5)
  - [ ] Subtask 4.1: Add getStatus(id) method
  - [ ] Subtask 4.2: Track pending, initializing, initialized, failed states
  - [ ] Subtask 4.3: Add getAllStatuses() method

- [ ] **Task 5**: Export from async module
  - [ ] Subtask 5.1: Add export to `src/async/index.ts`

### Testing Tasks

- [ ] **Test Task 1**: Test component registration
- [ ] **Test Task 2**: Test priority ordering
- [ ] **Test Task 3**: Test fallback mechanism
- [ ] **Test Task 4**: Test status tracking

---

## Technical Notes

### Architecture Reference
- **Component**: ComponentInitializer
- **Section**: Components - ComponentInitializer
- **Patterns**: requestIdleCallback, priority queue

### Implementation Approach
Use requestIdleCallback with a setTimeout fallback for Safari. Components register with a priority number (lower = earlier). The initializer processes components in priority order during idle time, calling their async initialize() method.

### API Contracts
```typescript
interface AsyncInitializable {
  readonly id: string;
  readonly priority: number;
  readonly isCritical: boolean;
  initialize(): Promise<void>;
  readonly isInitialized: boolean;
}

type InitStatus = 'pending' | 'initializing' | 'initialized' | 'failed';

class ComponentInitializer {
  register(component: AsyncInitializable): void;
  initializeAll(): Promise<void>;
  getStatus(id: string): InitStatus | undefined;
  getAllStatuses(): Map<string, InitStatus>;

  onInitialized(callback: (id: string) => void): void;
  offInitialized(callback: (id: string) => void): void;
  onInitFailed(callback: (id: string, error: Error) => void): void;
  offInitFailed(callback: (id: string, error: Error) => void): void;

  dispose(): void;
}
```

### Files Likely Affected
- `src/async/types.ts` - add AsyncInitializable, InitStatus
- `src/async/ComponentInitializer.ts` - new file
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
1. **Happy Path**: Register components, initializeAll, verify all initialized
2. **Error Case**: Component throws during init, verify failed status
3. **Edge Case**: requestIdleCallback not available, verify fallback works

### Edge Cases to Cover
- Empty component list
- Component init throws error
- Same component registered twice
- Dispose before initialization completes

### Test Data Requirements
- Mock AsyncInitializable implementations
- May need to mock requestIdleCallback

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

This component enables pre-warming of expensive resources like the Shiki syntax highlighter. By initializing during idle time, the first actual use doesn't incur initialization delay.

ADR-003 documents the requestIdleCallback decision and Safari fallback requirement.

---

**Workflow**:
- `/dev story-026` to implement
- `/qa story-026` to review
