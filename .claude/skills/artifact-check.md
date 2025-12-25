# Skill: Artifact Dependency Check

## Purpose
Validates that required upstream artifacts exist before allowing a role to proceed.

## Dependency Chain

```
Analyst → PM → Architect → Scrum Master → Dev → QA
   ↓        ↓        ↓            ↓          ↓      ↓
brief.md → PRD.md → ARCH.md → story-###.md → code → review
```

## Artifact Paths

| Artifact     | Path                                    | Required By        |
|--------------|----------------------------------------|-------------------|
| Brief        | bmad/00-brief/brief.md                 | PM                |
| PRD          | bmad/01-prd/PRD.md                     | Architect, Scrum  |
| Architecture | bmad/02-architecture/ARCHITECTURE.md   | Scrum, Dev, QA    |
| Story        | bmad/03-stories/story-{id}.md          | Dev, QA           |
| Test Plan    | bmad/04-qa/test-plan.md                | QA (optional)     |

## Validation Rules

### For /analyst
- No prerequisites (entry point)

### For /pm
- [ ] bmad/00-brief/brief.md EXISTS
- [ ] bmad/00-brief/brief.md is NOT empty
- [ ] Brief contains "Problem Statement" section

### For /architect
- [ ] bmad/01-prd/PRD.md EXISTS
- [ ] bmad/01-prd/PRD.md is NOT empty
- [ ] PRD contains "Requirements" section

### For /scrum
- [ ] bmad/01-prd/PRD.md EXISTS and valid
- [ ] bmad/02-architecture/ARCHITECTURE.md EXISTS
- [ ] Architecture contains "Components" section

### For /dev {id}
- [ ] bmad/03-stories/story-{id}.md EXISTS
- [ ] Story status is NOT "Done"
- [ ] bmad/02-architecture/ARCHITECTURE.md EXISTS

### For /qa {id}
- [ ] bmad/03-stories/story-{id}.md EXISTS
- [ ] Story status is "In Review" or "Done"
- [ ] bmad/02-architecture/ARCHITECTURE.md EXISTS

## Check Procedure

```
1. Identify role being activated
2. Look up required artifacts for that role
3. For each required artifact:
   a. Check file exists
   b. Check file is not empty
   c. Check required sections present (if specified)
4. If any check fails:
   a. Report missing/invalid artifacts
   b. Suggest which role should run first
   c. HALT execution
5. If all checks pass:
   a. Log successful validation
   b. Proceed with role activation
```

## Error Messages

```
[ARTIFACT CHECK FAILED]
Missing: bmad/00-brief/brief.md
Required by: PM role
Action: Run /analyst first to create the brief.

[ARTIFACT CHECK FAILED]
Invalid: bmad/01-prd/PRD.md (empty file)
Required by: Architect role
Action: Run /pm to complete the PRD.
```

## Bypass
No bypass permitted. Artifact chain must be respected.
