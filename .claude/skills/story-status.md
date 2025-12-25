# Skill: Story Status Management

## Purpose
Standardizes story status tracking with consistent headers and valid state transitions.

## Status Values

| Status      | Meaning                              | Set By       |
|-------------|--------------------------------------|--------------|
| Draft       | Story created, not yet ready         | Scrum Master |
| Ready       | Story complete, ready for dev        | Scrum Master |
| In Progress | Dev actively working                 | Dev          |
| In Review   | Code complete, awaiting QA           | Dev          |
| QA Pass     | QA approved                          | QA           |
| QA Fail     | QA found issues                      | QA           |
| Done        | Story complete and merged            | QA/Dev       |
| Blocked     | Cannot proceed                       | Any          |

## Valid Transitions

```
Draft → Ready                    (Scrum Master completes story)
Ready → In Progress              (Dev starts work)
In Progress → In Review          (Dev completes implementation)
In Progress → Blocked            (Dev encounters blocker)
In Review → QA Pass              (QA approves)
In Review → QA Fail              (QA rejects)
QA Fail → In Progress            (Dev addresses feedback)
QA Pass → Done                   (Final merge)
Blocked → In Progress            (Blocker resolved)
```

## Story Header Format

Every story file MUST begin with this YAML frontmatter:

```yaml
---
id: story-001
title: "Story title here"
status: Ready
priority: P1
estimate: S/M/L
created: YYYY-MM-DD
updated: YYYY-MM-DD
assignee:
pr_link:
---
```

## Update Procedure

### When Dev Starts Story
```yaml
status: In Progress
updated: {current_date}
assignee: dev
```

### When Dev Completes Story
```yaml
status: In Review
updated: {current_date}
pr_link: {if applicable}
```

### When QA Reviews
```yaml
status: QA Pass | QA Fail
updated: {current_date}
```

### Adding Status History
Append to "Status History" section in story:

```markdown
## Status History

| Date       | From        | To          | By    | Note           |
|------------|-------------|-------------|-------|----------------|
| 2024-01-15 | Ready       | In Progress | Dev   | Started work   |
| 2024-01-16 | In Progress | In Review   | Dev   | PR #123 ready  |
| 2024-01-17 | In Review   | QA Pass     | QA    | All checks pass|
```

## Validation

Before status change:
1. Check current status
2. Verify transition is valid
3. Update frontmatter
4. Add history entry
5. Update timestamp

## Error Messages

```
[INVALID TRANSITION] Cannot move from "Ready" to "Done"
Valid transitions from "Ready": In Progress, Blocked

[STATUS UPDATE FAILED] Story file missing frontmatter
Required format: See story.template.md
```
