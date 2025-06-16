# MCP Server Configuration & Guidelines

## Overview

This document provides configuration and usage guidelines for Model Context Protocol (MCP) servers integrated into the AI Development Continuity System.

## Available MCP Servers

### 1. Code-Index Server (`mcp.config.usrlocalmcp.code-index`)

**Purpose**: Semantic code search and file analysis for enhanced development workflow.

**Configuration**:
```bash
# Set project path (required for initialization)
set_project_path: /Users/Yousef_1/Dokumenter/Kodefiler/RapportAi/rapport-assistent
```

**Key Tools**:
- `search_code`: Semantic search within indexed files
- `find_files`: Locate files using glob patterns
- `get_file_summary`: Analyze file structure and complexity
- `refresh_index`: Update project index after changes

**Best Practices**:
- Use specific file extensions in searches (`.tsx`, `.ts`, `.js`)
- Combine semantic and pattern-based searches
- Regular index refresh after significant code changes
- Leverage file summaries before detailed analysis

**Common Use Cases**:
```bash
# Find React components
search_code(query="React component", extensions=[".tsx", ".ts"])

# Locate test files
find_files(pattern="**/*.test.ts")

# Analyze component structure
get_file_summary(file_path="src/components/ReportForm.tsx")
```

### 2. Memento-MCP Server (`mcp.config.usrlocalmcp.memento-mcp`)

**Purpose**: Project knowledge graph and learning continuity across sessions.

**Key Tools**:
- `create_entities`: Store project concepts and components
- `create_relations`: Define relationships between entities
- `semantic_search`: Find relevant knowledge using embeddings
- `add_observations`: Update entity knowledge

**Best Practices**:
- Create entities for major components, patterns, and decisions
- Use descriptive relation types ("contains", "depends_on", "implements")
- Regular semantic searches to leverage accumulated knowledge
- Store reasoning and decision context in observations

**Knowledge Structure**:
```bash
# Project hierarchy
RapportAi Project -> contains -> ReportForm Component
ReportForm Component -> implements -> Form Validation
Form Validation -> uses -> Zod Schema

# Decision tracking
Architecture Decision -> influences -> Component Design
Performance Optimization -> affects -> Bundle Size
```

### 3. TaskManager Server (`mcp.config.usrlocalmcp.TaskManager`)

**Purpose**: Structured task planning and progress tracking with approval workflows.

**Key Tools**:
- `request_planning`: Create structured task breakdown
- `get_next_task`: Retrieve next pending task
- `mark_task_done`: Complete tasks with details
- `approve_task_completion`: User approval workflow

**Best Practices**:
- Break complex work into 15-30 minute atomic tasks
- Include clear success criteria in task descriptions
- Wait for user approval before proceeding to next task
- Document completion details for continuity

**Workflow Pattern**:
1. `request_planning` → Create task breakdown
2. `get_next_task` → Get current task
3. Execute task with chain-of-thought reasoning
4. `mark_task_done` → Complete with details
5. Wait for `approve_task_completion` from user
6. Repeat cycle

### 4. Desktop Commander (`mcp.config.usrlocalmcp.desktop-commander`)

**Purpose**: File system operations and configuration management.

**Key Tools**:
- `read_file`: Read file contents with offset/length control
- `read_multiple_files`: Batch file reading
- `get_config`: Retrieve server configuration

**Best Practices**:
- Use absolute paths for reliability
- Leverage offset/length for large files
- Batch operations for efficiency
- Respect security boundaries

## Integration Workflow

### Session Initialization
1. **Code-Index**: Set project path and verify index
2. **Memento**: Read existing knowledge graph
3. **TaskManager**: Check for pending tasks
4. **Desktop Commander**: Verify file access

### During Development
1. **Search Phase**: Use code-index for relevant code
2. **Knowledge Phase**: Query memento for context
3. **Planning Phase**: Structure work with TaskManager
4. **Execution Phase**: Implement with file operations
5. **Documentation Phase**: Update knowledge graph

### Session Handoff
1. **State Capture**: Store current context in memento
2. **Task Status**: Update TaskManager with progress
3. **Index Refresh**: Update code-index if needed
4. **Knowledge Update**: Add session learnings

## Error Handling

### Common Issues
- **Code-Index not configured**: Run `set_project_path` first
- **Empty knowledge graph**: Initialize with project entities
- **Task approval pending**: Wait for user confirmation
- **File access denied**: Check Desktop Commander config

### Recovery Strategies
- Verify MCP server connectivity before operations
- Fallback to manual operations if MCP unavailable
- Document MCP failures in work-log.md
- Use alternative search methods if code-index fails

## Performance Optimization

### Code-Index
- Limit search scope with target directories
- Use specific file extensions
- Regular index maintenance

### Memento
- Batch entity/relation creation
- Use semantic search for complex queries
- Regular knowledge graph cleanup

### TaskManager
- Atomic task sizing (15-30 min)
- Clear success criteria
- Efficient approval workflows

## Security Considerations

- **File Access**: Desktop Commander respects allowed directories
- **Data Privacy**: Memento stores project-specific knowledge only
- **Code Security**: Code-index operates on local files only
- **Task Isolation**: TaskManager maintains session boundaries

## Monitoring & Maintenance

### Health Checks
- Verify MCP server connectivity at session start
- Monitor index freshness in code-index
- Check knowledge graph consistency in memento
- Validate task completion rates in TaskManager

### Regular Maintenance
- Weekly code-index refresh
- Monthly knowledge graph cleanup
- Quarterly task pattern analysis
- Annual MCP server updates

This configuration ensures optimal MCP server integration for enhanced AI development workflows.