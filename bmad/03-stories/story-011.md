---
id: story-011
title: "Combined Demo"
status: Done
priority: P2
estimate: M
created: 2025-12-25
updated: 2025-12-27
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

- [x] **AC1**: All three animation types visible simultaneously
  - Given: The combined demo is loaded
  - When: I view the display
  - Then: I see particles, animated objects, and fluid elements together

- [x] **AC2**: Each system operates correctly
  - Given: All systems are running together
  - When: I observe the scene
  - Then: Each system behaves as it does in isolation

- [x] **AC3**: Systems don't interfere with each other
  - Given: All systems are running
  - When: I observe over time
  - Then: No visual glitches, conflicts, or performance degradation

- [x] **AC4**: User interaction works on appropriate elements
  - Given: The combined scene is active
  - When: I interact with the scene
  - Then: Appropriate elements respond (configurable which ones)

- [x] **AC5**: Performance is acceptable
  - Given: All systems running together
  - When: I check FPS
  - Then: Frame rate stays above 30fps (may require reduced complexity)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create CombinedDemo class (AC: 1)
  - [x] Subtask 1.1: Create `src/demos/CombinedDemo.ts`
  - [x] Subtask 1.2: Implement Demo interface
  - [x] Subtask 1.3: Instantiate ParticleDemo, ObjectDemo, FluidDemo internally

- [x] **Task 2**: Configure spatial arrangement (AC: 2, 3)
  - [x] Subtask 2.1: Position particle emitter in one area
  - [x] Subtask 2.2: Position animated objects in another area
  - [x] Subtask 2.3: Position fluid container in third area
  - [x] Subtask 2.4: Ensure no spatial overlap

- [x] **Task 3**: Coordinate update loops (AC: 2)
  - [x] Subtask 3.1: Call update on all sub-demos each frame
  - [x] Subtask 3.2: Pass same delta time to all
  - [x] Subtask 3.3: Verify timing consistency

- [x] **Task 4**: Aggregate scene objects (AC: 1)
  - [x] Subtask 4.1: Implement getSceneObjects() returning all sub-demo objects
  - [x] Subtask 4.2: Add to scene correctly
  - [x] Subtask 4.3: Handle cleanup on stop/reset

- [x] **Task 5**: Configure input routing (AC: 4)
  - [x] Subtask 5.1: Determine which demo receives input
  - [x] Subtask 5.2: Route input based on mouse position
  - [x] Subtask 5.3: Or route to all demos simultaneously

- [x] **Task 6**: Reduce complexity for performance (AC: 5)
  - [x] Subtask 6.1: Use lower particle counts than individual demos
  - [x] Subtask 6.2: Use simpler fluid (fewer particles)
  - [x] Subtask 6.3: Use fewer animated objects
  - [x] Subtask 6.4: Test combined performance, tune as needed

- [x] **Task 7**: Implement lifecycle methods
  - [x] Subtask 7.1: start() starts all sub-demos
  - [x] Subtask 7.2: stop() stops all sub-demos
  - [x] Subtask 7.3: reset() resets all sub-demos

- [x] **Task 8**: Implement parameter schema
  - [x] Subtask 8.1: Expose limited subset of parameters
  - [x] Subtask 8.2: Or group parameters by sub-demo
  - [x] Subtask 8.3: Implement set/get for parameters

### Testing Tasks

- [x] **Test Task 1**: Verify all three demo types are visible
- [x] **Test Task 2**: Verify no visual glitches or conflicts
- [x] **Test Task 3**: Verify 30+ FPS with combined scene
- [x] **Test Task 4**: Verify interaction works as expected

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

- **Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Session Date**: 2025-12-27
- **Tasks Completed**: All 8 implementation tasks and 4 testing tasks
- **Implementation Notes**: Created CombinedDemo using composition pattern. Each sub-demo is positioned in a separate region (particles left, objects center, fluid right) to prevent visual overlap. Used reduced complexity settings for performance.

### Decisions Made
- [Spatial Layout]: Used horizontal arrangement with X offsets (-3, 0, +3) for clear visual separation
- [Input Routing]: Routed input to all sub-demos with offset adjustment for mouse world position
- [Parameter Prefixes]: Used prefixes (particle_, object_, fluid_) to namespace parameters by sub-demo
- [Reduced Complexity]: 50% particle emission rate, 4 objects instead of 8, 100 fluid particles instead of 200

### Issues Encountered
- [None]: Implementation proceeded without significant issues

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/demos/CombinedDemo.ts` - Main CombinedDemo class implementing composition pattern with all three sub-demos
- `tests/demos/CombinedDemo.test.ts` - Comprehensive test suite with 38 tests covering all acceptance criteria

### Modified Files
- `src/demos/index.ts` - Added export for CombinedDemo
- `src/main.ts` - Updated to import and use real CombinedDemo instead of placeholder

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-25 | - | Ready | Scrum | Created |
| 2025-12-27 | Ready | In Progress | Dev | Started implementation |
| 2025-12-27 | In Progress | In Review | Dev | Completed - all tests passing (319 total, 38 new for CombinedDemo) |
| 2025-12-27 | In Review | Done | QA | QA Pass - all ACs verified, architecture aligned, code quality approved |

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
