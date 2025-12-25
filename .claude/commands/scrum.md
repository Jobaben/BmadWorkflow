# /scrum - Activate Scrum Master Role

Activate the Scrum Master agent for story creation and backlog management.

## Purpose
Break down PRD requirements and architecture into actionable user stories. Each story = one PR.

## Agent
Uses: `.claude/agents/scrum-master.md`

## Skills Used
- `skills/artifact-check.md` - Validates PRD and Architecture exist
- `skills/file-contract.md` - Enforces boundaries
- `skills/runlog.md` - Logs session
- `skills/story-status.md` - Manages story status

## INPUT Files
- `bmad/01-prd/PRD.md` (required) - Product Requirements Document
- `bmad/02-architecture/ARCHITECTURE.md` (required) - Technical Architecture

## OUTPUT Files
- `bmad/03-stories/story-001.md` (and subsequent)

## Prerequisite Check
```
[REQUIRED] bmad/01-prd/PRD.md must exist
           If missing: Run /pm first

[REQUIRED] bmad/02-architecture/ARCHITECTURE.md must exist
           If missing: Run /architect first
```

## Execution Steps

1. **Pre-flight**
   - Verify PRD exists
   - Verify Architecture exists
   - Load file contract for Scrum Master
   - Start runlog entry

2. **Analyze Inputs**
   - Read all PRD requirements
   - Read architectural approach
   - Identify natural story boundaries

3. **Identify Epics**
   - Group related functionality
   - Note dependencies between groups

4. **Create Stories**
   - Break epics into stories
   - Each story = one PR
   - Apply INVEST criteria:
     - Independent
     - Negotiable
     - Valuable
     - Estimable
     - Small
     - Testable

5. **Write Story Files**
   - Use `bmad/templates/story.template.md`
   - Number sequentially: story-001, story-002, etc.
   - Include:
     - Clear title
     - User story format
     - Acceptance criteria
     - Technical notes (from architecture)
     - Size estimate (S/M/L)

6. **Document Dependencies**
   - Note story order requirements
   - Link dependent stories

7. **Validate**
   - [ ] Each story has clear acceptance criteria
   - [ ] Stories are appropriately sized
   - [ ] Dependencies documented
   - [ ] Stories trace to PRD
   - [ ] Stories align with architecture

8. **Complete**
   - Update runlog
   - List created stories
   - Recommend: `/dev story-001`

## Boundaries (ENFORCED)
- READ: PRD, Architecture
- WRITE: `bmad/03-stories/story-###.md` only
- FORBIDDEN: Code changes, architecture changes, PRD changes

## Story Numbering
Check existing stories and increment:
```
story-001.md
story-002.md
story-003.md
...
```

## Example Output

```markdown
# story-001.md
---
id: story-001
title: "Create notification data model"
status: Ready
priority: P1
estimate: S
---

## User Story
As a developer, I need a notification data model so that notifications can be stored and retrieved.

## Acceptance Criteria
- [ ] Notification entity with required fields
- [ ] Database migration created
- [ ] Basic CRUD repository

## Technical Notes
Reference: ARCHITECTURE.md Section 3.1
```
