---
id: story-009
title: "Fluid Demo"
status: Ready
priority: P1
estimate: L
created: 2025-12-25
updated: 2025-12-25
assignee:
pr_link:
epic: Demo Modules
depends_on: [story-002, story-003, story-004, story-006]
blocks: [story-011]
prd_requirement: FR-003, FR-004
---

# Story: Fluid Demo

## User Story

**As a** developer learning physics simulation,
**I want to** see fluid-like physics behavior in a demonstration,
**So that** I understand simulation principles for dynamic effects.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Fluid elements exhibit flowing motion
  - Given: The fluid demo is running
  - When: I observe the display
  - Then: I see elements moving in a fluid-like manner

- [ ] **AC2**: Fluid responds to boundaries
  - Given: Fluid elements are moving
  - When: They encounter container boundaries
  - Then: They respond realistically (bouncing, pooling at bottom)

- [ ] **AC3**: User interaction affects fluid
  - Given: The demo is running
  - When: I click or drag with the mouse
  - Then: The fluid responds to the applied force or disturbance

- [ ] **AC4**: Demo implements the Demo interface
  - Given: FluidDemo class exists
  - When: I check its implementation
  - Then: It implements all required interface methods

- [ ] **AC5**: Performance remains acceptable
  - Given: Many fluid particles are simulated
  - When: I check performance
  - Then: Frame rate stays above 30fps (NFR-001)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create FluidDemo class (AC: 4)
  - [ ] Subtask 1.1: Create `src/demos/FluidDemo.ts`
  - [ ] Subtask 1.2: Implement Demo interface
  - [ ] Subtask 1.3: Add lifecycle methods (start, stop, reset)

- [ ] **Task 2**: Set up particle rendering (AC: 1)
  - [ ] Subtask 2.1: Create InstancedMesh for efficient rendering
  - [ ] Subtask 2.2: Use sphere geometry for fluid particles
  - [ ] Subtask 2.3: Apply semi-transparent blue material

- [ ] **Task 3**: Initialize particle positions (AC: 1)
  - [ ] Subtask 3.1: Create initial particle distribution
  - [ ] Subtask 3.2: Use ObjectPool for particle data
  - [ ] Subtask 3.3: Position particles in upper portion of container

- [ ] **Task 4**: Implement gravity (AC: 1)
  - [ ] Subtask 4.1: Apply downward force to all particles
  - [ ] Subtask 4.2: Update velocities based on gravity
  - [ ] Subtask 4.3: Update positions based on velocities

- [ ] **Task 5**: Implement boundary collision (AC: 2)
  - [ ] Subtask 5.1: Define container boundaries (box)
  - [ ] Subtask 5.2: Detect boundary collision
  - [ ] Subtask 5.3: Apply bounce with damping
  - [ ] Subtask 5.4: Prevent particles from escaping

- [ ] **Task 6**: Implement simplified SPH-like behavior (AC: 1)
  - [ ] Subtask 6.1: Calculate particle density (neighbors count)
  - [ ] Subtask 6.2: Apply simple pressure force (push apart when crowded)
  - [ ] Subtask 6.3: Apply viscosity (average nearby velocities)
  - [ ] Subtask 6.4: Document simplifications from real SPH

- [ ] **Task 7**: Update instanced mesh (AC: 1)
  - [ ] Subtask 7.1: Update transform matrices each frame
  - [ ] Subtask 7.2: Mark instanceMatrix for GPU upload
  - [ ] Subtask 7.3: Optionally color by velocity/pressure

- [ ] **Task 8**: Implement user interaction (AC: 3)
  - [ ] Subtask 8.1: Read input state in update
  - [ ] Subtask 8.2: Apply force at mouse position when clicked
  - [ ] Subtask 8.3: Create "stir" effect on mouse drag

- [ ] **Task 9**: Implement parameter schema (AC: 4)
  - [ ] Subtask 9.1: Define adjustable parameters (viscosity, gravity, count)
  - [ ] Subtask 9.2: Implement getParameterSchema()
  - [ ] Subtask 9.3: Implement setParameter()

- [ ] **Task 10**: Performance optimization (AC: 5)
  - [ ] Subtask 10.1: Use spatial hashing for neighbor lookup
  - [ ] Subtask 10.2: Cap particle count based on performance
  - [ ] Subtask 10.3: Test and tune for 30+ FPS

### Testing Tasks

- [ ] **Test Task 1**: Verify particles flow downward with gravity
- [ ] **Test Task 2**: Verify particles bounce off boundaries
- [ ] **Test Task 3**: Verify particles spread apart (pressure)
- [ ] **Test Task 4**: Verify click interaction applies force
- [ ] **Test Task 5**: Verify 30+ FPS with default particle count

---

## Technical Notes

### Architecture Reference
- **Component**: FluidDemo
- **Section**: Components - Fluid Demo
- **Patterns**: Object Pool, InstancedMesh for batch rendering

### Implementation Approach
Per ADR-004, implement a simplified SPH-like model that looks fluid-like but prioritizes understandability. Use InstancedMesh for efficient rendering of many spheres. Spatial hashing for O(n) neighbor lookup instead of O(n²).

The simulation should feel "wet" and responsive, not physically accurate. Document what real SPH would do differently.

### API Contracts
```typescript
// From Architecture
interface FluidParticle {
  position: Vector3;
  velocity: Vector3;
  density: number;
  pressure: number;
}

interface FluidParams {
  particleCount: number;
  gravity: number;
  viscosity: number;
  restDensity: number;
  boundaryDamping: number;
}
```

### Data Models
```typescript
// Spatial hash for neighbor lookup
class SpatialHash<T> {
  insert(position: Vector3, item: T): void;
  query(position: Vector3, radius: number): T[];
  clear(): void;
}
```

### Files Likely Affected
- `src/demos/FluidDemo.ts` - new file
- `src/utils/SpatialHash.ts` - new file (optional, for performance)
- `src/main.ts` - integration for testing

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
1. **Happy Path**: Particles fall, pool at bottom, spread out, respond to click
2. **Error Case**: All particles at boundary handled correctly
3. **Edge Case**: Very high particle count degrades gracefully

### Edge Cases to Cover
- Particles squeezed into corner
- Very high viscosity (slow motion)
- Zero gravity (floating)

### Test Data Requirements
- Default fluid parameters

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-002 | Must complete first | Pending | Need renderer |
| story-003 | Must complete first | Pending | Need animation loop |
| story-004 | Must complete first | Pending | Need input manager |
| story-006 | Must complete first | Pending | Need object pool |

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

This is the most technically challenging demo. Per ADR-004, we're implementing a simplified model for learning, not a production-grade SPH simulation. The code should have extensive comments explaining:
- What real SPH does
- What simplifications we made
- Why those simplifications are acceptable for learning

Consider starting with just gravity + boundaries, then adding pressure/viscosity in iterations.

---

**Workflow**:
- `/dev story-009` to implement
- `/qa story-009` to review
