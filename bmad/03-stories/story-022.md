---
id: story-022
title: "Wizard Content (Object & Fluid Concepts)"
status: QA Pass
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

- [x] **AC1**: Object animation concepts are defined across all tiers
  - Given: The wizard content exists
  - When: I view object concepts
  - Then: I see rotation, orbit, bounce, wave, and scale animation concepts (FR-006)

- [x] **AC2**: Fluid physics concepts are defined across all tiers
  - Given: The wizard content exists
  - When: I view fluid concepts
  - Then: I see SPH basics, forces, boundaries, and optimization concepts (FR-006)

- [x] **AC3**: Each step has code snippets from actual demo files
  - Given: An object or fluid concept step
  - When: I view the code
  - Then: It displays actual code from ObjectDemo.ts or FluidDemo.ts (FR-002)

- [x] **AC4**: Each step has explanatory annotations
  - Given: A concept step with code
  - When: I view the code
  - Then: Key lines have annotations explaining the concept (FR-003)

- [x] **AC5**: Parameter bindings work for each demo
  - Given: I am on a step with adjustable parameters
  - When: I adjust a parameter
  - Then: The code highlights and demo updates (FR-005)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Define Object Animation Micro concepts (AC: 1)
  - [x] Subtask 1.1: Create step: "3D Transformations Basics" (position, rotation, scale)
  - [x] Subtask 1.2: Create step: "The Mesh Object" (geometry + material)
  - [x] Subtask 1.3: Create step: "Delta Time for Smooth Animation"
  - [x] Subtask 1.4: Create step: "Rotation Animation" (quaternions, euler angles)

- [x] **Task 2**: Define Object Animation Medium concepts (AC: 1)
  - [x] Subtask 2.1: Create step: "Orbital Motion" (trigonometry for circles)
  - [x] Subtask 2.2: Create step: "Bounce Animation" (easing functions)
  - [x] Subtask 2.3: Create step: "Wave Motion" (sine waves, phase offsets)
  - [x] Subtask 2.4: Create step: "Scale Animation" (pulsing effects)

- [x] **Task 3**: Define Object Animation Advanced concepts (AC: 1)
  - [x] Subtask 3.1: Create step: "Multiple Animation Types" (switching modes)
  - [x] Subtask 3.2: Create step: "Input-Driven Animation" (mouse/keyboard control)
  - [x] Subtask 3.3: Create step: "Object Groups and Hierarchies"

- [x] **Task 4**: Define Fluid Physics Micro concepts (AC: 2)
  - [x] Subtask 4.1: Create step: "What is SPH?" (simplified explanation)
  - [x] Subtask 4.2: Create step: "Fluid Particles" (particle data structure)
  - [x] Subtask 4.3: Create step: "Gravity and Basic Motion"
  - [x] Subtask 4.4: Create step: "InstancedMesh for Performance"

- [x] **Task 5**: Define Fluid Physics Medium concepts (AC: 2)
  - [x] Subtask 5.1: Create step: "Boundary Collisions" (container walls)
  - [x] Subtask 5.2: Create step: "Density Calculation" (counting neighbors)
  - [x] Subtask 5.3: Create step: "Pressure Forces" (pushing apart when crowded)
  - [x] Subtask 5.4: Create step: "Viscosity" (smoothing velocities)

- [x] **Task 6**: Define Fluid Physics Advanced concepts (AC: 2)
  - [x] Subtask 6.1: Create step: "Spatial Hashing" (efficient neighbor lookup)
  - [x] Subtask 6.2: Create step: "Mouse Interaction" (stirring the fluid)
  - [x] Subtask 6.3: Create step: "Performance Tuning" (balancing quality/speed)

- [x] **Task 7**: Write code snippet references (AC: 3)
  - [x] Subtask 7.1: Analyze ObjectDemo.ts for relevant code regions
  - [x] Subtask 7.2: Analyze FluidDemo.ts for relevant code regions
  - [x] Subtask 7.3: Create CodeSnippetRef for each concept

- [x] **Task 8**: Write annotations (AC: 4)
  - [x] Subtask 8.1: Write annotations for object concepts
  - [x] Subtask 8.2: Write annotations for fluid concepts
  - [x] Subtask 8.3: Include "Real SPH does this differently..." notes for fluid

- [x] **Task 9**: Define parameter bindings (AC: 5)
  - [x] Subtask 9.1: Map object parameters (speed, amplitude, count)
  - [x] Subtask 9.2: Map fluid parameters (gravity, viscosity, particle count)

- [x] **Task 10**: Register content in ConceptRegistry
  - [x] Subtask 10.1: Create `src/wizard-data/steps/object-steps.ts`
  - [x] Subtask 10.2: Create `src/wizard-data/steps/fluid-steps.ts`
  - [x] Subtask 10.3: Update wizard-data/index.ts

### Testing Tasks

- [x] **Test Task 1**: Verify all object steps load correctly
- [x] **Test Task 2**: Verify all fluid steps load correctly
- [x] **Test Task 3**: Verify annotations render correctly
- [x] **Test Task 4**: Verify parameter bindings work

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

- **Model**: Claude Opus 4.5
- **Session Date**: 2025-12-28
- **Tasks Completed**: All 10 implementation tasks + 4 testing tasks
- **Implementation Notes**: Created 22 wizard steps (11 object + 11 fluid). Each step includes code snippets referencing actual demo line numbers, educational annotations explaining concepts/patterns/tips/warnings, and parameter bindings for interactive controls. Fluid steps include SPH simplification warnings.

### Decisions Made
- Used actual line numbers from ObjectDemo.ts (635 lines) and FluidDemo.ts (864 lines)
- Object steps cover transformations, mesh, delta time, rotation, orbit, bounce, wave, scale, multi-type, input-driven, groups
- Fluid steps cover SPH intro, particles, gravity, instanced mesh, boundaries, density, pressure, viscosity, spatial hash, interaction, performance
- Included "Real SPH does this differently" warnings in fluid steps
- Created comprehensive helper functions (getMicroObjectSteps, getMediumFluidSteps, etc.)

### Issues Encountered
- Unused import errors: Removed unused tier helper imports from index.ts
- Test updates needed: Updated particle-steps tests to expect 35 total steps (13+11+11) instead of 13

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/wizard-data/steps/object-steps.ts` - 11 object animation wizard steps
- `src/wizard-data/steps/fluid-steps.ts` - 11 fluid physics wizard steps
- `tests/wizard-data/object-steps.test.ts` - 22 unit tests for object steps
- `tests/wizard-data/fluid-steps.test.ts` - 26 unit tests for fluid steps

### Modified Files
- `src/wizard-data/index.ts` - Added object and fluid step imports/exports, updated helper functions
- `tests/wizard-data/particle-steps.test.ts` - Updated tests to expect 35 total steps

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-27 | - | Ready | Scrum | Created |
| 2025-12-28 | Ready | In Progress | Dev | Started implementation |
| 2025-12-28 | In Progress | In Review | Dev | Implementation complete, 87 tests passing |
| 2025-12-28 | In Review | QA Pass | QA | All ACs verified, code quality approved |

---

## Notes

This story completes the core learning content for the wizard. The fluid physics content should be especially careful to explain what "real" SPH does differently - this is an educational simplification, and learners should know that.

Object animation concepts teach fundamental 3D math that applies to any graphics work. Fluid physics demonstrates more advanced simulation techniques.

---

**Workflow**:
- `/dev story-022` to implement
- `/qa story-022` to review
