---
id: story-004
title: "Input Manager"
status: Ready
priority: P0
estimate: S
created: 2025-12-25
updated: 2025-12-25
assignee:
pr_link:
epic: Core Infrastructure
depends_on: [story-001, story-002]
blocks: [story-007, story-008, story-009]
prd_requirement: FR-004, NFR-006
---

# Story: Input Manager

## User Story

**As a** developer creating interactive demonstrations,
**I want to** have centralized input handling for mouse and keyboard,
**So that** demos can respond to user input consistently.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Mouse position is tracked in normalized coordinates
  - Given: The input manager is initialized
  - When: I move the mouse over the canvas
  - Then: Mouse position is available as normalized coordinates (-1 to 1)

- [ ] **AC2**: Mouse position is projected to 3D world space
  - Given: The input manager has camera access
  - When: I move the mouse
  - Then: A world-space position is calculated for the mouse

- [ ] **AC3**: Mouse button state is tracked
  - Given: The input manager is running
  - When: I press and release mouse buttons
  - Then: isMouseDown reflects the current state

- [ ] **AC4**: Keyboard state is tracked
  - Given: The input manager is running
  - When: I press keys
  - Then: keysPressed set contains currently held keys

- [ ] **AC5**: Input state is accessible synchronously
  - Given: The input manager exists
  - When: I call getInputState()
  - Then: Current input state is returned immediately (NFR-006)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create InputManager class (AC: 1, 2)
  - [ ] Subtask 1.1: Create `src/core/InputManager.ts`
  - [ ] Subtask 1.2: Accept canvas and camera in constructor
  - [ ] Subtask 1.3: Implement mouse position normalization
  - [ ] Subtask 1.4: Implement world-space projection using Raycaster

- [ ] **Task 2**: Implement mouse event handling (AC: 3)
  - [ ] Subtask 2.1: Add mousemove event listener
  - [ ] Subtask 2.2: Add mousedown event listener
  - [ ] Subtask 2.3: Add mouseup event listener
  - [ ] Subtask 2.4: Add mouseleave handler for edge cases

- [ ] **Task 3**: Implement keyboard event handling (AC: 4)
  - [ ] Subtask 3.1: Add keydown event listener
  - [ ] Subtask 3.2: Add keyup event listener
  - [ ] Subtask 3.3: Use Set for tracking pressed keys
  - [ ] Subtask 3.4: Handle window blur (release all keys)

- [ ] **Task 4**: Implement InputState interface (AC: 5)
  - [ ] Subtask 4.1: Create getInputState() method
  - [ ] Subtask 4.2: Return immutable state snapshot
  - [ ] Subtask 4.3: Ensure state updates are synchronous

- [ ] **Task 5**: Add cleanup/dispose method
  - [ ] Subtask 5.1: Implement dispose() to remove event listeners
  - [ ] Subtask 5.2: Prevent memory leaks

- [ ] **Task 6**: Integration test
  - [ ] Subtask 6.1: Add visual feedback for input in test scene
  - [ ] Subtask 6.2: Verify mouse world position with helper cube
  - [ ] Subtask 6.3: Verify keyboard detection with console logging

### Testing Tasks

- [ ] **Test Task 1**: Verify normalized coordinates at canvas corners
- [ ] **Test Task 2**: Verify world position updates on mouse move
- [ ] **Test Task 3**: Verify key press/release tracking
- [ ] **Test Task 4**: Verify input state available during render loop

---

## Technical Notes

### Architecture Reference
- **Component**: InputManager
- **Section**: Components - Input Manager
- **Patterns**: Observer pattern for input events

### Implementation Approach
Use Three.js Vector2 for normalized coordinates, Vector3 for world position. Raycaster projects mouse to a plane at z=0 for world position. Keep input handling on the main thread for < 100ms response (NFR-006).

### API Contracts
```typescript
// From Architecture
interface InputState {
  mousePosition: Vector2;       // normalized -1 to 1
  mouseWorldPosition: Vector3;  // projected to scene
  isMouseDown: boolean;
  keysPressed: Set<string>;
}

// InputManager interface
class InputManager {
  constructor(canvas: HTMLCanvasElement, camera: Camera);
  getInputState(): InputState;
  dispose(): void;
}
```

### Files Likely Affected
- `src/core/InputManager.ts` - new file
- `src/types/index.ts` - InputState already defined
- `src/main.ts` - integration

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
1. **Happy Path**: Mouse movement updates position, keyboard tracked
2. **Error Case**: Mouse outside canvas handled gracefully
3. **Edge Case**: Rapid key presses correctly tracked

### Edge Cases to Cover
- Mouse leaves canvas bounds
- Window loses focus (release all keys)
- Touch events (optional, desktop focus)

### Test Data Requirements
- None required

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-001 | Must complete first | Pending | Need project and types |
| story-002 | Must complete first | Pending | Need camera for projection |

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

Input manager is decoupled from the render loop for responsiveness. Demos query input state synchronously during their update phase rather than receiving events asynchronously.

---

**Workflow**:
- `/dev story-004` to implement
- `/qa story-004` to review
