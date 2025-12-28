---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputDocuments: [bmad/00-brief/brief-wizard-integration.md]
status: Draft
created: 2025-12-28
updated: 2025-12-28
author: PM
brief_reference: bmad/00-brief/brief-wizard-integration.md
version: 1.0
parent_prd: bmad/01-prd/PRD.md
---

# Product Requirements Document: Wizard Integration

> This PRD addendum addresses the integration gap identified in brief-wizard-integration.md. It supplements the main PRD.md which defined the wizard concept.

---

## Executive Summary

The wizard learning experience has been fully architected and implemented across 16+ stories, but it remains **invisible to users**. All components exist and pass tests, but no code instantiates them at runtime. This PRD defines the requirements to make the wizard visible and usable.

**Key Insight**: This is not new feature development—it's integration work to activate existing functionality.

**Brief Reference**: See `bmad/00-brief/brief-wizard-integration.md`

---

## Problem Statement

> Summarized from brief-wizard-integration.md

The wizard learning experience described in PRD.md has been **architecturally complete but operationally absent** since inception:

1. **Components Built, Never Rendered** — WizardLayout, WizardController, LearningPanel, CodePanel exist but aren't instantiated
2. **Async Infrastructure Unused** — ContentBuffer, AsyncContentLoader, LoadingStateManager complete but never invoked
3. **No Mode Toggle** — No mechanism to switch from playground to wizard mode
4. **HTML Element Hidden** — `<div id="wizard-app">` exists but has `display: none` permanently

**Impact**: 16+ stories of work are invisible; user still sees only the playground.

---

## User Personas

### Persona 1: Alex the Aspiring Developer (from main PRD)

| Attribute | Integration-Specific Context |
|-----------|------------------------------|
| **Current Experience** | Sees demo buttons and sliders; unaware wizard exists |
| **Desired Experience** | Can access guided wizard alongside or instead of playground |
| **Pain Point** | Learning features exist but are inaccessible |

**Quote**: "Wait, there's a wizard? I thought this was just a demo playground."

### Persona 2: Dan the Developer (Maintainer)

| Attribute | Description |
|-----------|-------------|
| **Role** | Future maintainer extending the wizard |
| **Goals** | Understand how components are composed and initialized |
| **Pain Point** | Components exist in isolation; no reference for how they connect |
| **Context** | Reviews codebase to add new features |
| **Technical Proficiency** | High |

**Quote**: "I can see all these wizard components but how do they actually get used together?"

---

## Functional Requirements

> These requirements make the existing wizard visible and functional

| ID | Requirement | User Story | Priority | Brief Trace |
|----|-------------|------------|----------|-------------|
| FR-INT-001 | Mode Toggle | As Alex, I want to switch between playground and wizard modes so that I can access the learning experience | Must | SC-2 |
| FR-INT-002 | Wizard Instantiation | As Alex, I want the wizard to load when I select wizard mode so that I see the learning interface | Must | SC-3 |
| FR-INT-003 | Async Content Loading | As Alex, I want content to load without blocking the interface so that navigation feels responsive | Must | SC-4 |
| FR-INT-004 | Pre-warming Components | As Dan, I want SyntaxHighlighter pre-warmed during idle time so that first code snippet renders instantly | Should | SC-4 |
| FR-INT-005 | Mode Persistence | As Alex, I want my mode choice remembered within a session so that refreshing doesn't lose context | Could | - |
| FR-INT-006 | Demo Continuity | As Alex, I want the 3D demo to continue rendering when I switch modes so that learning includes live visuals | Must | SC-5 |

---

### FR-INT-001: Mode Toggle

**Description**: A mechanism for users to switch between playground mode (current behavior) and wizard mode (guided learning experience).

**Acceptance Criteria**:
```gherkin
Given I am in playground mode
When I activate the mode toggle
Then I see the wizard interface

Given I am in wizard mode
When I activate the mode toggle
Then I return to playground mode

Given I first load the application
When the page loads
Then I see playground mode (backwards compatibility)

Given I am viewing the application
When I look for the mode toggle
Then I can find it without instructions (discoverable)
```

**Edge Cases**:
- Toggle during animation: Mode switch should not break active animations
- Toggle mid-navigation: Should preserve demo state where possible

---

### FR-INT-002: Wizard Instantiation

**Description**: When wizard mode is activated, all wizard components are instantiated and rendered to the DOM.

**Acceptance Criteria**:
```gherkin
Given I activate wizard mode
When the mode transition completes
Then WizardLayout is rendered to the wizard-app container

Given wizard mode is active
When I view the interface
Then I see navigation controls, learning panel, and code panel

Given wizard mode is active
When WizardController initializes
Then it has access to all required dependencies (registry, engine, demo adapter)

Given I switch to wizard mode
When components initialize
Then existing playground UI is hidden (not destroyed)
```

