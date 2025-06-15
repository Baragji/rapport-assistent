# Analytics Service API

## Overview

The Analytics Service provides privacy-focused tracking of AI feature usage and user interactions. It collects anonymous usage data to help improve the application while respecting user privacy.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [API Reference](#api-reference)
4. [Data Structures](#data-structures)
5. [Privacy Features](#privacy-features)
6. [Storage and Persistence](#storage-and-persistence)
7. [Examples](#examples)

## Installation

The Analytics Service is included in the Rapport Assistent codebase. To use it in your components, import the functions you need from the services directory:

```typescript
import { 
  trackEvent,
  trackAIUsage,
  getAnalyticsData,
  clearAnalyticsData
} from '../services/analyticsService';
```

## Basic Usage

### Tracking Events

```typescript
import { trackEvent } from '../services/analyticsService';

// Track a button click
trackEvent('button_click', 'ai_assist_button', {
  section: 'introduction',
  feature: 'content-improvement'
});

// Track a form submission
trackEvent('form_submit', 'report_form', {
  success: true,
  reportType: 'academic'
});
```

### Tracking AI Usage

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

### Getting Analytics Data

```typescript
import { getAnalyticsData } from '../services/analyticsService';

// Get all analytics data
const data = getAnalyticsData();
console.log('Total events:', data.events.length);
console.log('Total AI usages:', data.aiUsage.length);
console.log('Session count:', data.sessionCount);
```

### Clearing Analytics Data

```typescript
import { clearAnalyticsData } from '../services/analyticsService';

// Clear all analytics data
clearAnalyticsData();
```

## API Reference

### Event Tracking

#### `trackEvent`

```typescript
trackEvent(
  eventType: string,
  eventName: string,
  metadata?: Record<string, unknown>
): void
```

Tracks a general analytics event.

Parameters:
- `eventType`: Type of event (e.g., button_click, form_submit)
- `eventName`: Name of the event (e.g., ai_assist_button, report_form)
- `metadata`: Additional metadata about the event (optional)

### AI Usage Tracking

#### `trackAIUsage`

```typescript
trackAIUsage(usageData: AIUsageData): void
```

Tracks AI feature usage.

Parameters:
- `usageData`: Object containing data about the AI feature usage

#### `startAIOperationTiming`

```typescript
startAIOperationTiming(operationId: string): {
  stopTiming: (result: {
    featureId: string;
    templateId?: string;
    success: boolean;
    errorType?: string;
    errorMessage?: string;
    tokenCount?: number;
    metadata?: Record<string, unknown>;
  }) => void;
}
```

Starts timing an AI operation and returns a function to stop timing and track the result.

Parameters:
- `operationId`: Identifier for the operation

Returns:
- Object with a `stopTiming` function to call when the operation completes

### Data Access

#### `getAnalyticsData`

```typescript
getAnalyticsData(): AnalyticsData
```

Gets all analytics data from localStorage.

Returns:
- Object containing all analytics data

#### `getAIUsageStats`

```typescript
getAIUsageStats(): {
  totalUsage: number;
  successRate: number;
  averageResponseTime: number;
  usageByFeature: Record<string, number>;
  errorRates: Record<string, number>;
}
```

Gets statistics about AI feature usage.

Returns:
- Object containing AI usage statistics

#### `getEventStats`

```typescript
getEventStats(): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByName: Record<string, number>;
}
```

Gets statistics about tracked events.

Returns:
- Object containing event statistics

### Session Management

#### `initAnalyticsSession`

```typescript
initAnalyticsSession(): void
```

Initializes a new analytics session, incrementing the session count.

#### `clearAnalyticsData`

```typescript
clearAnalyticsData(): void
```

Clears all analytics data from localStorage.

## Data Structures

### `AIUsageData`

```typescript
interface AIUsageData {
  /**
   * Identifier for the AI feature being used
   */
  featureId: string;
  
  /**
   * Template ID used for generation (if applicable)
   */
  templateId?: string;
  
  /**
   * Response time in milliseconds
   */
  responseTime?: number;
  
  /**
   * Number of tokens in the response (if available)
   */
  tokenCount?: number;
  
  /**
   * Whether the AI operation was successful
   */
  success: boolean;
  
  /**
   * Error type if the operation failed
   */
  errorType?: string;
  
  /**
   * Error message if the operation failed
   */
  errorMessage?: string;
  
  /**
   * Timestamp of the AI usage
   */
  timestamp?: string;
  
  /**
   * Additional metadata about the AI usage
   */
  metadata?: Record<string, unknown>;
}
```

### `AnalyticsEvent`

```typescript
interface AnalyticsEvent {
  /**
   * Type of event (e.g., button_click, form_submit)
   */
  eventType: string;
  
  /**
   * Name of the event (e.g., ai_assist_button, report_form)
   */
  eventName: string;
  
  /**
   * Timestamp of the event
   */
  timestamp: string;
  
  /**
   * Additional metadata about the event
   */
  metadata?: Record<string, unknown>;
}
```

### `AnalyticsData`

```typescript
interface AnalyticsData {
  /**
   * Array of tracked events
   */
  events: AnalyticsEvent[];
  
  /**
   * Array of AI usage data
   */
  aiUsage: AIUsageData[];
  
  /**
   * Number of user sessions
   */
  sessionCount: number;
  
  /**
   * Timestamp of first visit
   */
  firstVisit: string;
  
  /**
   * Timestamp of last visit
   */
  lastVisit: string;
}
```

## Privacy Features

### Sensitive Field Filtering

The Analytics Service automatically filters out sensitive fields from metadata:

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

### Metadata Sanitization

All metadata is sanitized before storage:

```typescript
const sanitizeMetadata = (metadata?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!metadata) {
    return undefined;
  }
  
  const sanitized: Record<string, unknown> = {};
  
  // Only include non-sensitive fields
  Object.keys(metadata).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Skip sensitive fields
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      return;
    }
    
    // Include safe fields
    sanitized[key] = metadata[key];
  });
  
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};
```

## Storage and Persistence

### LocalStorage

All analytics data is stored in the browser's localStorage under the key `rapport-ai-analytics`:

```typescript
const ANALYTICS_STORAGE_KEY = 'rapport-ai-analytics';
```

### Error Handling

The Analytics Service is designed to fail gracefully. If localStorage is unavailable or throws an error, the service will log the error but will not disrupt the application.

## Examples

### Tracking User Interactions

```typescript
import { trackEvent } from '../services/analyticsService';

// In a React component
const MyComponent = () => {
  const handleButtonClick = () => {
    // Track the event
    trackEvent('button_click', 'generate_report_button', {
      reportType: 'academic',
      hasReferences: true
    });
    
    // Perform the action
    generateReport();
  };
  
  return (
    <button onClick={handleButtonClick}>
      Generate Report
    </button>
  );
};
```

### Timing AI Operations

```typescript
import { startAIOperationTiming } from '../services/analyticsService';
import { AIClient } from '../services/aiClient';

const improveContent = async (content) => {
  // Start timing the operation
  const timing = startAIOperationTiming('improve-content');
  const client = new AIClient();
  
  try {
    // Perform the AI operation
    const result = await client.generateContent(`Improve this: ${content}`);
    
    // Stop timing and track successful result
    timing.stopTiming({
      featureId: 'improve-content',
      success: true,
      tokenCount: result.length / 4 // Rough estimate
    });
    
    return result;
  } catch (error) {
    // Stop timing and track failed result
    timing.stopTiming({
      featureId: 'improve-content',
      success: false,
      errorType: error.type || 'unknown',
      errorMessage: error.message
    });
    
    throw error;
  }
};
```

### Creating an Analytics Dashboard

```tsx
import React, { useState, useEffect } from 'react';
import { getAIUsageStats, getEventStats } from '../services/analyticsService';
import { PieChart } from '../components/PieChart';

const AnalyticsDashboard = () => {
  const [aiStats, setAiStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  
  // Refresh stats every 5 seconds
  useEffect(() => {
    const loadStats = () => {
      setAiStats(getAIUsageStats());
      setEventStats(getEventStats());
    };
    
    // Initial load
    loadStats();
    
    // Set up interval
    const interval = setInterval(loadStats, 5000);
    
    // Clean up
    return () => clearInterval(interval);
  }, []);
  
  if (!aiStats || !eventStats) {
    return <div>Loading analytics...</div>;
  }
  
  // Prepare chart data for AI usage by feature
  const usageByFeatureData = {
    labels: Object.keys(aiStats.usageByFeature),
    datasets: [
      {
        data: Object.values(aiStats.usageByFeature),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }
    ]
  };
  
  return (
    <div className="analytics-dashboard">
      <h2 className="text-2xl font-bold mb-4">AI Usage Analytics</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Total Usage</h3>
          <p className="text-3xl font-bold">{aiStats.totalUsage}</p>
        </div>
        
        <div className="stat-card bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Success Rate</h3>
          <p className="text-3xl font-bold">{aiStats.successRate.toFixed(1)}%</p>
        </div>
        
        <div className="stat-card bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Avg Response Time</h3>
          <p className="text-3xl font-bold">{aiStats.averageResponseTime.toFixed(0)}ms</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Usage by Feature</h3>
          <PieChart
            data={usageByFeatureData}
            height={250}
            showStats={true}
          />
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Error Rates</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Error Type</th>
                <th className="text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(aiStats.errorRates).map(([type, rate]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td className="text-right">{rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Event Analytics</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Events by Type</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Event Type</th>
                <th className="text-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(eventStats.eventsByType).map(([type, count]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td className="text-right">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Events by Name</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Event Name</th>
                <th className="text-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(eventStats.eventsByName).map(([name, count]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="text-right">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
```