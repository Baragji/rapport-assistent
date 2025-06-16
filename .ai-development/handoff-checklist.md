# Session Handoff Checklist

## For Ending Current Session

### Pre-Handoff Verification
- [ ] Current task is either completed or safely rolled back
- [ ] All tests are passing (`npm test`)
- [ ] No uncommitted changes that would break the build
- [ ] session-state.json is updated with current status
- [ ] work-log.md reflects all changes made

### Handoff Information
- [ ] Update session-state.json with:
  - Current task status
  - Next recommended task
  - Any context notes for next session
  - Current branch and commit hash
- [ ] Create rollback point (git commit + tag)
- [ ] Document any issues or blockers encountered
- [ ] Note any deviations from the implementation plan

### Final Checks
- [ ] Run `npm run build` to ensure build works
- [ ] Run `npm run test:coverage` to check coverage status
- [ ] Commit all tracking files to git

## For Starting New Session

### Session Initialization
- [ ] Read session-state.json to understand current status
- [ ] Review work-log.md for recent context and decisions
- [ ] Check implementation-plan.md for next atomic task
- [ ] Verify tests are passing (`npm test`)
- [ ] Confirm build works (`npm run build`)

### Sprint 2 Specific Checks
- [ ] Confirm Sprint 1 foundation is solid (53 tests, 89.37% coverage)
- [ ] Review Sprint 2 goals: AI-Assist & Reference Manager
- [ ] Check if OpenAI API key setup is needed
- [ ] Understand current task in Sprint 2 sequence (S2.1 - S2.10)
- [ ] Review risk factors: API configuration, testing requirements

### Context Recovery
- [ ] Understand what was completed in previous session
- [ ] Identify current task and its acceptance criteria
- [ ] Review any risk factors or blockers noted
- [ ] Confirm rollback points are available if needed
- [ ] Check Sprint 2 progress vs. success criteria

### Ready to Proceed
- [ ] Update session-state.json with new session ID and start time
- [ ] Begin next atomic task from Sprint 2 implementation plan
- [ ] Update work-log.md with session start notes
- [ ] Keep Sprint 2 goals and success criteria in mind

## Emergency Recovery Protocol

If previous session ended unexpectedly:
1. Check session-state.json for last known good state
2. Run tests to verify current state
3. If tests fail, rollback to last rollback point:
   ```bash
   git log --oneline --grep="ROLLBACK-POINT"
   git reset --hard <commit-hash>
   ```
4. Update session-state.json to reflect recovery
5. Continue from last successful task

## Communication Template for User

When context window is approaching limit:

"I'm approaching my context window limit. Let me create a clean handoff point:

**Current Status**: [Brief description of what was accomplished]
**Next Task**: [Specific next atomic task from implementation plan]
**Rollback Point**: [Git commit hash if rollback needed]
**Notes**: [Any important context for next session]

Please start a new chat session and ask me to continue the development. I'll pick up exactly where we left off using the session state files."