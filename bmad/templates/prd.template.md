---
stepsCompleted: []
inputDocuments: []
status: Draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: PM
brief_reference: bmad/00-brief/brief.md
---

# Product Requirements Document (PRD)

> This document defines WHAT the product should do and for WHOM. It contains no implementation details.

---

## Executive Summary

[2-3 sentence overview of what this product/feature will do and why it matters]

---

## Problem Statement

> Summarized from brief - the core problem being solved

[Reference the problem statement from the brief. This should be a direct traceability link.]

**Brief Reference**: See `bmad/00-brief/brief.md` - Problem Statement section

---

## User Personas

### Persona 1: [Name]

| Attribute | Description |
|-----------|-------------|
| **Role** | [Job title or user type] |
| **Goals** | [What they want to achieve] |
| **Pain Points** | [Current frustrations from brief] |
| **Context** | [How/when they use the product] |
| **Technical Proficiency** | Low / Medium / High |

**Behaviors**:
- [Key behavior 1]
- [Key behavior 2]

**Quote**: "[Representative quote capturing their mindset]"

### Persona 2: [Name]

[Repeat structure - minimum 2 personas required]

---

## Functional Requirements

> Each requirement must be traceable to a stakeholder need from the brief

| ID | Requirement | User Story | Priority | Brief Trace |
|----|-------------|------------|----------|-------------|
| FR-001 | [Description] | As a [persona], I want [action] so that [benefit] | Must | SC-X |
| FR-002 | [Description] | As a [persona], I want [action] so that [benefit] | Must | SC-X |
| FR-003 | [Description] | As a [persona], I want [action] so that [benefit] | Should | SC-X |
| FR-004 | [Description] | As a [persona], I want [action] so that [benefit] | Could | SC-X |

### FR-001: [Requirement Name]

**Description**: [Detailed description]

**Acceptance Criteria**:
```gherkin
Given [precondition]
When [action]
Then [expected result]

Given [precondition]
When [alternative action]
Then [expected result]
```

**Edge Cases**:
- [Edge case 1]: [Expected behavior]
- [Edge case 2]: [Expected behavior]

### FR-002: [Requirement Name]

[Repeat structure for each requirement]

---

## Non-Functional Requirements

| ID | Category | Requirement | Target | Rationale |
|----|----------|-------------|--------|-----------|
| NFR-001 | Performance | [Description] | [Specific metric] | [Why this matters] |
| NFR-002 | Security | [Description] | [Standard/compliance] | [Why this matters] |
| NFR-003 | Scalability | [Description] | [Capacity target] | [Why this matters] |
| NFR-004 | Availability | [Description] | [SLA target] | [Why this matters] |
| NFR-005 | Usability | [Description] | [Accessibility standard] | [Why this matters] |

---

## Prioritization Matrix

### MoSCoW Analysis

| Priority | Requirements | Rationale |
|----------|--------------|-----------|
| **Must** | FR-001, FR-002, NFR-001, NFR-002 | Without these, product is not viable |
| **Should** | FR-003, NFR-003 | Important but not critical for launch |
| **Could** | FR-004 | Nice-to-have if resources permit |
| **Won't** | [Explicitly excluded] | Documented for scope clarity |

### Priority Justification

- **FR-001 is Must because**: [Rationale]
- **FR-003 is Should because**: [Rationale]

---

## Scope

### In Scope

> These capabilities WILL be delivered

- [ ] [Capability 1 - tied to FR-XXX]
- [ ] [Capability 2 - tied to FR-XXX]
- [ ] [Capability 3 - tied to FR-XXX]

### Out of Scope

> These are explicitly EXCLUDED (prevents scope creep)

- [Excluded item 1]: [Why excluded, potential future consideration]
- [Excluded item 2]: [Why excluded]

### Future Considerations

> May be addressed in future phases

- [Future item 1]: [Dependency or trigger for inclusion]

---

## Dependencies

| ID | Dependency | Type | Owner | Status | Impact if Unavailable |
|----|------------|------|-------|--------|----------------------|
| DEP-001 | [Dependency] | Internal/External | [Team/System] | Available/Pending | [Blocker/Degraded] |

---

## Constraints

### Business Constraints
- [Constraint 1]: [Impact on requirements]

### Regulatory Constraints
- [Constraint 1]: [Compliance requirement]

### Timeline Constraints
- [Constraint 1]: [Date-driven requirement]

---

## Assumptions

| ID | Assumption | Impact if Wrong | Validation Plan |
|----|------------|-----------------|-----------------|
| A-001 | [Assumption] | [Risk] | [How to validate] |

---

## Risks

| ID | Risk | Probability | Impact | Mitigation | Owner |
|----|------|-------------|--------|------------|-------|
| R-001 | [Risk description] | H/M/L | H/M/L | [Strategy] | [Who] |

---

## Success Metrics

> Tied to Success Criteria from brief

| Metric | Baseline | Target | Measurement Method | Brief Trace |
|--------|----------|--------|-------------------|-------------|
| [Metric 1] | [Current] | [Goal] | [How measured] | SC-1 |
| [Metric 2] | [Current] | [Goal] | [How measured] | SC-2 |

---

## Traceability Matrix

| Brief Success Criterion | PRD Requirements | Coverage |
|------------------------|------------------|----------|
| SC-1 | FR-001, FR-002 | Full |
| SC-2 | FR-003, NFR-001 | Full |
| SC-3 | FR-004 | Partial |

---

## Open Questions

- [ ] Q1: [Question]
  - Impact: [What decision it affects]
  - Owner: [Who should answer]
  - Due: [When needed]

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Manager | | | Pending |
| Primary Stakeholder | | | Pending |
| Technical Lead | | | Pending |

---

## Workflow Checklist

- [ ] All brief success criteria have requirements
- [ ] Minimum 2 personas defined
- [ ] All MUST requirements have acceptance criteria
- [ ] Prioritization complete (MoSCoW applied)
- [ ] No implementation details present
- [ ] Traceability to brief established
- [ ] Out of scope explicitly documented

---

**Next Step**: `/architect` to create Technical Architecture
