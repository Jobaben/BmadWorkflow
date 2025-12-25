---
id: story-011
title: "Combined Demo"
status: Ready
priority: P2
estimate: M
created: 2025-12-25
updated: 2025-12-25
assignee:
pr_link:
epic: Integration & Polish
depends_on: [story-007, story-008, story-009]
blocks: [story-012]
prd_requirement: FR-007
---

# Story: Combined Demo

## User Story

**As a** developer learning to integrate multiple animation systems,
**I want to** see particles, objects, and physics working together,
**So that** I understand how to combine multiple animation types in a single scene.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: All three animation types visible simultaneously
  - Given: The combined demo is loaded
  - When: I view the display
  - Then: I see particles, animated objects, and fluid elements together

- [ ] **AC2**: Each system operates correctly
  - Given: All systems are running together
  - When: I observe the scene
  - Then: Each system behaves as it does in isolation

- [ ] **AC3**: Systems don't interfere with each other
  - Given: All systems are running
  - When: I observe over time
  - Then: No visual glitches, conflicts, or performance degradation

- [ ] **AC4**: User interaction works on appropriate elements
  - Given: The combined scene is active
  - When: I interact with the scene
  - Then: Appropriate elements respond (configurable which ones)

- [ ] **AC5**: Performance is acceptable
  - Given: All systems running together
  - When: I check FPS
  - Then: Frame rate stays above 30fps (may require reduced complexity)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create CombinedDemo class (AC: 1)
  - [ ] Subtask 1.1: Create `src/demos/CombinedDemo.ts`
  - [ ] Subtask 1.2: Implement Demo interface
  - [ ] Subtask 1.3: Instantiate ParticleDemo, ObjectDemo, FluidDemo internally

- [ ] **Task 2**: Configure spatial arrangement (AC: 2, 3)
  - [ ] Subtask 2.1: Position particle emitter in one area
  - [ ] Subtask 2.2: Position animated objects in another area
  - [ ] Subtask 2.3: Position fluid container in third area
  - [ ] Subtask 2.4: Ensure no spatial overlap

- [ ] **Task 3**: Coordinate update loops (AC: 2)
  - [ ] Subtask 3.1: Call update on all sub-demos each frame
  - [ ] Subtask 3.2: Pass same delta time to all
  - [ ] Subtask 3.3: Verify timing consistency

- [ ] **Task 4**: Aggregate scene objects (AC: 1)
  - [ ] Subtask 4.1: Implement getSceneObjects() returning all sub-demo objects
  - [ ] Subtask 4.2: Add to scene correctly
  - [ ] Subtask 4.3: Handle cleanup on stop/reset

- [ ] **Task 5**: Configure input routing (AC: 4)
  - [ ] Subtask 5.1: Determine which demo receives input
  - [ ] Subtask 5.2: Route input based on mouse position
  - [ ] Subtask 5.3: Or route to all demos simultaneously

- [ ] **Task 6**: Reduce complexity for performance (AC: 5)
  - [ ] Subtask 6.1: Use lower particle counts than individual demos
  - [ ] Subtask 6.2: Use simpler fluid (fewer particles)
  - [ ] Subtask 6.3: Use fewer animated objects
  - [ ] Subtask 6.4: Test combined performance, tune as needed

- [ ] **Task 7**: Implement lifecycle methods
  - [ ] Subtask 7.1: start() starts all sub-demos
  - [ ] Subtask 7.2: stop() stops all sub-demos
  - [ ] Subtask 7.3: reset() resets all sub-demos

- [ ] **Task 8**: Implement parameter schema
  - [ ] Subtask 8.1: Expose limited subset of parameters
  - [ ] Subtask 8.2: Or group parameters by sub-demo
  - [ ] Subtask 8.3: Implement set/get for parameters

### Testing Tasks

- [ ] **Test Task 1**: Verify all three demo types are visible
- [ ] **Test Task 2**: Verify no visual glitches or conflicts
- [ ] **Test Task 3**: Verify 30+ FPS with combined scene
- [ ] **Test Task 4**: Verify interaction works as expected

---

## Technical Notes

### Architecture Reference
- **Component**: CombinedDemo
- **Section**: Components - Combined Demo
- **Patterns**: Composition - CombinedDemo contains instances of other demos

### Implementation Approach
CombinedDemo is a container that orchestrates the three individual demos. It doesn't duplicate their logic—it instantiates and coordinates them. Position each demo in a different region of the scene to avoid visual confusion.

Consider using reduced complexity settings:
- Particles: 50% of standalone count
- Objects: 2-3 instead of full set
- Fluid: 50% of standalone count

### API Contracts
```typescript
// CombinedDemo uses composition
class CombinedDemo implements Demo {
  private particleDemo: ParticleDemo;
  private objectDemo: ObjectDemo;
  private fluidDemo: FluidDemo;

  // Standard Demo interface
  start(): void;
  stop(): void;
  reset(): void;
  update(deltaTime: number): void;
  onInput(state: InputState): void;
  getParameterSchema(): ParameterSchema[];
  setParameter(key: string, value: any): void;
  getSceneObjects(): Object3D[];
}
```

### Files Likely Affected
- `src/demos/CombinedDemo.ts` - new file
- `src/app/DemoController.ts` - registration

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
1. **Happy Path**: All three demos run together smoothly
2. **Error Case**: One sub-demo fails, others continue
3. **Edge Case**: Very low-end device, graceful degradation

### Edge Cases to Cover
- Performance on slower devices
- Memory usage with all demos
- Quick demo switching

### Test Data Requirements
- Reduced-complexity parameters for each sub-demo

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-007 | Must complete first | Pending | Need ParticleDemo |
| story-008 | Must complete first | Pending | Need ObjectDemo |
| story-009 | Must complete first | Pending | Need FluidDemo |

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

FR-007 is a "Should" priority. This demo shows integration patterns that will be valuable for the future car physics product. The key learning is how to manage multiple animation systems in a single scene without conflicts.

Consider a "showcase" layout:
```
+-------------------+
|  Particles        |
|        +----------+
|        | Objects  |
+--------+          |
| Fluid  |          |
+---------+---------+
```

---

**Workflow**:
- `/dev story-011` to implement
- `/qa story-011` to review
