---
id: story-020
title: "Parameter Code Linker"
status: Done
priority: P1
estimate: M
created: 2025-12-27
updated: 2025-12-28
assignee: Dev
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

- [x] **AC1**: Parameter controls show code variable names
  - Given: I am viewing a step with adjustable parameters
  - When: I look at a parameter control
  - Then: I can see which code variable it affects (FR-005)

- [x] **AC2**: Adjusting a parameter highlights related code
  - Given: I am viewing code and parameter controls
  - When: I adjust a parameter
  - Then: The related code line is highlighted (FR-005)

- [x] **AC3**: Hovering parameter shows code location
  - Given: I am viewing parameter controls
  - When: I hover over a parameter
  - Then: The code section is emphasized

- [x] **AC4**: Visual effect changes in real-time
  - Given: I am adjusting a parameter
  - When: I move the slider
  - Then: The 3D demo updates immediately (FR-005)

- [x] **AC5**: Parameter explanation is visible
  - Given: I am viewing a parameter control
  - When: I look at the control
  - Then: I see a brief explanation of what it does

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create ParameterCodeLinker class (AC: 1, 2, 3)
  - [x] Subtask 1.1: Create `src/wizard/ParameterCodeLinker.ts`
  - [x] Subtask 1.2: Accept LearningPanel reference
  - [x] Subtask 1.3: Accept DemoAdapter reference
  - [x] Subtask 1.4: Store ParameterBinding mappings

- [x] **Task 2**: Create enhanced parameter controls (AC: 1, 5)
  - [x] Subtask 2.1: Create `src/wizard-ui/ParameterControl.ts`
  - [x] Subtask 2.2: Display parameter label and variable name
  - [x] Subtask 2.3: Display parameter explanation
  - [x] Subtask 2.4: Create slider/checkbox/dropdown based on type

- [x] **Task 3**: Implement code highlighting on focus (AC: 2, 3)
  - [x] Subtask 3.1: Add focus/hover listeners to controls
  - [x] Subtask 3.2: On focus, call highlightCodeForParameter(key)
  - [x] Subtask 3.3: Communicate with LearningPanel to highlight lines
  - [x] Subtask 3.4: Add visual transition for highlight

- [x] **Task 4**: Implement code highlighting on change (AC: 2)
  - [x] Subtask 4.1: Add change listener to controls
  - [x] Subtask 4.2: Animate code highlight on value change
  - [x] Subtask 4.3: Clear highlight after brief delay

- [x] **Task 5**: Wire parameter changes to demo (AC: 4)
  - [x] Subtask 5.1: On parameter change, call DemoAdapter.setParameter
  - [x] Subtask 5.2: Ensure changes are immediate
  - [x] Subtask 5.3: Handle edge values gracefully

- [x] **Task 6**: Integrate with LearningPanel (AC: 2, 3)
  - [x] Subtask 6.1: Render controls in panel's parameter section
  - [x] Subtask 6.2: Update controls when step changes
  - [x] Subtask 6.3: Clear controls when step has no parameters

- [x] **Task 7**: Style parameter controls
  - [x] Subtask 7.1: Style controls to match learning panel
  - [x] Subtask 7.2: Add code variable name styling
  - [x] Subtask 7.3: Style highlight animation

### Testing Tasks

- [x] **Test Task 1**: Verify code highlights on parameter focus
- [x] **Test Task 2**: Verify code highlights on parameter change
- [x] **Test Task 3**: Verify demo updates when parameter changes
- [x] **Test Task 4**: Verify explanations are visible

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

- **Model**: Claude Opus 4.5
- **Session Date**: 2025-12-28
- **Tasks Completed**: All 7 implementation tasks, all 4 testing tasks
- **Implementation Notes**: Implemented ParameterCodeLinker to bridge parameter UI controls with code display and demo updates. Created ParameterControl UI component with slider, checkbox, select, and color picker support. Integrated with LearningPanel for code line highlighting with CSS animations.

### Decisions Made
- Used observer pattern for parameter events to allow external components to react to focus/blur/change
- Implemented 4 control types (slider, checkbox, select, color) with consistent styling
- Added CSS animations for parameter-code highlight connection feedback
- Used Map for efficient binding lookups by parameter key

### Issues Encountered
- JSDOM doesn't properly fire range input value setters: Fixed by testing internal state (getValue) instead of DOM element properties

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/wizard/ParameterCodeLinker.ts` - Core linker bridging parameter controls with code display
- `src/wizard-ui/ParameterControl.ts` - Interactive UI controls with variable name display
- `tests/wizard/ParameterCodeLinker.test.ts` - Unit tests (23 tests)
- `tests/wizard-ui/ParameterControl.test.ts` - Unit tests (29 tests)

### Modified Files
- `src/wizard-ui/LearningPanel.ts` - Added parameter control integration and code line highlighting
- `src/wizard/index.ts` - Added ParameterCodeLinker exports
- `src/wizard-ui/index.ts` - Added ParameterControl exports
- `tests/wizard-ui/LearningPanel.test.ts` - Updated placeholder text test for new message

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-27 | - | Ready | Scrum | Created |
| 2025-12-28 | Ready | In Progress | Dev | Started implementation |
| 2025-12-28 | In Progress | In Review | Dev | Implementation complete |
| 2025-12-28 | In Review | QA Pass | QA | All acceptance criteria verified |

---

## Notes

This story directly addresses FR-005 (Live Parameter Connection), which is a MUST priority. The goal is to help learners understand that the slider they're moving corresponds to a specific variable in the code. This "aha" moment is central to the learning experience.

---

**Workflow**:
- `/dev story-020` to implement
- `/qa story-020` to review
