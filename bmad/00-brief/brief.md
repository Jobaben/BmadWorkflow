---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
status: Draft
created: 2025-12-25
updated: 2025-12-27
author: Analyst
---

# Project Brief: 3D Animation Learning Foundation - Wizard Learning Experience

> This document frames the problem space. It defines WHAT needs to be solved and WHY, never HOW.

---

## Executive Summary

A working 3D animation demo application exists with particle systems, fluid physics, object animation, and a combined demo. However, the current UI is a simple "playground" model where users click between demos without understanding the underlying concepts or framework usage. The learner needs a **guided wizard experience** that systematically teaches techniques from micro-concepts to advanced topics, with explanatory code snippets from the actual running demo.

---

## Problem Statement

### What is the problem?

The existing demo application successfully renders particles, fluid physics, and 3D objects, but it fails as a **learning tool**. Users can observe the results but gain no understanding of:

1. **How the code works** — The connection between visual output and source code is invisible
2. **Framework patterns** — The Three.js framework usage patterns are not explained
3. **Conceptual progression** — There is no structured path from basic concepts to advanced techniques

Clicking buttons to switch between demos provides entertainment value but not educational value. The learner cannot answer "How would I build this myself?" after using the current application.

### Who is affected?

- **Primary**: Developer (learner and future product owner) — Cannot achieve learning goals
- **Secondary**: Potential future learners who might use this as an educational resource
- **Tertiary**: Future product users — Quality of future car physics product depends on developer's mastery

### What is the impact?

| Impact Type | Current State | Measurement |
|-------------|---------------|-------------|
| Learning Efficiency | Demos visible but not understood | Time to independently recreate a technique |
| Knowledge Retention | Passive observation only | Can explain how particle emitter works? |
| Skill Transfer | Framework patterns unexplained | Can apply patterns to new problems? |
| Foundation Quality | Demos work but aren't educational | Confidence to build future product |

---

## Stakeholders

| Stakeholder | Role | Interest | Influence | Key Concerns |
|-------------|------|----------|-----------|--------------|
| Developer | Learner / Future Product Owner | Deep understanding of 3D techniques and framework | High | Must understand "why" not just "what" |
| Future Learners | Potential secondary users | Clear educational path | Medium | Accessibility of concepts |

### Stakeholder Relationships

The developer's learning depth directly determines the quality of the future car physics product. Shallow understanding from passive demo observation will result in fragile, cargo-culted implementations. Deep understanding from guided, explained learning will enable confident extension and debugging.

---

## Current State

### How is this handled today?

1. User opens the application and sees a 3D scene
2. User clicks buttons (Particles, Objects, Fluid, Combined) to switch demos
3. User adjusts sliders to see parameter effects
4. User observes visual results with no explanation

### Why current approaches fall short

| Approach | Limitation | Impact |
|----------|------------|--------|
| Button-based demo switching | No conceptual context or ordering | Learner doesn't know what to focus on |
| Parameter sliders | Change values without understanding why | Cargo-cult parameter tuning |
| Visual-only feedback | Code is hidden from user | Cannot connect output to implementation |

### What has been tried before?

| Attempt | When | Outcome | Why It Failed |
|---------|------|---------|---------------|
| Current button-based UI | 2025-12-25 | Demos work but don't teach | No educational design — purely functional |

---

## Success Criteria

> These criteria define how we will know the problem is solved. Each must be measurable.

| ID | Criterion | Metric | Target | Current |
|----|-----------|--------|--------|---------|
| SC-1 | Learner can explain particle emitter concepts | Verbal/written explanation test | Accurate description of lifecycle | Cannot explain |
| SC-2 | Learner understands framework patterns | Can identify Three.js patterns in code | Recognizes scene/mesh/material pattern | Patterns invisible |
| SC-3 | Concepts build progressively | Micro → Medium → Advanced ordering | Clear learning path exists | No ordering |
| SC-4 | Code is visible and explained | Annotated code snippets shown | Each technique has code explanation | No code visible |
| SC-5 | Can modify parameters while learning | Live interaction with explanations | Parameter changes tied to code concepts | Parameters work but unexplained |

