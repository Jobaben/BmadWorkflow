# Analyst Session: QA Automation Run Check

**Date**: 2025-12-25
**Role**: Analyst (Mary)
**Project**: Automated QA Run Check for BMAD Workflow

---

## Session Summary

Framed the problem for automating the BMAD QA review process as a GitHub run check.

## Input Received

Operator request: "the qa part of the bmad workflow should be a run check that does the whole process in github and then passes if the story passes."

## Research Conducted

- Reviewed `.claude/agents/qa.md` - QA agent definition
- Reviewed `.claude/commands/qa.md` - QA command workflow
- Reviewed `bmad/04-qa/review-story-001.md` - Example QA output
- Analyzed current manual QA invocation process

## Key Findings

1. **Current State**: QA review requires manual `/qa story-###` invocation
2. **Gap**: No GitHub integration, no automated enforcement
3. **Need**: Automatic QA check that runs on PRs and reports pass/fail

## Artifacts Created

| Artifact | Path | Status |
|----------|------|--------|
| Problem Brief | `bmad/00-brief/brief.md` | Complete |

## Decisions Made

- This is a new problem framing (replaced previous 3D Animation project brief)
- Scoped to GitHub integration only (not other CI/CD platforms)
- Scoped to QA automation only (not full Dev role automation)

## Open Questions Identified

1. How should story ID be determined from PR context?
2. Should check be required to pass before merge?
3. What happens if multiple stories in one PR?

## Next Steps

- `/pm` to create Product Requirements Document

---

**Session End**: 2025-12-25
**Duration**: ~10 minutes