**Edge Cases**:
- Missing dependencies: Should show error state, not crash
- Repeated mode switches: Components should handle re-initialization gracefully

---

### FR-INT-003: Async Content Loading

**Description**: Wizard content loads through the AsyncContentLoader infrastructure, preventing UI blocking.

**Acceptance Criteria**:
```gherkin
Given I navigate to a wizard step
When content needs to load
Then AsyncContentLoader handles the loading

Given content is loading
When I view the interface
Then I see a loading indicator (not a frozen UI)

Given I navigate away before load completes
When the navigation happens
Then the previous load is cancelled (via AbortController)

Given content fails to load
When an error occurs
Then a meaningful error message is shown
```

**Edge Cases**:
- Network delays: Loading state should be visible
- Rapid navigation: Previous requests should be cancelled

---

### FR-INT-004: Pre-warming Components

**Description**: Components that benefit from pre-initialization (like SyntaxHighlighter) are warmed up during browser idle time.

**Acceptance Criteria**:
```gherkin
Given the application has loaded
When browser is idle
Then ComponentInitializer pre-warms registered components

Given SyntaxHighlighter is pre-warmed
When I first view a code snippet in wizard
Then highlighting appears immediately (no visible delay)

Given pre-warming hasn't completed
When I access the wizard quickly
Then components initialize on-demand (graceful fallback)
```

**Edge Cases**:
- No idle time: Components initialize on first use
- Pre-warming fails: Fall back to on-demand initialization

---

### FR-INT-005: Mode Persistence (Session)

**Description**: The selected mode persists within a browser session so refreshes don't reset to playground.

**Acceptance Criteria**:
```gherkin
Given I select wizard mode
When I refresh the page
Then wizard mode is restored

Given I close the browser completely
When I return to the application
Then I see playground mode (clean start)

Given I use a URL parameter to specify mode
When the page loads
Then that mode is activated (override session)
```

**Edge Cases**:
- Conflicting signals: URL parameter takes precedence over session storage
- Storage disabled: Gracefully fall back to default (playground)

---

### FR-INT-006: Demo Continuity

**Description**: The 3D demo continues rendering alongside the wizard interface, providing live visual context for learning.

**Acceptance Criteria**:
```gherkin
Given I switch to wizard mode
When the mode transition completes
Then the 3D demo continues rendering (not paused)

Given I am in wizard mode viewing particle concepts
When I look at the demo area
Then I see the relevant particle demo running

Given I navigate between wizard steps
When the step changes
Then the demo updates to match the current topic

Given I am in wizard mode
When I view the layout
Then both wizard content and demo are visible simultaneously
```

**Edge Cases**:
- Performance: Demo rendering should not degrade wizard UI responsiveness
- Demo switch: Transition between demo types should be smooth

---

## Non-Functional Requirements

