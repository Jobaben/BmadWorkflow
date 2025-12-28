---
id: story-018
title: "Demo Adapter for Wizard Integration"
status: QA Pass
priority: P0
estimate: S
created: 2025-12-27
updated: 2025-12-28
assignee:
pr_link:
epic: Wizard Core
depends_on: [story-007, story-008, story-009, story-011, story-013]
blocks: [story-019]
prd_requirement: FR-007
---

# Story: Demo Adapter for Wizard Integration

## User Story

**As a** wizard system,
**I want to** control the existing demos through a clean interface,
**So that** the wizard layer can switch demos and adjust parameters without modifying demo code.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [x] **AC1**: Adapter can load any demo type
  - Given: A wizard step specifies a demo type
  - When: loadDemoForStep is called
  - Then: The correct demo is loaded and ready

- [x] **AC2**: Adapter forwards parameter changes
  - Given: A demo is loaded
  - When: setParameter is called
  - Then: The underlying demo receives the parameter change

- [x] **AC3**: Adapter can reset the demo
  - Given: A demo is running with modifications
  - When: resetDemo is called
  - Then: The demo returns to initial state

- [x] **AC4**: Adapter provides scene objects
  - Given: A demo is loaded
  - When: getSceneObjects is called
  - Then: The demo's Three.js objects are returned for rendering

- [x] **AC5**: Adapter manages demo lifecycle
  - Given: Switching between demos
  - When: A new demo is loaded
  - Then: The previous demo is properly stopped and cleaned up

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create DemoAdapter class (AC: 1, 5)
  - [x] Subtask 1.1: Create `src/wizard/DemoAdapter.ts`
  - [x] Subtask 1.2: Accept demo factories/constructors
  - [x] Subtask 1.3: Track currently active demo
  - [x] Subtask 1.4: Implement loadDemoForStep(step: WizardStep)

- [x] **Task 2**: Implement demo switching (AC: 1, 5)
  - [x] Subtask 2.1: Stop current demo before switching
  - [x] Subtask 2.2: Clear current demo's scene objects
  - [x] Subtask 2.3: Create new demo instance
  - [x] Subtask 2.4: Start new demo
  - [x] Subtask 2.5: Emit demoLoaded event

- [x] **Task 3**: Implement parameter forwarding (AC: 2)
  - [x] Subtask 3.1: Implement setParameter(key: string, value: any)
  - [x] Subtask 3.2: Forward to active demo's setParameter
  - [x] Subtask 3.3: Handle parameter not found gracefully

- [x] **Task 4**: Implement reset functionality (AC: 3)
  - [x] Subtask 4.1: Implement resetDemo()
  - [x] Subtask 4.2: Call active demo's reset method
  - [x] Subtask 4.3: Reset parameters to defaults

- [x] **Task 5**: Implement scene object access (AC: 4)
  - [x] Subtask 5.1: Implement getSceneObjects(): Object3D[]
  - [x] Subtask 5.2: Return active demo's scene objects
  - [x] Subtask 5.3: Handle no demo loaded case

- [x] **Task 6**: Implement input forwarding
  - [x] Subtask 6.1: Implement onInput(state: InputState)
  - [x] Subtask 6.2: Forward to active demo's onInput
  - [x] Subtask 6.3: Implement update(deltaTime: number)

### Testing Tasks

- [x] **Test Task 1**: Verify demo loading works for all demo types
- [x] **Test Task 2**: Verify parameter changes reach demo
- [x] **Test Task 3**: Verify demo reset works
- [x] **Test Task 4**: Verify clean switching between demos

---

## Technical Notes

### Architecture Reference
- **Component**: Demo Adapter
- **Section**: Components - Demo Adapter
- **Patterns**: Adapter pattern wrapping existing demos

### Implementation Approach
The DemoAdapter is the integration boundary between the wizard layer and the demo layer. It wraps the existing Demo interface and provides a wizard-friendly API. This allows the wizard to control demos without knowledge of their internal implementation.

### API Contracts
```typescript
class DemoAdapter {
  constructor(demos: Map<DemoType, () => Demo>);
  loadDemoForStep(step: WizardStep): void;
  setParameter(key: string, value: unknown): void;
  resetDemo(): void;
  getSceneObjects(): Object3D[];
  update(deltaTime: number): void;
  onInput(state: InputState): void;
  getCurrentDemo(): Demo | null;
  getCurrentDemoType(): DemoType | null;
  dispose(): void;
}
```

### Files Likely Affected
- `src/wizard/DemoAdapter.ts` - new file

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
1. **Happy Path**: Load particle demo, adjust parameters, switch to fluid demo
2. **Error Case**: Load unknown demo type, graceful error
3. **Edge Case**: Rapid demo switching

### Edge Cases to Cover
- Load same demo type twice
- Reset during demo transition
- Parameter set before demo loaded

### Test Data Requirements
- Mock demos for testing

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-007 | Must complete first | Done | Need ParticleDemo |
| story-008 | Must complete first | Done | Need ObjectDemo |
| story-009 | Must complete first | Done | Need FluidDemo |
| story-011 | Must complete first | Done | Need CombinedDemo |
| story-013 | Must complete first | Ready | Need WizardStep type |

---

## Dev Agent Record

> Populated by Dev agent during implementation

- **Model**: Claude Opus 4.5
- **Session Date**: 2025-12-28
- **Tasks Completed**: All 6 implementation tasks and 4 testing tasks
- **Implementation Notes**: Implemented DemoAdapter using the Adapter pattern to wrap existing demos. Uses factory functions for demo creation, enabling lazy instantiation. Added event system for demo lifecycle notifications. Handles edge cases like rapid switching, disposed state, and missing demos gracefully.

### Decisions Made
- Used Map<DemoType, DemoFactory> for demo registration to enable lazy instantiation
- Added event system (demoLoaded, demoUnloaded, error) for lifecycle notifications
- When same demo type is loaded again, reset instead of recreate for efficiency
- Added helper methods (hasDemo, supportsDemoType, getSupportedDemoTypes) for better API

### Issues Encountered
- None significant - clean implementation following existing patterns

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/wizard/DemoAdapter.ts` - DemoAdapter class with full demo lifecycle management
- `tests/wizard/DemoAdapter.test.ts` - Unit tests (34 tests covering all acceptance criteria)

### Modified Files
- `src/wizard/index.ts` - Added DemoAdapter exports

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-27 | - | Ready | Scrum | Created |
| 2025-12-28 | Ready | In Progress | Dev | Started implementation |
| 2025-12-28 | In Progress | In Review | Dev | Implementation complete, 34 tests passing |
| 2025-12-28 | In Review | QA Pass | QA | All acceptance criteria verified |

---

## Notes

This story implements the Adapter pattern from ADR-001 (Layered Architecture). The DemoAdapter ensures the existing demo code remains unchanged while the wizard layer can control it. This separation of concerns is critical for maintainability.

---

**Workflow**:
- `/dev story-018` to implement
- `/qa story-018` to review
