---
id: story-007
title: "Particle Demo"
status: Done
priority: P1
estimate: L
created: 2025-12-25
updated: 2025-12-26
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

- [x] **AC1**: Particles are generated continuously
  - Given: The particle demo is running
  - When: I observe the display
  - Then: New particles are being emitted from a source point

- [x] **AC2**: Particles move and decay over time
  - Given: Particles exist in the scene
  - When: Time passes
  - Then: Particles move according to velocity and disappear after their lifetime

- [x] **AC3**: Mouse interaction affects particles
  - Given: The demo is running
  - When: I move my mouse
  - Then: Particles respond (e.g., attraction, repulsion, or emission point moves)

- [x] **AC4**: Demo implements the Demo interface
  - Given: ParticleDemo class exists
  - When: I check its implementation
  - Then: It implements start(), stop(), update(dt), reset(), onInput(), getSceneObjects()

- [x] **AC5**: Performance remains smooth
  - Given: Many particles are active
  - When: I check the FPS
  - Then: Frame rate stays above 30fps (NFR-001)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create ParticleDemo class (AC: 4)
  - [x] Subtask 1.1: Create `src/demos/ParticleDemo.ts`
  - [x] Subtask 1.2: Implement Demo interface
  - [x] Subtask 1.3: Add lifecycle methods (start, stop, reset)

- [x] **Task 2**: Set up particle geometry (AC: 1)
  - [x] Subtask 2.1: Create BufferGeometry for particles
  - [x] Subtask 2.2: Create Points object with appropriate material
  - [x] Subtask 2.3: Set up position attribute buffer

- [x] **Task 3**: Implement particle emission (AC: 1)
  - [x] Subtask 3.1: Create emitter at origin
  - [x] Subtask 3.2: Use ObjectPool for particle data
  - [x] Subtask 3.3: Emit particles based on emission rate
  - [x] Subtask 3.4: Assign initial velocity (spread/cone pattern)

- [x] **Task 4**: Implement particle update loop (AC: 2)
  - [x] Subtask 4.1: Apply gravity/forces to velocity
  - [x] Subtask 4.2: Update positions from velocities
  - [x] Subtask 4.3: Update age and check lifetime
  - [x] Subtask 4.4: Recycle dead particles via pool

- [x] **Task 5**: Update geometry each frame (AC: 2)
  - [x] Subtask 5.1: Update position buffer from particle data
  - [x] Subtask 5.2: Mark geometry for GPU upload
  - [x] Subtask 5.3: Optionally update color/size based on age

- [x] **Task 6**: Implement mouse interaction (AC: 3)
  - [x] Subtask 6.1: Read input state in update
  - [x] Subtask 6.2: Move emission point to mouse world position
  - [x] Subtask 6.3: Optionally add attractor/repulsor at mouse

- [x] **Task 7**: Implement parameter schema (AC: 4)
  - [x] Subtask 7.1: Define adjustable parameters (emission rate, lifetime, etc.)
  - [x] Subtask 7.2: Implement getParameterSchema()
  - [x] Subtask 7.3: Implement setParameter()

- [x] **Task 8**: Performance optimization (AC: 5)
  - [x] Subtask 8.1: Ensure ObjectPool is used (no allocations)
  - [x] Subtask 8.2: Cap max particle count
  - [x] Subtask 8.3: Test with max particles, verify 30+ FPS

### Testing Tasks

- [x] **Test Task 1**: Verify particles appear and move
- [x] **Test Task 2**: Verify particles disappear after lifetime
- [x] **Test Task 3**: Verify mouse interaction affects particles
- [x] **Test Task 4**: Verify 30+ FPS with max particles

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

- **Model**: Claude Opus 4.5
- **Session Date**: 2025-12-26
- **Tasks Completed**: All 8 implementation tasks and 4 testing tasks
- **Implementation Notes**: Created a complete particle system with Three.js Points and BufferGeometry, integrated ObjectPool for memory-efficient particle lifecycle management, implemented all Demo interface methods

### Decisions Made
- Used internal ParticleData interface instead of public Particle type for pool management efficiency
- Set MAX_PARTICLES to 5000 to balance visual richness with performance
- Particles emit in a cone pattern for a fountain-like effect
- Mouse-down triggers an attractor effect using inverse-square distance
- Particles fade and shrink as they age for visual polish

### Issues Encountered
- Initial test failures for particle decay when demo stopped: Fixed by allowing update() to run particle decay even when emission is stopped
- TypeScript build error for unused Particle import: Removed unused import

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/demos/ParticleDemo.ts` - Main particle demo implementation with Demo interface, ObjectPool integration, BufferGeometry rendering
- `src/demos/index.ts` - Export file for demos module
- `tests/demos/ParticleDemo.test.ts` - 38 unit tests covering all acceptance criteria

### Modified Files
- None

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-25 | - | Ready | Scrum | Created |
| 2025-12-26 | Ready | In Progress | Dev | Implementation started |
| 2025-12-26 | In Progress | In Review | Dev | Implementation complete, all tests passing |
| 2025-12-26 | In Review | QA Pass | QA | All acceptance criteria verified, code quality approved |

---

## Notes

This is the first major demo module and directly addresses PRD FR-001 (Particle System Demonstration). It serves as the pattern for other demo implementations. Document the code thoroughly for learning purposes.

Start with a simple fountain effect. Parameters allow experimentation with different behaviors.

---

**Workflow**:
- `/dev story-007` to implement
- `/qa story-007` to review
