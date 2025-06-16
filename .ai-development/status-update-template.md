# Status Update Template

## How to Update Continuity Files

### session-state.json Updates
Only update these specific fields:
```json
{
  "currentTask": "new-task-name",
  "taskStatus": "completed|in-progress|ready-to-start",
  "completedTasks": ["append-new-completed-task"],
  "contextNotes": "Brief context for next session",
  "testStatus": "passing|failing",
  "buildStatus": "passing|failing", 
  "coverageStatus": "XX.XX%"
}
```

### work-log.md Updates
Append new entries only:
```markdown
### [Timestamp] - [Task Name] Completed
- **Description**: Brief task description
- **Files Modified**: List of changed files
- **Status**: All tests passing, build successful
- **Commit**: commit-hash
```

### implementation-plan.md Updates
Mark tasks as completed:
```markdown
- [x] Task Name ✅ (mark completed tasks only)
```

### DO NOT:
- Rewrite entire files
- Change file structure
- Modify existing content
- Create new sections without permission

### DO:
- Read existing content first
- Use targeted updates
- Preserve formatting
- Append new information only