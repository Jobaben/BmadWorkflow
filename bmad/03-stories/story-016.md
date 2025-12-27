---
id: story-016
title: "Wizard Navigator Component"
status: Ready
priority: P0
estimate: S
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard UI
depends_on: [story-013, story-015]
blocks: [story-019]
prd_requirement: FR-001, FR-004, FR-006
---

# Story: Wizard Navigator Component

## User Story

**As a** learner using the wizard,
**I want to** navigate between learning steps with clear progress indication,
**So that** I can follow the recommended path or jump to specific topics.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Previous and Next buttons navigate between steps
  - Given: I am on a wizard step
  - When: I click Previous or Next
  - Then: I navigate to the adjacent step (FR-001)

- [ ] **AC2**: Current step position is clearly shown
  - Given: I am viewing the wizard
  - When: I look at the navigation
  - Then: I see my current position (e.g., "Step 3 of 15") (FR-001)

- [ ] **AC3**: Step title is displayed
  - Given: I am on a wizard step
  - When: I look at the navigation
  - Then: I see the current step's title

- [ ] **AC4**: Concept list allows direct navigation
  - Given: I want to jump to a specific topic
  - When: I view the concept list
  - Then: I can click on any step to navigate directly (FR-004)

- [ ] **AC5**: Complexity tier is indicated
  - Given: I am viewing the concept list
  - When: I look at each step
  - Then: I can see its complexity tier (micro/medium/advanced) (FR-006)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create WizardNavigator class (AC: 1, 2, 3)
  - [ ] Subtask 1.1: Create `src/wizard-ui/WizardNavigator.ts`
  - [ ] Subtask 1.2: Accept container element in constructor
  - [ ] Subtask 1.3: Create Previous button
  - [ ] Subtask 1.4: Create Next button
  - [ ] Subtask 1.5: Create step indicator display

- [ ] **Task 2**: Implement navigation controls (AC: 1)
  - [ ] Subtask 2.1: Add click handler for Previous button
  - [ ] Subtask 2.2: Add click handler for Next button
  - [ ] Subtask 2.3: Disable Previous on first step
  - [ ] Subtask 2.4: Disable Next on last step
  - [ ] Subtask 2.5: Emit navigation events via callback

- [ ] **Task 3**: Implement step indicator (AC: 2, 3)
  - [ ] Subtask 3.1: Display "Step X of Y"
  - [ ] Subtask 3.2: Display current step title
  - [ ] Subtask 3.3: Update on step change

- [ ] **Task 4**: Create concept list/dropdown (AC: 4, 5)
  - [ ] Subtask 4.1: Create expandable concept list
  - [ ] Subtask 4.2: Display all available steps
  - [ ] Subtask 4.3: Show complexity tier badge for each step
  - [ ] Subtask 4.4: Highlight current step in list
  - [ ] Subtask 4.5: Add click handler for direct navigation

- [ ] **Task 5**: Create tier filter (AC: 5)
  - [ ] Subtask 5.1: Create tier tab/radio buttons (Micro, Medium, Advanced)
  - [ ] Subtask 5.2: Filter concept list by tier when clicked
  - [ ] Subtask 5.3: Show count of steps per tier

- [ ] **Task 6**: Style the navigator (AC: 1, 2, 4)
  - [ ] Subtask 6.1: Style navigation buttons prominently
  - [ ] Subtask 6.2: Style step indicator for readability
  - [ ] Subtask 6.3: Style concept list dropdown
  - [ ] Subtask 6.4: Style tier badges with distinct colors

### Testing Tasks

- [ ] **Test Task 1**: Verify prev/next navigation works
- [ ] **Test Task 2**: Verify step indicator updates correctly
- [ ] **Test Task 3**: Verify direct navigation from concept list
- [ ] **Test Task 4**: Verify tier filtering works

---

## Technical Notes

### Architecture Reference
- **Component**: Wizard Navigator
- **Section**: Components - Wizard Navigator
- **Patterns**: Observer pattern for navigation events

### Implementation Approach
Create a self-contained navigation component that receives step data from ConceptRegistry and emits navigation events. The component should be decoupled from the WizardController for testability.

### API Contracts
```typescript
class WizardNavigator {
  constructor(container: HTMLElement);
  setSteps(steps: WizardStep[]): void;
  setCurrentStep(step: WizardStep): void;
  onNavigate(callback: (stepId: string) => void): void;
  dispose(): void;
}
```

### Files Likely Affected
- `src/wizard-ui/WizardNavigator.ts` - new file
- `src/style.css` - navigator styles

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
1. **Happy Path**: Navigate forward through all steps, navigate back
2. **Error Case**: Click next on last step (button disabled)
3. **Edge Case**: Jump to advanced topic, then back to micro

### Edge Cases to Cover
- First step (no previous)
- Last step (no next)
- Single step only
- Rapid click handling

### Test Data Requirements
- WizardStep array from ConceptRegistry

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-013 | Must complete first | Ready | Need WizardStep type |
| story-015 | Must complete first | Ready | Need layout container |

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

This story implements FR-001 (Wizard Navigation) and FR-004 (Flexible Navigation). The navigator provides both linear progression (prev/next) and random access (concept list). NFR-003 requires navigation to be intuitive within 30 seconds for first-time users, so buttons should be prominent and clearly labeled.

---

**Workflow**:
- `/dev story-016` to implement
- `/qa story-016` to review
