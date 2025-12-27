---
id: story-014
title: "Code Snippet Engine with Syntax Highlighting"
status: In Review
priority: P0
estimate: M
created: 2025-12-27
updated: 2025-12-27
assignee:
pr_link:
epic: Wizard Foundation
depends_on: [story-013]
blocks: [story-017, story-020]
prd_requirement: FR-002, FR-003
---

# Story: Code Snippet Engine with Syntax Highlighting

## User Story

**As a** learner using the wizard,
**I want to** see actual code snippets from the running demos with syntax highlighting,
**So that** I can understand how the visual effects are implemented in real code.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [x] **AC1**: Source files are bundled and extractable
  - Given: The application is built
  - When: I request a code snippet
  - Then: The actual source code from the specified file and lines is returned (FR-002)

- [x] **AC2**: Code is syntax highlighted
  - Given: A code snippet is extracted
  - When: It is rendered
  - Then: TypeScript/JavaScript syntax is properly highlighted (FR-002)

- [x] **AC3**: Specific line ranges can be extracted
  - Given: A CodeSnippetRef with startLine and endLine
  - When: I request the snippet
  - Then: Only those lines are returned

- [x] **AC4**: Focus lines can be emphasized
  - Given: A CodeSnippetRef with focusLines
  - When: The snippet is displayed
  - Then: Those specific lines are visually emphasized

- [x] **AC5**: Annotations can be overlaid on code
  - Given: A code snippet with annotations
  - When: The snippet is rendered
  - Then: Annotations appear at the correct line positions (FR-003)

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [x] **Task 1**: Configure Vite for raw source imports (AC: 1)
  - [x] Subtask 1.1: Update vite.config.ts for ?raw imports
  - [x] Subtask 1.2: Create source file import manifest
  - [x] Subtask 1.3: Bundle demo source files (ParticleDemo.ts, etc.)

- [x] **Task 2**: Create SnippetExtractor utility (AC: 1, 3)
  - [x] Subtask 2.1: Create `src/wizard/SnippetExtractor.ts`
  - [x] Subtask 2.2: Implement extractLines(source: string, start: number, end: number)
  - [x] Subtask 2.3: Handle edge cases (out of bounds, invalid ranges)

- [x] **Task 3**: Install and configure Shiki (AC: 2)
  - [x] Subtask 3.1: Run `npm install shiki`
  - [x] Subtask 3.2: Create `src/wizard/SyntaxHighlighter.ts`
  - [x] Subtask 3.3: Initialize Shiki with TypeScript grammar
  - [x] Subtask 3.4: Choose appropriate theme (dark, matching app)

- [x] **Task 4**: Create CodeSnippetEngine class (AC: 1, 2, 3, 4)
  - [x] Subtask 4.1: Create `src/wizard/CodeSnippetEngine.ts`
  - [x] Subtask 4.2: Accept source file registry in constructor
  - [x] Subtask 4.3: Implement getSnippet(ref: CodeSnippetRef): Promise<HighlightedCode>
  - [x] Subtask 4.4: Implement line highlighting for focusLines
  - [x] Subtask 4.5: Return HighlightedCode with html, plainText, lineCount

- [x] **Task 5**: Implement annotation overlay (AC: 5)
  - [x] Subtask 5.1: Create annotation positioning logic
  - [x] Subtask 5.2: Generate HTML with annotation markers
  - [x] Subtask 5.3: Style annotations to be readable but not obstructive

- [x] **Task 6**: Create code display component (AC: 2, 4, 5)
  - [x] Subtask 6.1: Create `src/wizard-ui/CodeDisplay.ts`
  - [x] Subtask 6.2: Render highlighted HTML to DOM
  - [x] Subtask 6.3: Handle scrollable code blocks
  - [x] Subtask 6.4: Display line numbers

### Testing Tasks

- [x] **Test Task 1**: Verify source files are bundled correctly
- [x] **Test Task 2**: Verify line extraction is accurate
- [x] **Test Task 3**: Verify syntax highlighting produces valid HTML
- [x] **Test Task 4**: Verify annotations appear at correct positions

---

## Technical Notes

### Architecture Reference
- **Component**: Code Snippet Engine
- **Section**: Components - Code Snippet Engine
- **Patterns**: Factory pattern for snippet creation

### Implementation Approach
Per ADR-002, bundle source files as static assets at build time using Vite's `?raw` import. Use Shiki for VSCode-quality syntax highlighting. Create a source registry that maps file paths to raw source content.

### API Contracts
```typescript
// From Architecture
interface CodeSnippetRef {
  id: string;
  sourceFile: string;
  startLine: number;
  endLine: number;
  title?: string;
  focusLines?: number[];
}

interface HighlightedCode {
  html: string;
  plainText: string;
  lineCount: number;
  annotations: Annotation[];
}

class CodeSnippetEngine {
  constructor(sourceRegistry: Map<string, string>);
  getSnippet(ref: CodeSnippetRef): Promise<HighlightedCode>;
  highlightLines(lineStart: number, lineEnd: number): void;
}
```

