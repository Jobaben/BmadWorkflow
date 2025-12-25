---
id: story-###
title: "Story Title"
status: Ready
priority: P1
estimate: S
created: YYYY-MM-DD
updated: YYYY-MM-DD
assignee:
pr_link:
epic:
depends_on: []
blocks: []
prd_requirement: FR-###
---

# Story: [Title]

## User Story

**As a** [user persona],
**I want to** [action/capability],
**So that** [benefit/value].

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: [Specific, testable criterion]
  - Given: [precondition]
  - When: [action]
  - Then: [expected result]

- [ ] **AC2**: [Specific, testable criterion]
  - Given: [precondition]
  - When: [action]
  - Then: [expected result]

- [ ] **AC3**: [Specific, testable criterion]
  - Given: [precondition]
  - When: [action]
  - Then: [expected result]

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: [Description] (AC: 1)
  - [ ] Subtask 1.1: [Details]
  - [ ] Subtask 1.2: [Details]

- [ ] **Task 2**: [Description] (AC: 2)
  - [ ] Subtask 2.1: [Details]
  - [ ] Subtask 2.2: [Details]

- [ ] **Task 3**: [Description] (AC: 3)
  - [ ] Subtask 3.1: [Details]

### Testing Tasks

- [ ] **Test Task 1**: Write unit tests for [component]
- [ ] **Test Task 2**: Write integration tests for [flow]
- [ ] **Test Task 3**: Verify all acceptance criteria with tests

---

## Technical Notes

### Architecture Reference
- **Component**: [Reference from ARCHITECTURE.md]
- **Section**: [Specific section number]
- **Patterns**: [Patterns to follow]

### Implementation Approach
[Brief technical guidance for the developer - what patterns to use, what to avoid]

### API Contracts
```
[If applicable, specify request/response formats]
```

### Data Models
```
[If applicable, specify data structures]
```

### Files Likely Affected
- `path/to/file1` - [purpose]
- `path/to/file2` - [purpose]

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
1. **Happy Path**: [Expected behavior]
2. **Error Case**: [Expected behavior]
3. **Edge Case**: [Expected behavior]

### Edge Cases to Cover
- [Edge case 1]
- [Edge case 2]

### Test Data Requirements
- [Any specific test data needed]

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-### | Must complete first | Pending | [Why] |

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
| YYYY-MM-DD | - | Ready | Scrum | Created |

---

## Notes

[Additional context, decisions, or clarifications]

---

**Workflow**:
- `/dev story-###` to implement
- `/qa story-###` to review
