# CLAUDE.md - BMAD Workflow Project Rules

## Project Overview

This repository uses the **BMAD (Business-Model-Agile-Development)** file-driven agentic workflow. Claude Code operates through defined roles, each with strict file contracts and quality gates.

## Directory Structure

```
.claude/
  commands/     # Slash commands for role activation
  agents/       # Role definitions with file contracts
  skills/       # Reusable behaviors (enforcement, logging)

bmad/
  00-brief/     # Problem framing (Analyst output)
  01-prd/       # Product requirements (PM output)
  02-architecture/  # Technical design (Architect output)
  03-stories/   # User stories (Scrum Master output)
  04-qa/        # QA reviews and test plans
  05-runlogs/   # Session logs
  templates/    # Document templates
```

## Role Contracts (Enforced)

| Role      | Reads                          | Writes                         | Forbidden              |
|-----------|--------------------------------|--------------------------------|------------------------|
| Analyst   | Operator input, brief.md       | bmad/00-brief/brief.md         | Solution design        |
| PM        | brief.md                       | bmad/01-prd/PRD.md             | Implementation details |
| Architect | PRD.md, repo (read-only)       | bmad/02-architecture/ARCHITECTURE.md | Code changes     |
| Scrum     | PRD.md, ARCHITECTURE.md        | bmad/03-stories/story-###.md   | Direct implementation  |
| Dev       | One story, architecture        | Code, tests, story status      | Multi-story work       |
| QA        | Story, PRD, ARCHITECTURE, diff | bmad/04-qa/review-story-###.md | Code changes           |
| Ship      | Stories (all), git status      | Git ops, story status          | Code changes           |

## Core Rules

1. **One Role Per Session**: Each slash command activates exactly one agent role
2. **File Contract Enforcement**: Agents MUST NOT write outside their designated outputs
3. **Artifact Dependencies**: Each phase requires completion of prior artifacts
4. **Story Isolation**: Dev works on exactly one story per session
5. **Runlog Everything**: All role sessions are logged to bmad/05-runlogs/

## Slash Commands

- `/bmad-init` - Initialize or repair BMAD structure
- `/analyst` - Activate Analyst role for problem framing
- `/pm` - Activate PM role for requirements
- `/architect` - Activate Architect role for technical design
- `/scrum` - Activate Scrum Master for story creation
- `/dev <story-id>` - Activate Dev role for specific story
- `/qa <story-id>` - Activate QA role for story review
- `/ship <story-id>` - Ship QA-passed story (commit, PR, merge, next branch)
- `/bmad-status` - Display artifact and story status

## Quality Gates

Before transitioning to next phase:
- [ ] Required artifacts exist and are non-empty
- [ ] Checklist in artifact is complete
- [ ] No FORBIDDEN actions occurred
- [ ] Runlog entry created

## Session Behavior

1. Check artifact dependencies via `skills/artifact-check.md`
2. Enforce file contract via `skills/file-contract.md`
3. Log session via `skills/runlog.md`
4. Update story status via `skills/story-status.md` (if applicable)
