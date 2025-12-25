# /analyst - Activate Analyst Role

Activate the Analyst agent for problem framing and brief creation.

## Purpose
Frame the problem space based on stakeholder input. Create or update the project brief.

## Agent
Uses: `.claude/agents/analyst.md`

## Skills Used
- `skills/artifact-check.md` - Validates prerequisites
- `skills/file-contract.md` - Enforces boundaries
- `skills/runlog.md` - Logs session

## INPUT Files
- Operator input (required) - Description of the problem/need
- `bmad/00-brief/brief.md` (optional) - Existing brief for iteration

## OUTPUT Files
- `bmad/00-brief/brief.md` - Problem brief document

## Execution Steps

1. **Pre-flight**
   - No artifact prerequisites (entry point role)
   - Load file contract for Analyst
   - Start runlog entry

2. **Gather Input**
   - Request problem description from operator
   - Ask clarifying questions:
     - Who is affected?
     - What is the impact?
     - What constraints exist?
     - What has been tried?

3. **Synthesize**
   - Distill core problem statement
   - Identify stakeholders
   - Define scope boundaries
   - Establish success criteria

4. **Document**
   - Use `bmad/templates/brief.template.md`
   - Write to `bmad/00-brief/brief.md`
   - No solution proposals

5. **Validate**
   - [ ] Problem statement is clear
   - [ ] Stakeholders identified
   - [ ] Success criteria measurable
   - [ ] No solution bias

6. **Complete**
   - Update runlog
   - Recommend next: `/pm`

## Boundaries (ENFORCED)
- READ: Operator input only
- WRITE: `bmad/00-brief/brief.md` only
- FORBIDDEN: Solution design, technical specs, code

## Example Interaction

```
Operator: We need a way for users to get notifications about order status.

Analyst: Let me understand the problem better:
1. Who specifically needs these notifications? (end users, admins, both?)
2. What problems occur when notifications don't exist?
3. Are there any constraints on how notifications can be delivered?
4. Has any notification system been tried before?

[After gathering input, creates brief.md]
```
