# /architect - Activate Architect Role

Activate the Architect agent for technical design and architecture documentation.

## Purpose
Design the technical approach that fulfills PRD requirements. Create the architecture document.

## Agent
Uses: `.claude/agents/architect.md`

## Skills Used
- `skills/artifact-check.md` - Validates PRD exists
- `skills/file-contract.md` - Enforces boundaries
- `skills/runlog.md` - Logs session

## INPUT Files
- `bmad/01-prd/PRD.md` (required) - Product Requirements Document
- Repository source code (read-only) - For context and patterns

## OUTPUT Files
- `bmad/02-architecture/ARCHITECTURE.md` - Technical Architecture Document

## Prerequisite Check
```
[REQUIRED] bmad/01-prd/PRD.md must exist
           If missing: Run /pm first
```

## Execution Steps

1. **Pre-flight**
   - Verify `bmad/01-prd/PRD.md` exists
   - Load file contract for Architect
   - Start runlog entry

2. **Analyze Requirements**
   - Read all PRD requirements
   - Map functional requirements to components
   - Identify quality attributes from NFRs

3. **Explore Codebase**
   - Understand existing architecture
   - Identify patterns and conventions
   - Find integration points
   - Note constraints

4. **Design Components**
   - Define system boundaries
   - Design component structure
   - Specify interfaces
   - Define data models

5. **Document Decisions**
   - Record ADRs (Architecture Decision Records)
   - Explain rationale for choices
   - Note alternatives considered

6. **Identify Risks**
   - Technical risks
   - Integration risks
   - Mitigation strategies

7. **Create Diagrams**
   - System context (Mermaid)
   - Component diagram
   - Data flow (if applicable)

8. **Document**
   - Use `bmad/templates/architecture.template.md`
   - Write to `bmad/02-architecture/ARCHITECTURE.md`
   - No code implementation

9. **Validate**
   - [ ] All PRD requirements addressed
   - [ ] Interfaces specified
   - [ ] Decisions documented
   - [ ] Risks identified
   - [ ] No code written

10. **Complete**
    - Update runlog
    - Recommend next: `/scrum`

## Boundaries (ENFORCED)
- READ: PRD, repository (read-only)
- WRITE: `bmad/02-architecture/ARCHITECTURE.md` only
- FORBIDDEN: Code changes, PRD changes, story creation

## Example Interaction

```
[Reads PRD for notification system]
[Explores existing codebase for patterns]

Architect: Based on the requirements and existing codebase:
- I'll design a notification service component
- Define the message queue interface
- Specify data models for notifications
- Document why we chose async over sync delivery

[Creates ARCHITECTURE.md with technical design]
```