### Data Models
```typescript
// Source registry maps file paths to raw content
const sourceRegistry = new Map<string, string>([
  ['demos/ParticleDemo.ts', particleDemoSource],
  ['demos/ObjectDemo.ts', objectDemoSource],
  // ...
]);
```

### Files Likely Affected
- `vite.config.ts` - raw import configuration
- `src/wizard/SnippetExtractor.ts` - new file
- `src/wizard/SyntaxHighlighter.ts` - new file
- `src/wizard/CodeSnippetEngine.ts` - new file
- `src/wizard-ui/CodeDisplay.ts` - new file
- `src/wizard/sourceRegistry.ts` - new file

---

## Definition of Done

> All items must be checked before moving to "In Review"

- [x] All tasks checked off
- [x] All acceptance criteria verified
- [x] Code implemented following project patterns
- [x] Unit tests written and passing (113 new tests)
- [x] Integration tests written (if applicable) - N/A for this story
- [x] All existing tests still pass (no regressions) - 464 total tests pass
- [x] File List section updated
- [x] Dev Agent Record completed

---

## Testing Notes

### Test Scenarios
1. **Happy Path**: Extract lines 10-20 from ParticleDemo.ts, get highlighted HTML
2. **Error Case**: Request lines from non-existent file, graceful error
3. **Edge Case**: Request lines beyond file length, return available lines

### Edge Cases to Cover
- Empty file
- Single line extraction
- Very long code blocks (scrollable)
- Unicode characters in code

### Test Data Requirements
- Sample source file content for testing

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| story-013 | Must complete first | QA Pass | CodeSnippetRef type available |

---

## Dev Agent Record

> Populated by Dev agent during implementation

- **Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Session Date**: 2025-12-27
- **Tasks Completed**: All 6 implementation tasks, all 4 testing tasks
- **Implementation Notes**: Implemented the complete Code Snippet Engine with syntax highlighting using Shiki. Created source registry for bundled demo files, snippet extraction utility, syntax highlighter wrapper, main CodeSnippetEngine class, and CodeDisplay UI component. All components are fully tested with 113 new tests.

### Decisions Made
- Used github-dark theme for Shiki to match typical IDE appearances (ADR-003)
- Implemented snippet caching in CodeSnippetEngine for performance optimization
- Used CSS-in-JS approach for CodeDisplay styling with automatic style injection
- Created SourceNotFoundError custom error class for better error handling

### Issues Encountered
- None significant - implementation followed Architecture specification

---

## File List

> Populated by Dev agent - list all created/modified files

### Created Files
- `src/vite-env.d.ts` - Type declarations for Vite raw imports
- `src/wizard/sourceRegistry.ts` - Registry of bundled demo source files
- `src/wizard/SnippetExtractor.ts` - Utility for extracting line ranges from source code
- `src/wizard/SyntaxHighlighter.ts` - Shiki wrapper for syntax highlighting
- `src/wizard/CodeSnippetEngine.ts` - Main engine class for snippet retrieval
- `src/wizard-ui/CodeDisplay.ts` - UI component for rendering highlighted code
- `src/wizard-ui/index.ts` - Module exports for wizard-ui package
- `tests/wizard/SnippetExtractor.test.ts` - 31 unit tests for snippet extraction
- `tests/wizard/SyntaxHighlighter.test.ts` - 18 unit tests for syntax highlighting
- `tests/wizard/CodeSnippetEngine.test.ts` - 22 unit tests for code snippet engine
- `tests/wizard/sourceRegistry.test.ts` - 17 unit tests for source registry
- `tests/wizard-ui/CodeDisplay.test.ts` - 25 unit tests for code display component

### Modified Files
- `vite.config.ts` - Added assetsInclude for raw TypeScript imports
- `src/wizard/index.ts` - Added exports for new modules
- `package.json` - Added shiki dependency

---

## Status History

| Date | From | To | By | Note |
|------|------|----|----|------|
| 2025-12-27 | - | Ready | Scrum | Created |
| 2025-12-27 | Ready | In Progress | Dev (Claude Opus 4.5) | Started implementation |
| 2025-12-27 | In Progress | In Review | Dev (Claude Opus 4.5) | All tasks complete, 113 new tests passing |

---

## Notes

This story directly addresses PRD FR-002 (Code Snippet Display) and FR-003 (Explanatory Annotations). The code displayed must come from the actual running demo source files, not simplified examples. Per ADR-002, we use bundled source with Vite's raw imports.

Shiki adds ~200KB to bundle size for grammars, but provides VSCode-quality highlighting that matches what developers see in their editors.

---

**Workflow**:
- `/dev story-014` to implement
- `/qa story-014` to review
