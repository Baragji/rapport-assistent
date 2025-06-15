# AI Features Documentation

## Overview

Rapport Assistent integrates OpenAI's powerful language models to enhance the report creation process. This document provides detailed information about the AI features, their implementation, and how to use them effectively.

## Table of Contents

1. [AI Client Implementation](#ai-client-implementation)
2. [Prompt Templates](#prompt-templates)
3. [AI-Assist Button](#ai-assist-button)
4. [useAI Hook](#useai-hook)
5. [User Feedback Collection](#user-feedback-collection)
6. [Analytics Integration](#analytics-integration)
7. [Performance Considerations](#performance-considerations)
8. [Error Handling](#error-handling)
9. [Usage Examples](#usage-examples)

## AI Client Implementation

The AI client is implemented in `src/services/aiClient.ts` and provides a robust interface to the OpenAI API.

### Key Features

- **Error Handling**: Custom `AIError` class with error type classification
- **Retry Mechanism**: Exponential backoff for retryable errors
- **Streaming Support**: Real-time content streaming with progress tracking
- **Lazy Loading**: Optional lazy loading via `aiClientLazy.ts`

### Configuration

The AI client is configured using environment variables:

```
VITE_OPENAI_API_KEY=your-api-key-here
VITE_OPENAI_MODEL=gpt-4-turbo-preview
VITE_OPENAI_MAX_TOKENS=1000
```

### Basic Usage

```typescript
import { AIClient } from '../services/aiClient';

const client = new AIClient();
const response = await client.generateContent('Improve this paragraph: ...');
```

## Prompt Templates

Prompt templates are managed by the `promptService` in `src/services/promptService.ts`.

### Template Structure

Templates are stored as JSON files in the `src/templates` directory with the following structure:

```json
{
  "id": "improve-introduction",
  "description": "Improves the introduction section of a report",
  "template": "Improve the following introduction for an academic report: {{content}}",
  "parameters": ["content"],
  "examples": [
    {
      "content": "This is a report about climate change.",
      "output": "This comprehensive report examines the multifaceted impacts of climate change on global ecosystems and human societies."
    }
  ]
}
```

### Using Templates

```typescript
import { promptService } from '../services/promptService';

const filledTemplate = promptService.fillTemplate('improve-introduction', {
  content: 'This is my introduction paragraph.'
});
```

## AI-Assist Button

The `AIAssistButton` component provides a user-friendly way to trigger AI-assisted content generation.

### Props

| Prop | Type | Description |
|------|------|-------------|
| templateId | string | ID of the prompt template to use |
| templateParams | object | Parameters to fill the template |
| onContentGenerated | function | Callback when content is generated |
| label | string | Button label text |
| streaming | boolean | Whether to use streaming responses |
| showFeedback | boolean | Whether to show feedback UI after generation |

### Example Usage

```tsx
<AIAssistButton
  templateId="improve-introduction"
  templateParams={{ content: currentIntroduction }}
  onContentGenerated={(improvedContent) => setIntroduction(improvedContent)}
  label="Improve Introduction"
  streaming={true}
  showFeedback={true}
/>
```

## useAI Hook

The `useAI` hook provides a flexible way to integrate AI capabilities into any component.

### Return Values

| Value | Type | Description |
|-------|------|-------------|
| content | string | Generated content |
| isLoading | boolean | Whether content is being generated |
| error | string | Error message if generation failed |
| progress | number | Progress of streaming response (0-100) |
| generateContent | function | Generate content using a template |
| generateFromPrompt | function | Generate content using a raw prompt |
| reset | function | Reset the hook state |

### Example Usage

```tsx
const {
  content,
  isLoading,
  error,
  progress,
  generateContent
} = useAI({
  streaming: true,
  onStream: (chunk, progress) => console.log(`Received chunk, progress: ${progress}%`),
  onComplete: (content) => console.log('Generation complete:', content)
});

// Later in your code
const handleImprove = async () => {
  await generateContent('improve-introduction', { content: currentText });
};
```

## User Feedback Collection

The `AIFeedback` component and `feedbackService` allow collecting user feedback on AI-generated content.

### Feedback Data Structure

```typescript
interface FeedbackData {
  contentId: string;
  templateId: string;
  rating: number;
  comments: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

### Example Usage

```tsx
<AIFeedback
  contentId="unique-content-id"
  templateId="improve-introduction"
  metadata={{ responseLength: content.length }}
  onFeedbackSubmitted={(rating, comments) => {
    console.log(`User rated content ${rating}/5`);
  }}
/>
```

## Analytics Integration

The `analyticsService` provides privacy-focused tracking of AI feature usage.

### Tracked Metrics

- **AI Usage**: Feature usage, response times, success rates
- **User Interactions**: Button clicks, form submissions
- **Performance**: Response times, token counts

### Example Usage

```typescript
import { trackEvent, trackAIUsage } from '../services/analyticsService';

// Track a user interaction
trackEvent('button_click', 'ai_assist_button', {
  templateId: 'improve-introduction',
  section: 'introduction'
});

// Track AI usage
trackAIUsage({
  featureId: 'improve-introduction',
  templateId: 'improve-introduction',
  responseTime: 1250,
  success: true
});
```

## Performance Considerations

### Lazy Loading

The AI client can be lazy-loaded to improve initial load times:

```typescript
import { getAIClient } from '../services/aiClientLazy';

const client = await getAIClient();
```

### Feature Flags

Feature flags can be used to enable/disable AI features:

```typescript
import { getFeatureFlag } from '../utils/featureFlags';

if (getFeatureFlag('AI_LAZY_LOADING')) {
  // Use lazy loading
}
```

## Error Handling

The AI client includes robust error handling with different error types:

- **RATE_LIMIT**: API rate limit exceeded (retryable)
- **INVALID_REQUEST**: Invalid request parameters (not retryable)
- **API_ERROR**: General API error (may be retryable)
- **NETWORK_ERROR**: Network connectivity issues (retryable)
- **TIMEOUT**: Request timeout (retryable)
- **UNKNOWN**: Unknown error (not retryable)

### Example Error Handling

```typescript
try {
  const result = await client.generateContent(prompt);
  // Handle successful result
} catch (err) {
  if (err instanceof AIError) {
    if (err.retryable) {
      // Can retry this operation
      console.log('Retryable error:', err.message);
    } else {
      // Cannot retry, handle permanently
      console.error('Permanent error:', err.message);
    }
  } else {
    console.error('Unknown error:', err);
  }
}
```

## Usage Examples

### Improving a Report Introduction

```tsx
import React, { useState } from 'react';
import { AIAssistButton } from '../components/AIAssistButton';

const IntroductionSection = () => {
  const [introduction, setIntroduction] = useState('');
  
  return (
    <div className="introduction-section">
      <h2>Introduction</h2>
      
      <textarea
        value={introduction}
        onChange={(e) => setIntroduction(e.target.value)}
        placeholder="Write your introduction here..."
        rows={5}
        className="w-full p-2 border rounded"
      />
      
      <div className="mt-2">
        <AIAssistButton
          templateId="improve-introduction"
          templateParams={{ content: introduction }}
          onContentGenerated={(improvedContent) => setIntroduction(improvedContent)}
          label="Improve Introduction"
          icon={<span>✨</span>}
          variant="primary"
          streaming={true}
          showFeedback={true}
        />
      </div>
    </div>
  );
};

export default IntroductionSection;
```

### Using References with AI Suggestions

```tsx
import React, { useState } from 'react';
import { AIAssistButton } from '../components/AIAssistButton';

const ContentSection = ({ references }) => {
  const [content, setContent] = useState('');
  
  return (
    <div className="content-section">
      <h2>Content</h2>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your content here..."
        rows={10}
        className="w-full p-2 border rounded"
      />
      
      <div className="mt-2">
        <AIAssistButton
          templateId="improve-content-with-references"
          templateParams={{ content }}
          references={references}
          onContentGenerated={(improvedContent) => setContent(improvedContent)}
          label="Improve with References"
          variant="primary"
          streaming={true}
          showFeedback={true}
        />
      </div>
    </div>
  );
};

export default ContentSection;
```

### Advanced Usage with useAI Hook

```tsx
import React, { useState, useCallback } from 'react';
import { useAI } from '../hooks/useAI';

const AdvancedAIComponent = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  
  const {
    isLoading,
    error,
    progress,
    generateFromPrompt,
    reset
  } = useAI({
    streaming: true,
    onComplete: (content) => setOutput(content)
  });
  
  const handleGenerate = useCallback(async () => {
    reset();
    try {
      await generateFromPrompt(`Improve this text: ${input}`);
    } catch (err) {
      console.error('Error generating content:', err);
    }
  }, [input, generateFromPrompt, reset]);
  
  return (
    <div className="advanced-ai-component">
      <div className="mb-4">
        <label className="block mb-2">Input Text:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          rows={5}
        />
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={isLoading || !input}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      
      {isLoading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-red-600">
          Error: {error}
        </div>
      )}
      
      {output && (
        <div className="mt-4">
          <label className="block mb-2">Improved Text:</label>
          <div className="p-4 border rounded bg-gray-50">
            {output}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAIComponent;
```