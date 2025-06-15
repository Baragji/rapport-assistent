# Analytics Service Documentation

## Overview

The Analytics Service in Rapport Assistent provides privacy-focused tracking of AI feature usage and user interactions. This document details how the analytics system works, what data is collected, and how to use it effectively.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Data Collection](#data-collection)
3. [Privacy Considerations](#privacy-considerations)
4. [API Reference](#api-reference)
5. [Usage Examples](#usage-examples)
6. [Statistics and Reporting](#statistics-and-reporting)
7. [Implementation Details](#implementation-details)
8. [Testing](#testing)

## Design Principles

The analytics service was designed with the following principles in mind:

1. **Privacy First**: No personal data is collected or stored
2. **Transparency**: Clear documentation of what is tracked
3. **Performance**: Minimal impact on application performance
4. **Reliability**: Graceful handling of errors and edge cases
5. **Utility**: Actionable insights for improving AI features

## Data Collection

### What is Collected

The analytics service collects two main types of data:

1. **AI Usage Data**:
   - Feature ID (which AI feature was used)
   - Template ID (which prompt template was used)
   - Response time (how long the AI operation took)
   - Success/failure status
   - Error type and message (if applicable)
   - Token count (approximate size of the response)
   - Timestamp

2. **Event Data**:
   - Event type (e.g., button_click, form_submit)
   - Event name (e.g., ai_assist_button, report_form)
   - Timestamp
   - Non-sensitive metadata

### What is NOT Collected

The analytics service explicitly does not collect:

- User identifiers (names, emails, IDs)
- Prompt content or user inputs
- AI response content
- Any personal information
- IP addresses or location data

## Privacy Considerations

### Data Sanitization

All data is sanitized before storage to remove potentially sensitive information:

```typescript
const SENSITIVE_FIELDS = [
  'email', 
  'password', 
  'token', 
  'apiKey', 
  'content', 
  'promptText', 
  'responseText',
  'userEmail',
  'userId',
  'name',
  'phone'
];
```

Any field matching or containing these terms is automatically excluded from analytics data.

### Local Storage Only

All analytics data is stored in the browser's localStorage and is not transmitted to any external servers by default. This ensures that data remains under the user's control.

### Data Retention

Users can clear all analytics data at any time using the `clearAnalyticsData()` function.

## API Reference

### Core Functions

#### `trackEvent(eventType, eventName, metadata?)`

Tracks a general user interaction event.

```typescript
import { trackEvent } from '../services/analyticsService';

// Track a button click
trackEvent('button_click', 'ai_assist_button', { section: 'introduction' });

// Track a form submission
trackEvent('form_submit', 'report_form', { success: true });
```

#### `trackAIUsage(usageData)`

Tracks AI feature usage with detailed metrics.

```typescript
import { trackAIUsage } from '../services/analyticsService';

// Track successful AI usage
trackAIUsage({
  featureId: 'improve-introduction',
  templateId: 'introduction-improvement',
  responseTime: 1250,
  success: true,
  tokenCount: 150
});

// Track failed AI usage
trackAIUsage({
  featureId: 'improve-content',
  templateId: 'content-improvement',
  responseTime: 800,
  success: false,
  errorType: 'api_error',
  errorMessage: 'OpenAI API returned an error'
});
```

#### `startAIOperationTiming(operationId)`

Starts timing an AI operation and returns a function to stop timing and track the result.

```typescript
import { startAIOperationTiming } from '../services/analyticsService';

const timing = startAIOperationTiming('template-generation');

// Later, when the operation completes
timing.stopTiming({
  featureId: 'template-generation',
  templateId: 'improve-introduction',
  success: true,
  tokenCount: 150
});
```

### Data Access Functions

#### `getAnalyticsData()`

Retrieves all analytics data from localStorage.

```typescript
import { getAnalyticsData } from '../services/analyticsService';

const data = getAnalyticsData();
console.log('Total events:', data.events.length);
console.log('Total AI usages:', data.aiUsage.length);
console.log('Session count:', data.sessionCount);
```

#### `getAIUsageStats()`

Calculates and returns statistics about AI feature usage.

```typescript
import { getAIUsageStats } from '../services/analyticsService';

const stats = getAIUsageStats();
console.log('Total AI usage:', stats.totalUsage);
console.log('Success rate:', stats.successRate);
console.log('Average response time:', stats.averageResponseTime);
console.log('Usage by feature:', stats.usageByFeature);
console.log('Error rates:', stats.errorRates);
```

#### `getEventStats()`

Calculates and returns statistics about tracked events.

```typescript
import { getEventStats } from '../services/analyticsService';

const stats = getEventStats();
console.log('Total events:', stats.totalEvents);
console.log('Events by type:', stats.eventsByType);
console.log('Events by name:', stats.eventsByName);
```

### Session Management

#### `initAnalyticsSession()`

Initializes a new analytics session, incrementing the session count.

```typescript
import { initAnalyticsSession } from '../services/analyticsService';

// Call this when the application starts
initAnalyticsSession();
```

#### `clearAnalyticsData()`

Clears all analytics data from localStorage.

```typescript
import { clearAnalyticsData } from '../services/analyticsService';

// Call this when the user wants to clear their data
clearAnalyticsData();
```

## Usage Examples

### Basic Event Tracking

```typescript
import { trackEvent } from '../services/analyticsService';

// In a component
const handleButtonClick = () => {
  // Track the event
  trackEvent('button_click', 'generate_report_button', {
    reportType: 'academic',
    hasReferences: true
  });
  
  // Perform the action
  generateReport();
};
```

### AI Feature Tracking

```typescript
import { trackAIUsage } from '../services/analyticsService';
import { AIClient } from '../services/aiClient';

const improveContent = async (content) => {
  const startTime = performance.now();
  const client = new AIClient();
  
  try {
    const result = await client.generateContent(`Improve this: ${content}`);
    const endTime = performance.now();
    
    // Track successful usage
    trackAIUsage({
      featureId: 'improve-content',
      responseTime: endTime - startTime,
      success: true,
      tokenCount: result.length / 4 // Rough estimate
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    // Track failed usage
    trackAIUsage({
      featureId: 'improve-content',
      responseTime: endTime - startTime,
      success: false,
      errorType: error.type || 'unknown',
      errorMessage: error.message
    });
    
    throw error;
  }
};
```

### Integrated with useAI Hook

The analytics service is already integrated with the `useAI` hook:

```typescript
import { useAI } from '../hooks/useAI';

const MyComponent = () => {
  const { generateContent } = useAI();
  
  const handleImprove = async () => {
    // Analytics are automatically tracked by the hook
    const result = await generateContent('improve-introduction', {
      content: 'This is my introduction.'
    });
    
    // Use the result
    console.log(result);
  };
  
  return (
    <button onClick={handleImprove}>
      Improve Introduction
    </button>
  );
};
```

### Displaying Analytics Data

```tsx
import React, { useState, useEffect } from 'react';
import { getAIUsageStats, getEventStats } from '../services/analyticsService';

const AnalyticsDashboard = () => {
  const [aiStats, setAiStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  
  useEffect(() => {
    // Get the latest stats
    setAiStats(getAIUsageStats());
    setEventStats(getEventStats());
  }, []);
  
  if (!aiStats || !eventStats) {
    return <div>Loading analytics...</div>;
  }
  
  return (
    <div className="analytics-dashboard">
      <h2>AI Usage Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Usage</h3>
          <p className="stat-value">{aiStats.totalUsage}</p>
        </div>
        <div className="stat-card">
          <h3>Success Rate</h3>
          <p className="stat-value">{aiStats.successRate.toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <h3>Avg Response Time</h3>
          <p className="stat-value">{aiStats.averageResponseTime.toFixed(0)}ms</p>
        </div>
      </div>
      
      <h3>Usage by Feature</h3>
      <ul>
        {Object.entries(aiStats.usageByFeature).map(([feature, count]) => (
          <li key={feature}>
            {feature}: {count} uses
          </li>
        ))}
      </ul>
      
      <h2>Event Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p className="stat-value">{eventStats.totalEvents}</p>
        </div>
      </div>
      
      <h3>Events by Type</h3>
      <ul>
        {Object.entries(eventStats.eventsByType).map(([type, count]) => (
          <li key={type}>
            {type}: {count} events
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnalyticsDashboard;
```

## Statistics and Reporting

The analytics service provides several built-in statistics functions:

### AI Usage Statistics

```typescript
const aiStats = getAIUsageStats();
```

Returns:
- `totalUsage`: Total number of AI operations
- `successRate`: Percentage of successful operations
- `averageResponseTime`: Average response time in milliseconds
- `usageByFeature`: Count of usage by feature ID
- `errorRates`: Percentage of errors by error type

### Event Statistics

```typescript
const eventStats = getEventStats();
```

Returns:
- `totalEvents`: Total number of tracked events
- `eventsByType`: Count of events by event type
- `eventsByName`: Count of events by event name

## Implementation Details

### Data Storage

Analytics data is stored in localStorage under the key `rapport-ai-analytics` with the following structure:

```typescript
interface AnalyticsData {
  events: AnalyticsEvent[];
  aiUsage: AIUsageData[];
  sessionCount: number;
  firstVisit: string;
  lastVisit: string;
}
```

### Error Handling

The analytics service is designed to fail gracefully. If localStorage is unavailable or throws an error, the service will log the error but will not disrupt the application.

### Performance Impact

The analytics service is designed to have minimal performance impact:
- Operations are synchronous and fast
- No network requests are made
- Data sanitization is efficient
- Error handling prevents cascading failures

## Testing

The analytics service has comprehensive test coverage, including:

- Basic tracking functionality
- Data structure validation
- Privacy and data sanitization
- Error handling and recovery
- Statistics calculation
- Edge cases (empty data, localStorage errors)

To run the tests:

```bash
npm run test -- --testPathPattern=analyticsService
```

Example test output:

```
PASS  src/services/__tests__/analyticsService.test.ts
  Analytics Service
    trackEvent
      ✓ stores event in localStorage (5 ms)
      ✓ appends to existing events (1 ms)
      ✓ handles localStorage errors gracefully (2 ms)
    trackAIUsage
      ✓ stores AI usage data in localStorage (1 ms)
      ✓ appends to existing AI usage data (1 ms)
      ✓ handles optional parameters correctly (1 ms)
      ✓ handles localStorage errors gracefully (1 ms)
    getAnalyticsData
      ✓ returns empty data when no analytics are stored (1 ms)
      ✓ returns stored analytics data (1 ms)
      ✓ handles localStorage errors (1 ms)
    clearAnalyticsData
      ✓ removes analytics data from localStorage (1 ms)
      ✓ handles localStorage errors (1 ms)
    Analytics Data Structure
      ✓ maintains correct data structure with multiple events and AI usages (1 ms)
    Privacy Considerations
      ✓ does not store personal data in analytics (1 ms)
      ✓ sanitizes AI usage data for privacy (1 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```