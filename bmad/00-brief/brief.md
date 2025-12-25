---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
status: Draft
created: 2025-12-25
updated: 2025-12-25
author: Analyst
---

# Project Brief: Automated QA Run Check for BMAD Workflow

> This document frames the problem space. It defines WHAT needs to be solved and WHY, never HOW.

---

## Executive Summary

The BMAD workflow's QA review process currently requires manual invocation via `/qa story-###`. This creates friction in the development process and risks QA being skipped or forgotten. A GitHub run check is needed that automatically performs QA review and provides pass/fail feedback directly in the pull request workflow.

---

## Problem Statement

### What is the problem?

The BMAD workflow has a well-defined QA review process that evaluates story implementations against acceptance criteria, architecture alignment, and code quality. However, this process is entirely manual—developers must remember to invoke `/qa story-###` after completing implementation.

This manual step creates several issues:
- QA review can be skipped or forgotten
- There's no automated enforcement of quality gates before merging
- The feedback loop is disconnected from the GitHub PR workflow
- No visibility into QA status directly on the pull request

### Who is affected?

- **Primary**: Developers using the BMAD workflow who want automated quality feedback
- **Secondary**: Project maintainers who want to enforce QA gates before merging
- **Tertiary**: Future contributors who need clear, automated feedback on their PRs

### What is the impact?

| Impact Type | Current State | Measurement |
|-------------|---------------|-------------|
| Quality Risk | QA can be skipped | Binary: Enforced/Not Enforced |
| Developer Experience | Manual QA invocation required | Steps to complete PR |
| Visibility | QA status not visible in PR | Present/Absent in GitHub UI |
| Consistency | Variable QA thoroughness | Standardized vs. ad-hoc |

---

## Stakeholders

| Stakeholder | Role | Interest | Influence | Key Concerns |
|-------------|------|----------|-----------|--------------|
| BMAD Workflow Users | Developers | Automated feedback, reduced manual steps | High | Speed, reliability, clear results |
| Project Maintainers | Quality Gatekeepers | Enforce QA before merge | High | Preventing unreviewed code from merging |
| Repository Owners | Infrastructure Owners | CI/CD integration | Medium | Cost, maintenance, security |

### Stakeholder Relationships

All stakeholders benefit from automated QA: developers get faster feedback, maintainers get enforcement, and owners get consistent quality.

---

## Current State

### How is this handled today?

1. Developer completes story implementation
2. Developer creates pull request
3. Developer (or reviewer) must manually run `/qa story-###`
4. QA agent produces review document
5. Story status is updated to QA Pass/Fail
6. Manual merge if passed

### Why current approaches fall short

| Approach | Limitation | Impact |
|----------|------------|--------|
| Manual `/qa` invocation | Easy to forget or skip | Unreviewed code can merge |
| No GitHub integration | QA status not visible in PR | Poor developer experience |
| Human-dependent triggering | Inconsistent timing | Delayed feedback |

### What has been tried before?

| Attempt | When | Outcome | Why It Failed |
|---------|------|---------|---------------|
| Nothing | N/A | N/A | Feature not yet implemented |

---

## Success Criteria

> These criteria define how we will know the problem is solved. Each must be measurable.

| ID | Criterion | Metric | Target | Current |
|----|-----------|--------|--------|---------|
| SC-1 | QA review runs automatically on PR | PR triggers check | 100% of PRs | 0% |
| SC-2 | Check status reflects QA verdict | PASS/FAIL matches story review | Accurate | N/A |
| SC-3 | Review document created automatically | `review-story-{id}.md` exists | Created | Manual |
| SC-4 | Failed QA blocks merge | Required check configured | Enforced | Not enforced |
| SC-5 | QA results visible in GitHub UI | Check details viewable | Visible | Not visible |

### Validation Approach

- Create a test PR with a passing story, verify check passes
- Create a test PR with a failing story, verify check fails
- Confirm review document is created in `bmad/04-qa/`
- Verify merge is blocked when QA fails (if configured as required)

---

## Scope

### In Scope

> These items WILL be addressed by this effort

- [ ] Automatic QA review triggered by pull request events
- [ ] GitHub check status reflecting QA pass/fail verdict
- [ ] Review document creation (`bmad/04-qa/review-story-{id}.md`)
- [ ] Story status update based on QA verdict
- [ ] Clear feedback visible in GitHub PR UI

### Out of Scope

> These items will NOT be addressed (documented to prevent scope creep)

- Full Dev role automation (only QA is automated)
- Cross-repository BMAD workflow (this repo only initially)
- Custom QA rules per story (use standard QA process)
- Integration with other CI/CD platforms (GitHub only)

### Boundaries

- **Starts at**: PR created/updated with story implementation
- **Ends at**: QA check complete, status reported, review document created
- **Does not include**: Implementation fixes (that remains Dev role responsibility)

---

## Constraints

### Business Constraints

- Must work within GitHub's check/action infrastructure
- Should not require significant ongoing costs

### Technical Constraints

- Must integrate with existing BMAD file structure
- Must preserve the QA agent's review process logic
- Cannot modify implementation code (QA is read-only)

### Resource Constraints

- Single repository focus initially
- Must be maintainable without dedicated DevOps resources

### Regulatory/Compliance Constraints

- None identified

---

## Assumptions

> These are believed to be true but not yet verified

| ID | Assumption | Risk if Wrong | Validation Method |
|----|------------|---------------|-------------------|
| A-1 | GitHub Actions can run Claude-based QA | May need alternative approach | Prototype testing |
| A-2 | Story ID can be extracted from PR context | May need naming conventions | Prototype testing |
| A-3 | QA process can complete within GitHub timeout limits | May need optimization | Timing tests |

---

## Open Questions

> Questions requiring answers before or during solution design

- [ ] Q1: How should the story ID be determined from the PR?
  - Owner: Architect
  - Impact: Determines automation trigger logic

- [ ] Q2: Should the check be required to pass before merge?
  - Owner: Repository Owner
  - Impact: Enforcement level

- [ ] Q3: What happens if multiple stories are in one PR?
  - Owner: Architect
  - Impact: Check design complexity

---

## Discovery Notes

### Research Conducted

- Reviewed existing BMAD QA agent and workflow (2025-12-25)
- Analyzed current manual process steps

### Interviews/Observations

| Source | Date | Key Insights |
|--------|------|--------------|
| Operator | 2025-12-25 | Need: "QA as a run check that does the whole process in GitHub and passes if story passes" |

---

## Related Documents

- `.claude/agents/qa.md` - Current QA agent definition
- `.claude/commands/qa.md` - Current QA command
- `bmad/04-qa/review-story-001.md` - Example QA review output
- Future: PRD will be created by `/pm`
- Future: Architecture will be created by `/architect`

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Analyst | Mary | 2025-12-25 | Complete |
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
