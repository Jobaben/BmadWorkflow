# BMAD Workflow

**Business-Model-Agile-Development** - A file-driven agentic workflow for structured software development.

## Overview

BMAD enforces a disciplined progression from problem discovery through implementation and quality assurance. Each role has strict file contracts that define what they can read and write.

## Directory Structure

```
bmad/
├── 00-brief/           # Problem framing (Analyst)
│   └── brief.md
├── 01-prd/             # Product requirements (PM)
│   └── PRD.md
├── 02-architecture/    # Technical design (Architect)
│   └── ARCHITECTURE.md
├── 03-stories/         # User stories (Scrum Master)
│   ├── story-001.md
│   ├── story-002.md
│   └── ...
├── 04-qa/              # Quality assurance
│   ├── test-plan.md
│   ├── risk-register.md
│   └── review-story-###.md
├── 05-runlogs/         # Session logs
│   └── session-YYYY-MM-DD.md
└── templates/          # Document templates
```

## Role Contracts

| Role      | Reads                       | Writes                          | Forbidden              |
|-----------|-----------------------------|---------------------------------|------------------------|
| Analyst   | Operator input              | `00-brief/brief.md`             | Solution design        |
| PM        | `brief.md`                  | `01-prd/PRD.md`                 | Implementation details |
| Architect | `PRD.md`, repo (read-only)  | `02-architecture/ARCHITECTURE.md` | Code changes         |
| Scrum     | `PRD.md`, `ARCHITECTURE.md` | `03-stories/story-###.md`       | Code implementation    |
| Dev       | One story, architecture     | Code, tests, story status       | Multiple stories       |
| QA        | Story, PRD, arch, diff      | `04-qa/review-story-###.md`     | Code modification      |

## Workflow Sequence

```
1. /analyst    → Creates brief.md (problem framing)
2. /pm         → Creates PRD.md (requirements)
3. /architect  → Creates ARCHITECTURE.md (technical design)
4. /scrum      → Creates story-###.md files (backlog)
5. /dev <id>   → Implements one story
6. /qa <id>    → Reviews implementation
```

## Commands

| Command         | Purpose                              |
|-----------------|--------------------------------------|
| `/bmad-init`    | Initialize or repair BMAD structure  |
| `/analyst`      | Frame the problem                    |
| `/pm`           | Define requirements                  |
| `/architect`    | Design technical approach            |
| `/scrum`        | Create user stories                  |
| `/dev <id>`     | Implement a story                    |
| `/qa <id>`      | Review a story                       |
| `/bmad-status`  | Show workflow status                 |

## Key Principles

1. **One Role Per Session**: Each command activates exactly one agent
2. **File Contract Enforcement**: Agents cannot write outside their designated paths
3. **Artifact Dependencies**: Each phase requires prior artifacts
4. **Story Isolation**: Dev works on exactly one story
5. **Audit Trail**: All sessions logged to runlogs

## Getting Started

```bash
# Initialize the workflow
/bmad-init

# Start with problem framing
/analyst

# Check status at any time
/bmad-status
```

## Templates

All templates are in `bmad/templates/`. Each role uses the appropriate template for their output artifact.