| ID | Category | Requirement | Target | Rationale |
|----|----------|-------------|--------|-----------|
| NFR-INT-001 | Performance | Mode switch should complete quickly | < 500ms perceived | User should not feel the application is slow |
| NFR-INT-002 | Performance | Demo frame rate should remain stable during wizard mode | 60 FPS maintained | Core requirement from async epic |
| NFR-INT-003 | Compatibility | Must work with existing components without modification | Zero changes to wizard/* or async/* internals | Integration, not refactoring |
| NFR-INT-004 | Backward Compatibility | Existing playground behavior unchanged | All current functionality preserved | Users shouldn't lose existing features |

---

## Prioritization Matrix

### MoSCoW Analysis

| Priority | Requirements | Rationale |
|----------|--------------|-----------|
| **Must** | FR-INT-001, FR-INT-002, FR-INT-003, FR-INT-006, NFR-INT-001, NFR-INT-002, NFR-INT-003, NFR-INT-004 | Core integration - without these, wizard remains invisible |
| **Should** | FR-INT-004 | Improves perceived performance but wizard works without it |
| **Could** | FR-INT-005 | Convenience feature, not essential for wizard functionality |
| **Won't** | Automatic mode detection, onboarding flow | Out of scope for integration |

### Priority Justification

- **FR-INT-001 is Must because**: Without mode toggle, users cannot access the wizard at all
- **FR-INT-002 is Must because**: Without instantiation, wizard UI never appears
- **FR-INT-003 is Must because**: Without async loading, wizard violates 60fps requirement
- **FR-INT-006 is Must because**: Without demo continuity, learning loses visual context
- **FR-INT-004 is Should because**: Improves UX but not blocking
- **FR-INT-005 is Could because**: Nice convenience but refresh isn't common

---

## Scope

### In Scope

> These capabilities WILL be delivered

- [x] Mode toggle mechanism (playground <-> wizard) — FR-INT-001
- [x] Wizard component instantiation in main.ts — FR-INT-002
- [x] WizardLayout rendering to DOM — FR-INT-002
- [x] AsyncContentLoader integration for content — FR-INT-003
- [x] ComponentInitializer for pre-warming — FR-INT-004
- [x] Hiding/showing appropriate UI elements per mode — FR-INT-002
- [x] Demo continues in wizard mode — FR-INT-006

### Out of Scope

> These are explicitly EXCLUDED

- **Changes to existing wizard components**: Integration uses components as-is
- **Changes to async infrastructure**: Integration uses infrastructure as-is
- **New wizard features**: Only connecting existing pieces
- **New learning content**: Content already defined in concept registry
- **Mobile optimization**: Desktop focus per main PRD

---

## Dependencies

| ID | Dependency | Type | Owner | Status | Impact if Unavailable |
|----|------------|------|-------|--------|----------------------|
| DEP-INT-001 | WizardLayout | Internal | Prior stories | Complete | Blocker |
| DEP-INT-002 | WizardController | Internal | Prior stories | Complete | Blocker |
| DEP-INT-003 | AsyncContentLoader | Internal | Story-027 | Complete | Blocker |
| DEP-INT-004 | ContentBuffer | Internal | Story-024 | Complete | Blocker |
| DEP-INT-005 | ComponentInitializer | Internal | Story-026 | Complete | Blocker |
| DEP-INT-006 | SyntaxHighlighterComponent | Internal | Story-028 | Complete | Blocker |
| DEP-INT-007 | ConceptRegistry with content | Internal | Prior stories | Complete | Blocker |

**All dependencies are COMPLETE** — this is purely integration work.

---

## Constraints

### Technical Constraints
- Must not modify existing wizard/* or async/* files (use as-is)
- Must maintain 60fps during mode transitions
- Must preserve existing playground functionality

### Resource Constraints
- Single developer implementation
- Should be completed in single story

---

## Assumptions

| ID | Assumption | Impact if Wrong | Validation Plan |
|----|------------|-----------------|-----------------|
| A-INT-001 | All wizard components work correctly when composed | May discover integration bugs | Test during implementation |
| A-INT-002 | Components can be instantiated multiple times (mode toggle) | May need lifecycle management | Test toggle cycles |
| A-INT-003 | HTML structure supports both modes | May need index.html changes | Review layout requirements |

---

## Risks

| ID | Risk | Probability | Impact | Mitigation | Owner |
|----|------|-------------|--------|------------|-------|
| R-INT-001 | Components have hidden interdependencies | Low | Medium | Tests pass; likely minimal issues | Developer |
| R-INT-002 | Performance regression during mode switch | Medium | Medium | Profile and optimize if needed | Developer |
| R-INT-003 | Layout conflicts between modes | Low | Medium | CSS scoping per mode | Developer |

---

## Success Metrics

> Tied to Success Criteria from brief

| Metric | Baseline | Target | Measurement Method | Brief Trace |
|--------|----------|--------|-------------------|-------------|
| Wizard visibility | Hidden | Visible and usable | Manual verification | SC-1 |
| Mode toggle function | Doesn't exist | Works both directions | Functional test | SC-2 |
| Component instantiation | 0 components | All wizard components | Runtime inspection | SC-3 |
| Async usage | 0% of async code used | AsyncContentLoader active | Debug logging | SC-4 |
| Navigation works | Cannot test | Steps navigable | End-to-end test | SC-5 |

---

## Traceability Matrix

| Brief Success Criterion | PRD Requirements | Coverage |
|------------------------|------------------|----------|
| SC-1: Wizard visible | FR-INT-002 | Full |
| SC-2: Mode toggle works | FR-INT-001 | Full |
| SC-3: Components initialized | FR-INT-002, FR-INT-004 | Full |
| SC-4: Async infrastructure active | FR-INT-003, FR-INT-004 | Full |
| SC-5: Learning experience functional | FR-INT-006 | Full |

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Manager | John | 2025-12-28 | Complete |
| Primary Stakeholder | | | Pending |

---

## Workflow Checklist

- [x] All brief success criteria have requirements (SC-1 through SC-5 mapped)
- [x] Minimum 2 personas defined (Alex, Dan)
- [x] All MUST requirements have acceptance criteria
- [x] Prioritization complete (MoSCoW applied)
- [x] No implementation details present
- [x] Traceability to brief established
- [x] Out of scope explicitly documented

---

**Next Step**: `/scrum` to create story for wizard integration (single story expected)
