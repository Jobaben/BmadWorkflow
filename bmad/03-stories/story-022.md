---
id: story-022
title: "Wizard Content (Object & Fluid Concepts)"
status: Ready
priority: P2
estimate: L
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard Content
depends_on: [story-021]
blocks: [story-023]
prd_requirement: FR-001, FR-002, FR-003, FR-006
---

# Story: Wizard Content (Object & Fluid Concepts)

## User Story

**As a** learner using the wizard,
**I want to** learn object animation and fluid physics concepts,
**So that** I can understand 3D transformations and physics simulation principles.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Object animation concepts are defined across all tiers
  - Given: The wizard content exists
  - When: I view object concepts
  - Then: I see rotation, orbit, bounce, wave, and scale animation concepts (FR-006)

- [ ] **AC2**: Fluid physics concepts are defined across all tiers
  - Given: The wizard content exists
  - When: I view fluid concepts
  - Then: I see SPH basics, forces, boundaries, and optimization concepts (FR-006)

- [ ] **AC3**: Each step has code snippets from actual demo files
  - Given: An object or fluid concept step
  - When: I view the code
  - Then: It displays actual code from ObjectDemo.ts or FluidDemo.ts (FR-002)

- [ ] **AC4**: Each step has explanatory annotations
  - Given: A concept step with code
  - When: I view the code
  - Then: Key lines have annotations explaining the concept (FR-003)

- [ ] **AC5**: Parameter bindings work for each demo
  - Given: I am on a step with adjustable parameters
  - When: I adjust a parameter
  - Then: The code highlights and demo updates (FR-005)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Define Object Animation Micro concepts (AC: 1)
  - [ ] Subtask 1.1: Create step: "3D Transformations Basics" (position, rotation, scale)
  - [ ] Subtask 1.2: Create step: "The Mesh Object" (geometry + material)
  - [ ] Subtask 1.3: Create step: "Delta Time for Smooth Animation"
  - [ ] Subtask 1.4: Create step: "Rotation Animation" (quaternions, euler angles)

- [ ] **Task 2**: Define Object Animation Medium concepts (AC: 1)
  - [ ] Subtask 2.1: Create step: "Orbital Motion" (trigonometry for circles)
  - [ ] Subtask 2.2: Create step: "Bounce Animation" (easing functions)
  - [ ] Subtask 2.3: Create step: "Wave Motion" (sine waves, phase offsets)
  - [ ] Subtask 2.4: Create step: "Scale Animation" (pulsing effects)

- [ ] **Task 3**: Define Object Animation Advanced concepts (AC: 1)
  - [ ] Subtask 3.1: Create step: "Multiple Animation Types" (switching modes)
  - [ ] Subtask 3.2: Create step: "Input-Driven Animation" (mouse/keyboard control)
  - [ ] Subtask 3.3: Create step: "Object Groups and Hierarchies"

- [ ] **Task 4**: Define Fluid Physics Micro concepts (AC: 2)
  - [ ] Subtask 4.1: Create step: "What is SPH?" (simplified explanation)
  - [ ] Subtask 4.2: Create step: "Fluid Particles" (particle data structure)
  - [ ] Subtask 4.3: Create step: "Gravity and Basic Motion"
  - [ ] Subtask 4.4: Create step: "InstancedMesh for Performance"

- [ ] **Task 5**: Define Fluid Physics Medium concepts (AC: 2)
  - [ ] Subtask 5.1: Create step: "Boundary Collisions" (container walls)
  - [ ] Subtask 5.2: Create step: "Density Calculation" (counting neighbors)
  - [ ] Subtask 5.3: Create step: "Pressure Forces" (pushing apart when crowded)
  - [ ] Subtask 5.4: Create step: "Viscosity" (smoothing velocities)

- [ ] **Task 6**: Define Fluid Physics Advanced concepts (AC: 2)
  - [ ] Subtask 6.1: Create step: "Spatial Hashing" (efficient neighbor lookup)
  - [ ] Subtask 6.2: Create step: "Mouse Interaction" (stirring the fluid)
  - [ ] Subtask 6.3: Create step: "Performance Tuning" (balancing quality/speed)

- [ ] **Task 7**: Write code snippet references (AC: 3)
  - [ ] Subtask 7.1: Analyze ObjectDemo.ts for relevant code regions
  - [ ] Subtask 7.2: Analyze FluidDemo.ts for relevant code regions
  - [ ] Subtask 7.3: Create CodeSnippetRef for each concept

- [ ] **Task 8**: Write annotations (AC: 4)
  - [ ] Subtask 8.1: Write annotations for object concepts
  - [ ] Subtask 8.2: Write annotations for fluid concepts
  - [ ] Subtask 8.3: Include "Real SPH does this differently..." notes for fluid

- [ ] **Task 9**: Define parameter bindings (AC: 5)
  - [ ] Subtask 9.1: Map object parameters (speed, amplitude, count)
  - [ ] Subtask 9.2: Map fluid parameters (gravity, viscosity, particle count)

- [ ] **Task 10**: Register content in ConceptRegistry
  - [ ] Subtask 10.1: Create `src/wizard-data/steps/object-steps.ts`
  - [ ] Subtask 10.2: Create `src/wizard-data/steps/fluid-steps.ts`
  - [ ] Subtask 10.3: Update wizard-data/index.ts

### Testing Tasks

- [ ] **Test Task 1**: Verify all object steps load correctly
- [ ] **Test Task 2**: Verify all fluid steps load correctly
- [ ] **Test Task 3**: Verify annotations render correctly
- [ ] **Test Task 4**: Verify parameter bindings work

---

## Technical Notes

### Architecture Reference
- **Component**: Concept Registry (content)
- **Section**: Wizard Step Interface
- **Patterns**: Static TypeScript data per ADR-005

### Implementation Approach
Follow the same pattern as particle concepts. Object concepts teach transformations and animation math. Fluid concepts teach physics simulation with explicit notes about simplifications from real SPH.

### Suggested Step Structure

**Object Animation:**
- Micro: transformations, mesh, delta time, rotation (4 steps)
- Medium: orbit, bounce, wave, scale (4 steps)
- Advanced: multi-type, input-driven, groups (3 steps)

**Fluid Physics:**
- Micro: what is SPH, particles, gravity, instanced mesh (4 steps)
- Medium: boundaries, density, pressure, viscosity (4 steps)
- Advanced: spatial hash, interaction, performance (3 steps)

### Files Likely Affected
- `src/wizard-data/steps/object-steps.ts` - new file
- `src/wizard-data/steps/fluid-steps.ts` - new file
- `src/wizard-data/index.ts` - add steps

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
1. **Happy Path**: Navigate through object and fluid steps
2. **Error Case**: Step with complex code block renders correctly
3. **Edge Case**: Switching between demo types in wizard

### Edge Cases to Cover
- Demo switching during learning
- Complex fluid algorithm explanations
- Math-heavy animation explanations

### Test Data Requirements
- All object and fluid WizardStep objects

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-021 | Must complete first | Ready | Follow same patterns |

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
| 2025-12-27 | - | Ready | Scrum | Created |

---

## Notes

This story completes the core learning content for the wizard. The fluid physics content should be especially careful to explain what "real" SPH does differently - this is an educational simplification, and learners should know that.

Object animation concepts teach fundamental 3D math that applies to any graphics work. Fluid physics demonstrates more advanced simulation techniques.

---

**Workflow**:
- `/dev story-022` to implement
- `/qa story-022` to review
