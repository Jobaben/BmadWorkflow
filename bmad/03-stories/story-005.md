---
id: story-005
title: "UI Shell & Demo Selector"
status: In Review
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

- [x] **AC1**: Demo selector displays available demos
  - Given: The application is loaded
  - When: I view the UI
  - Then: I see a list of available demos (Particles, Objects, Fluid, Combined)

- [x] **AC2**: Clicking a demo switches the active view
  - Given: The demo selector is visible
  - When: I click on a demo name
  - Then: That demo becomes active and is displayed

- [x] **AC3**: Current selection is visually indicated
  - Given: A demo is selected
  - When: I view the selector
  - Then: The active demo is visually highlighted

- [x] **AC4**: UI does not obstruct the canvas
  - Given: The UI is displayed
  - When: I view the application
  - Then: The UI is positioned to not block the 3D content

- [x] **AC5**: Demo switch emits an event
  - Given: A demo switch occurs
  - When: The new demo is selected
  - Then: An event is emitted that controllers can subscribe to

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create UI shell structure (AC: 4)
  - [x] Subtask 1.1: Update `index.html` with UI container structure
  - [x] Subtask 1.2: Create sidebar or header area for controls
  - [x] Subtask 1.3: Style UI to be overlay on canvas

- [x] **Task 2**: Create DemoSelector component (AC: 1)
  - [x] Subtask 2.1: Create `src/ui/DemoSelector.ts`
  - [x] Subtask 2.2: Accept demo list configuration
  - [x] Subtask 2.3: Generate DOM elements for each demo button

- [x] **Task 3**: Implement selection behavior (AC: 2, 3)
  - [x] Subtask 3.1: Add click handlers to demo buttons
  - [x] Subtask 3.2: Track currently selected demo
  - [x] Subtask 3.3: Apply "active" class to selected button
  - [x] Subtask 3.4: Remove "active" from previously selected

- [x] **Task 4**: Implement event emission (AC: 5)
  - [x] Subtask 4.1: Create onDemoSelect callback mechanism
  - [x] Subtask 4.2: Emit demo selection events
  - [x] Subtask 4.3: Test event subscription

- [x] **Task 5**: Style the UI (AC: 4)
  - [x] Subtask 5.1: Add CSS for demo selector
  - [x] Subtask 5.2: Ensure buttons are clearly visible
  - [x] Subtask 5.3: Add hover states
  - [x] Subtask 5.4: Position in corner (not blocking canvas center)

- [x] **Task 6**: Create DemoType enum
  - [x] Subtask 6.1: Define demo types in `src/types/index.ts`
  - [x] Subtask 6.2: Export for use in selector

### Testing Tasks

- [x] **Test Task 1**: Verify all demo buttons appear
- [x] **Test Task 2**: Verify clicking updates visual selection
- [x] **Test Task 3**: Verify selection event is emitted
- [x] **Test Task 4**: Verify UI doesn't block canvas center

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

- **Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Session Date**: 2025-12-26
- **Tasks Completed**: All 6 implementation tasks, 4 testing tasks
- **Implementation Notes**: Created DemoSelector component following vanilla TypeScript patterns (ADR-002), integrated with main.ts, positioned in top-right corner for non-obtrusive UI

### Decisions Made
- [Decision 1]: Used callback pattern instead of EventTarget for onSelect to keep implementation simple and framework-agnostic
- [Decision 2]: Positioned selector in top-right corner (opposite from FPS display) to keep canvas center clear
- [Decision 3]: Updated DemoType enum values to plural form (Particles, Objects) to match story specification

### Issues Encountered
- [Issue 1]: DemoType enum had singular values (particle, object), updated to plural (particles, objects) to match story API contract

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/ui/DemoSelector.ts` - Main DemoSelector component with callback-based event system
- `tests/ui/DemoSelector.test.ts` - 25 unit tests covering initialization, selection, events, and edge cases

### Modified Files
- `src/types/index.ts` - Added DemoInfo interface, updated DemoType enum values to plural form
- `src/ui/index.ts` - Added DemoSelector and DemoSelectCallback exports
- `src/style.css` - Added UI shell and demo selector styles (positioned top-right, hover states, active state)
- `src/main.ts` - Integrated DemoSelector with demo configuration and event handling
- `index.html` - Added UI shell container and demo-selector-container div

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-25 | - | Ready | Scrum | Created |
| 2025-12-26 | Ready | In Progress | Dev | Started implementation |
| 2025-12-26 | In Progress | In Review | Dev | Implementation complete, 25 unit tests passing |

---

## Notes

Keep the UI minimal and unobtrusive. The focus should be on the 3D content, not the interface. A simple vertical list of buttons in the top-left corner is sufficient.

---

**Workflow**:
- `/dev story-005` to implement
- `/qa story-005` to review
