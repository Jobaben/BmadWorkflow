---
id: story-001
title: "Project Setup & Core Types"
status: Ready
priority: P0
estimate: M
created: 2025-12-25
updated: 2025-12-25
assignee:
pr_link:
epic: Foundation
depends_on: []
blocks: [story-002, story-003, story-004, story-005, story-006]
prd_requirement: FR-005, FR-006
---

# Story: Project Setup & Core Types

## User Story

**As a** developer starting the 3D Animation Learning Foundation,
**I want to** have a properly configured project with TypeScript, Vite, and Three.js,
**So that** I can begin building demo modules on a solid foundation.

---

## Acceptance Criteria

> Each criterion must be specific, testable, and traceable to PRD requirements.

- [ ] **AC1**: Project initializes with Vite and TypeScript
  - Given: An empty project directory
  - When: I run `npm install` and `npm run dev`
  - Then: A development server starts without errors

- [ ] **AC2**: Three.js is installed and importable
  - Given: The project is set up
  - When: I import Three.js in a TypeScript file
  - Then: TypeScript compiles without errors and Three.js types are available

- [ ] **AC3**: Core type definitions exist
  - Given: The types directory exists
  - When: I review the type definitions
  - Then: All interfaces from Architecture doc Section "Data Models" are defined

- [ ] **AC4**: Project builds to static files
  - Given: The project is configured
  - When: I run `npm run build`
  - Then: Static files are generated in `dist/` that can run standalone (FR-006)

- [ ] **AC5**: Basic HTML shell with canvas element exists
  - Given: The project is built
  - When: I open `index.html`
  - Then: A canvas element is present for Three.js rendering

---

## Tasks

> Execute tasks in order. Check off each task only when complete with passing tests.

### Implementation Tasks

- [ ] **Task 1**: Initialize Vite project with TypeScript template (AC: 1)
  - [ ] Subtask 1.1: Run `npm create vite@latest` with TypeScript template
  - [ ] Subtask 1.2: Configure `vite.config.ts` for static file output
  - [ ] Subtask 1.3: Verify dev server starts correctly

- [ ] **Task 2**: Install and configure Three.js (AC: 2)
  - [ ] Subtask 2.1: Run `npm install three @types/three`
  - [ ] Subtask 2.2: Create test import in `main.ts`
  - [ ] Subtask 2.3: Verify TypeScript recognizes Three.js types

- [ ] **Task 3**: Install lil-gui for future control panel (AC: 2)
  - [ ] Subtask 3.1: Run `npm install lil-gui`
  - [ ] Subtask 3.2: Verify import works

- [ ] **Task 4**: Create directory structure per Architecture (AC: 3)
  - [ ] Subtask 4.1: Create `src/app/` directory
  - [ ] Subtask 4.2: Create `src/demos/` directory
  - [ ] Subtask 4.3: Create `src/core/` directory
  - [ ] Subtask 4.4: Create `src/ui/` directory
  - [ ] Subtask 4.5: Create `src/utils/` directory
  - [ ] Subtask 4.6: Create `src/types/` directory

- [ ] **Task 5**: Define core TypeScript interfaces (AC: 3)
  - [ ] Subtask 5.1: Create `src/types/index.ts`
  - [ ] Subtask 5.2: Define `Particle` interface
  - [ ] Subtask 5.3: Define `ParticleParams` interface
  - [ ] Subtask 5.4: Define `AnimationType` type
  - [ ] Subtask 5.5: Define `AnimatedObject` interface
  - [ ] Subtask 5.6: Define `ObjectParams` interface
  - [ ] Subtask 5.7: Define `FluidParticle` interface
  - [ ] Subtask 5.8: Define `FluidParams` interface
  - [ ] Subtask 5.9: Define `InputState` interface
  - [ ] Subtask 5.10: Define `DemoState` interface
  - [ ] Subtask 5.11: Define `ParameterSchema` interface
  - [ ] Subtask 5.12: Define `Demo` interface (base interface for all demos)
  - [ ] Subtask 5.13: Define `DemoType` enum

- [ ] **Task 6**: Create HTML shell with canvas (AC: 5)
  - [ ] Subtask 6.1: Update `index.html` with proper structure
  - [ ] Subtask 6.2: Add canvas container element
  - [ ] Subtask 6.3: Add basic CSS for full-viewport canvas

- [ ] **Task 7**: Verify production build (AC: 4)
  - [ ] Subtask 7.1: Run `npm run build`
  - [ ] Subtask 7.2: Verify `dist/` contains HTML, CSS, JS
  - [ ] Subtask 7.3: Test opening `dist/index.html` directly works

### Testing Tasks

- [ ] **Test Task 1**: Verify development server starts without errors
- [ ] **Test Task 2**: Verify Three.js import compiles successfully
- [ ] **Test Task 3**: Verify all type definitions have no TypeScript errors
- [ ] **Test Task 4**: Verify production build completes successfully

---

## Technical Notes

### Architecture Reference
- **Component**: Project initialization
- **Section**: Technology Stack, File Structure, Coding Standards
- **Patterns**: Module Pattern for type exports

### Implementation Approach
Follow the file structure from Architecture Section "Coding Standards". Use TypeScript strict mode. All types should be exported from `src/types/index.ts` for easy imports.

### Data Models
```typescript
// From Architecture - these must all be defined
interface Particle {
  position: Vector3;
  velocity: Vector3;
  age: number;
  lifetime: number;
  size: number;
  color: Color;
  alive: boolean;
}

interface ParticleParams {
  emissionRate: number;
  lifetime: number;
  initialSpeed: number;
  gravity: Vector3;
  size: number;
  color: Color;
}

type AnimationType = 'rotate' | 'orbit' | 'bounce' | 'wave' | 'scale';

interface AnimatedObject {
  mesh: Mesh;
  animationType: AnimationType;
  phase: number;
  speed: number;
  amplitude: number;
}

interface ObjectParams {
  objectCount: number;
  animationSpeed: number;
  amplitude: number;
  showAxes: boolean;
}

interface FluidParticle {
  position: Vector3;
  velocity: Vector3;
  density: number;
  pressure: number;
}

interface FluidParams {
  particleCount: number;
  gravity: number;
  viscosity: number;
  restDensity: number;
  boundaryDamping: number;
}

interface InputState {
  mousePosition: Vector2;
  mouseWorldPosition: Vector3;
  isMouseDown: boolean;
  keysPressed: Set<string>;
}

interface ParameterSchema {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: any;
}
```

### Files Likely Affected
- `package.json` - dependencies
- `vite.config.ts` - build configuration
- `tsconfig.json` - TypeScript configuration
- `index.html` - HTML shell
- `src/main.ts` - entry point
- `src/types/index.ts` - type definitions
- `src/style.css` - basic styles

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
1. **Happy Path**: `npm run dev` starts server, `npm run build` creates static files
2. **Error Case**: Import non-existent type should cause TypeScript error
3. **Edge Case**: Build with no source changes should succeed

### Edge Cases to Cover
- TypeScript strict mode catches type errors
- Production build runs without dev dependencies

### Test Data Requirements
- None required for this story

---

## Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| None | - | - | This is the foundation story |

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

This is the foundational story that all other stories depend on. It must be completed first before any other work can begin. The type definitions established here will be used throughout the entire application.

---

**Workflow**:
- `/dev story-001` to implement
- `/qa story-001` to review
