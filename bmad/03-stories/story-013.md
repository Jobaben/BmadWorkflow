---
id: story-013
title: "Wizard Core Types & Concept Registry"
status: QA Pass
priority: P0
estimate: M
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard Foundation
depends_on: [story-001]
blocks: [story-014, story-016, story-017, story-018, story-019]
prd_requirement: FR-001, FR-003, FR-006
---

# Story: Wizard Core Types & Concept Registry

## User Story

**As a** developer building the wizard learning experience,
**I want to** have well-defined TypeScript types and a central concept registry,
**So that** wizard steps, annotations, and complexity tiers are structured and type-safe.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [x] **AC1**: ComplexityTier enum exists with three levels
  - Given: The types are defined
  - When: I use ComplexityTier
  - Then: I can specify 'micro', 'medium', or 'advanced' (FR-006)

- [x] **AC2**: WizardStep interface is complete
  - Given: The types are defined
  - When: I create a WizardStep
  - Then: It includes id, title, tier, demoType, description, codeSnippets, annotations, parameters, order, prerequisites

- [x] **AC3**: Annotation interface supports code region linking
  - Given: The types are defined
  - When: I create an Annotation
  - Then: It includes lineStart, lineEnd, content, and highlightType (FR-003)

- [x] **AC4**: ConceptRegistry provides step lookup methods
  - Given: The ConceptRegistry is instantiated
  - When: I call getStep(id) or getStepsByTier(tier)
  - Then: Correct steps are returned

- [x] **AC5**: ConceptRegistry provides ordered step list
  - Given: The ConceptRegistry has steps registered
  - When: I request the full step list
  - Then: Steps are returned in recommended learning order (FR-001)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Create wizard type definitions (AC: 1, 2, 3)
  - [x] Subtask 1.1: Create `src/wizard/types.ts`
  - [x] Subtask 1.2: Define ComplexityTier enum ('micro', 'medium', 'advanced')
  - [x] Subtask 1.3: Define WizardStep interface per Architecture
  - [x] Subtask 1.4: Define Annotation interface with highlightType
  - [x] Subtask 1.5: Define CodeSnippetRef interface
  - [x] Subtask 1.6: Define ParameterBinding interface

- [x] **Task 2**: Create ConceptRegistry class (AC: 4, 5)
  - [x] Subtask 2.1: Create `src/wizard/ConceptRegistry.ts`
  - [x] Subtask 2.2: Accept steps array in constructor
  - [x] Subtask 2.3: Implement getStep(stepId: string): WizardStep | undefined
  - [x] Subtask 2.4: Implement getStepsByTier(tier: ComplexityTier): WizardStep[]
  - [x] Subtask 2.5: Implement getAllSteps(): WizardStep[] (ordered)
  - [x] Subtask 2.6: Implement getStepCount(): number

- [x] **Task 3**: Implement step ordering and prerequisites (AC: 5)
  - [x] Subtask 3.1: Store steps sorted by order property
  - [x] Subtask 3.2: Implement getNextStep(currentId: string): WizardStep | undefined
  - [x] Subtask 3.3: Implement getPreviousStep(currentId: string): WizardStep | undefined
  - [x] Subtask 3.4: Implement getPrerequisites(stepId: string): WizardStep[]

- [x] **Task 4**: Create placeholder step data (AC: 4, 5)
  - [x] Subtask 4.1: Create `src/wizard-data/index.ts` with sample steps
  - [x] Subtask 4.2: Add 2-3 placeholder steps for testing
  - [x] Subtask 4.3: Export combined step registry

- [x] **Task 5**: Create module exports
  - [x] Subtask 5.1: Create `src/wizard/index.ts` with all exports
  - [x] Subtask 5.2: Verify imports work from main

### Testing Tasks

- [x] **Test Task 1**: Verify all types compile without errors
- [x] **Test Task 2**: Verify getStep returns correct step by id
- [x] **Test Task 3**: Verify getStepsByTier filters correctly
- [x] **Test Task 4**: Verify step ordering is correct

---

## Technical Notes

### Architecture Reference
- **Component**: Concept Registry
- **Section**: Components - Concept Registry
- **Patterns**: Registry pattern for centralized data access

