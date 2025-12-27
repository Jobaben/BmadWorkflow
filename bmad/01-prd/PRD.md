---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputDocuments: [bmad/00-brief/brief.md]
status: Draft
created: 2025-12-25
updated: 2025-12-27
author: PM
brief_reference: bmad/00-brief/brief.md
version: 2.0
---

# Product Requirements Document (PRD)

> This document defines WHAT the product should do and for WHOM. It contains no implementation details.

---

## Executive Summary

Transform the existing 3D animation demo application from a passive observation tool into a **guided wizard learning experience** that systematically teaches 3D animation techniques. The wizard will progress learners from micro-concepts to advanced topics, displaying annotated code snippets from the actual running demos and connecting parameter adjustments to their underlying code implementations. This addresses the core problem that users can currently see results but cannot answer "How would I build this myself?"

**Context**: Working demos already exist (particles, fluid physics, object animation, combined). This PRD defines the educational layer that makes them teachable.

---

## Problem Statement

> Summarized from brief - the core problem being solved

The existing demo application successfully renders particles, fluid physics, and 3D objects, but it fails as a **learning tool**. The connection between visual output and source code is invisible, framework patterns are unexplained, and there is no structured path from basic concepts to advanced techniques.

Users can observe the results but gain no understanding of:
1. **How the code works** — The connection between visual output and source code is invisible
2. **Framework patterns** — The framework usage patterns are not explained
3. **Conceptual progression** — There is no structured path from basic concepts to advanced techniques

**Brief Reference**: See `bmad/00-brief/brief.md` - Problem Statement section

---

## User Personas

### Persona 1: Alex the Aspiring Developer

| Attribute | Description |
|-----------|-------------|
| **Role** | Solo developer learning 3D animation fundamentals |
| **Goals** | Master 3D animation techniques to build a car physics product within ~1 year |
| **Pain Points** | Current demos show results but don't explain how they work; cannot connect visual output to code; no clear learning path |
| **Context** | Uses the application during focused learning sessions; wants to understand deeply, not just copy-paste |
| **Technical Proficiency** | Medium - understands programming but new to 3D frameworks |

**Behaviors**:
- Prefers structured learning over random exploration
- Wants to understand "why" not just "what"
- Values seeing actual code over simplified examples
- Needs to build confidence before tackling complex projects

**Quote**: "I can see the particles moving, but I have no idea how I'd recreate this in my own project."

### Persona 2: Sam the Secondary Learner

| Attribute | Description |
|-----------|-------------|
| **Role** | Future user of this educational resource |
| **Goals** | Learn 3D animation concepts through a well-structured tutorial |
| **Pain Points** | Existing tutorials often use contrived examples that don't match real code |
| **Context** | Discovers this as an educational resource; may have varying skill levels |
| **Technical Proficiency** | Low to Medium |

**Behaviors**:
- May follow the recommended path or jump to specific topics
- Values clear explanations alongside working examples
- Needs progressive complexity to avoid overwhelm
- Benefits from seeing concepts in context of a real application

**Quote**: "I want to learn from real code, not dumbed-down examples that don't work in practice."

---

## Functional Requirements

> Each requirement must be traceable to a stakeholder need from the brief

| ID | Requirement | User Story | Priority | Brief Trace |
|----|-------------|------------|----------|-------------|
| FR-001 | Wizard Navigation System | As Alex, I want a guided wizard that leads me through concepts in order so that I build understanding progressively | Must | SC-3 |
| FR-002 | Code Snippet Display | As Alex, I want to see the actual code that produces each visual effect so that I understand how it works | Must | SC-4 |
| FR-003 | Explanatory Annotations | As Alex, I want code snippets annotated with explanations so that I understand framework patterns | Must | SC-2 |
| FR-004 | Flexible Navigation | As Sam, I want to jump to specific topics when needed so that I can focus on what I need to learn | Should | SC-3 |
| FR-005 | Live Parameter Connection | As Alex, I want to adjust parameters and see both the visual change AND the related code so that I understand the connection | Must | SC-5 |
| FR-006 | Concept Categorization | As Sam, I want concepts organized by complexity level so that I can gauge my progress | Should | SC-3 |
| FR-007 | Integrated Demo Rendering | As Alex, I want the demo to render alongside explanations so that I see concepts in action | Must | SC-4 |

