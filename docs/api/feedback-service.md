# Feedback Service API

## Overview

The Feedback Service collects and manages user feedback on AI-generated content. It provides a way to store, retrieve, and analyze feedback to improve AI features over time.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [API Reference](#api-reference)
4. [Data Structures](#data-structures)
5. [Storage and Persistence](#storage-and-persistence)
6. [Integration with AIFeedback Component](#integration-with-aifeedback-component)
7. [Examples](#examples)

## Installation

The Feedback Service is included in the Rapport Assistent codebase. To use it in your components, import the functions you need from the services directory:

```typescript
import { 
  submitFeedback,
  getFeedback,
  getAllFeedback,
  clearFeedback
} from '../services/feedbackService';
```

## Basic Usage

### Submitting Feedback

```typescript
import { submitFeedback } from '../services/feedbackService';

// Submit feedback for AI-generated content
submitFeedback({
  contentId: 'unique-content-id-123',
  templateId: 'improve-introduction',
  rating: 4,
  comments: 'The improved introduction is much clearer and more engaging.',
  metadata: {
    responseLength: 350,
    promptTemplate: 'improve-introduction'
  }
});
```

### Getting Feedback

```typescript
import { getFeedback, getAllFeedback } from '../services/feedbackService';

// Get feedback for a specific content ID
const feedback = getFeedback('unique-content-id-123');
console.log('Feedback:', feedback);

// Get all feedback
const allFeedback = getAllFeedback();
console.log('Total feedback items:', allFeedback.length);
```

### Clearing Feedback

```typescript
import { clearFeedback } from '../services/feedbackService';

// Clear all feedback
clearFeedback();
```

## API Reference

### Feedback Submission

#### `submitFeedback`

```typescript
submitFeedback(feedbackData: FeedbackData): void
```

Submits feedback for AI-generated content.

Parameters:
- `feedbackData`: Object containing feedback data

### Feedback Retrieval

#### `getFeedback`

```typescript
getFeedback(contentId: string): FeedbackData | null
```

Gets feedback for a specific content ID.

Parameters:
- `contentId`: Unique identifier for the content

Returns:
- Feedback data object, or null if not found

#### `getAllFeedback`

```typescript
getAllFeedback(): FeedbackData[]
```

Gets all feedback.

Returns:
- Array of all feedback data objects

#### `getFeedbackStats`

```typescript
getFeedbackStats(): {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  feedbackByTemplate: Record<string, {
    count: number;
    averageRating: number;
  }>;
}
```

Gets statistics about collected feedback.

Returns:
- Object containing feedback statistics

### Feedback Management

#### `clearFeedback`

```typescript
clearFeedback(): void
```

Clears all feedback from localStorage.

## Data Structures

### `FeedbackData`

```typescript
interface FeedbackData {
  /**
   * Unique identifier for the content being rated
   */
  contentId: string;
  
  /**
   * Template ID used to generate the content
   */
  templateId: string;
  
  /**
   * Rating from 1 to 5
   */
  rating: number;
  
  /**
   * Optional comments from the user
   */
  comments: string;
  
  /**
   * Timestamp of the feedback
   */
  timestamp: string;
  
  /**
   * Additional metadata about the content
   */
  metadata?: Record<string, unknown>;
}
```

## Storage and Persistence

### LocalStorage

All feedback data is stored in the browser's localStorage under the key `rapport-ai-feedback`:

```typescript
const FEEDBACK_STORAGE_KEY = 'rapport-ai-feedback';
```

### Error Handling

The Feedback Service is designed to fail gracefully. If localStorage is unavailable or throws an error, the service will log the error but will not disrupt the application.

## Integration with AIFeedback Component

The Feedback Service is designed to work seamlessly with the `AIFeedback` component:

```tsx
import React from 'react';
import AIFeedback from '../components/AIFeedback';

const MyComponent = () => {
  const handleFeedbackSubmitted = (rating, comments) => {
    console.log(`User rated content ${rating}/5`);
    console.log(`Comments: ${comments}`);
  };
  
  return (
    <div>
      <h3>Generated Content</h3>
      <div className="generated-content">
        This is the AI-generated content...
      </div>
      
      <AIFeedback
        contentId="unique-content-id-123"
        templateId="improve-introduction"
        metadata={{
          promptLength: 150,
          responseLength: 300
        }}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </div>
  );
};
```

The `AIFeedback` component automatically calls the `submitFeedback` function when the user submits feedback.

## Examples

### Collecting Feedback on AI-Generated Content

```tsx
import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';
import AIFeedback from '../components/AIFeedback';

const FeedbackExample = () => {
  const [originalText, setOriginalText] = useState('');
  const [contentId, setContentId] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const {
    content,
    isLoading,
    generateFromPrompt
  } = useAI({
    onComplete: (generatedContent, metadata) => {
      // Set the content ID for feedback
      setContentId(metadata?.contentId as string || `content-${Date.now()}`);
      setShowFeedback(true);
    }
  });
  
  const handleGenerate = async () => {
    setShowFeedback(false);
    try {
      await generateFromPrompt(`Improve this text: ${originalText}`);
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };
  
  const handleFeedbackSubmitted = (rating, comments) => {
    console.log(`Feedback submitted: ${rating}/5 - ${comments}`);
    setShowFeedback(false);
    
    // You could show a thank you message or other UI here
    alert('Thank you for your feedback!');
  };
  
  return (
    <div className="feedback-example">
      <h2>AI Content with Feedback</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Original Text:</label>
        <textarea
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Enter text to improve..."
          rows={4}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={isLoading || !originalText}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isLoading ? 'Generating...' : 'Improve Text'}
      </button>
      
      {content && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Improved Text:</h3>
          <div className="p-4 border rounded bg-gray-50">
            {content}
          </div>
        </div>
      )}
      
      {showFeedback && contentId && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Your Feedback:</h3>
          <AIFeedback
            contentId={contentId}
            templateId="improve-text"
            metadata={{
              originalLength: originalText.length,
              improvedLength: content.length
            }}
            onFeedbackSubmitted={handleFeedbackSubmitted}
          />
        </div>
      )}
    </div>
  );
};

export default FeedbackExample;
```

### Creating a Feedback Dashboard

```tsx
import React, { useState, useEffect } from 'react';
import { getAllFeedback, getFeedbackStats } from '../services/feedbackService';

const FeedbackDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Load feedback data on component mount
  useEffect(() => {
    setFeedback(getAllFeedback());
    setStats(getFeedbackStats());
  }, []);
  
  if (!stats) {
    return <div>Loading feedback data...</div>;
  }
  
  return (
    <div className="feedback-dashboard">
      <h2 className="text-2xl font-bold mb-4">Feedback Dashboard</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Total Feedback</h3>
          <p className="text-3xl font-bold">{stats.totalFeedback}</p>
        </div>
        
        <div className="stat-card bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Average Rating</h3>
          <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
        </div>
        
        <div className="stat-card bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Templates Rated</h3>
          <p className="text-3xl font-bold">{Object.keys(stats.feedbackByTemplate).length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Rating Distribution</h3>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center mb-2">
                <span className="w-8">{rating}★</span>
                <div className="flex-grow bg-gray-200 h-6 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{
                      width: `${(stats.ratingDistribution[rating] || 0) / stats.totalFeedback * 100}%`
                    }}
                  ></div>
                </div>
                <span className="ml-2 w-8 text-right">
                  {stats.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Feedback by Template</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Template</th>
                <th className="text-center">Count</th>
                <th className="text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.feedbackByTemplate).map(([template, data]) => (
                <tr key={template}>
                  <td>{template}</td>
                  <td className="text-center">{data.count}</td>
                  <td className="text-right">{data.averageRating.toFixed(1)}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mt-6 mb-3">Recent Feedback</h3>
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Template</th>
              <th className="text-center">Rating</th>
              <th className="text-left">Comments</th>
              <th className="text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {feedback.slice(0, 10).map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">{item.templateId}</td>
                <td className="py-2 text-center">{item.rating}/5</td>
                <td className="py-2">{item.comments || '-'}</td>
                <td className="py-2 text-right">
                  {new Date(item.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackDashboard;
```

### Implementing a Feedback Collection Strategy

```tsx
import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';
import AIAssistButton from '../components/AIAssistButton';

const FeedbackStrategy = () => {
  const [introduction, setIntroduction] = useState('');
  const [content, setContent] = useState('');
  const [conclusion, setConclusion] = useState('');
  
  // Determine when to show feedback based on usage patterns
  const [feedbackShown, setFeedbackShown] = useState({
    introduction: false,
    content: false,
    conclusion: false
  });
  
  // Track usage count to show feedback every 3 uses
  const [usageCount, setUsageCount] = useState({
    introduction: 0,
    content: 0,
    conclusion: 0
  });
  
  const handleContentGenerated = (section, newContent) => {
    // Update the section content
    if (section === 'introduction') setIntroduction(newContent);
    if (section === 'content') setContent(newContent);
    if (section === 'conclusion') setConclusion(newContent);
    
    // Update usage count
    const newCount = {
      ...usageCount,
      [section]: usageCount[section] + 1
    };
    setUsageCount(newCount);
    
    // Show feedback every 3 uses
    if (newCount[section] % 3 === 0) {
      setFeedbackShown({
        ...feedbackShown,
        [section]: true
      });
    }
  };
  
  const handleFeedbackSubmitted = (section) => {
    setFeedbackShown({
      ...feedbackShown,
      [section]: false
    });
  };
  
  return (
    <div className="report-editor">
      <h2>Report Editor</h2>
      
      <div className="section mb-6">
        <h3>Introduction</h3>
        <textarea
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          placeholder="Write your introduction here..."
          rows={4}
          className="w-full p-2 border rounded mb-2"
        />
        <AIAssistButton
          templateId="improve-introduction"
          templateParams={{ content: introduction }}
          onContentGenerated={(content) => handleContentGenerated('introduction', content)}
          label="Improve Introduction"
          showFeedback={feedbackShown.introduction}
          onFeedbackSubmitted={() => handleFeedbackSubmitted('introduction')}
        />
      </div>
      
      <div className="section mb-6">
        <h3>Main Content</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your main content here..."
          rows={6}
          className="w-full p-2 border rounded mb-2"
        />
        <AIAssistButton
          templateId="improve-content"
          templateParams={{ content }}
          onContentGenerated={(content) => handleContentGenerated('content', content)}
          label="Improve Content"
          showFeedback={feedbackShown.content}
          onFeedbackSubmitted={() => handleFeedbackSubmitted('content')}
        />
      </div>
      
      <div className="section mb-6">
        <h3>Conclusion</h3>
        <textarea
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          placeholder="Write your conclusion here..."
          rows={4}
          className="w-full p-2 border rounded mb-2"
        />
        <AIAssistButton
          templateId="improve-conclusion"
          templateParams={{ content: conclusion }}
          onContentGenerated={(content) => handleContentGenerated('conclusion', content)}
          label="Improve Conclusion"
          showFeedback={feedbackShown.conclusion}
          onFeedbackSubmitted={() => handleFeedbackSubmitted('conclusion')}
        />
      </div>
    </div>
  );
};

export default FeedbackStrategy;
```