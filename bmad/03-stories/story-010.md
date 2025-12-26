---
id: story-010
title: "Control Panel"
status: In Review
priority: P2
estimate: M
created: 2025-12-25
updated: 2025-12-26
assignee: Claude Opus 4.5
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

- [x] **AC1**: Control panel shows parameters for active demo
  - Given: A demo is selected
  - When: I view the control panel
  - Then: I see adjustable controls for that demo's parameters

- [x] **AC2**: Parameter changes take effect immediately
  - Given: A demo is running
  - When: I adjust a parameter value
  - Then: The demo behavior changes immediately

- [x] **AC3**: Different control types for different parameters
  - Given: Various parameter types exist
  - When: I view controls
  - Then: Numbers have sliders, booleans have checkboxes, enums have dropdowns

- [x] **AC4**: Default values are visible
  - Given: Parameters have defaults
  - When: I view controls
  - Then: I can see or restore original values

- [x] **AC5**: Control panel updates when switching demos
  - Given: Demo A is active with its controls
  - When: I switch to Demo B
  - Then: Controls update to show Demo B's parameters

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create ControlPanel class (AC: 1)
  - [x] Subtask 1.1: Create `src/ui/ControlPanel.ts`
  - [x] Subtask 1.2: Accept container element in constructor
  - [x] Subtask 1.3: Initialize lil-gui instance

- [x] **Task 2**: Implement parameter schema rendering (AC: 1, 3)
  - [x] Subtask 2.1: Accept ParameterSchema array
  - [x] Subtask 2.2: Create slider for number types
  - [x] Subtask 2.3: Create checkbox for boolean types
  - [x] Subtask 2.4: Create dropdown for select types
  - [x] Subtask 2.5: Set min/max/step for sliders

- [x] **Task 3**: Implement value change callbacks (AC: 2)
  - [x] Subtask 3.1: Emit events on value change
  - [x] Subtask 3.2: Ensure changes are synchronous
  - [x] Subtask 3.3: Debounce rapid slider movements

- [x] **Task 4**: Implement default value display (AC: 4)
  - [x] Subtask 4.1: Store default values from schema
  - [x] Subtask 4.2: Add "Reset to defaults" button
  - [x] Subtask 4.3: Emit reset event

- [x] **Task 5**: Implement demo switching (AC: 5)
  - [x] Subtask 5.1: Create setParameters() method
  - [x] Subtask 5.2: Clear existing controls
  - [x] Subtask 5.3: Rebuild controls for new schema

- [x] **Task 6**: Integrate with DemoController
  - [x] Subtask 6.1: Wire control panel to demo parameter updates
  - [x] Subtask 6.2: Update controls when demo switches
  - [x] Subtask 6.3: Test with Particle, Object, and Fluid demos

- [x] **Task 7**: Style the control panel
  - [x] Subtask 7.1: Position panel (top-right corner)
  - [x] Subtask 7.2: Ensure readable on dark background
  - [x] Subtask 7.3: Collapse/expand capability (lil-gui built-in)

### Testing Tasks

- [x] **Test Task 1**: Verify controls match parameter schema
- [x] **Test Task 2**: Verify changes affect demo immediately
- [x] **Test Task 3**: Verify controls update on demo switch
- [x] **Test Task 4**: Verify reset restores defaults

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

- **Model**: Claude Opus 4.5
- **Session Date**: 2025-12-26
- **Tasks Completed**: All 7 implementation tasks + 4 testing tasks
- **Implementation Notes**: Created ControlPanel component using lil-gui library. Integrated with demo switching and parameter change callbacks. Added 26 unit tests covering all acceptance criteria.

### Decisions Made
- Used lil-gui's built-in features for control rendering: The library handles sliders, checkboxes, and dropdowns automatically based on parameter types
- Implemented debouncing for number controls: Prevents excessive updates during rapid slider movements (16ms debounce delay)
- Reset functionality emits both reset callback and individual parameter change callbacks: Ensures demos can respond to resets appropriately

### Issues Encountered
- lil-gui requires window.matchMedia: Added mock in test file to handle jsdom environment
- Demo switching required clearing and recreating GUI: Implemented by destroying and recreating the GUI instance on setParameters()

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/ui/ControlPanel.ts` - ControlPanel component with lil-gui integration
- `tests/ui/ControlPanel.test.ts` - 26 unit tests for ControlPanel

### Modified Files
- `src/ui/index.ts` - Added ControlPanel export
- `src/main.ts` - Integrated ControlPanel with demos and demo switching
- `src/style.css` - Added CSS for control panel positioning and lil-gui styling
- `index.html` - Added control-panel-container element

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-25 | - | Ready | Scrum | Created |
| 2025-12-26 | Ready | In Progress | Dev | Started implementation |
| 2025-12-26 | In Progress | In Review | Dev | Implementation complete |

---

## Notes

FR-008 is a "Should" priority requirement, so this story enables experimentation but isn't strictly required for core functionality. The lil-gui library makes this straightforward to implement while providing a professional-looking interface.

---

**Workflow**:
- `/dev story-010` to implement
- `/qa story-010` to review
