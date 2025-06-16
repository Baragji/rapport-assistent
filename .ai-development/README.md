# AI Development Continuity System (2025 Enhanced)

This directory contains files that enable seamless handoffs between AI development sessions, addressing context window limitations while leveraging 2025 best practices for AI-assisted development.

## System Overview

The enhanced development continuity system treats context window limits as a known architectural constraint and provides:

- **Persistent State Tracking**: Current progress and next steps with confidence scoring
- **Atomic Task Breakdown**: 15-30 minute work units optimized for context limits
- **Chain-of-Thought Reasoning**: Structured analysis and verification protocols
- **Self-Consistency Validation**: Multiple reasoning paths for critical decisions
- **MCP Server Integration**: Code indexing, knowledge graphs, and task management
- **Rollback Points**: Safe recovery states with automated checkpoints
- **Handoff Protocol**: Standardized session transitions with quality gates

## File Structure

### Core Continuity Files
- `session-state.json` - Current development status, confidence scores, and next actions
- `implementation-plan.md` - Master plan broken into atomic tasks (15-30 min each)
- `work-log.md` - Detailed log with chain-of-thought reasoning and decisions
- `handoff-checklist.md` - Protocol for session transitions with quality verification
- `Fixedprompt-optimized-2025.md` - Enhanced prompt with 2025 best practices
- `README.md` - This overview document

### MCP Integration Files
- `mcp-config.md` - Configuration and usage guidelines for MCP servers
- `knowledge-graph.md` - Project knowledge maintained via memento-mcp
- `code-index-queries.md` - Common search patterns for code-index server

## Usage

### Starting a New Session (2025 Protocol)
1. **Initialize MCP Servers**: Verify code-index, memento-mcp, and TaskManager connectivity
2. **Read State**: Review `session-state.json` for current status and confidence scores
3. **Context Recovery**: Use chain-of-thought analysis from `work-log.md`
4. **Task Selection**: Get next atomic task (15-30 min) from implementation plan
5. **Quality Gate**: Verify understanding with self-consistency check

### During Development (Enhanced Workflow)
1. **Pre-Task Analysis**: Use `<thinking>`, `<approach>`, `<steps>`, `<verify>` structure
2. **Confidence Scoring**: Rate decisions 1-10 and document reasoning paths
3. **MCP Integration**: Leverage code-index for search, memento for knowledge, TaskManager for tracking
4. **Continuous Updates**: Update `session-state.json` with progress and confidence
5. **Atomic Commits**: Frequent commits with descriptive messages and rollback points
6. **Verification**: Run tests and validate against success criteria

### Ending a Session (Quality Assured)
1. **Task Completion**: Finish current atomic task or create safe rollback point
2. **Knowledge Update**: Store insights in memento-mcp knowledge graph
3. **State Persistence**: Update all tracking files with confidence scores
4. **Quality Verification**: Follow enhanced handoff checklist
5. **Rollback Preparation**: Create tagged commit with recovery instructions

## Recovery Protocol

If a session ended unexpectedly:
1. Check `session-state.json` for last known state
2. Verify current state with tests
3. Rollback to last checkpoint if needed
4. Continue from last successful task

## Design Principles (2025 Enhanced)

- **Atomic Tasks**: 15-30 minute work units with clear success criteria and rollback points
- **Chain-of-Thought**: Structured reasoning with `<thinking>`, `<approach>`, `<steps>`, `<verify>`
- **Self-Consistency**: Multiple reasoning paths for critical decisions with confidence scoring
- **MCP-Powered**: Integrated code indexing, knowledge graphs, and task management
- **Crash-Safe**: System can recover from any interruption with automated checkpoints
- **Self-Documenting**: Full context preserved with reasoning traces and confidence metrics
- **Test-Driven**: Verification at each step with automated quality gates
- **Rollback-Ready**: Multiple recovery points with clear continuation instructions
- **Prompt-Optimized**: 2025 best practices for clarity, specificity, and structured output

## MCP Server Integration

### Code-Index Server
- **Purpose**: Semantic code search and file analysis
- **Usage**: Find relevant code, analyze dependencies, get file summaries
- **Best Practice**: Use specific queries with file type filters

### Memento-MCP Server
- **Purpose**: Project knowledge graph and learning continuity
- **Usage**: Store insights, track relationships, semantic search
- **Best Practice**: Regular updates with project learnings and decisions

### TaskManager Server
- **Purpose**: Structured task planning and progress tracking
- **Usage**: Break down complex work, track completion, manage approvals
- **Best Practice**: Atomic task breakdown with clear success criteria

This enhanced system ensures development continuity while leveraging 2025 AI development best practices and MCP server capabilities.