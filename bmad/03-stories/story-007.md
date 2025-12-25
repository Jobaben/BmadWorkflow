---
id: story-007
title: "Particle Demo"
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
prd_requirement: FR-001, FR-004
---

# Story: Particle Demo

## User Story

**As a** developer learning 3D animation,
**I want to** see and interact with a working particle system demonstration,
**So that** I understand how particles are created, animated, and destroyed.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Particles are generated continuously
  - Given: The particle demo is running
  - When: I observe the display
  - Then: New particles are being emitted from a source point

- [ ] **AC2**: Particles move and decay over time
  - Given: Particles exist in the scene
  - When: Time passes
  - Then: Particles move according to velocity and disappear after their lifetime

- [ ] **AC3**: Mouse interaction affects particles
  - Given: The demo is running
  - When: I move my mouse
  - Then: Particles respond (e.g., attraction, repulsion, or emission point moves)

- [ ] **AC4**: Demo implements the Demo interface
  - Given: ParticleDemo class exists
  - When: I check its implementation
  - Then: It implements start(), stop(), update(dt), reset(), onInput(), getSceneObjects()

- [ ] **AC5**: Performance remains smooth
  - Given: Many particles are active
  - When: I check the FPS
  - Then: Frame rate stays above 30fps (NFR-001)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create ParticleDemo class (AC: 4)
  - [ ] Subtask 1.1: Create `src/demos/ParticleDemo.ts`
  - [ ] Subtask 1.2: Implement Demo interface
  - [ ] Subtask 1.3: Add lifecycle methods (start, stop, reset)

- [ ] **Task 2**: Set up particle geometry (AC: 1)
  - [ ] Subtask 2.1: Create BufferGeometry for particles
  - [ ] Subtask 2.2: Create Points object with appropriate material
  - [ ] Subtask 2.3: Set up position attribute buffer

- [ ] **Task 3**: Implement particle emission (AC: 1)
  - [ ] Subtask 3.1: Create emitter at origin
  - [ ] Subtask 3.2: Use ObjectPool for particle data
  - [ ] Subtask 3.3: Emit particles based on emission rate
  - [ ] Subtask 3.4: Assign initial velocity (spread/cone pattern)

- [ ] **Task 4**: Implement particle update loop (AC: 2)
  - [ ] Subtask 4.1: Apply gravity/forces to velocity
  - [ ] Subtask 4.2: Update positions from velocities
  - [ ] Subtask 4.3: Update age and check lifetime
  - [ ] Subtask 4.4: Recycle dead particles via pool

- [ ] **Task 5**: Update geometry each frame (AC: 2)
  - [ ] Subtask 5.1: Update position buffer from particle data
  - [ ] Subtask 5.2: Mark geometry for GPU upload
  - [ ] Subtask 5.3: Optionally update color/size based on age

- [ ] **Task 6**: Implement mouse interaction (AC: 3)
  - [ ] Subtask 6.1: Read input state in update
  - [ ] Subtask 6.2: Move emission point to mouse world position
  - [ ] Subtask 6.3: Optionally add attractor/repulsor at mouse

- [ ] **Task 7**: Implement parameter schema (AC: 4)
  - [ ] Subtask 7.1: Define adjustable parameters (emission rate, lifetime, etc.)
  - [ ] Subtask 7.2: Implement getParameterSchema()
  - [ ] Subtask 7.3: Implement setParameter()

- [ ] **Task 8**: Performance optimization (AC: 5)
  - [ ] Subtask 8.1: Ensure ObjectPool is used (no allocations)
  - [ ] Subtask 8.2: Cap max particle count
  - [ ] Subtask 8.3: Test with max particles, verify 30+ FPS

### Testing Tasks

- [ ] **Test Task 1**: Verify particles appear and move
- [ ] **Test Task 2**: Verify particles disappear after lifetime
- [ ] **Test Task 3**: Verify mouse interaction affects particles
- [ ] **Test Task 4**: Verify 30+ FPS with max particles

---

## Technical Notes

### Architecture Reference
- **Component**: ParticleDemo
- **Section**: Components - Particle Demo
- **Patterns**: Object Pool, BufferGeometry for batch rendering

### Implementation Approach
Use Three.js Points with BufferGeometry for efficient rendering of many particles. Store particle data in typed arrays. Use ObjectPool for particle lifecycle management. Update position buffer each frame and mark for GPU upload.

### API Contracts
```typescript
// From Architecture
interface Particle {
  position: Vector3;
  velocity: Vector3;
  age: number;
  lifetime: number;
  size: number;
  color: Color;
  alive: boolean;
}

interface ParticleParams {
  emissionRate: number;      // particles per second
  lifetime: number;          // seconds
  initialSpeed: number;      // units per second
  gravity: Vector3;          // acceleration
  size: number;              // world units
  color: Color;
}
```

### Data Models
```typescript
// Particle data stored in pools/arrays
// Position buffer: Float32Array for GPU upload
// Use index-based access for performance
```

### Files Likely Affected
- `src/demos/ParticleDemo.ts` - new file
- `src/demos/Demo.ts` - base interface (if not in types)
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
1. **Happy Path**: Particles emit, move, disappear on schedule
2. **Error Case**: All particles dead still renders (empty scene)
3. **Edge Case**: Maximum particles reached, emission continues recycling

### Edge Cases to Cover
- Very short lifetime (< 0.1s)
- Very high emission rate
- Mouse outside canvas bounds

### Test Data Requirements
- Default particle parameters

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

This is the first major demo module and directly addresses PRD FR-001 (Particle System Demonstration). It serves as the pattern for other demo implementations. Document the code thoroughly for learning purposes.

Start with a simple fountain effect. Parameters allow experimentation with different behaviors.

---

**Workflow**:
- `/dev story-007` to implement
- `/qa story-007` to review
