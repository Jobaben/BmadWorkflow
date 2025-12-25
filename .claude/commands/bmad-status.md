# /bmad-status - BMAD Workflow Status

Display the current status of all BMAD artifacts and stories.

## Purpose
Provide a quick overview of workflow progress, artifact completion, and story states.

## INPUT Files
Reads all bmad/ directories (read-only)

## OUTPUT Files
None - display only

## Execution Steps

1. **Check Artifact Status**
   ```
   Artifacts:
   ├── Brief:        [EXISTS/MISSING] bmad/00-brief/brief.md
   ├── PRD:          [EXISTS/MISSING] bmad/01-prd/PRD.md
   ├── Architecture: [EXISTS/MISSING] bmad/02-architecture/ARCHITECTURE.md
   ├── Test Plan:    [EXISTS/MISSING] bmad/04-qa/test-plan.md
   └── Risk Register:[EXISTS/MISSING] bmad/04-qa/risk-register.md
   ```

2. **Check Story Status**
   ```
   Stories:
   ├── story-001: [Status] "Title"
   ├── story-002: [Status] "Title"
   └── story-003: [Status] "Title"

   Summary:
   - Ready:       X
   - In Progress: X
   - In Review:   X
   - QA Pass:     X
   - QA Fail:     X
   - Done:        X
   - Blocked:     X
   ```

3. **Check QA Reviews**
   ```
   QA Reviews:
   ├── review-story-001.md [EXISTS]
   └── review-story-002.md [EXISTS]
   ```

4. **Recent Runlog Entries**
   ```
   Recent Activity (last 5):
   - [14:32] Analyst - Completed brief
   - [14:45] PM - Created PRD
   - [15:20] Architect - Designed system
   ```

5. **Suggest Next Action**
   Based on current state, suggest the appropriate next command.

## Example Output

```
═══════════════════════════════════════════════════════════
                    BMAD WORKFLOW STATUS
═══════════════════════════════════════════════════════════

📋 ARTIFACTS
├── Brief:        ✓ EXISTS  bmad/00-brief/brief.md
├── PRD:          ✓ EXISTS  bmad/01-prd/PRD.md
├── Architecture: ✓ EXISTS  bmad/02-architecture/ARCHITECTURE.md
├── Test Plan:    ○ MISSING bmad/04-qa/test-plan.md
└── Risk Register:○ MISSING bmad/04-qa/risk-register.md

📝 STORIES (5 total)
├── story-001: ✓ Done        "Create notification model"
├── story-002: ✓ QA Pass     "Implement notification service"
├── story-003: ⟳ In Review   "Add email provider"
├── story-004: ▶ In Progress "Add SMS provider"
└── story-005: ○ Ready       "Create notification preferences UI"

SUMMARY:
  Ready: 1 | In Progress: 1 | In Review: 1 | QA Pass: 1 | Done: 1

📊 QA REVIEWS
├── review-story-001.md ✓
└── review-story-002.md ✓

📜 RECENT ACTIVITY
├── [10:32] Dev     - Completed story-003 implementation
├── [10:15] Dev     - Started story-004
└── [09:45] QA      - Passed story-002

═══════════════════════════════════════════════════════════
💡 SUGGESTED NEXT ACTION: /qa story-003
═══════════════════════════════════════════════════════════
```

## Logic for Suggestions

1. If no brief → `/analyst`
2. If brief but no PRD → `/pm`
3. If PRD but no architecture → `/architect`
4. If architecture but no stories → `/scrum`
5. If stories exist:
   - If any "In Review" → `/qa story-{id}`
   - If any "QA Fail" → `/dev story-{id}` (address feedback)
   - If any "Ready" and none "In Progress" → `/dev story-{id}`
   - If all "Done" → "All stories complete!"
