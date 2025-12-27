---
id: story-015
title: "Wizard Layout (Split-View)"
status: Ready
priority: P0
estimate: M
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard UI
depends_on: [story-001, story-002]
blocks: [story-016, story-017, story-019]
prd_requirement: FR-007, NFR-006
---

# Story: Wizard Layout (Split-View)

## User Story

**As a** learner using the wizard,
**I want to** see the 3D demo and learning content side-by-side,
**So that** I can observe visual effects while reading explanations and code.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Split-view layout displays demo and content simultaneously
  - Given: The wizard is active
  - When: I view the interface
  - Then: Demo viewport and learning panel are both visible side-by-side (FR-007)

- [ ] **AC2**: Layout uses CSS Grid for structure
  - Given: The layout is rendered
  - When: I inspect the CSS
  - Then: CSS Grid is used per ADR-004

- [ ] **AC3**: Layout is responsive to minimum 1024px width
  - Given: The browser window is 1024px wide
  - When: I view the wizard
  - Then: Both panels are visible and usable (NFR-006)

- [ ] **AC4**: Navigation header is visible
  - Given: The wizard is active
  - When: I view the interface
  - Then: A header with step navigation controls is visible

- [ ] **AC5**: Demo viewport contains the 3D canvas
  - Given: The wizard is active
  - When: I view the demo viewport
  - Then: The existing 3D demo renders correctly within it

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create WizardLayout component (AC: 1, 2)
  - [ ] Subtask 1.1: Create `src/wizard-ui/WizardLayout.ts`
  - [ ] Subtask 1.2: Create container element with CSS Grid
  - [ ] Subtask 1.3: Define grid areas: header, viewport, panel, footer
  - [ ] Subtask 1.4: Set 50/50 split for viewport and panel

- [ ] **Task 2**: Style the grid layout (AC: 2, 3)
  - [ ] Subtask 2.1: Add CSS for wizard-layout class
  - [ ] Subtask 2.2: Set min-width: 1024px handling
  - [ ] Subtask 2.3: Make columns flexible (fr units)
  - [ ] Subtask 2.4: Style header and footer areas

- [ ] **Task 3**: Create DemoViewport component (AC: 5)
  - [ ] Subtask 3.1: Create `src/wizard-ui/DemoViewport.ts`
  - [ ] Subtask 3.2: Accept canvas element or create container
  - [ ] Subtask 3.3: Size canvas to fit viewport area
  - [ ] Subtask 3.4: Handle resize events

- [ ] **Task 4**: Create navigation header area (AC: 4)
  - [ ] Subtask 4.1: Create header container element
  - [ ] Subtask 4.2: Add placeholder for step indicator
  - [ ] Subtask 4.3: Add placeholder for prev/next buttons
  - [ ] Subtask 4.4: Style header for visibility

- [ ] **Task 5**: Create learning panel area (AC: 1)
  - [ ] Subtask 5.1: Create panel container element
  - [ ] Subtask 5.2: Add scrollable content area
  - [ ] Subtask 5.3: Style for readability (padding, font size)

- [ ] **Task 6**: Create footer area for tier indicators (AC: 1)
  - [ ] Subtask 6.1: Create footer container element
  - [ ] Subtask 6.2: Add placeholder for tier navigation
  - [ ] Subtask 6.3: Style footer appropriately

- [ ] **Task 7**: Integrate with existing app
  - [ ] Subtask 7.1: Create toggle between playground and wizard modes
  - [ ] Subtask 7.2: Wire canvas to viewport component
  - [ ] Subtask 7.3: Test demo renders in new layout

### Testing Tasks

- [ ] **Test Task 1**: Verify grid layout renders correctly
- [ ] **Test Task 2**: Verify 1024px minimum width works
- [ ] **Test Task 3**: Verify canvas renders in viewport
- [ ] **Test Task 4**: Verify resize handling works

---

## Technical Notes

### Architecture Reference
- **Component**: WizardLayout, DemoViewport
- **Section**: Components - Wizard Layout, Demo Viewport
- **Patterns**: Composition for layout structure

### Implementation Approach
Per ADR-004, use CSS Grid for the main layout. The layout structure from Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  [◀ Prev]   Step 3 of 15: Particle Emission    [Next ▶]     │
├───────────────────────────────┬─────────────────────────────┤
│                               │                             │
│      3D Demo Viewport         │      Learning Panel         │
│      (Canvas + Controls)      │      (Content + Code)       │
│                               │                             │
├───────────────────────────────┴─────────────────────────────┤
│  ● Micro Concepts    ○ Medium Concepts    ○ Advanced        │
└─────────────────────────────────────────────────────────────┘
```

### API Contracts
```typescript
class WizardLayout {
  constructor(container: HTMLElement);
  getViewportContainer(): HTMLElement;
  getPanelContainer(): HTMLElement;
  getHeaderContainer(): HTMLElement;
  getFooterContainer(): HTMLElement;
  dispose(): void;
}

class DemoViewport {
  constructor(container: HTMLElement);
  attachCanvas(canvas: HTMLCanvasElement): void;
  resize(): void;
  dispose(): void;
}
```

### Files Likely Affected
- `src/wizard-ui/WizardLayout.ts` - new file
- `src/wizard-ui/DemoViewport.ts` - new file
- `src/wizard-ui/index.ts` - new file
- `src/style.css` - wizard layout styles
- `index.html` - wizard container

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
1. **Happy Path**: Layout renders with all areas visible
2. **Error Case**: Very narrow viewport shows appropriate message
3. **Edge Case**: Window resize updates layout correctly

### Edge Cases to Cover
- Browser at exactly 1024px
- Very tall narrow viewport
- Rapid resize events

### Test Data Requirements
- None - layout structure testing

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-001 | Must complete first | Done | Project setup |
| story-002 | Must complete first | Done | Need renderer for canvas |

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

This story creates the visual structure for the wizard experience. Per ADR-004, we use CSS Grid without a draggable splitter for simplicity. The 50/50 split provides equal space for both the demo and learning content.

The layout must accommodate the existing demo rendering without modification to the demo layer.

---

**Workflow**:
- `/dev story-015` to implement
- `/qa story-015` to review
