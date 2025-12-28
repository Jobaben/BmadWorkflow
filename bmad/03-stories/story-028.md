---
id: story-028
title: "Async Integration & Boundary Documentation"
status: Done
priority: P0
estimate: S
created: 2025-12-28
updated: 2025-12-28
assignee: Dev Agent
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

- [x] **AC1**: Sync/async boundary guidelines are documented
  - Given: A developer wants to add a new feature
  - When: They consult the documentation
  - Then: They can determine whether to use sync or async patterns

- [x] **AC2**: Existing components are integrated with async infrastructure
  - Given: SyntaxHighlighter is pre-warmable
  - When: ComponentInitializer is used
  - Then: SyntaxHighlighter can register for idle-time initialization

- [x] **AC3**: Wizard integration uses AsyncContentLoader
  - Given: WizardController navigates to a step
  - When: Content needs loading
  - Then: AsyncContentLoader is used instead of direct sync loading

- [x] **AC4**: Code comments document zone membership
  - Given: A file in the codebase
  - When: A developer reads it
  - Then: Comments indicate if it's sync zone, async zone, or bridge

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create sync/async boundary documentation (AC: 1)
  - [x] Subtask 1.1: Create `docs/async-boundaries.md`
  - [x] Subtask 1.2: Document MUST BE SYNC components and reasons
  - [x] Subtask 1.3: Document SHOULD BE ASYNC components and reasons
  - [x] Subtask 1.4: Document decision criteria for ambiguous cases
  - [x] Subtask 1.5: Include code examples of correct patterns

- [x] **Task 2**: Make SyntaxHighlighter AsyncInitializable (AC: 2)
  - [x] Subtask 2.1: Update SyntaxHighlighter to implement AsyncInitializable
  - [x] Subtask 2.2: Add id, priority, isCritical, isInitialized properties
  - [x] Subtask 2.3: Ensure initialize() pre-warms the highlighter

- [x] **Task 3**: Integrate WizardController with async loading (AC: 3)
  - [x] Subtask 3.1: Inject AsyncContentLoader into WizardController
  - [x] Subtask 3.2: Update navigation to use loadStep()
  - [x] Subtask 3.3: Read from ContentBuffer for display
  - [x] Subtask 3.4: Handle loading states in UI

- [x] **Task 4**: Add zone documentation comments (AC: 4)
  - [x] Subtask 4.1: Add zone comments to AnimationLoop.ts (SYNC ZONE)
  - [x] Subtask 4.2: Add zone comments to InputManager.ts (SYNC ZONE)
  - [x] Subtask 4.3: Add zone comments to AsyncContentLoader.ts (ASYNC ZONE)
  - [x] Subtask 4.4: Add zone comments to ContentBuffer.ts (BRIDGE)

- [x] **Task 5**: Create usage example (AC: 1)
  - [x] Subtask 5.1: Add example of correct async pattern to docs
  - [x] Subtask 5.2: Add example of incorrect pattern (anti-pattern)

### Testing Tasks

- [x] **Test Task 1**: Verify SyntaxHighlighter initializes via ComponentInitializer
- [x] **Test Task 2**: Verify WizardController uses async loading
- [x] **Test Task 3**: Integration test: full navigation flow

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
| story-024 | Must complete first | Done | ContentBuffer |
| story-025 | Must complete first | Done | LoadingStateManager |
| story-026 | Must complete first | Done | ComponentInitializer |
| story-027 | Must complete first | Done | AsyncContentLoader |

---

## Dev Agent Record

> Populated by Dev agent during implementation

- **Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Session Date**: 2025-12-28
- **Tasks Completed**: All 5 implementation tasks, all 3 testing tasks
- **Implementation Notes**: Created comprehensive sync/async boundary documentation. Added SyntaxHighlighterComponent implementing AsyncInitializable. Integrated WizardController with optional AsyncContentLoader for cancellable content loading with preloading. Added @zone comments to key files.

### Decisions Made
- Made asyncLoader optional in WizardControllerConfig for backwards compatibility
- Added preloadAdjacentSteps() to automatically preload prev/next steps after navigation
- Used @zone JSDoc tag format for zone documentation (SYNC, ASYNC, BRIDGE)

### Issues Encountered
- None significant - implementation followed story specs closely

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `docs/async-boundaries.md` - Comprehensive sync/async boundary guidelines with decision tree, code examples, and anti-patterns

### Modified Files
- `src/wizard/SyntaxHighlighter.ts` - Added SyntaxHighlighterComponent implementing AsyncInitializable, added @zone ASYNC comment
- `src/wizard/WizardController.ts` - Added optional asyncLoader integration, preloadAdjacentSteps(), added @zone ASYNC comment
- `src/wizard/index.ts` - Added SyntaxHighlighterComponent export
- `src/core/AnimationLoop.ts` - Added @zone SYNC comment
- `src/core/InputManager.ts` - Added @zone SYNC comment
- `src/async/AsyncContentLoader.ts` - Added @zone ASYNC comment
- `src/async/ContentBuffer.ts` - Added @zone BRIDGE comment
- `tests/wizard/SyntaxHighlighter.test.ts` - Added 11 tests for SyntaxHighlighterComponent
- `tests/wizard/WizardController.test.ts` - Added 8 tests for AsyncContentLoader integration

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-28 | - | Ready | Scrum | Created |
| 2025-12-28 | Ready | In Progress | Dev Agent | Started implementation |
| 2025-12-28 | In Progress | In Review | Dev Agent | All tasks complete, 955 tests passing |
| 2025-12-28 | In Review | QA Pass | QA Agent | All ACs verified, 955 tests passing |

---

## Notes

This is the final integration story that brings all async components together. The documentation is critical for FR-004 (sync/async boundary guidelines) and ensures the developer (Dan persona) can confidently extend the codebase.

This story should be implemented last to ensure all dependencies are available for integration.

---

**Workflow**:
- `/dev story-028` to implement
- `/qa story-028` to review
