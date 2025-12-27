---
id: story-021
title: "Initial Wizard Content (Particle Concepts)"
status: Ready
priority: P1
estimate: L
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard Content
depends_on: [story-019, story-020]
blocks: [story-023]
prd_requirement: FR-001, FR-002, FR-003, FR-006
---

# Story: Initial Wizard Content (Particle Concepts)

## User Story

**As a** learner using the wizard,
**I want to** learn particle system concepts through progressive steps,
**So that** I can understand how to build particle effects from micro-concepts to advanced techniques.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Micro-level particle concepts are defined
  - Given: The wizard content exists
  - When: I view micro concepts
  - Then: I see foundational topics like particle lifecycle, emission, velocity (FR-006)

- [ ] **AC2**: Medium-level particle concepts are defined
  - Given: The wizard content exists
  - When: I view medium concepts
  - Then: I see combined topics like forces, color/size over time, pooling (FR-006)

- [ ] **AC3**: Advanced particle concepts are defined
  - Given: The wizard content exists
  - When: I view advanced concepts
  - Then: I see integration topics like mouse interaction, performance optimization (FR-006)

- [ ] **AC4**: Each step has code snippets from actual ParticleDemo
  - Given: A particle concept step
  - When: I view the code
  - Then: It displays actual code from ParticleDemo.ts (FR-002)

- [ ] **AC5**: Each step has explanatory annotations
  - Given: A particle concept step with code
  - When: I view the code
  - Then: Key lines have annotations explaining the concept (FR-003)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Define Micro particle concepts (AC: 1)
  - [ ] Subtask 1.1: Create step: "What is a Particle?" (particle data structure)
  - [ ] Subtask 1.2: Create step: "Particle Lifecycle" (birth, update, death)
  - [ ] Subtask 1.3: Create step: "Emission Basics" (creating particles over time)
  - [ ] Subtask 1.4: Create step: "Initial Velocity" (direction and spread)
  - [ ] Subtask 1.5: Create step: "BufferGeometry for Particles" (efficient rendering)

- [ ] **Task 2**: Define Medium particle concepts (AC: 2)
  - [ ] Subtask 2.1: Create step: "Applying Forces" (gravity, acceleration)
  - [ ] Subtask 2.2: Create step: "Color Over Lifetime" (fading, color changes)
  - [ ] Subtask 2.3: Create step: "Size Over Lifetime" (growing/shrinking)
  - [ ] Subtask 2.4: Create step: "Object Pooling" (memory efficiency)
  - [ ] Subtask 2.5: Create step: "Particle Materials" (PointsMaterial options)

- [ ] **Task 3**: Define Advanced particle concepts (AC: 3)
  - [ ] Subtask 3.1: Create step: "Mouse Interaction" (attractor/repulsor)
  - [ ] Subtask 3.2: Create step: "Performance Optimization" (max particles, culling)
  - [ ] Subtask 3.3: Create step: "Putting It Together" (complete particle system)

- [ ] **Task 4**: Write code snippet references (AC: 4)
  - [ ] Subtask 4.1: Analyze ParticleDemo.ts for relevant code regions
  - [ ] Subtask 4.2: Create CodeSnippetRef for each concept's code
  - [ ] Subtask 4.3: Define focusLines for key lines

- [ ] **Task 5**: Write annotations (AC: 5)
  - [ ] Subtask 5.1: Write conceptual annotations for each step
  - [ ] Subtask 5.2: Write pattern annotations for framework usage
  - [ ] Subtask 5.3: Write tip annotations for best practices
  - [ ] Subtask 5.4: Ensure annotations explain "why" not just "what"

- [ ] **Task 6**: Define parameter bindings (AC: 4)
  - [ ] Subtask 6.1: Map emissionRate to code location
  - [ ] Subtask 6.2: Map lifetime to code location
  - [ ] Subtask 6.3: Map initialSpeed to code location
  - [ ] Subtask 6.4: Map gravity to code location
  - [ ] Subtask 6.5: Map size to code location

- [ ] **Task 7**: Register content in ConceptRegistry
  - [ ] Subtask 7.1: Create `src/wizard-data/steps/particle-steps.ts`
  - [ ] Subtask 7.2: Export all particle WizardStep objects
  - [ ] Subtask 7.3: Add to registry in wizard-data/index.ts

### Testing Tasks

- [ ] **Test Task 1**: Verify all steps load correctly
- [ ] **Test Task 2**: Verify code snippets extract correctly
- [ ] **Test Task 3**: Verify annotations render at correct lines
- [ ] **Test Task 4**: Verify parameter bindings work

---

## Technical Notes

### Architecture Reference
- **Component**: Concept Registry (content)
- **Section**: Wizard Step Interface, Coding Standards
- **Patterns**: Static TypeScript data per ADR-005

### Implementation Approach
Per Architecture recommendations, start with 5-7 concepts per demo. Organize from micro to advanced. Use actual line numbers from ParticleDemo.ts for code snippets. Annotations should teach framework patterns and explain "why".

### Suggested Step Structure

**Micro Concepts (tier: 'micro'):**
1. particle-what-is - Particle interface and data structure
2. particle-lifecycle - Birth, update, death cycle
3. particle-emission - Creating particles over time
4. particle-velocity - Initial velocity and spread
5. particle-geometry - BufferGeometry for efficient rendering

**Medium Concepts (tier: 'medium'):**
6. particle-forces - Gravity and acceleration
7. particle-color-lifetime - Color changes over time
8. particle-size-lifetime - Size changes over time
9. particle-pooling - Object pool for memory efficiency
10. particle-materials - PointsMaterial configuration

**Advanced Concepts (tier: 'advanced'):**
11. particle-interaction - Mouse attractor/repulsor
12. particle-performance - Optimization techniques
13. particle-complete - Full system integration

### Files Likely Affected
- `src/wizard-data/steps/particle-steps.ts` - new file
- `src/wizard-data/index.ts` - add particle steps

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
1. **Happy Path**: Navigate through all particle steps, see code and annotations
2. **Error Case**: Step with missing code snippet handles gracefully
3. **Edge Case**: Very long annotations render correctly

### Edge Cases to Cover
- Code snippet line numbers change after refactor
- Annotations overlap on same lines
- Very complex code blocks

### Test Data Requirements
- All particle WizardStep objects complete with annotations

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-019 | Must complete first | Ready | Need WizardController for testing |
| story-020 | Must complete first | Ready | Need ParameterCodeLinker for bindings |

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

This story creates the first set of learning content. The particle system is a good starting point because:
- It's foundational to many graphics effects
- The concepts scale from simple to complex
- It demonstrates many Three.js patterns

Focus on quality over quantity - 10-13 well-crafted steps are better than 30 shallow ones. Each annotation should answer "why would I do this?" not just "what does this do?".

---

**Workflow**:
- `/dev story-021` to implement
- `/qa story-021` to review
