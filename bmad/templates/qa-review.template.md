# QA Review: story-###

## Review Info
- **Story**: story-###
- **Title**: _Story title_
- **Reviewer**: QA
- **Review Date**: YYYY-MM-DD
- **Verdict**: PENDING | PASS | FAIL

---

## Summary

_Brief summary of the implementation and review outcome._

---

## Acceptance Criteria Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC1 | _Criterion_ | PASS/FAIL | _How verified_ |
| AC2 | _Criterion_ | PASS/FAIL | _How verified_ |
| AC3 | _Criterion_ | PASS/FAIL | _How verified_ |

---

## Architecture Alignment

### Patterns and Conventions
| Check | Status | Notes |
|-------|--------|-------|
| Follows component boundaries | PASS/FAIL | _Details_ |
| Interfaces match specification | PASS/FAIL | _Details_ |
| Data models correct | PASS/FAIL | _Details_ |
| Naming conventions followed | PASS/FAIL | _Details_ |

### Architectural Violations
- [ ] None identified
- _Or list violations_

---

## Code Quality

### Code Review Checklist
| Check | Status | Notes |
|-------|--------|-------|
| Code is readable | PASS/FAIL | |
| Functions are focused | PASS/FAIL | |
| No code duplication | PASS/FAIL | |
| Error handling appropriate | PASS/FAIL | |
| No hardcoded values | PASS/FAIL | |
| Comments where needed | PASS/FAIL | |

### Security Review
| Check | Status | Notes |
|-------|--------|-------|
| No secrets in code | PASS/FAIL | |
| Input validation | PASS/FAIL | |
| No injection vulnerabilities | PASS/FAIL | |
| Authentication/Authorization | PASS/FAIL/NA | |

---

## Test Review

### Test Coverage
| Type | Exists | Passing | Coverage |
|------|--------|---------|----------|
| Unit tests | YES/NO | YES/NO | _X%_ |
| Integration tests | YES/NO/NA | YES/NO | _X%_ |
| E2E tests | YES/NO/NA | YES/NO | - |

### Test Quality
| Check | Status | Notes |
|-------|--------|-------|
| Tests are meaningful | PASS/FAIL | |
| Edge cases covered | PASS/FAIL | |
| Test names descriptive | PASS/FAIL | |
| No flaky tests | PASS/FAIL | |

---

## PRD Alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| _FR/NFR ID_ | Aligned/Misaligned | _Details_ |

---

## Issues Found

### Critical (Blocking)
_Issues that must be fixed before approval_
1. _Issue description_

### Major (Should Fix)
_Significant issues that should be addressed_
1. _Issue description_

### Minor (Nice to Have)
_Suggestions for improvement_
1. _Suggestion_

---

## Files Reviewed

| File | Status | Notes |
|------|--------|-------|
| `path/to/file` | OK/ISSUES | _Brief note_ |

---

## Verdict

### Decision: [PASS / FAIL]

**Rationale**: _Explanation of the decision_

### Required Actions (if FAIL)
1. _Action item 1_
2. _Action item 2_

### Recommendations (if PASS)
1. _Optional improvement 1_

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| QA Reviewer | | |

---

**Next Steps**:
- If PASS: Merge PR, update story to "Done"
- If FAIL: `/dev story-###` to address issues
