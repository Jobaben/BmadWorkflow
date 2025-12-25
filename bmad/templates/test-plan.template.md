# Test Plan

## Document Info
- **Created**: YYYY-MM-DD
- **Author**: QA
- **Status**: Draft | Active | Complete
- **PRD Reference**: `bmad/01-prd/PRD.md`
- **Architecture Reference**: `bmad/02-architecture/ARCHITECTURE.md`

---

## Overview

### Purpose
_What this test plan covers and its objectives._

### Scope
_Features and components covered by this test plan._

### Out of Scope
_What is explicitly not covered._

---

## Test Strategy

### Test Levels

| Level | Purpose | Tools | Responsibility |
|-------|---------|-------|----------------|
| Unit | Test individual functions/methods | _Framework_ | Dev |
| Integration | Test component interactions | _Framework_ | Dev/QA |
| E2E | Test complete user flows | _Framework_ | QA |
| Performance | Test system performance | _Tool_ | QA |

### Test Types
- [ ] Functional testing
- [ ] Regression testing
- [ ] Smoke testing
- [ ] Security testing
- [ ] Performance testing
- [ ] Accessibility testing

---

## Test Environment

### Environments

| Environment | Purpose | URL/Access | Data |
|-------------|---------|------------|------|
| Local | Development | localhost | Mock |
| CI | Automated tests | Pipeline | Test fixtures |
| Staging | Pre-production | _URL_ | Sanitized copy |

### Environment Requirements
- _Requirement 1_
- _Requirement 2_

---

## Test Data

### Data Requirements
| Data Type | Source | Sensitivity | Refresh |
|-----------|--------|-------------|---------|
| _Type_ | _Source_ | Low/Med/High | _Frequency_ |

### Test Fixtures
_Location and description of test fixtures._

---

## Test Cases

### Feature: [Feature Name]

#### TC-001: [Test Case Name]
- **Priority**: P1/P2/P3
- **Type**: Positive/Negative/Edge
- **Preconditions**: _Setup required_
- **Steps**:
  1. _Step 1_
  2. _Step 2_
- **Expected Result**: _What should happen_
- **Actual Result**: _To be filled during execution_
- **Status**: Not Run/Pass/Fail

---

## Traceability Matrix

| Requirement ID | Test Case(s) | Status |
|----------------|--------------|--------|
| FR-001 | TC-001, TC-002 | Covered |
| FR-002 | TC-003 | Covered |
| NFR-001 | PERF-001 | Covered |

---

## Entry Criteria

- [ ] Code complete and deployed to test environment
- [ ] Unit tests passing
- [ ] Test data available
- [ ] Test environment accessible

---

## Exit Criteria

- [ ] All P1 test cases executed
- [ ] All P1 and P2 test cases pass
- [ ] No critical defects open
- [ ] Test coverage meets threshold
- [ ] Performance benchmarks met

---

## Quality Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Test case pass rate | > 95% | - |
| Code coverage | > 80% | - |
| Critical defects | 0 | - |
| P1 defects | 0 | - |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| _Testing risk_ | H/M/L | H/M/L | _Strategy_ |

---

## Schedule

| Phase | Start | End | Status |
|-------|-------|-----|--------|
| Test planning | _Date_ | _Date_ | _Status_ |
| Test execution | _Date_ | _Date_ | _Status_ |
| Defect resolution | _Date_ | _Date_ | _Status_ |
| Sign-off | _Date_ | _Date_ | _Status_ |

---

## Defect Management

### Defect Severity
- **Critical**: System unusable
- **Major**: Feature broken, workaround exists
- **Minor**: Cosmetic or minor functional issue
- **Trivial**: No functional impact

### Defect Workflow
1. Identify and log
2. Triage and prioritize
3. Assign to developer
4. Fix and verify
5. Close

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Tech Lead | | | |
