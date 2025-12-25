---
id: story-010
title: "Control Panel"
status: Ready
priority: P2
estimate: M
created: 2025-12-25
updated: 2025-12-25
assignee:
pr_link:
epic: Integration & Polish
depends_on: [story-005, story-007, story-008, story-009]
blocks: [story-012]
prd_requirement: FR-008
---

# Story: Control Panel

## User Story

**As a** developer experimenting with 3D animations,
**I want to** adjust animation parameters in real-time,
**So that** I can see how changes affect behavior and learn through experimentation.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Control panel shows parameters for active demo
  - Given: A demo is selected
  - When: I view the control panel
  - Then: I see adjustable controls for that demo's parameters

- [ ] **AC2**: Parameter changes take effect immediately
  - Given: A demo is running
  - When: I adjust a parameter value
  - Then: The demo behavior changes immediately

- [ ] **AC3**: Different control types for different parameters
  - Given: Various parameter types exist
  - When: I view controls
  - Then: Numbers have sliders, booleans have checkboxes, enums have dropdowns

- [ ] **AC4**: Default values are visible
  - Given: Parameters have defaults
  - When: I view controls
  - Then: I can see or restore original values

- [ ] **AC5**: Control panel updates when switching demos
  - Given: Demo A is active with its controls
  - When: I switch to Demo B
  - Then: Controls update to show Demo B's parameters

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create ControlPanel class (AC: 1)
  - [ ] Subtask 1.1: Create `src/ui/ControlPanel.ts`
  - [ ] Subtask 1.2: Accept container element in constructor
  - [ ] Subtask 1.3: Initialize lil-gui instance

- [ ] **Task 2**: Implement parameter schema rendering (AC: 1, 3)
  - [ ] Subtask 2.1: Accept ParameterSchema array
  - [ ] Subtask 2.2: Create slider for number types
  - [ ] Subtask 2.3: Create checkbox for boolean types
  - [ ] Subtask 2.4: Create dropdown for select types
  - [ ] Subtask 2.5: Set min/max/step for sliders

- [ ] **Task 3**: Implement value change callbacks (AC: 2)
  - [ ] Subtask 3.1: Emit events on value change
  - [ ] Subtask 3.2: Ensure changes are synchronous
  - [ ] Subtask 3.3: Debounce rapid slider movements

- [ ] **Task 4**: Implement default value display (AC: 4)
  - [ ] Subtask 4.1: Store default values from schema
  - [ ] Subtask 4.2: Add "Reset to defaults" button
  - [ ] Subtask 4.3: Emit reset event

- [ ] **Task 5**: Implement demo switching (AC: 5)
  - [ ] Subtask 5.1: Create setParameters() method
  - [ ] Subtask 5.2: Clear existing controls
  - [ ] Subtask 5.3: Rebuild controls for new schema

- [ ] **Task 6**: Integrate with DemoController
  - [ ] Subtask 6.1: Wire control panel to demo parameter updates
  - [ ] Subtask 6.2: Update controls when demo switches
  - [ ] Subtask 6.3: Test with Particle, Object, and Fluid demos

- [ ] **Task 7**: Style the control panel
  - [ ] Subtask 7.1: Position panel (top-right corner)
  - [ ] Subtask 7.2: Ensure readable on dark background
  - [ ] Subtask 7.3: Collapse/expand capability (lil-gui built-in)

### Testing Tasks

- [ ] **Test Task 1**: Verify controls match parameter schema
- [ ] **Test Task 2**: Verify changes affect demo immediately
- [ ] **Test Task 3**: Verify controls update on demo switch
- [ ] **Test Task 4**: Verify reset restores defaults

---

## Technical Notes

### Architecture Reference
- **Component**: ControlPanel
- **Section**: Components - Control Panel
- **Patterns**: Observer pattern for value changes

### Implementation Approach
Use lil-gui library (lightweight dat.gui fork) for the control interface. It handles the UI complexity and provides a familiar interface. Each demo provides its ParameterSchema[], and the ControlPanel renders appropriate controls.

### API Contracts
```typescript
// From Architecture
interface ParameterSchema {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: any;
}

// ControlPanel interface
class ControlPanel {
  constructor(container: HTMLElement);
  setParameters(schema: ParameterSchema[]): void;
  onParameterChange(callback: (key: string, value: any) => void): void;
  onReset(callback: () => void): void;
  dispose(): void;
}
```

### Files Likely Affected
- `src/ui/ControlPanel.ts` - new file
- `src/app/DemoController.ts` - integration
- `src/style.css` - lil-gui customization if needed

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
1. **Happy Path**: Adjust slider, see demo change immediately
2. **Error Case**: Invalid value clamped to min/max
3. **Edge Case**: Very rapid slider movement handled smoothly

### Edge Cases to Cover
- Extreme parameter values
- Switching demos while adjusting
- Reset during animation

### Test Data Requirements
- Parameter schemas from each demo

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-005 | Must complete first | Pending | Need UI shell |
| story-007 | Should complete first | Pending | Need Particle parameters |
| story-008 | Should complete first | Pending | Need Object parameters |
| story-009 | Should complete first | Pending | Need Fluid parameters |

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

FR-008 is a "Should" priority requirement, so this story enables experimentation but isn't strictly required for core functionality. The lil-gui library makes this straightforward to implement while providing a professional-looking interface.

---

**Workflow**:
- `/dev story-010` to implement
- `/qa story-010` to review
