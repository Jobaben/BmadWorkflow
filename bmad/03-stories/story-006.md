---
id: story-006
title: "Object Pool Utility"
status: Ready
priority: P1
estimate: S
created: 2025-12-25
updated: 2025-12-25
assignee:
pr_link:
epic: Utilities
depends_on: [story-001]
blocks: [story-007, story-009]
prd_requirement: NFR-001
---

# Story: Object Pool Utility

## User Story

**As a** developer building high-performance particle and fluid systems,
**I want to** have an object pooling utility,
**So that** I can avoid garbage collection pauses and maintain smooth frame rates.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Pool provides objects without allocation
  - Given: A pool is initialized with objects
  - When: I call acquire()
  - Then: An object is returned without new allocation

- [ ] **AC2**: Released objects are recycled
  - Given: An object has been acquired
  - When: I call release(object)
  - Then: The object is returned to the pool for reuse

- [ ] **AC3**: Pool grows when exhausted
  - Given: All pool objects are in use
  - When: I call acquire()
  - Then: The pool grows and provides a new object

- [ ] **AC4**: Objects are reset on release
  - Given: An object has been modified during use
  - When: I release it
  - Then: A reset function is called to clean its state

- [ ] **AC5**: Pool reports statistics
  - Given: A pool is in use
  - When: I check pool stats
  - Then: I can see active count, available count, total size

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create ObjectPool class (AC: 1, 2)
  - [ ] Subtask 1.1: Create `src/utils/ObjectPool.ts`
  - [ ] Subtask 1.2: Implement generic pool with factory function
  - [ ] Subtask 1.3: Implement acquire() method
  - [ ] Subtask 1.4: Implement release() method
  - [ ] Subtask 1.5: Use array-based storage for efficiency

- [ ] **Task 2**: Implement pool growth (AC: 3)
  - [ ] Subtask 2.1: Add grow() method
  - [ ] Subtask 2.2: Create batch of new objects when exhausted
  - [ ] Subtask 2.3: Make batch size configurable

- [ ] **Task 3**: Implement object reset (AC: 4)
  - [ ] Subtask 3.1: Accept reset function in constructor
  - [ ] Subtask 3.2: Call reset on release
  - [ ] Subtask 3.3: Make reset optional (default no-op)

- [ ] **Task 4**: Add pool statistics (AC: 5)
  - [ ] Subtask 4.1: Track active count
  - [ ] Subtask 4.2: Track available count
  - [ ] Subtask 4.3: Track total pool size
  - [ ] Subtask 4.4: Add getStats() method

- [ ] **Task 5**: Create unit tests
  - [ ] Subtask 5.1: Test acquire returns object
  - [ ] Subtask 5.2: Test release makes object available
  - [ ] Subtask 5.3: Test pool growth
  - [ ] Subtask 5.4: Test reset function is called

### Testing Tasks

- [ ] **Test Task 1**: Verify no allocations during steady-state usage
- [ ] **Test Task 2**: Verify released objects are reused
- [ ] **Test Task 3**: Verify stats reflect actual pool state
- [ ] **Test Task 4**: Verify reset function modifies objects

---

## Technical Notes

### Architecture Reference
- **Component**: Object Pool
- **Section**: Components - Object Pool
- **Patterns**: Object Pool pattern for performance

### Implementation Approach
Use a generic class `ObjectPool<T>` that accepts a factory function for creating new objects and an optional reset function. Store available objects in an array, pop for acquire, push for release.

### API Contracts
```typescript
interface PoolStats {
  active: number;      // currently in use
  available: number;   // ready to acquire
  total: number;       // total created
}

class ObjectPool<T> {
  constructor(
    factory: () => T,
    initialSize?: number,
    reset?: (obj: T) => void
  );

  acquire(): T;
  release(obj: T): void;
  getStats(): PoolStats;

  // Optional
  releaseAll(): void;
  dispose(): void;
}
```

### Files Likely Affected
- `src/utils/ObjectPool.ts` - new file
- `src/types/index.ts` - PoolStats interface

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
1. **Happy Path**: Acquire/release cycle without allocation
2. **Error Case**: Release object not from pool (ignore or warn)
3. **Edge Case**: Pool exhaustion triggers growth

### Edge Cases to Cover
- Double release of same object
- Acquire from empty pool
- Very large pool sizes

### Test Data Requirements
- Simple test object with resettable state

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-001 | Must complete first | Pending | Need project setup |

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
| 2025-12-25 | - | Ready | Scrum | Created |

---

## Notes

Object pooling is a critical optimization pattern for game/graphics development. This utility will be used by both ParticleDemo (story-007) and FluidDemo (story-009). Document the pattern well for learning purposes.

---

**Workflow**:
- `/dev story-006` to implement
- `/qa story-006` to review