### Implementation Approach
Follow Architecture Section "Concept Registry" exactly. Use TypeScript strict mode. Store steps in a Map for O(1) lookup by id. Pre-sort steps by order property for efficient ordered access.

### API Contracts
```typescript
// From Architecture
enum ComplexityTier {
  Micro = 'micro',
  Medium = 'medium',
  Advanced = 'advanced'
}

interface WizardStep {
  id: string;
  title: string;
  tier: ComplexityTier;
  demoType: DemoType;
  description: string;
  learningObjectives: string[];
  codeSnippets: CodeSnippetRef[];
  annotations: Annotation[];
  parameters?: ParameterBinding[];
  order: number;
  prerequisites?: string[];
}

interface Annotation {
  id: string;
  lineStart: number;
  lineEnd: number;
  content: string;
  highlightType: 'concept' | 'pattern' | 'warning' | 'tip';
}

interface CodeSnippetRef {
  id: string;
  sourceFile: string;
  startLine: number;
  endLine: number;
  title?: string;
  focusLines?: number[];
}

interface ParameterBinding {
  parameterKey: string;
  codeLocation: CodeSnippetRef;
  variableName: string;
  explanation: string;
}
```

### Files Likely Affected
- `src/wizard/types.ts` - new file
- `src/wizard/ConceptRegistry.ts` - new file
- `src/wizard/index.ts` - new file
- `src/wizard-data/index.ts` - new file

---

## Definition of Done

> All items must be checked before moving to "In Review"

- [x] All tasks checked off
- [x] All acceptance criteria verified
- [x] Code implemented following project patterns
- [x] Unit tests written and passing (32 new tests)
- [x] Integration tests written (if applicable) - N/A for this story
- [x] All existing tests still pass (no regressions) - 351 total tests pass
- [x] File List section updated
- [x] Dev Agent Record completed

---

## Testing Notes

### Test Scenarios
1. **Happy Path**: Registry returns steps correctly by id and tier
2. **Error Case**: getStep with unknown id returns undefined
3. **Edge Case**: Empty registry handles gracefully

### Edge Cases to Cover
- Unknown step id lookup
- Empty tier (no steps of that tier)
- Step with no prerequisites

### Test Data Requirements
- 3-5 sample WizardStep objects covering all tiers

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-001 | Must complete first | Done | Need TypeScript project setup |

---

## Dev Agent Record

> Populated by Dev agent during implementation

- **Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Session Date**: 2025-12-27
- **Tasks Completed**: All 5 implementation tasks, all 4 testing tasks
- **Implementation Notes**: Implemented wizard core types and ConceptRegistry exactly as specified in Architecture. Created 5 sample wizard steps covering all three complexity tiers with prerequisite relationships.

### Decisions Made
- Used Map for O(1) lookup by step ID as recommended in Architecture
- Pre-sorted steps array for efficient ordered access
- Added 5 sample steps (instead of minimum 2-3) to better demonstrate tier filtering and prerequisites
- Included `learningObjectives` field in WizardStep as specified in Architecture (was mentioned in Architecture but not explicitly in story tasks)

### Issues Encountered
- None - implementation followed Architecture specification exactly

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/wizard/types.ts` - Core type definitions (ComplexityTier, WizardStep, Annotation, CodeSnippetRef, ParameterBinding)
- `src/wizard/ConceptRegistry.ts` - Registry class with step lookup, tier filtering, and navigation methods
- `src/wizard/index.ts` - Module exports for wizard package
- `src/wizard-data/index.ts` - Sample wizard steps and pre-configured registry for testing
- `tests/wizard/ConceptRegistry.test.ts` - 32 unit tests covering all ConceptRegistry functionality

### Modified Files
- None

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-27 | - | Ready | Scrum | Created |
| 2025-12-27 | Ready | In Progress | Dev (Claude Opus 4.5) | Started implementation |
| 2025-12-27 | In Progress | In Review | Dev (Claude Opus 4.5) | All tasks complete, 32 tests passing |
| 2025-12-27 | In Review | QA Pass | QA (Claude Opus 4.5) | All AC verified, code quality approved |

---

## Notes

This is the foundation story for the Wizard Layer. All other wizard stories depend on these types and the ConceptRegistry. The types must exactly match the Architecture document to ensure consistency across the wizard implementation.

---

**Workflow**:
- `/dev story-013` to implement
- `/qa story-013` to review