---

### FR-001: Wizard Navigation System

**Description**: A guided, step-by-step navigation system that presents learning content in a recommended progressive order from micro-concepts to advanced techniques.

**Acceptance Criteria**:
```gherkin
Given I am on any wizard step
When I complete the current step
Then I can proceed to the next recommended step

Given I am viewing the wizard
When I look at the navigation
Then I can see my current position in the overall learning path

Given I am on a step other than the first
When I want to review previous content
Then I can navigate backwards in the wizard
```

**Edge Cases**:
- First step: No "previous" navigation available
- Last step: Clear indication that learning path is complete
- Re-entry: Wizard should work if user refreshes or returns

---

### FR-002: Code Snippet Display

**Description**: Display actual source code snippets from the running demos, showing the real implementation that produces the visible effects.

**Acceptance Criteria**:
```gherkin
Given I am viewing a concept explanation
When the concept involves code
Then I see the actual code snippet from the demo source

Given I am viewing a code snippet
When I compare it to the source files
Then the snippet matches the actual implementation

Given I am viewing a code snippet
When I look at the display
Then the code is syntax-highlighted and readable
```

**Edge Cases**:
- Long code blocks: Should be scrollable or collapsible
- Code updates: Snippets should remain accurate if demo code changes

---

### FR-003: Explanatory Annotations

**Description**: Code snippets include annotations that explain framework patterns, key concepts, and the purpose of each significant code section.

**Acceptance Criteria**:
```gherkin
Given I am viewing a code snippet
When the code uses framework patterns
Then annotations explain what those patterns do

Given I am viewing annotations
When I read them
Then they explain "why" not just "what" the code does

Given I am learning about a concept
When I view its code
Then key lines or sections are highlighted with explanations
```

**Edge Cases**:
- Dense code: Annotations should not obscure readability
- Simple code: May have fewer annotations without feeling incomplete

---

### FR-004: Flexible Navigation

**Description**: While a recommended path exists, users can jump to any concept at any time without being locked into linear progression.

**Acceptance Criteria**:
```gherkin
Given I am viewing the wizard
When I want to skip to a specific topic
Then I can navigate directly to that topic

Given I have jumped to an advanced topic
When I realize I need foundational knowledge
Then I can easily navigate to prerequisite concepts

Given I am browsing available topics
When I view the topic list
Then I can see all topics with their complexity levels
```

**Edge Cases**:
- Deep linking: Should support direct navigation to specific concepts
- Context switching: Demo should update appropriately when jumping between topics

---

### FR-005: Live Parameter Connection

**Description**: When users adjust parameters via controls, they see both the visual effect change AND the code that controls that parameter, connecting interaction to implementation.

**Acceptance Criteria**:
```gherkin
Given I am viewing a concept with adjustable parameters
When I adjust a parameter control
Then I see the visual effect change in real-time

Given I am adjusting a parameter
When I look at the code display
Then the relevant code section is highlighted or indicated

Given I am viewing parameter controls
When I see a control
Then I understand which code variable it affects
```

**Edge Cases**:
- Multiple parameters: Each should clearly map to its code
- Extreme values: Demo should handle edge cases gracefully

---

### FR-006: Concept Categorization

**Description**: Concepts are organized into complexity tiers (micro, medium, advanced) so learners can understand the progression and choose appropriate starting points.

**Acceptance Criteria**:
```gherkin
Given I am viewing the concept list
When I look at any concept
Then I can see its complexity level clearly indicated

Given I am a beginner
When I start learning
Then micro-concepts are presented first in the recommended path

Given I want to see advanced topics
When I browse the concept list
Then I can filter or identify advanced concepts
```

**Edge Cases**:
- Concepts spanning levels: Should be categorized by primary complexity
- Empty categories: Handle gracefully if a level has no concepts

---

### FR-007: Integrated Demo Rendering

**Description**: The active demo renders alongside the wizard content so users can see concepts demonstrated in real-time.

**Acceptance Criteria**:
```gherkin
Given I am on a wizard step about particles
When I view the step
Then I see a live particle demo rendering

Given I am learning about a specific technique
When I view that step
Then the demo shows that technique in action

Given I am viewing the wizard interface
When I look at the layout
Then both explanation content and demo are visible simultaneously
```

