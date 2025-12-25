---
id: story-005
title: "UI Shell & Demo Selector"
status: Ready
priority: P1
estimate: S
created: 2025-12-25
updated: 2025-12-25
assignee:
pr_link:
epic: UI Framework
depends_on: [story-001]
blocks: [story-010]
prd_requirement: NFR-003
---

# Story: UI Shell & Demo Selector

## User Story

**As a** developer learning 3D animation concepts,
**I want to** have a simple navigation UI to switch between demos,
**So that** I can easily explore different demonstration types.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Demo selector displays available demos
  - Given: The application is loaded
  - When: I view the UI
  - Then: I see a list of available demos (Particles, Objects, Fluid, Combined)

- [ ] **AC2**: Clicking a demo switches the active view
  - Given: The demo selector is visible
  - When: I click on a demo name
  - Then: That demo becomes active and is displayed

- [ ] **AC3**: Current selection is visually indicated
  - Given: A demo is selected
  - When: I view the selector
  - Then: The active demo is visually highlighted

- [ ] **AC4**: UI does not obstruct the canvas
  - Given: The UI is displayed
  - When: I view the application
  - Then: The UI is positioned to not block the 3D content

- [ ] **AC5**: Demo switch emits an event
  - Given: A demo switch occurs
  - When: The new demo is selected
  - Then: An event is emitted that controllers can subscribe to

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create UI shell structure (AC: 4)
  - [ ] Subtask 1.1: Update `index.html` with UI container structure
  - [ ] Subtask 1.2: Create sidebar or header area for controls
  - [ ] Subtask 1.3: Style UI to be overlay on canvas

- [ ] **Task 2**: Create DemoSelector component (AC: 1)
  - [ ] Subtask 2.1: Create `src/ui/DemoSelector.ts`
  - [ ] Subtask 2.2: Accept demo list configuration
  - [ ] Subtask 2.3: Generate DOM elements for each demo button

- [ ] **Task 3**: Implement selection behavior (AC: 2, 3)
  - [ ] Subtask 3.1: Add click handlers to demo buttons
  - [ ] Subtask 3.2: Track currently selected demo
  - [ ] Subtask 3.3: Apply "active" class to selected button
  - [ ] Subtask 3.4: Remove "active" from previously selected

- [ ] **Task 4**: Implement event emission (AC: 5)
  - [ ] Subtask 4.1: Create onDemoSelect callback mechanism
  - [ ] Subtask 4.2: Emit demo selection events
  - [ ] Subtask 4.3: Test event subscription

- [ ] **Task 5**: Style the UI (AC: 4)
  - [ ] Subtask 5.1: Add CSS for demo selector
  - [ ] Subtask 5.2: Ensure buttons are clearly visible
  - [ ] Subtask 5.3: Add hover states
  - [ ] Subtask 5.4: Position in corner (not blocking canvas center)

- [ ] **Task 6**: Create DemoType enum
  - [ ] Subtask 6.1: Define demo types in `src/types/index.ts`
  - [ ] Subtask 6.2: Export for use in selector

### Testing Tasks

- [ ] **Test Task 1**: Verify all demo buttons appear
- [ ] **Test Task 2**: Verify clicking updates visual selection
- [ ] **Test Task 3**: Verify selection event is emitted
- [ ] **Test Task 4**: Verify UI doesn't block canvas center

---

## Technical Notes

### Architecture Reference
- **Component**: Demo Selector
- **Section**: Components - Demo Selector
- **Patterns**: Observer pattern for selection events

### Implementation Approach
Use vanilla TypeScript and DOM manipulation (ADR-002). No framework needed. Simple button elements with CSS for styling. Event pattern for decoupling from demo loading logic.

### API Contracts
```typescript
// DemoType enum (add to types)
type DemoType = 'particles' | 'objects' | 'fluid' | 'combined';

interface DemoInfo {
  id: DemoType;
  label: string;
  description?: string;
}

// DemoSelector interface
class DemoSelector {
  constructor(container: HTMLElement);
  setDemos(demos: DemoInfo[]): void;
  setSelected(id: DemoType): void;
  onSelect(callback: (id: DemoType) => void): void;
}
```

### Files Likely Affected
- `src/ui/DemoSelector.ts` - new file
- `src/types/index.ts` - DemoType, DemoInfo
- `index.html` - UI container
- `src/style.css` - UI styling

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
1. **Happy Path**: Click demo button, selection updates, event fires
2. **Error Case**: Demo with no handler still updates UI
3. **Edge Case**: Rapid clicking handled gracefully

### Edge Cases to Cover
- Clicking already-selected demo (no-op or re-emit?)
- Very long demo names (text truncation)
- Small screen sizes

### Test Data Requirements
- Demo list with 4 entries

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-001 | Must complete first | Pending | Need project and types |

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

Keep the UI minimal and unobtrusive. The focus should be on the 3D content, not the interface. A simple vertical list of buttons in the top-left corner is sufficient.

---

**Workflow**:
- `/dev story-005` to implement
- `/qa story-005` to review
