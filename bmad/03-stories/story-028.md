---
id: story-028
title: "Async Integration & Boundary Documentation"
status: Ready
priority: P0
estimate: S
created: 2025-12-28
updated: 2025-12-28
assignee:
pr_link:
epic: Async Optimization
depends_on: [story-024, story-025, story-026, story-027]
blocks: []
prd_requirement: FR-004, NFR-005
---

# Story: Async Integration & Boundary Documentation

## User Story

**As a** developer,
**I want to** have clear documentation of sync/async boundaries,
**So that** I can extend the codebase consistently without breaking patterns.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Sync/async boundary guidelines are documented
  - Given: A developer wants to add a new feature
  - When: They consult the documentation
  - Then: They can determine whether to use sync or async patterns

- [ ] **AC2**: Existing components are integrated with async infrastructure
  - Given: SyntaxHighlighter is pre-warmable
  - When: ComponentInitializer is used
  - Then: SyntaxHighlighter can register for idle-time initialization

- [ ] **AC3**: Wizard integration uses AsyncContentLoader
  - Given: WizardController navigates to a step
  - When: Content needs loading
  - Then: AsyncContentLoader is used instead of direct sync loading

- [ ] **AC4**: Code comments document zone membership
  - Given: A file in the codebase
  - When: A developer reads it
  - Then: Comments indicate if it's sync zone, async zone, or bridge

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create sync/async boundary documentation (AC: 1)
  - [ ] Subtask 1.1: Create `docs/async-boundaries.md`
  - [ ] Subtask 1.2: Document MUST BE SYNC components and reasons
  - [ ] Subtask 1.3: Document SHOULD BE ASYNC components and reasons
  - [ ] Subtask 1.4: Document decision criteria for ambiguous cases
  - [ ] Subtask 1.5: Include code examples of correct patterns

- [ ] **Task 2**: Make SyntaxHighlighter AsyncInitializable (AC: 2)
  - [ ] Subtask 2.1: Update SyntaxHighlighter to implement AsyncInitializable
  - [ ] Subtask 2.2: Add id, priority, isCritical, isInitialized properties
  - [ ] Subtask 2.3: Ensure initialize() pre-warms the highlighter

- [ ] **Task 3**: Integrate WizardController with async loading (AC: 3)
  - [ ] Subtask 3.1: Inject AsyncContentLoader into WizardController
  - [ ] Subtask 3.2: Update navigation to use loadStep()
  - [ ] Subtask 3.3: Read from ContentBuffer for display
  - [ ] Subtask 3.4: Handle loading states in UI

- [ ] **Task 4**: Add zone documentation comments (AC: 4)
  - [ ] Subtask 4.1: Add zone comments to AnimationLoop.ts (SYNC ZONE)
  - [ ] Subtask 4.2: Add zone comments to InputManager.ts (SYNC ZONE)
  - [ ] Subtask 4.3: Add zone comments to AsyncContentLoader.ts (ASYNC ZONE)
  - [ ] Subtask 4.4: Add zone comments to ContentBuffer.ts (BRIDGE)

- [ ] **Task 5**: Create usage example (AC: 1)
  - [ ] Subtask 5.1: Add example of correct async pattern to docs
  - [ ] Subtask 5.2: Add example of incorrect pattern (anti-pattern)

### Testing Tasks

- [ ] **Test Task 1**: Verify SyntaxHighlighter initializes via ComponentInitializer
- [ ] **Test Task 2**: Verify WizardController uses async loading
- [ ] **Test Task 3**: Integration test: full navigation flow

---

## Technical Notes

### Architecture Reference
- **Component**: All (integration)
- **Section**: Sync/Async Boundary Guidelines
- **Patterns**: Zone documentation, AsyncInitializable

### Implementation Approach
This story ties together all async components and ensures proper documentation. The key deliverables are: (1) documentation that developers can follow, (2) integration of existing components with new async infrastructure.

### Zone Documentation Format
```typescript
/**
 * @zone SYNC
 * @reason Animation frame callback - 16ms budget
 *
 * This file contains synchronous-only code. DO NOT use async/await.
 */
```

### Files Likely Affected
- `docs/async-boundaries.md` - new file
- `src/wizard/SyntaxHighlighter.ts` - add AsyncInitializable
- `src/wizard/WizardController.ts` - integrate async loading
- `src/core/AnimationLoop.ts` - add zone comment
- `src/core/InputManager.ts` - add zone comment
- `src/async/*.ts` - add zone comments

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
1. **Happy Path**: Navigate wizard, content loads async, animation smooth
2. **Error Case**: Content load fails, error handled gracefully
3. **Edge Case**: SyntaxHighlighter pre-warmed before first use

### Edge Cases to Cover
- WizardController before async infrastructure ready
- ComponentInitializer with SyntaxHighlighter
- Rapid navigation during async load

### Test Data Requirements
- Existing wizard test data
- May need performance profiling tools

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-024 | Must complete first | Ready | ContentBuffer |
| story-025 | Must complete first | Ready | LoadingStateManager |
| story-026 | Must complete first | Ready | ComponentInitializer |
| story-027 | Must complete first | Ready | AsyncContentLoader |

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
| 2025-12-28 | - | Ready | Scrum | Created |

---

## Notes

This is the final integration story that brings all async components together. The documentation is critical for FR-004 (sync/async boundary guidelines) and ensures the developer (Dan persona) can confidently extend the codebase.

This story should be implemented last to ensure all dependencies are available for integration.

---

**Workflow**:
- `/dev story-028` to implement
- `/qa story-028` to review
