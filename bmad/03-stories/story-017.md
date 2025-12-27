---
id: story-017
title: "Learning Panel Component"
status: Ready
priority: P0
estimate: M
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard UI
depends_on: [story-013, story-014, story-015]
blocks: [story-019]
prd_requirement: FR-002, FR-003
---

# Story: Learning Panel Component

## User Story

**As a** learner using the wizard,
**I want to** see explanations, code snippets, and annotations for each concept,
**So that** I can understand both the "what" and "why" of 3D animation techniques.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Step description is displayed prominently
  - Given: I am on a wizard step
  - When: I view the learning panel
  - Then: I see the step's description text (FR-002)

- [ ] **AC2**: Code snippets are displayed with syntax highlighting
  - Given: A step has code snippets
  - When: I view the learning panel
  - Then: Code is displayed with TypeScript syntax highlighting (FR-002)

- [ ] **AC3**: Annotations explain key concepts
  - Given: A code snippet has annotations
  - When: I view the code
  - Then: Annotations are visible and linked to specific lines (FR-003)

- [ ] **AC4**: Learning objectives are listed
  - Given: I am on a wizard step
  - When: I view the panel
  - Then: I can see what I will learn from this step

- [ ] **AC5**: Panel content is scrollable
  - Given: The step has extensive content
  - When: Content exceeds panel height
  - Then: I can scroll to see all content

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Create LearningPanel class (AC: 1, 4, 5)
  - [ ] Subtask 1.1: Create `src/wizard-ui/LearningPanel.ts`
  - [ ] Subtask 1.2: Accept container element in constructor
  - [ ] Subtask 1.3: Create title section
  - [ ] Subtask 1.4: Create learning objectives section
  - [ ] Subtask 1.5: Create description section
  - [ ] Subtask 1.6: Create code section
  - [ ] Subtask 1.7: Make content area scrollable

- [ ] **Task 2**: Implement step rendering (AC: 1, 4)
  - [ ] Subtask 2.1: Implement renderStep(step: WizardStep, code: HighlightedCode[])
  - [ ] Subtask 2.2: Display step title and tier badge
  - [ ] Subtask 2.3: Display learning objectives as bullet list
  - [ ] Subtask 2.4: Display description with markdown support

- [ ] **Task 3**: Integrate code display (AC: 2)
  - [ ] Subtask 3.1: Use CodeDisplay component from story-014
  - [ ] Subtask 3.2: Display each code snippet with title
  - [ ] Subtask 3.3: Display line numbers
  - [ ] Subtask 3.4: Highlight focus lines

- [ ] **Task 4**: Implement annotation display (AC: 3)
  - [ ] Subtask 4.1: Render annotations as inline callouts
  - [ ] Subtask 4.2: Style by annotation type (concept, pattern, warning, tip)
  - [ ] Subtask 4.3: Link annotations to specific code lines
  - [ ] Subtask 4.4: Make annotations expandable/collapsible

- [ ] **Task 5**: Style the learning panel (AC: 1, 2, 3)
  - [ ] Subtask 5.1: Set readable typography (16px+ font)
  - [ ] Subtask 5.2: Add appropriate spacing and padding
  - [ ] Subtask 5.3: Style code blocks distinctly
  - [ ] Subtask 5.4: Style annotation callouts
  - [ ] Subtask 5.5: Ensure sufficient contrast (NFR-005)

- [ ] **Task 6**: Add parameter controls section
  - [ ] Subtask 6.1: Create placeholder for parameter controls
  - [ ] Subtask 6.2: Will be populated by ParameterCodeLinker (story-020)

### Testing Tasks

- [ ] **Test Task 1**: Verify step content renders correctly
- [ ] **Test Task 2**: Verify code snippets are highlighted
- [ ] **Test Task 3**: Verify annotations display at correct lines
- [ ] **Test Task 4**: Verify scrolling works for long content

---

## Technical Notes

### Architecture Reference
- **Component**: Learning Panel
- **Section**: Components - Learning Panel
- **Patterns**: Composition with CodeDisplay

### Implementation Approach
The LearningPanel orchestrates multiple content sections. It receives a WizardStep and pre-highlighted code from the CodeSnippetEngine. Content should be readable and well-spaced, following NFR-005 accessibility guidelines.

### API Contracts
```typescript
class LearningPanel {
  constructor(container: HTMLElement);
  renderStep(step: WizardStep, code: HighlightedCode[]): void;
  highlightParameter(key: string): void;
  getParameterContainer(): HTMLElement;
  clear(): void;
  dispose(): void;
}
```

### Files Likely Affected
- `src/wizard-ui/LearningPanel.ts` - new file
- `src/style.css` - learning panel styles

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
1. **Happy Path**: Render step with description, objectives, code, annotations
2. **Error Case**: Step with no code snippets still renders correctly
3. **Edge Case**: Very long description and multiple code blocks

### Edge Cases to Cover
- Step with no annotations
- Step with multiple code snippets
- Very long code blocks
- Special characters in code

### Test Data Requirements
- WizardStep with full content
- HighlightedCode from CodeSnippetEngine

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-013 | Must complete first | Ready | Need WizardStep type |
| story-014 | Must complete first | Ready | Need CodeSnippetEngine |
| story-015 | Must complete first | Ready | Need layout container |

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

This story implements the educational content display (FR-002 Code Snippet Display, FR-003 Explanatory Annotations). The panel should explain "why" not just "what" - annotations are key to achieving this. Content must be readable per NFR-005 (16px minimum font, sufficient contrast).

---

**Workflow**:
- `/dev story-017` to implement
- `/qa story-017` to review
