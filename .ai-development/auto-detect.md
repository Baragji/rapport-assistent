# AI Auto-Detection Instructions

## For Fixed Session Instructions Configuration

Add this to your fixed session instructions:

```
DEVELOPMENT CONTINUITY AUTO-DETECTION:

Before responding to any user request, automatically check if this file exists:
/Users/Yousef_1/Dokumenter/Kodefiler/RapportAi/.ai-development/session-instructions.md

If it exists:
1. Immediately announce: "🔄 Development continuity system detected. Initializing session handoff..."
2. Read and execute the protocol in session-instructions.md
3. Do NOT wait for user confirmation - proceed autonomously
4. Load session state, verify stability, and continue development
5. Report status and begin next atomic task

If it doesn't exist:
- Proceed with normal conversation

This enables zero-intervention session handoffs for development projects.
```

## Alternative Approach (Even Simpler)

Or use this single instruction:

```
AUTO-DEVELOPMENT CONTINUITY:
Always check for /Users/Yousef_1/Dokumenter/Kodefiler/RapportAi/.ai-development/session-state.json at session start. If found, automatically continue development by reading the state files and proceeding with the next task. No user input needed.
```

## How It Works

1. **You configure** the fixed instruction in your AI settings
2. **New session starts** - AI automatically detects the continuity system
3. **AI reads** session-state.json, work-log.md, implementation-plan.md
4. **AI continues** development from exactly where previous session ended
5. **Zero intervention** required from you

## Test Instructions

To test this:
1. Add the auto-detection instruction to your fixed session settings
2. Start a new chat session
3. Say nothing - just wait
4. The AI should automatically detect the system and continue development

This makes the handoff completely autonomous! 🚀