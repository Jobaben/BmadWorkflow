# Skill: File Contract Enforcement

## Purpose
Enforces strict file access boundaries for each BMAD role. Validates INPUTS exist and restricts OUTPUTS to designated paths.

## Usage
This skill is invoked at the start of every role session to validate and enforce the file contract.

## Contract Definitions

### Analyst
```yaml
INPUTS:
  - Operator verbal/text input (required)
  - bmad/00-brief/brief.md (optional, for iteration)
OUTPUTS:
  - bmad/00-brief/brief.md
FORBIDDEN:
  - Any file outside bmad/00-brief/
  - Solution proposals
  - Technical specifications
```

### PM
```yaml
INPUTS:
  - bmad/00-brief/brief.md (required)
OUTPUTS:
  - bmad/01-prd/PRD.md
FORBIDDEN:
  - Any file outside bmad/01-prd/
  - Implementation details
  - Architecture decisions
```

### Architect
```yaml
INPUTS:
  - bmad/01-prd/PRD.md (required)
  - Repository files (read-only)
OUTPUTS:
  - bmad/02-architecture/ARCHITECTURE.md
FORBIDDEN:
  - Code changes
  - Story creation
  - Any file outside bmad/02-architecture/
```

### Scrum Master
```yaml
INPUTS:
  - bmad/01-prd/PRD.md (required)
  - bmad/02-architecture/ARCHITECTURE.md (required)
OUTPUTS:
  - bmad/03-stories/story-###.md (one or more)
FORBIDDEN:
  - Code changes
  - Architecture changes
  - PRD changes
```

### Dev
```yaml
INPUTS:
  - bmad/03-stories/story-<id>.md (required, exactly one)
  - bmad/02-architecture/ARCHITECTURE.md (read-only)
OUTPUTS:
  - Source code files
  - Test files
  - Story status update (in story file)
FORBIDDEN:
  - Multiple stories
  - Architecture changes
  - PRD changes
  - Brief changes
```

### QA
```yaml
INPUTS:
  - bmad/03-stories/story-<id>.md (required)
  - bmad/01-prd/PRD.md (read-only)
  - bmad/02-architecture/ARCHITECTURE.md (read-only)
  - Git diff / changed files
OUTPUTS:
  - bmad/04-qa/review-story-<id>.md
FORBIDDEN:
  - Code changes
  - Story content changes
  - Architecture changes
```

## Enforcement Procedure

1. **Pre-flight Check**
   - Verify all required INPUTS exist
   - If missing, STOP and report which inputs are needed

2. **Runtime Monitoring**
   - Track all file write attempts
   - Block writes to FORBIDDEN paths

3. **Post-session Validation**
   - Confirm OUTPUTS were created
   - Verify no FORBIDDEN actions occurred

## Error Messages

```
[CONTRACT VIOLATION] Missing required input: {file_path}
[CONTRACT VIOLATION] Write attempt to forbidden path: {file_path}
[CONTRACT VIOLATION] Role boundary exceeded: {description}
```

## Bypass
No bypass is permitted. Contract violations halt the session.
