# Skill: Session Runlog

## Purpose
Appends structured log entries to the daily runlog file for audit trail and context continuity.

## Log Location
```
bmad/05-runlogs/session-YYYY-MM-DD.md
```

## Usage
Invoke at the START and END of every role session.

## Log Entry Format

```markdown
## [HH:MM] Role: {role_name}

### Session Start
- **Triggered by**: {command or operator request}
- **Input artifacts**: {list of files read}
- **Goal**: {stated objective}

### Actions Taken
- {action 1}
- {action 2}
- ...

### Outputs Created
- {file_path}: {brief description}

### Session End
- **Status**: {completed | blocked | partial}
- **Blockers**: {if any}
- **Next recommended action**: {suggestion}

---
```

## Procedure

### On Session Start
1. Get current date (YYYY-MM-DD format)
2. Check if `bmad/05-runlogs/session-{date}.md` exists
   - If not, create with header:
     ```markdown
     # BMAD Session Runlog - {date}

     Daily log of all BMAD role sessions.

     ---
     ```
3. Append session start entry

### On Session End
1. Append actions taken
2. Append outputs created
3. Record final status
4. Add separator line

## Example Entry

```markdown
## [14:32] Role: Analyst

### Session Start
- **Triggered by**: /analyst
- **Input artifacts**: Operator verbal input
- **Goal**: Frame the problem for a user notification system

### Actions Taken
- Gathered requirements from operator
- Identified key stakeholders
- Defined problem boundaries
- Created initial brief

### Outputs Created
- bmad/00-brief/brief.md: Initial problem brief for notification system

### Session End
- **Status**: completed
- **Blockers**: None
- **Next recommended action**: /pm to create PRD

---
```

## Error Handling
If runlog directory doesn't exist, create it before writing.
