# Project Knowledge Graph

## Overview

This document maintains the project knowledge graph structure using memento-mcp server, ensuring continuity of learnings and insights across AI development sessions.

## Core Entities

### Project Structure

**RapportAi Project**
- Type: `project`
- Observations:
  - React-based report generation application
  - TypeScript implementation with modern tooling
  - Component-based architecture with hooks
  - Performance monitoring and feature flags integrated

**ReportForm Component**
- Type: `component`
- Observations:
  - Main form component for report generation
  - Uses React hooks for state management
  - Implements form validation with Zod
  - Handles file uploads and data processing

**Performance Monitor**
- Type: `utility`
- Observations:
  - Custom hook for performance tracking
  - Monitors component render times
  - Integrates with analytics systems
  - Provides development insights

**Feature Flags System**
- Type: `system`
- Observations:
  - Controls feature rollout and A/B testing
  - Environment-based configuration
  - Runtime feature toggling
  - Analytics integration

### Development Tools

**AI Development Continuity System**
- Type: `development_tool`
- Observations:
  - Enhanced with 2025 best practices
  - MCP server integration for workflow optimization
  - Atomic task breakdown (15-30 min units)
  - Chain-of-thought reasoning protocols

**MCP Servers**
- Type: `development_infrastructure`
- Observations:
  - Code-index for semantic search
  - Memento for knowledge persistence
  - TaskManager for structured workflows
  - Desktop Commander for file operations

## Key Relationships

### Containment Hierarchy
```
RapportAi Project
├── contains → ReportForm Component
├── contains → Performance Monitor
├── contains → Feature Flags System
└── uses → AI Development Continuity System
```

### Dependencies
```
ReportForm Component
├── depends_on → Form Validation
├── uses → React Hooks
└── integrates_with → Performance Monitor

AI Development Continuity System
├── leverages → MCP Servers
├── implements → Chain-of-Thought Reasoning
└── follows → 2025 Best Practices
```

### Implementation Patterns
```
Performance Monitor
├── implements → Custom Hook Pattern
├── uses → React Performance API
└── reports_to → Analytics System

Feature Flags System
├── implements → Configuration Pattern
├── enables → A/B Testing
└── controls → Feature Rollout
```

## Decision History

### Architecture Decisions

**Component Architecture**
- Decision: Use functional components with hooks
- Reasoning: Better performance and modern React patterns
- Impact: Improved maintainability and testing
- Confidence: 9/10

**TypeScript Integration**
- Decision: Full TypeScript implementation
- Reasoning: Type safety and better developer experience
- Impact: Reduced runtime errors and improved IDE support
- Confidence: 10/10

**Performance Monitoring**
- Decision: Custom performance monitoring hook
- Reasoning: Specific metrics for report generation workflow
- Impact: Better insights into user experience
- Confidence: 8/10

### Development Process Decisions

**AI Development Continuity**
- Decision: Implement 2025 enhanced continuity system
- Reasoning: Better session handoffs and context preservation
- Impact: Improved development efficiency and quality
- Confidence: 9/10

**MCP Server Integration**
- Decision: Integrate code-index, memento, and TaskManager
- Reasoning: Enhanced workflow automation and knowledge persistence
- Impact: Streamlined development process
- Confidence: 8/10

**Atomic Task Breakdown**
- Decision: 15-30 minute task units with clear success criteria
- Reasoning: Better context window management and progress tracking
- Impact: More predictable development cycles
- Confidence: 9/10

## Learning Patterns

### Successful Patterns

**Chain-of-Thought Reasoning**
- Pattern: `<thinking>`, `<approach>`, `<steps>`, `<verify>`
- Usage: Complex problem solving and decision making
- Effectiveness: High - improves decision quality
- Adoption: Standard practice for all complex tasks

**Confidence Scoring**
- Pattern: Rate decisions 1-10 with reasoning
- Usage: Risk assessment and decision tracking
- Effectiveness: Medium-High - better risk management
- Adoption: Applied to all significant decisions

**MCP-Powered Workflow**
- Pattern: Search → Plan → Execute → Document → Update
- Usage: Standard development cycle
- Effectiveness: High - comprehensive workflow coverage
- Adoption: Primary development methodology

### Anti-Patterns to Avoid

**Context Window Overflow**
- Problem: Tasks too large for single session
- Solution: Atomic task breakdown with clear checkpoints
- Prevention: 15-30 minute task sizing

**Knowledge Loss Between Sessions**
- Problem: Losing context and decisions across sessions
- Solution: Comprehensive knowledge graph maintenance
- Prevention: Regular memento updates

**Unclear Task Boundaries**
- Problem: Tasks without clear success criteria
- Solution: Specific, measurable task definitions
- Prevention: TaskManager approval workflows

## Knowledge Maintenance

### Regular Updates
- **Daily**: Add new entities and observations from development
- **Weekly**: Update relationships and decision confidence
- **Monthly**: Review and consolidate knowledge patterns
- **Quarterly**: Analyze learning effectiveness and adjust

### Quality Assurance
- **Consistency**: Ensure entity types and relations follow patterns
- **Completeness**: Verify all major decisions are documented
- **Accuracy**: Validate observations against actual implementation
- **Relevance**: Remove outdated or irrelevant knowledge

### Search Strategies

**Semantic Search Queries**
- "React component patterns" - Find component design insights
- "performance optimization" - Locate performance-related knowledge
- "form validation approaches" - Discover validation strategies
- "development workflow" - Find process improvements

**Entity Relationship Queries**
- Find all components that depend on Performance Monitor
- Locate decisions that affect ReportForm Component
- Identify patterns used across multiple components
- Discover knowledge gaps in current documentation

## Integration with Development Workflow

### Session Start
1. Query existing knowledge for current task context
2. Identify relevant patterns and previous decisions
3. Load related entities and relationships
4. Set confidence baselines for new work

### During Development
1. Document new insights and patterns as they emerge
2. Update entity observations with implementation details
3. Create new relationships as dependencies are discovered
4. Track decision confidence and reasoning

### Session End
1. Consolidate session learnings into knowledge graph
2. Update relationship strengths based on implementation
3. Document any pattern changes or new anti-patterns
4. Prepare knowledge context for next session

This knowledge graph serves as the persistent memory of the project, ensuring that insights and learnings are preserved and leveraged across all development sessions.