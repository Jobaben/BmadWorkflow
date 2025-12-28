---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: [brief.md, PRD.md, ARCHITECTURE.md]
status: Complete
created: 2025-12-28
updated: 2025-12-28
author: Analyst
---

# Project Brief: Wizard UI Integration Gap

> This document frames a critical implementation gap discovered after completing the Async Optimization epic.

---

## Executive Summary

After completing 16+ stories building wizard UI components and async infrastructure, the wizard is **fully built but invisible**. All components exist, tests pass, but no code ever instantiates or renders the wizard. The `<div id="wizard-app">` in `index.html` has `display: none` and is never activated. Users still see only the original playground mode.

---

## Problem Statement

### What is the problem?

The wizard learning experience described in the original brief has been **architecturally complete but operationally absent** since its inception:

1. **Components Built, Never Rendered** — WizardLayout, WizardController, LearningPanel, CodePanel, ParameterCodeLinker all exist with passing tests (~2,450 lines of wizard code)
2. **Async Infrastructure Unused** — ContentBuffer, AsyncContentLoader, LoadingStateManager, ComponentInitializer built for 60fps-safe loading but never invoked
3. **No Mode Toggle** — No mechanism exists to switch from playground to wizard mode
4. **HTML Element Hidden** — `<div id="wizard-app">` exists but has `display: none` permanently

The Async Optimization epic (stories 024-028) was successfully completed, but it optimized a wizard that cannot be seen or used.

### Who is affected?

- **Primary**: Developer (learner) — Cannot access the wizard learning experience
- **Secondary**: Anyone evaluating the project — Sees only playground, unaware wizard exists

### What is the impact?

| Impact Type | Current State | Measurement |
|-------------|---------------|-------------|
| Feature Availability | Wizard exists in code, invisible to users | User can see/use wizard? NO |
| Learning Experience | Original brief goal unmet | Guided learning available? NO |
| Investment Return | 16+ stories of work invisible | % of wizard code actually used: 0% |
| Async Infrastructure | Complete but unused | ContentBuffer accessed at runtime? NO |

---

## Stakeholders

| Stakeholder | Role | Interest | Influence | Key Concerns |
|-------------|------|----------|-----------|--------------|
| Developer | Learner / User | See and use the wizard | High | All that work should be visible |

---

## Current State

### How is this handled today?

1. User opens application
2. Application runs `main.ts`
3. `main.ts` creates: SceneManager, DemoRenderer, DemoSelector, ControlPanel
4. User sees playground mode with demo buttons and sliders
5. Wizard components are **never instantiated**
6. `<div id="wizard-app">` remains hidden forever

### What exists but is never used?

| Component | File | Status | Used at Runtime? |
|-----------|------|--------|------------------|
| WizardLayout | src/wizard/WizardLayout.ts | Built, Tested | NO |
| WizardController | src/wizard/WizardController.ts | Built, Tested | NO |
| LearningPanel | src/wizard/LearningPanel.ts | Built, Tested | NO |
| CodePanel | src/wizard/CodePanel.ts | Built, Tested | NO |
| ParameterCodeLinker | src/wizard/ParameterCodeLinker.ts | Built, Tested | NO |
| ConceptRegistry | src/wizard/ConceptRegistry.ts | Built, Tested | NO |
| SyntaxHighlighter | src/wizard/SyntaxHighlighter.ts | Built, Tested | NO |
| ContentBuffer | src/async/ContentBuffer.ts | Built, Tested | NO |
| AsyncContentLoader | src/async/AsyncContentLoader.ts | Built, Tested | NO |
| LoadingStateManager | src/async/LoadingStateManager.ts | Built, Tested | NO |
| ComponentInitializer | src/async/ComponentInitializer.ts | Built, Tested | NO |

### Code inspection evidence

