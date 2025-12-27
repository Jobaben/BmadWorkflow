---
id: story-019
title: "Wizard Controller (State Machine)"
status: Ready
priority: P0
estimate: M
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard Core
depends_on: [story-013, story-014, story-015, story-016, story-017, story-018]
blocks: [story-020, story-021, story-023]
prd_requirement: FR-001, FR-004
---

# Story: Wizard Controller (State Machine)

## User Story

**As a** developer building the wizard experience,
**I want to** have a central controller managing wizard state and coordinating components,
**So that** step transitions, content updates, and demo changes are synchronized.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Controller manages current step state
  - Given: The wizard is initialized
  - When: I query the current step
  - Then: The correct WizardStep is returned

- [ ] **AC2**: Step navigation updates all components
  - Given: I navigate to a new step
  - When: The transition completes
  - Then: Navigator, LearningPanel, and DemoAdapter are all updated (FR-001)

- [ ] **AC3**: Direct step navigation works
  - Given: I want to jump to a specific step
  - When: I call goToStep(stepId)
  - Then: The wizard navigates directly to that step (FR-004)

- [ ] **AC4**: Step history enables back navigation
  - Given: I have navigated through several steps
  - When: I go back
  - Then: I return to previously visited steps

- [ ] **AC5**: Step change emits events
  - Given: The wizard navigates to a new step
  - When: The step changes
  - Then: An onStepChange event is emitted for subscribers

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create WizardController class (AC: 1)
  - [ ] Subtask 1.1: Create `src/wizard/WizardController.ts`
  - [ ] Subtask 1.2: Accept dependencies (registry, adapter, navigator, panel, engine)
  - [ ] Subtask 1.3: Track currentStepId and stepHistory
  - [ ] Subtask 1.4: Implement getCurrentStep(): WizardStep

- [ ] **Task 2**: Implement step navigation (AC: 1, 2, 3)
  - [ ] Subtask 2.1: Implement goToStep(stepId: string)
  - [ ] Subtask 2.2: Implement nextStep()
  - [ ] Subtask 2.3: Implement previousStep()
  - [ ] Subtask 2.4: Validate step exists before navigation
  - [ ] Subtask 2.5: Update history on each navigation

- [ ] **Task 3**: Coordinate component updates (AC: 2)
  - [ ] Subtask 3.1: Update Navigator with new current step
  - [ ] Subtask 3.2: Fetch code snippets via CodeSnippetEngine
  - [ ] Subtask 3.3: Update LearningPanel with step and code
  - [ ] Subtask 3.4: Load appropriate demo via DemoAdapter
  - [ ] Subtask 3.5: Handle async code loading gracefully

- [ ] **Task 4**: Implement step history (AC: 4)
  - [ ] Subtask 4.1: Push to history on step change
  - [ ] Subtask 4.2: Pop from history on previousStep
  - [ ] Subtask 4.3: Clear forward history on new navigation

- [ ] **Task 5**: Implement event system (AC: 5)
  - [ ] Subtask 5.1: Create onStepChange callback registration
  - [ ] Subtask 5.2: Emit step change events
  - [ ] Subtask 5.3: Include previous and new step in event

- [ ] **Task 6**: Implement initialization
  - [ ] Subtask 6.1: Implement start(initialStepId?: string)
  - [ ] Subtask 6.2: Navigate to first step if not specified
  - [ ] Subtask 6.3: Set up event listeners for Navigator callbacks

- [ ] **Task 7**: Create wizard entry point
  - [ ] Subtask 7.1: Create factory or builder for WizardController
  - [ ] Subtask 7.2: Wire all dependencies together
  - [ ] Subtask 7.3: Create wizard mode toggle in main.ts

### Testing Tasks

- [ ] **Test Task 1**: Verify step state management
- [ ] **Test Task 2**: Verify all components update on navigation
- [ ] **Test Task 3**: Verify direct navigation works
- [ ] **Test Task 4**: Verify history-based back navigation

---

## Technical Notes

### Architecture Reference
- **Component**: Wizard Controller
- **Section**: Components - Wizard Controller
- **Patterns**: State Machine, Mediator pattern

### Implementation Approach
The WizardController is the orchestrator for the wizard experience. It mediates between all components (Navigator, LearningPanel, DemoAdapter, CodeSnippetEngine) and manages the step state machine. Navigation is async due to code snippet loading.

### API Contracts
```typescript
class WizardController {
  constructor(config: {
    registry: ConceptRegistry;
    adapter: DemoAdapter;
    navigator: WizardNavigator;
    panel: LearningPanel;
    engine: CodeSnippetEngine;
  });

  start(initialStepId?: string): Promise<void>;
  goToStep(stepId: string): Promise<void>;
  nextStep(): Promise<void>;
  previousStep(): Promise<void>;
  getCurrentStep(): WizardStep | null;
  onStepChange(callback: (event: StepChangeEvent) => void): void;
  dispose(): void;
}

interface StepChangeEvent {
  previousStep: WizardStep | null;
  currentStep: WizardStep;
}
```

### Files Likely Affected
- `src/wizard/WizardController.ts` - new file
- `src/wizard/index.ts` - exports
- `src/main.ts` - wizard mode integration

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
1. **Happy Path**: Start wizard, navigate next/prev, jump to step
2. **Error Case**: Navigate to non-existent step, graceful error
3. **Edge Case**: Navigate while code is still loading

### Edge Cases to Cover
- Navigation during async code loading
- Back navigation at first step
- Forward navigation at last step
- Rapid navigation clicks

### Test Data Requirements
- Mock components for unit testing
- Full integration test with real components

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-013 | Must complete first | Ready | Need ConceptRegistry |
| story-014 | Must complete first | Ready | Need CodeSnippetEngine |
| story-015 | Must complete first | Ready | Need WizardLayout |
| story-016 | Must complete first | Ready | Need WizardNavigator |
| story-017 | Must complete first | Ready | Need LearningPanel |
| story-018 | Must complete first | Ready | Need DemoAdapter |

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

This is the central orchestrator for the wizard experience. It ties together all wizard components and manages the step state machine. The controller should be testable in isolation using mock dependencies.

This story is a critical integration point - once complete, the basic wizard experience should be functional end-to-end.

---

**Workflow**:
- `/dev story-019` to implement
- `/qa story-019` to review