**Edge Cases**:
- Performance: Demo rendering should not degrade learning experience
- Demo context: Should switch appropriately between particle/fluid/object demos

---

## Non-Functional Requirements

| ID | Category | Requirement | Target | Rationale |
|----|----------|-------------|--------|-----------|
| NFR-001 | Performance | Demo rendering must maintain smooth frame rate during learning | 30+ FPS minimum | Choppy rendering distracts from learning |
| NFR-002 | Compatibility | Must run in modern web browsers | Chrome, Firefox, Safari, Edge (latest 2 versions) | Standalone SPA constraint from brief |
| NFR-003 | Usability | Learning interface must be intuitive without training | First-time user can navigate wizard within 30 seconds | Solo developer has no support team |
| NFR-004 | Maintainability | Must integrate with existing demo architecture | No restructuring of core demo code required | Technical constraint from brief |
| NFR-005 | Accessibility | Text content must be readable | Minimum 16px font, sufficient contrast | Educational content must be legible |
| NFR-006 | Responsiveness | Interface must work on desktop browsers | 1024px minimum viewport width | Out of scope excludes mobile optimization |

---

## Prioritization Matrix

### MoSCoW Analysis

| Priority | Requirements | Rationale |
|----------|--------------|-----------|
| **Must** | FR-001, FR-002, FR-003, FR-005, FR-007, NFR-001, NFR-002, NFR-004 | Core wizard experience - without these, learning goals cannot be met |
| **Should** | FR-004, FR-006, NFR-003, NFR-005 | Enhance usability but wizard works without them |
| **Could** | NFR-006 | Nice for varied setups but not critical |
| **Won't** | Copy/paste functionality, quizzes, progress persistence, mobile optimization | Explicitly out of scope per brief |

### Priority Justification

- **FR-001 is Must because**: Without guided navigation, users face the same unstructured experience as current playground
- **FR-002 is Must because**: Visible code is the core differentiator - SC-4 requires code to be visible and explained
- **FR-003 is Must because**: Code alone isn't enough; annotations address SC-2 (framework pattern understanding)
- **FR-005 is Must because**: Connecting parameters to code addresses SC-5 and deepens understanding
- **FR-007 is Must because**: Visual learning requires seeing the demo alongside explanations
- **FR-004 is Should because**: Linear-only would work for learning; flexibility enhances but isn't essential
- **FR-006 is Should because**: Implicit ordering works; explicit categories improve experience

---

## Scope

### In Scope

> These capabilities WILL be delivered

- [x] Guided wizard experience for learning 3D animation concepts — FR-001
- [x] Progressive concept ordering (micro → medium → advanced) — FR-006
- [x] Code snippet display from actual running demo — FR-002
- [x] Explanatory annotations for framework usage patterns — FR-003
- [x] Flexible navigation (recommended path with ability to jump) — FR-004
- [x] Live parameter adjustment tied to visible code — FR-005
- [x] Integrated demo rendering alongside explanations — FR-007

### Out of Scope

> These are explicitly EXCLUDED (prevents scope creep)

- **Car physics product**: This is only the learning foundation, not the end product
- **Backend services or databases**: Standalone SPA with no server dependencies
- **User accounts or progress persistence**: Session-only experience
- **Copy/paste functionality**: Focus is on understanding, not code extraction
- **Quiz or assessment features**: Learning is self-directed, not tested
- **Mobile-specific optimizations**: Desktop browser focus only

### Future Considerations

> May be addressed in future phases

- **Progress persistence**: Could add local storage for session continuity
- **Additional demos**: New animation techniques could extend the wizard
- **Export/sharing**: After learning foundation is solid

---

## Dependencies

| ID | Dependency | Type | Owner | Status | Impact if Unavailable |
|----|------------|------|-------|--------|----------------------|
| DEP-001 | Existing demo code (ParticleDemo, ObjectDemo, FluidDemo, CombinedDemo) | Internal | Developer | Available | Blocker - no content to teach |
| DEP-002 | Existing UI components (DemoSelector, ControlPanel) | Internal | Developer | Available | Degraded - would need new controls |
| DEP-003 | Demo code must be readable/extractable for display | Internal | Developer | Assumed (A-1) | Blocker - may need refactoring |

