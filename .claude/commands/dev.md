# /dev - Activate Developer Role

Activate the Developer agent for story implementation. Requires story ID.

## Usage
```
/dev story-001
/dev 001
```

## Purpose
Implement exactly ONE user story with production-quality code and tests.

## Agent
Uses: `.claude/agents/dev.md`

## Skills Used
- `skills/artifact-check.md` - Validates story exists
- `skills/file-contract.md` - Enforces boundaries
- `skills/runlog.md` - Logs session
- `skills/story-status.md` - Updates story status

## INPUT Files
- `bmad/03-stories/story-{id}.md` (required) - The story to implement
- `bmad/02-architecture/ARCHITECTURE.md` (read-only) - Technical guidance

## OUTPUT Files
- Source code files (as needed for story)
- Test files (required)
- Story status update (in story file frontmatter)

## Prerequisite Check
```
[REQUIRED] Story ID must be provided
           Usage: /dev story-001 or /dev 001

[REQUIRED] bmad/03-stories/story-{id}.md must exist
           If missing: Run /scrum first

[REQUIRED] Story status must be "Ready" or "In Progress"
           If "Done": Story already completed
           If "In Review": Awaiting QA
```

## Execution Steps

1. **Parse Story ID**
   - Extract ID from command argument
   - Normalize to story-### format

2. **Pre-flight**
   - Verify story file exists
   - Verify status is Ready or In Progress
   - Load file contract for Dev
   - Start runlog entry

3. **Update Status**
   - Set story status to "In Progress"
   - Update timestamp

4. **Understand Story**
   - Read acceptance criteria
   - Read technical notes
   - Review relevant architecture sections
   - Identify files to create/modify

5. **Implement**
   - Write code following project patterns
   - Respect architectural decisions
   - Handle errors appropriately
   - Validate inputs at boundaries

6. **Test**
   - Write unit tests
   - Write integration tests if needed
   - Ensure all tests pass

7. **Verify Acceptance**
   - Check each acceptance criterion
   - Document how each is met

8. **Complete Story**
   - Set status to "In Review"
   - Update timestamp
   - Note any deviations

9. **Complete Session**
   - Update runlog
   - Recommend: `/qa story-{id}`

## Boundaries (ENFORCED)
- READ: Assigned story (ONE only), Architecture
- WRITE: Source code, tests, story status
- FORBIDDEN: Multiple stories, architecture changes, PRD changes

## Status Transitions
```
Ready → In Progress    (on start)
In Progress → In Review  (on completion)
```

## Example Interaction

```
/dev story-001

[Reads story-001.md - "Create notification data model"]
[Reads relevant ARCHITECTURE.md sections]

Dev: Starting implementation of story-001.
Updating status to "In Progress".

Creating:
- src/models/notification.ts
- src/repositories/notificationRepository.ts
- tests/models/notification.test.ts
- tests/repositories/notificationRepository.test.ts

[Implements code and tests]

All acceptance criteria met:
- ✓ Notification entity with required fields
- ✓ Database migration created
- ✓ Basic CRUD repository

Updating status to "In Review".
Recommend: /qa story-001
```
