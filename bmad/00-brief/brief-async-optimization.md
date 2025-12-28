---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: [brief.md, async-analysis]
status: Draft
created: 2025-12-28
updated: 2025-12-28
author: Analyst
---

# Project Brief: Asynchronous Architecture Optimization

> This document frames the problem space. It defines WHAT needs to be solved and WHY, never HOW.

---

## Executive Summary

The current frontend architecture is predominantly synchronous (~95%), with async patterns limited to syntax highlighter initialization. While the synchronous render loop is performant by design, other parts of the codebase risk blocking the main thread during potentially expensive operations. The application needs strategic async adoption to ensure future scalability without compromising the existing performant animation system.

---

## Problem Statement

### What is the problem?

The frontend codebase has a performant synchronous core (animation loop, input handling, rendering) but lacks async patterns in areas where blocking operations could degrade user experience. As the application grows with additional features (wizard navigation, content loading, potential remote resources), synchronous operations in these areas risk:

1. **Main thread blocking** — Long-running operations freeze the UI and animation
2. **Poor scalability** — Adding features increases blocking risk without async foundation
3. **Inconsistent patterns** — Mixed sync/async without clear guidelines creates maintenance burden

The current architecture was built for demo simplicity, not for a growing educational platform with multiple UI components, content loading, and potential future remote resources.

### Who is affected?

- **Primary**: End users — May experience UI freezes or animation stuttering during content operations
- **Secondary**: Developer — Maintenance complexity increases without consistent async patterns
- **Tertiary**: Future features — Scalability limited by synchronous bottlenecks

### What is the impact?

| Impact Type | Current State | Measurement |
|-------------|---------------|-------------|
| UI Responsiveness | Acceptable for current scope | Frame drops during heavy operations |
| Scalability | Limited by sync patterns | Blocking risk per new feature added |
| Code Consistency | Mixed patterns (~5% async) | Developer cognitive load |
| Future Readiness | Not prepared for remote content | Refactoring cost when needed |

---

## Stakeholders

| Stakeholder | Role | Interest | Influence | Key Concerns |
|-------------|------|----------|-----------|--------------|
| End User | Learner | Smooth, responsive UI | High | No animation stuttering or freezes |
| Developer | Maintainer | Consistent, scalable patterns | High | Clear guidelines for when to use async |

### Stakeholder Relationships

The developer's architecture decisions directly impact end user experience. Over-engineering async adds complexity without user benefit. Under-engineering blocks the main thread and degrades UX.

---

## Current State

### How is this handled today?

1. Animation loop runs synchronously via `requestAnimationFrame` (performant)
2. Input events processed synchronously (appropriate)
3. Syntax highlighter uses async initialization (isolated)
4. All other operations (UI updates, content loading, parameter changes) are synchronous

### Why current approaches fall short

| Approach | Limitation | Impact |
|----------|------------|--------|
| Synchronous content loading | Blocks main thread | UI freezes during wizard step transitions |
| Synchronous UI initialization | Multiple components initialize sequentially | Startup latency compounds |
| No async boundaries | Cannot yield to browser during long operations | Animation frame budget exceeded |

### What has been tried before?

| Attempt | When | Outcome | Why It Failed |
|---------|------|---------|---------------|
| Async syntax highlighter | Story-014 | Successful | N/A - this worked well |
| Everything else sync | Initial build | Works but doesn't scale | Designed for demo simplicity |

---

## Success Criteria

> These criteria define how we will know the problem is solved. Each must be measurable.

| ID | Criterion | Metric | Target | Current |
|----|-----------|--------|--------|---------|
| SC-1 | Animation never drops frames during content operations | Frame time during wizard navigation | <16.67ms (60fps) | Unmeasured |
| SC-2 | Main thread not blocked by non-render operations | Long task count (>50ms) | Zero during normal use | Unmeasured |
| SC-3 | Async patterns are consistent and documented | Code review / pattern audit | Clear guidelines exist | No guidelines |
| SC-4 | Render loop remains synchronous | Animation loop implementation | No async in hot path | Achieved |
| SC-5 | No unnecessary async overhead | Performance regression test | No measurable slowdown | Baseline TBD |

### Validation Approach

- Profile application during wizard navigation and content loading
- Measure frame times during heavy operations
- Audit code for long-running synchronous operations outside render loop
- Verify render loop remains synchronous after changes

---

## Scope

### In Scope

> These items WILL be addressed by this effort

- [ ] Identify synchronous operations that risk blocking main thread
- [ ] Define clear boundaries: what SHOULD be async vs. what MUST stay sync
- [ ] Content/data loading operations (wizard steps, code snippets)
- [ ] UI component initialization that can be deferred
- [ ] Establish async patterns that don't compromise render performance

### Out of Scope

> These items will NOT be addressed (documented to prevent scope creep)

- Animation loop refactoring — already performant, must remain synchronous
- Input handling — must remain synchronous for responsiveness
- Per-frame rendering — must remain synchronous for animation quality
- Adding async for async's sake — no changes without clear benefit
- Remote API integration — future scope, not current

### Boundaries

- **Starts at**: Current working application with ~95% synchronous code
- **Ends at**: Strategic async adoption in non-render-critical paths
- **Does not include**: Changes to the core animation/render loop
- **Preserves**: 60fps animation performance, input responsiveness

---

## Constraints

### Business Constraints

- Solo developer: Changes must be maintainable by one person
- Must not delay wizard feature development significantly

### Technical Constraints

- **MUST NOT** make animation loop async (would degrade performance)
- **MUST NOT** make input handling async (would add latency)
- **MUST** maintain 60fps render performance
- Standalone SPA (no server-side processing available)

### Resource Constraints

- Single developer's time — async refactoring competes with feature work
- Must balance immediate needs vs. future-proofing

### Regulatory/Compliance Constraints

- None identified

---

## Assumptions

> These are believed to be true but not yet verified

| ID | Assumption | Risk if Wrong | Validation Method |
|----|------------|---------------|-------------------|
| A-1 | Content loading can be async without UX degradation | May need loading states | Prototype and test |
| A-2 | Async initialization won't add noticeable startup latency | May slow initial load | Performance measurement |
| A-3 | Current sync operations don't already cause frame drops | Problem may not exist | Profiling |

---

## Open Questions

> Questions requiring answers before or during solution design

- [ ] Q1: Which specific operations currently risk blocking the main thread?
  - Owner: Developer / Architect
  - Impact: Determines scope of async adoption

- [ ] Q2: What is acceptable initialization latency for async component loading?
  - Owner: Developer
  - Impact: Determines loading state requirements

- [ ] Q3: Should async patterns be enforced via linting or just documented?
  - Owner: Developer
  - Impact: Maintenance burden vs. consistency

---

## Discovery Notes

### Research Conducted

- Async pattern analysis conducted 2025-12-28
- Identified: ~95% sync (render loop, input, UI), ~5% async (Shiki highlighter)

### Interviews/Observations

| Source | Date | Key Insights |
|--------|------|--------------|
| Codebase analysis | 2025-12-28 | Animation loop properly sync; content loading could benefit from async |
| Developer input | 2025-12-28 | Goals: scalability, avoid main thread blocking, preserve performance |

---

## Related Documents

- Primary brief: `bmad/00-brief/brief.md` (Wizard Learning Experience)
- Codebase: `src/` (current implementation)
- Future: PRD will define specific async requirements

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Analyst | Claude | 2025-12-28 | Complete |
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

**Next Step**: `/pm` to create Product Requirements Document for async optimization