**main.ts** (current):
```typescript
// Playground mode only - no wizard instantiation
const sceneManager = new SceneManager();
const renderer = new DemoRenderer(sceneManager);
const selector = new DemoSelector('demo-selector', renderer);
const controlPanel = new ControlPanel('control-panel');
// ... no WizardController, no WizardLayout, no mode toggle
```

**index.html** (current):
```html
<div id="wizard-app" style="display: none;">
  <!-- Never shown, never populated -->
</div>
```

---

## Success Criteria

| ID | Criterion | Metric | Target | Current |
|----|-----------|--------|--------|---------|
| SC-1 | Wizard is visible | User can see wizard UI | Wizard renders on screen | Hidden |
| SC-2 | Mode toggle works | User can switch modes | Toggle between playground/wizard | No toggle exists |
| SC-3 | Components initialized | Runtime instantiation | All wizard components created | None created |
| SC-4 | Async infrastructure active | ContentBuffer populated | Content loads via AsyncContentLoader | Never called |
| SC-5 | Learning experience functional | User can navigate steps | Wizard navigation works | Cannot test - invisible |

---

## Scope

### In Scope

- [ ] Mode toggle mechanism (playground <-> wizard)
- [ ] Wizard component instantiation in main.ts
- [ ] WizardLayout rendering to DOM
- [ ] WizardController with steps and navigation
- [ ] AsyncContentLoader integration for content
- [ ] ComponentInitializer for pre-warming (SyntaxHighlighter)
- [ ] Hiding/showing appropriate UI elements per mode

### Out of Scope

- New wizard features beyond what's already built
- Changes to existing wizard component internals
- Additional async infrastructure
- Mobile optimizations

### Boundaries

- **Starts at**: Existing built components (wizard/*, async/*)
- **Ends at**: Wizard visible and functional in browser
- **Does not include**: New learning content or concepts

---

## Constraints

### Technical Constraints

- Must integrate with existing animation loop (60fps requirement)
- Must not break existing playground mode
- Async infrastructure must be used for content loading

### Resource Constraints

- Single developer implementation
- Should be straightforward integration work

---

## Assumptions

| ID | Assumption | Risk if Wrong | Validation Method |
|----|------------|---------------|-------------------|
| A-1 | Existing components work correctly | May need fixes during integration | Tests pass (955 tests) |
| A-2 | Components can be composed as designed | Architecture may have gaps | Integration testing |
| A-3 | Mode toggle is sufficient UX | May need more sophisticated approach | User testing |

---

## Open Questions

- [x] Q1: Which mode should be default?
  - Answer: Playground (existing behavior) for backwards compatibility

- [ ] Q2: How should mode toggle be triggered?
  - Options: Button, URL parameter, keyboard shortcut
  - Impact: UX design decision

- [ ] Q3: Should wizard pre-load on playground mode?
  - Impact: Initial load time vs. mode switch time

---

## Discovery Notes

### Investigation Conducted

- 2025-12-28: Post-epic review revealed integration gap
- Searched main.ts: No wizard instantiation
- Searched index.html: wizard-app div hidden, never activated
- Reviewed all wizard/*.ts files: Built but never imported into main

### Root Cause

Stories were written and implemented for individual components, but no story existed for **final integration**. Each piece was built and tested in isolation. The "glue" story was never created.

---

## Related Documents

- Original Brief: `bmad/00-brief/brief.md`
- PRD: `bmad/01-prd/PRD.md`
- Architecture: `bmad/02-architecture/ARCHITECTURE.md`
- Completed Stories: 024, 025, 026, 027, 028 (Async Optimization epic)
- Existing Wizard Code: `src/wizard/*.ts`
- Existing Async Code: `src/async/*.ts`

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Analyst | Mary | 2025-12-28 | Complete |

---

## Workflow Checklist

- [x] Problem statement is clear and specific
- [x] Stakeholders identified
- [x] Success criteria are measurable
- [x] Scope boundaries are explicit
- [x] No solution language present (describes integration need, not how)
- [x] Evidence provided (code inspection)

---

**Next Step**: `/pm` to create story requirements for wizard integration
