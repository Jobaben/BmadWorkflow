---
id: story-020
title: "Parameter Code Linker"
status: Ready
priority: P1
estimate: M
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard Core
depends_on: [story-013, story-014, story-019]
blocks: [story-021]
prd_requirement: FR-005
---

# Story: Parameter Code Linker

## User Story

**As a** learner adjusting demo parameters,
**I want to** see which code is affected when I change a slider,
**So that** I understand the connection between UI controls and implementation.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Parameter controls show code variable names
  - Given: I am viewing a step with adjustable parameters
  - When: I look at a parameter control
  - Then: I can see which code variable it affects (FR-005)

- [ ] **AC2**: Adjusting a parameter highlights related code
  - Given: I am viewing code and parameter controls
  - When: I adjust a parameter
  - Then: The related code line is highlighted (FR-005)

- [ ] **AC3**: Hovering parameter shows code location
  - Given: I am viewing parameter controls
  - When: I hover over a parameter
  - Then: The code section is emphasized

- [ ] **AC4**: Visual effect changes in real-time
  - Given: I am adjusting a parameter
  - When: I move the slider
  - Then: The 3D demo updates immediately (FR-005)

- [ ] **AC5**: Parameter explanation is visible
  - Given: I am viewing a parameter control
  - When: I look at the control
  - Then: I see a brief explanation of what it does

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create ParameterCodeLinker class (AC: 1, 2, 3)
  - [ ] Subtask 1.1: Create `src/wizard/ParameterCodeLinker.ts`
  - [ ] Subtask 1.2: Accept LearningPanel reference
  - [ ] Subtask 1.3: Accept DemoAdapter reference
  - [ ] Subtask 1.4: Store ParameterBinding mappings

- [ ] **Task 2**: Create enhanced parameter controls (AC: 1, 5)
  - [ ] Subtask 2.1: Create `src/wizard-ui/ParameterControl.ts`
  - [ ] Subtask 2.2: Display parameter label and variable name
  - [ ] Subtask 2.3: Display parameter explanation
  - [ ] Subtask 2.4: Create slider/checkbox/dropdown based on type

- [ ] **Task 3**: Implement code highlighting on focus (AC: 2, 3)
  - [ ] Subtask 3.1: Add focus/hover listeners to controls
  - [ ] Subtask 3.2: On focus, call highlightCodeForParameter(key)
  - [ ] Subtask 3.3: Communicate with LearningPanel to highlight lines
  - [ ] Subtask 3.4: Add visual transition for highlight

- [ ] **Task 4**: Implement code highlighting on change (AC: 2)
  - [ ] Subtask 4.1: Add change listener to controls
  - [ ] Subtask 4.2: Animate code highlight on value change
  - [ ] Subtask 4.3: Clear highlight after brief delay

- [ ] **Task 5**: Wire parameter changes to demo (AC: 4)
  - [ ] Subtask 5.1: On parameter change, call DemoAdapter.setParameter
  - [ ] Subtask 5.2: Ensure changes are immediate
  - [ ] Subtask 5.3: Handle edge values gracefully

- [ ] **Task 6**: Integrate with LearningPanel (AC: 2, 3)
  - [ ] Subtask 6.1: Render controls in panel's parameter section
  - [ ] Subtask 6.2: Update controls when step changes
  - [ ] Subtask 6.3: Clear controls when step has no parameters

- [ ] **Task 7**: Style parameter controls
  - [ ] Subtask 7.1: Style controls to match learning panel
  - [ ] Subtask 7.2: Add code variable name styling
  - [ ] Subtask 7.3: Style highlight animation

### Testing Tasks

- [ ] **Test Task 1**: Verify code highlights on parameter focus
- [ ] **Test Task 2**: Verify code highlights on parameter change
- [ ] **Test Task 3**: Verify demo updates when parameter changes
- [ ] **Test Task 4**: Verify explanations are visible

---

## Technical Notes

### Architecture Reference
- **Component**: Parameter Code Linker
- **Section**: Components - Parameter Code Linker
- **Patterns**: Observer pattern for parameter events

### Implementation Approach
The ParameterCodeLinker bridges parameter UI controls with code display and demo updates. It uses the ParameterBinding data from WizardStep to know which code lines correspond to which parameters.

### API Contracts
```typescript
interface ParameterBinding {
  parameterKey: string;
  codeLocation: CodeSnippetRef;
  variableName: string;
  explanation: string;
}

class ParameterCodeLinker {
  constructor(panel: LearningPanel, adapter: DemoAdapter);
  setBindings(bindings: ParameterBinding[]): void;
  onParameterFocus(key: string): void;
  onParameterChange(key: string, value: unknown): void;
  highlightCodeForParameter(key: string): void;
  dispose(): void;
}
```

### Files Likely Affected
- `src/wizard/ParameterCodeLinker.ts` - new file
- `src/wizard-ui/ParameterControl.ts` - new file
- `src/wizard-ui/LearningPanel.ts` - integration

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
1. **Happy Path**: Adjust slider, see code highlight and demo change
2. **Error Case**: Parameter with no code binding still works
3. **Edge Case**: Rapid slider adjustments

### Edge Cases to Cover
- Parameters with no code location
- Multiple parameters affecting same code region
- Extreme parameter values

### Test Data Requirements
- WizardStep with ParameterBinding data

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-013 | Must complete first | Ready | Need ParameterBinding type |
| story-014 | Must complete first | Ready | Need code highlight capability |
| story-019 | Must complete first | Ready | Need WizardController integration |

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

This story directly addresses FR-005 (Live Parameter Connection), which is a MUST priority. The goal is to help learners understand that the slider they're moving corresponds to a specific variable in the code. This "aha" moment is central to the learning experience.

---

**Workflow**:
- `/dev story-020` to implement
- `/qa story-020` to review
