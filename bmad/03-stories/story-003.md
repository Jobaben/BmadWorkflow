---
id: story-003
title: "Animation Loop & FPS Monitor"
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
prd_requirement: NFR-001, NFR-006
---

# Story: Animation Loop & FPS Monitor

## User Story

**As a** developer creating animated demonstrations,
**I want to** have a consistent animation loop with delta time and FPS monitoring,
**So that** animations run smoothly at consistent speeds regardless of frame rate.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Animation loop uses requestAnimationFrame
  - Given: The animation loop is started
  - When: Each frame is processed
  - Then: The loop uses requestAnimationFrame for optimal timing

- [ ] **AC2**: Delta time is calculated correctly
  - Given: The animation loop is running
  - When: A frame callback is invoked
  - Then: Accurate delta time (in seconds) is provided

- [ ] **AC3**: FPS is tracked accurately
  - Given: The application is running
  - When: I check the FPS monitor
  - Then: It reports the current and average FPS within 5% accuracy

- [ ] **AC4**: Loop can be started and stopped
  - Given: The animation loop exists
  - When: I call start() then stop()
  - Then: The loop stops and no more frames are processed

- [ ] **AC5**: Optional FPS display overlay
  - Given: The FPS monitor is enabled
  - When: The application runs
  - Then: An FPS counter is visible in the corner of the screen

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create AnimationLoop class (AC: 1, 2)
  - [ ] Subtask 1.1: Create `src/core/AnimationLoop.ts`
  - [ ] Subtask 1.2: Implement requestAnimationFrame loop
  - [ ] Subtask 1.3: Calculate delta time between frames
  - [ ] Subtask 1.4: Implement callback registration for frame updates

- [ ] **Task 2**: Implement loop control methods (AC: 4)
  - [ ] Subtask 2.1: Implement start() method
  - [ ] Subtask 2.2: Implement stop() method
  - [ ] Subtask 2.3: Track running state
  - [ ] Subtask 2.4: Handle edge case of calling start() when already running

- [ ] **Task 3**: Create FPS Monitor (AC: 3)
  - [ ] Subtask 3.1: Create `src/core/FPSMonitor.ts` or add to utils
  - [ ] Subtask 3.2: Calculate instantaneous FPS
  - [ ] Subtask 3.3: Calculate rolling average FPS (last 60 frames)
  - [ ] Subtask 3.4: Expose currentFPS and averageFPS properties

- [ ] **Task 4**: Create FPS display overlay (AC: 5)
  - [ ] Subtask 4.1: Create `src/ui/FPSDisplay.ts`
  - [ ] Subtask 4.2: Create DOM element for FPS display
  - [ ] Subtask 4.3: Update display each frame
  - [ ] Subtask 4.4: Style overlay to be unobtrusive (corner position)
  - [ ] Subtask 4.5: Add show/hide toggle capability

- [ ] **Task 5**: Integrate with renderer
  - [ ] Subtask 5.1: Connect loop to DemoRenderer.render()
  - [ ] Subtask 5.2: Verify continuous rendering works
  - [ ] Subtask 5.3: Test with animated cube (rotation)

### Testing Tasks

- [ ] **Test Task 1**: Verify delta time is consistent (within tolerance)
- [ ] **Test Task 2**: Verify FPS counter updates correctly
- [ ] **Test Task 3**: Verify loop can be stopped and restarted
- [ ] **Test Task 4**: Verify animated content moves smoothly

---

## Technical Notes

### Architecture Reference
- **Component**: AnimationLoop, FPS Monitor
- **Section**: Components - Animation Loop
- **Patterns**: Observer pattern for frame callbacks

### Implementation Approach
Use performance.now() for high-resolution timing. Delta time should be in seconds (not milliseconds) for easier physics calculations. Cap delta time to prevent spiral of death on tab switching.

### API Contracts
```typescript
// AnimationLoop interface
class AnimationLoop {
  onFrame: (callback: (deltaTime: number) => void) => void;
  start(): void;
  stop(): void;
  isRunning(): boolean;
}

// FPSMonitor interface
class FPSMonitor {
  frame(deltaTime: number): void;
  readonly currentFPS: number;
  readonly averageFPS: number;
}
```

### Files Likely Affected
- `src/core/AnimationLoop.ts` - new file
- `src/core/FPSMonitor.ts` - new file
- `src/ui/FPSDisplay.ts` - new file
- `src/main.ts` - integration
- `src/style.css` - FPS display styling

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
1. **Happy Path**: Loop runs at ~60fps, FPS displays correctly
2. **Error Case**: Tab becomes inactive, loop handles gracefully
3. **Edge Case**: Very fast/slow devices maintain consistent animation speed

### Edge Cases to Cover
- Tab visibility change (requestAnimationFrame pauses)
- Delta time capping (prevent physics explosion)
- Multiple start() calls (should not create multiple loops)

### Test Data Requirements
- None required

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-001 | Must complete first | Pending | Need project setup |
| story-002 | Must complete first | Pending | Need renderer for testing |

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

The animation loop is critical infrastructure. It must be rock-solid as all demos depend on it. Consider capping max delta time to ~0.1s to prevent physics issues when returning from an inactive tab.

---

**Workflow**:
- `/dev story-003` to implement
- `/qa story-003` to review
