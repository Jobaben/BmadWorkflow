# /ship - Ship QA-Passed Story

Automate the post-QA merge workflow: commit, push, PR, merge, and prepare next story.

## Usage
```
/ship story-021
/ship 021
/ship              # Auto-detect QA Pass story on current branch
```

## Purpose
Complete the story delivery cycle by merging approved code and setting up the next story for development.

## Skills Used
- `skills/story-status.md` - Updates story status
- `skills/runlog.md` - Logs session

## INPUT Files
- `bmad/03-stories/story-{id}.md` (required) - Story to ship
- `bmad/03-stories/*.md` - All stories (to find next)

## OUTPUT Files
- Story status update (QA Pass → Done)
- Git commits, PR, merge
- New feature branch for next story

## Prerequisite Check
```
[REQUIRED] Story status must be "QA Pass"
           If "In Review": Run /qa first
           If "Done": Already shipped

[REQUIRED] Current branch should be feature/story-{id}
           If on main: Switch to story branch first

[REQUIRED] Working directory should be clean or have only story-related changes
```

## Execution Steps

1. **Parse Story ID**
   - Extract ID from command argument
   - Or auto-detect from current branch name (feature/story-###)
   - Normalize to story-### format

2. **Pre-flight Checks**
   - Verify story file exists
   - Verify status is "QA Pass"
   - Verify on correct feature branch
   - Check for uncommitted changes

3. **Commit Changes**
   - Stage all changes: `git add .`
   - Create commit with message:
     ```
     feat(story-{id}): {story title}

     - All acceptance criteria met
     - QA review passed

     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

4. **Push to Remote**
   - Push branch: `git push -u origin feature/story-{id}`

5. **Create Pull Request**
   - Use `gh pr create` with:
     - Title: `feat(story-{id}): {story title}`
     - Body: Summary from QA review, link to story

6. **Merge Pull Request**
   - Merge with: `gh pr merge --merge --delete-branch`
   - This merges to main and deletes the feature branch

7. **Update Local Main**
   - Switch to main: `git checkout main`
   - Pull latest: `git pull origin main`

8. **Update Story Status**
   - Change story status from "QA Pass" → "Done"
   - Update story file frontmatter: `status: Done`
   - Add status history entry
   - Update timestamp

9. **Find Next Story**
   - Scan `bmad/03-stories/` for stories with status "Ready"
   - Select the lowest numbered "Ready" story
   - If none found, check for "QA Pass" stories to ship
   - If none found, report "All stories complete or in progress"

10. **Create Next Feature Branch**
    - If next story found:
      - Create branch: `git checkout -b feature/story-{next-id}`
      - Report: "Ready to start: /dev story-{next-id}"
    - If no next story:
      - Stay on main
      - Report status

11. **Complete**
    - Update runlog
    - Display summary

## Status Transitions
```
QA Pass → Done    (after merge)
```

## Git Operations Summary
```bash
# 1. Commit
git add .
git commit -m "feat(story-{id}): {title}"

# 2. Push
git push -u origin feature/story-{id}

# 3. Create PR
gh pr create --title "..." --body "..."

# 4. Merge PR
gh pr merge --merge --delete-branch

# 5. Update main
git checkout main
git pull origin main

# 6. Next branch
git checkout -b feature/story-{next-id}
```

## Example Interaction

```
/ship story-021

[Verifies story-021 status is "QA Pass"]
[Verifies on branch feature/story-021]

Shipping story-021: "Initial Wizard Content (Particle Concepts)"

Step 1: Committing changes...
  ✓ 3 files staged
  ✓ Commit created

Step 2: Pushing to remote...
  ✓ Pushed to origin/feature/story-021

Step 3: Creating PR...
  ✓ PR #31 created

Step 4: Merging PR...
  ✓ PR merged to main
  ✓ Branch deleted

Step 5: Updating main...
  ✓ Switched to main
  ✓ Pulled latest

Step 6: Updating story status...
  ✓ story-021 status → Done

Step 7: Finding next story...
  ✓ Found: story-022 "Object Demo Content" (Ready)

Step 8: Creating feature branch...
  ✓ Created feature/story-022

═══════════════════════════════════════════════════
✓ SHIPPED: story-021
═══════════════════════════════════════════════════

Next: /dev story-022
```

## Error Handling

### No QA Pass Story
```
Error: story-021 status is "In Review", not "QA Pass"
Run: /qa story-021
```

### Uncommitted Changes on Wrong Branch
```
Error: Uncommitted changes detected but not on feature/story-021
Please commit or stash changes first
```

### No Next Story Available
```
✓ SHIPPED: story-021

No "Ready" stories found.
Current story statuses:
- story-019: Done
- story-020: Done
- story-021: Done
- story-022: In Progress

Staying on main branch.
```

### PR Merge Conflict
```
Error: PR has merge conflicts
Please resolve conflicts manually:
1. git checkout feature/story-021
2. git merge main
3. Resolve conflicts
4. git push
5. Re-run /ship
```

## Boundaries
- READ: All story files, git status
- WRITE: Git operations, story status only
- FORBIDDEN: Code changes, test changes

## Notes

- This command is safe to re-run if interrupted
- If PR already exists, it will merge the existing PR
- If already on main with story Done, it will skip to finding next story
- Uses `--merge` strategy (not squash or rebase) to preserve commit history
