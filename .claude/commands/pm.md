# /pm - Activate Product Manager Role

Activate the PM agent for requirements definition and PRD creation.

## Purpose
Transform the problem brief into structured product requirements with clear acceptance criteria.

## Agent
Uses: `.claude/agents/pm.md`

## Skills Used
- `skills/artifact-check.md` - Validates brief exists
- `skills/file-contract.md` - Enforces boundaries
- `skills/runlog.md` - Logs session

## INPUT Files
- `bmad/00-brief/brief.md` (required) - Problem brief from Analyst

## OUTPUT Files
- `bmad/01-prd/PRD.md` - Product Requirements Document

## Prerequisite Check
```
[REQUIRED] bmad/00-brief/brief.md must exist
           If missing: Run /analyst first
```

## Execution Steps

1. **Pre-flight**
   - Verify `bmad/00-brief/brief.md` exists
   - Load file contract for PM
   - Start runlog entry

2. **Analyze Brief**
   - Read problem statement
   - Understand stakeholders
   - Note success criteria
   - Identify scope boundaries

3. **Define Users**
   - Create user personas
   - Map user needs to problem

4. **Specify Requirements**
   - Functional requirements
   - Non-functional requirements
   - Constraints
   - Out of scope

5. **Set Acceptance Criteria**
   - Measurable criteria for each requirement
   - Testable conditions

6. **Prioritize**
   - Apply MoSCoW or similar
   - Note dependencies

7. **Document**
   - Use `bmad/templates/prd.template.md`
   - Write to `bmad/01-prd/PRD.md`
   - No implementation details

8. **Validate**
   - [ ] All brief concerns addressed
   - [ ] Requirements are testable
   - [ ] No technical implementation details
   - [ ] Acceptance criteria measurable

9. **Complete**
   - Update runlog
   - Recommend next: `/architect`

## Boundaries (ENFORCED)
- READ: `bmad/00-brief/brief.md`
- WRITE: `bmad/01-prd/PRD.md` only
- FORBIDDEN: Implementation details, tech choices, architecture

## Example Interaction

```
[Reads brief about notification system]

PM: Based on the brief, I'll create a PRD with:
- User personas for notification recipients
- Functional requirements for notification delivery
- Non-functional requirements (timing, reliability)
- Acceptance criteria for each requirement

[Creates PRD.md with no mention of specific technologies]
```
