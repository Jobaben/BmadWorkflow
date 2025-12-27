---
id: story-015
title: "Wizard Layout (Split-View)"
status: Done
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

- [x] **Task 1**: Create WizardLayout component (AC: 1, 2)
  - [x] Subtask 1.1: Create `src/wizard-ui/WizardLayout.ts`
  - [x] Subtask 1.2: Create container element with CSS Grid
  - [x] Subtask 1.3: Define grid areas: header, viewport, panel, footer
  - [x] Subtask 1.4: Set 50/50 split for viewport and panel

- [x] **Task 2**: Style the grid layout (AC: 2, 3)
  - [x] Subtask 2.1: Add CSS for wizard-layout class
  - [x] Subtask 2.2: Set min-width: 1024px handling
  - [x] Subtask 2.3: Make columns flexible (fr units)
  - [x] Subtask 2.4: Style header and footer areas

- [x] **Task 3**: Create DemoViewport component (AC: 5)
  - [x] Subtask 3.1: Create `src/wizard-ui/DemoViewport.ts`
  - [x] Subtask 3.2: Accept canvas element or create container
  - [x] Subtask 3.3: Size canvas to fit viewport area
  - [x] Subtask 3.4: Handle resize events

- [x] **Task 4**: Create navigation header area (AC: 4)
  - [x] Subtask 4.1: Create header container element
  - [x] Subtask 4.2: Add placeholder for step indicator
  - [x] Subtask 4.3: Add placeholder for prev/next buttons
  - [x] Subtask 4.4: Style header for visibility

- [x] **Task 5**: Create learning panel area (AC: 1)
  - [x] Subtask 5.1: Create panel container element
  - [x] Subtask 5.2: Add scrollable content area
  - [x] Subtask 5.3: Style for readability (padding, font size)

- [x] **Task 6**: Create footer area for tier indicators (AC: 1)
  - [x] Subtask 6.1: Create footer container element
  - [x] Subtask 6.2: Add placeholder for tier navigation
  - [x] Subtask 6.3: Style footer appropriately

- [x] **Task 7**: Integrate with existing app
  - [x] Subtask 7.1: Create toggle between playground and wizard modes
  - [x] Subtask 7.2: Wire canvas to viewport component
  - [x] Subtask 7.3: Test demo renders in new layout

### Testing Tasks

- [x] **Test Task 1**: Verify grid layout renders correctly
- [x] **Test Task 2**: Verify 1024px minimum width works
- [x] **Test Task 3**: Verify canvas renders in viewport
- [x] **Test Task 4**: Verify resize handling works

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

- **Model**: Claude Opus 4.5
- **Session Date**: 2025-12-27
- **Tasks Completed**: All 7 implementation tasks and 4 testing tasks
- **Implementation Notes**: Created WizardLayout and DemoViewport components following ADR-004 CSS Grid pattern. Components are exported via wizard-ui/index.ts. Added wizard-app container to index.html for future wizard mode toggle.

### Decisions Made
- [Decision 1: Inline CSS injection]: Each component injects its own styles via getXxxStyles() functions for self-containment and lazy loading, matching the pattern established by CodeDisplay.
- [Decision 2: ResizeObserver for DemoViewport]: Used ResizeObserver API for efficient viewport resize detection instead of polling or window resize events.
- [Decision 3: Tier navigation in footer]: Added micro/medium/advanced tier buttons in footer with active state toggling for future wizard navigation.

### Issues Encountered
- [Issue 1: Unused import in CodeSnippetEngine]: Fixed unused `isLineFocused` import causing TypeScript error.

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/wizard-ui/WizardLayout.ts` - Split-view layout component with CSS Grid, navigation header, and tier footer
- `src/wizard-ui/DemoViewport.ts` - Demo canvas container with resize handling
- `tests/wizard-ui/WizardLayout.test.ts` - Unit tests for WizardLayout component
- `tests/wizard-ui/DemoViewport.test.ts` - Unit tests for DemoViewport component

### Modified Files
- `src/wizard-ui/index.ts` - Added exports for WizardLayout and DemoViewport
- `src/style.css` - Added wizard-app and mode-toggle styles
- `index.html` - Added wizard-app container for wizard mode
- `src/wizard/CodeSnippetEngine.ts` - Removed unused import

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-27 | - | Ready | Scrum | Created |
| 2025-12-27 | Ready | In Progress | Dev | Implementation started |
| 2025-12-27 | In Progress | In Review | Dev | Implementation complete |
| 2025-12-28 | In Review | QA Pass | QA | All AC verified |
| 2025-12-28 | QA Pass | Done | User | Story completed |

---

## Notes

This story creates the visual structure for the wizard experience. Per ADR-004, we use CSS Grid without a draggable splitter for simplicity. The 50/50 split provides equal space for both the demo and learning content.

The layout must accommodate the existing demo rendering without modification to the demo layer.

---

**Workflow**:
- `/dev story-015` to implement
- `/qa story-015` to review