### Validation Approach

- Learner completes wizard and can verbally explain each technique
- Learner can identify which code section controls which visual behavior
- Learner expresses confidence to implement similar techniques independently

---

## Scope

### In Scope

> These items WILL be addressed by this effort

- [ ] Guided wizard experience for learning 3D animation concepts
- [ ] Progressive concept ordering (micro → medium → advanced)
- [ ] Code snippet display from actual running demo
- [ ] Explanatory annotations for framework usage patterns
- [ ] Flexible navigation (recommended path with ability to jump)
- [ ] Live parameter adjustment tied to visible code

### Out of Scope

> These items will NOT be addressed (documented to prevent scope creep)

- Car physics product itself — this is only the learning foundation
- Backend services or databases
- User accounts or progress persistence
- Copy/paste functionality for code snippets
- Quiz or assessment features
- Mobile-specific optimizations

### Boundaries

- **Starts at**: Existing working demos (Particles, Objects, Fluid, Combined)
- **Ends at**: Wizard UI that teaches techniques using those demos
- **Does not include**: New animation techniques beyond what demos already show

---

## Constraints

### Business Constraints

- Solo developer: All design and implementation done by one person
- Timeline: Part of ~1 year learning foundation goal

### Technical Constraints

- Must run in modern web browsers
- Standalone SPA (no server-side dependencies)
- Must work with existing demo architecture

### Resource Constraints

- Single developer's time and attention
- Must balance learning tool creation with actually learning from it

### Regulatory/Compliance Constraints

- None identified

---

## Assumptions

> These are believed to be true but not yet verified

| ID | Assumption | Risk if Wrong | Validation Method |
|----|------------|---------------|-------------------|
| A-1 | Existing demo code is readable enough to display | May need refactoring before displaying | Code review |
| A-2 | Micro → macro concept ordering exists naturally | May need to restructure demos | Content analysis |
| A-3 | Explanatory annotations add value beyond code alone | Pure code might be enough | User testing |

---

## Open Questions

> Questions requiring answers before or during solution design

- [x] Q1: Strict linear progression or flexible jumping?
  - Owner: Developer
  - Answer: Both — recommended path exists but jumping allowed

- [x] Q2: Code snippets from actual code or simplified examples?
  - Owner: Developer
  - Answer: Actual running demo code with explanatory annotations

- [x] Q3: Need copy/paste functionality?
  - Owner: Developer
  - Answer: No — focus on understanding, not extraction

- [ ] Q4: How many micro-concepts exist in current demos?
  - Owner: Developer / PM
  - Impact: Determines wizard length and complexity

---

## Discovery Notes

### Research Conducted

- Initial problem framing session conducted 2025-12-25
- Problem refinement session conducted 2025-12-27

### Interviews/Observations

| Source | Date | Key Insights |
|--------|------|--------------|
| Developer (self) | 2025-12-25 | Future product = car physics with particles; no prior experience; 1 year timeline |
| Developer (self) | 2025-12-27 | Current UI shows but doesn't teach; need progressive concepts + code visibility |

---

## Related Documents

- Existing code: `src/demos/` (ParticleDemo, ObjectDemo, FluidDemo, CombinedDemo)
- Existing UI: `src/ui/` (DemoSelector, ControlPanel)
- Future: PRD will be created by `/pm`
- Future: Architecture will be created by `/architect`

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Analyst | Mary | 2025-12-27 | Complete |
| Primary Stakeholder | | | Pending |

---

## Workflow Checklist

- [x] Problem statement is clear and specific
- [x] At least 2 stakeholders identified
- [x] Success criteria are measurable (5 defined)
- [x] Scope boundaries are explicit
- [x] No solution language present
- [ ] Stakeholder has validated problem statement

---

**Next Step**: `/pm` to create Product Requirements Document