---

## Constraints

### Business Constraints
- **Solo developer**: All design and implementation done by one person - impacts scope and timeline flexibility

### Technical Constraints
- **Browser-only**: Must run in modern web browsers with no server dependencies
- **Existing architecture**: Must work with current demo structure without major refactoring

### Resource Constraints
- **Single developer**: Must balance building the tool with using it to learn

---

## Assumptions

| ID | Assumption | Impact if Wrong | Validation Plan |
|----|------------|-----------------|-----------------|
| A-001 | Existing demo code is readable enough to display as educational content | May require refactoring before display | Code review during architecture phase |
| A-002 | Micro → macro concept ordering exists naturally in the demos | May need to restructure or add intermediate concepts | Content analysis during architecture |
| A-003 | Explanatory annotations add value beyond code alone | Could simplify to code-only if annotations don't help | User testing with first concepts |

---

## Risks

| ID | Risk | Probability | Impact | Mitigation | Owner |
|----|------|-------------|--------|------------|-------|
| R-001 | Demo code too complex to explain in bite-sized concepts | Medium | High | Break into smaller functions if needed; simplify before display | Developer |
| R-002 | Wizard UI competes with demo for screen space | Medium | Medium | Design layout that balances both; may need collapsible panels | Developer |
| R-003 | Maintaining code snippets as demos evolve | Low | Medium | Architecture should define snippet extraction strategy | Architect |
| R-004 | Annotations become stale or inaccurate | Low | Medium | Keep annotations close to code; review when code changes | Developer |

---

## Success Metrics

> Tied to Success Criteria from brief

| Metric | Baseline | Target | Measurement Method | Brief Trace |
|--------|----------|--------|-------------------|-------------|
| Concept explanation ability | Cannot explain particle emitter | Accurate verbal description of lifecycle | Self-assessment after wizard completion | SC-1 |
| Framework pattern recognition | Patterns invisible to learner | Can identify scene/mesh/material pattern | Code review exercise | SC-2 |
| Learning path clarity | No ordering exists | Clear micro → medium → advanced progression | Wizard structure review | SC-3 |
| Code visibility | No code visible in app | Every technique has code + explanation | Feature verification | SC-4 |
| Parameter understanding | Parameters work but unexplained | Can explain what code variable controls each slider | Interactive testing | SC-5 |

---

## Traceability Matrix

| Brief Success Criterion | PRD Requirements | Coverage |
|------------------------|------------------|----------|
| SC-1: Explain particle concepts | FR-002, FR-003 | Full |
| SC-2: Understand framework patterns | FR-003 | Full |
| SC-3: Progressive concept building | FR-001, FR-004, FR-006 | Full |
| SC-4: Code visible and explained | FR-002, FR-003, FR-007 | Full |
| SC-5: Parameter modification with understanding | FR-005 | Full |

---

## Open Questions

- [x] Q1: Strict linear progression or flexible jumping?
  - **Answer**: Both — recommended path exists but jumping allowed (FR-001 + FR-004)

- [x] Q2: Code snippets from actual code or simplified examples?
  - **Answer**: Actual running demo code with explanatory annotations (FR-002 + FR-003)

- [x] Q3: Need copy/paste functionality?
  - **Answer**: No — explicitly out of scope; focus on understanding

- [ ] Q4: How many micro-concepts exist in current demos?
  - Impact: Determines wizard length and number of steps
  - Owner: Architect (will analyze during technical design)
  - Due: Before story creation

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Manager | John | 2025-12-27 | Complete |
| Primary Stakeholder | | | Pending |
| Technical Lead | | | Pending |

---

## Workflow Checklist

- [x] All brief success criteria have requirements (SC-1 through SC-5 mapped)
- [x] Minimum 2 personas defined (Alex, Sam)
- [x] All MUST requirements have acceptance criteria
- [x] Prioritization complete (MoSCoW applied)
- [x] No implementation details present
- [x] Traceability to brief established
- [x] Out of scope explicitly documented

---

**Next Step**: `/architect` to create Technical Architecture
