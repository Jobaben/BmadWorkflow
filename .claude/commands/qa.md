# /qa - Activate QA Role

Activate the QA agent for story review. Requires story ID.

## Usage
```
/qa story-001
/qa 001
```

## Purpose
Review completed story implementation for alignment with requirements, architecture, and quality standards.

## Agent
Uses: `.claude/agents/qa.md`

## Skills Used
- `skills/artifact-check.md` - Validates prerequisites
- `skills/file-contract.md` - Enforces boundaries
- `skills/runlog.md` - Logs session
- `skills/story-status.md` - Updates story status

## INPUT Files
- `bmad/03-stories/story-{id}.md` (required) - Story being reviewed
- `bmad/02-architecture/ARCHITECTURE.md` (read-only)
- `bmad/01-prd/PRD.md` (read-only)
- Git diff / changed files

## OUTPUT Files
- `bmad/04-qa/review-story-{id}.md` - Review document
- Story status update (Pass/Fail)

## Prerequisite Check
```
[REQUIRED] Story ID must be provided
           Usage: /qa story-001 or /qa 001

[REQUIRED] bmad/03-stories/story-{id}.md must exist
           If missing: No story to review

[REQUIRED] Story status must be "In Review"
           If "Ready": Not yet implemented (/dev first)
           If "In Progress": Implementation not complete
```

## Execution Steps

1. **Parse Story ID**
   - Extract ID from command argument
   - Normalize to story-### format

2. **Pre-flight**
   - Verify story file exists
   - Verify status is "In Review"
   - Load file contract for QA
   - Start runlog entry

3. **Gather Context**
   - Read story acceptance criteria
   - Read relevant architecture sections
   - Read relevant PRD requirements
   - Identify changed files

4. **Review Acceptance Criteria**
   - For each criterion, verify implementation
   - Document evidence of completion
   - Note any gaps

5. **Review Architecture Alignment**
   - Verify patterns are followed
   - Check interfaces match design
   - Validate data models

6. **Review Code Quality**
   - Code style consistency
   - Error handling
   - Security considerations
   - No hardcoded secrets
   - Meaningful names

7. **Review Tests**
   - Tests exist for new code
   - Tests are meaningful
   - Edge cases covered
   - Tests pass

8. **Document Review**
   - Use `bmad/templates/qa-review.template.md`
   - Write to `bmad/04-qa/review-story-{id}.md`
   - Include all findings

9. **Verdict**
   - **PASS**: Update story status to "QA Pass"
   - **FAIL**: Update story status to "QA Fail", document issues

10. **Complete**
    - Update runlog
    - If Pass: Recommend merge or next story
    - If Fail: Recommend `/dev story-{id}` to address

## Boundaries (ENFORCED)
- READ: Story, PRD, Architecture, code, tests
- WRITE: `bmad/04-qa/review-story-{id}.md`, story status only
- FORBIDDEN: Code changes, test changes, story content changes

## Status Transitions
```
In Review → QA Pass    (if approved)
In Review → QA Fail    (if issues found)
```

## Example Interaction

```
/qa story-001

[Reads story-001.md]
[Reads implementation changes]
[Reviews against architecture]

QA Review for story-001:

## Acceptance Criteria
- ✓ Notification entity with required fields
- ✓ Database migration created
- ✓ Basic CRUD repository

## Architecture Alignment
- ✓ Follows repository pattern
- ✓ Entity structure matches design

## Code Quality
- ✓ Clean, readable code
- ✓ Proper error handling
- ⚠ Minor: Consider adding JSDoc

## Tests
- ✓ Unit tests present
- ✓ All tests passing
- ✓ Good coverage

## Verdict: PASS

Story status updated to "QA Pass".
Ready for merge.
```
