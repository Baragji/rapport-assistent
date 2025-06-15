# useAI Hook API

## Overview

The `useAI` hook provides a React-friendly way to integrate AI capabilities into any component. It handles state management, error handling, and progress tracking for AI-assisted content generation.

## Table of Contents

- [useAI Hook API](#useai-hook-api)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [API Reference](#api-reference)
    - [`useAI` Hook](#useai-hook)
      - [Parameters](#parameters)
      - [Return Value](#return-value)
  - [Options](#options)
    - [Option Details](#option-details)
  - [Return Values](#return-values)
    - [Return Value Details](#return-value-details)
  - [Error Handling](#error-handling)
  - [Streaming Support](#streaming-support)
  - [Analytics Integration](#analytics-integration)
  - [Examples](#examples)
    - [Using with Template-Based Generation](#using-with-template-based-generation)
    - [Using with Raw Prompt Generation](#using-with-raw-prompt-generation)
    - [Using with a Custom Client](#using-with-a-custom-client)

## Installation

The `useAI` hook is included in the Rapport Assistent codebase. To use it in your components, import it from the hooks directory:

```typescript
import { useAI } from '../hooks/useAI';
```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';

const AIContentGenerator = () => {
  const [inputText, setInputText] = useState('');
  
  const {
    content,
    isLoading,
    error,
    generateFromPrompt,
    reset
  } = useAI();
  
  const handleGenerate = async () => {
    reset();
    try {
      await generateFromPrompt(`Improve this text: ${inputText}`);
    } catch (err) {
      console.error('Error generating content:', err);
    }
  };
  
  return (
    <div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to improve..."
      />
      
      <button
        onClick={handleGenerate}
        disabled={isLoading || !inputText}
      >
        {isLoading ? 'Generating...' : 'Improve Text'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {content && (
        <div className="result">
          <h3>Improved Text:</h3>
          <div>{content}</div>
        </div>
      )}
    </div>
  );
};
```

## API Reference

### `useAI` Hook

```typescript
function useAI(options?: UseAIOptions): UseAIResult
```

#### Parameters

- `options`: Configuration options for the hook (optional)

#### Return Value

Returns a `UseAIResult` object with state and methods for AI content generation.

## Options

The `useAI` hook accepts the following options:

```typescript
interface UseAIOptions {
  /**
   * Custom AI client instance
   */
  client?: AIClient;
  
  /**
   * Whether to use streaming responses
   */
  streaming?: boolean;
  
  /**
   * Callback for streaming updates
   */
  onStream?: (chunk: string, progress: number) => void;
  
  /**
   * Callback for when generation is complete
   */
  onComplete?: (content: string, metadata?: Record<string, unknown>) => void;
  
  /**
   * Callback for when an error occurs
   */
  onError?: (error: AIError) => void;
}
```

### Option Details

- `client`: Provide a custom AIClient instance (useful for testing or custom configuration)
- `streaming`: Enable streaming responses (default: false)
- `onStream`: Callback function called for each chunk of a streaming response
- `onComplete`: Callback function called when content generation is complete
- `onError`: Callback function called when an error occurs

## Return Values

The `useAI` hook returns an object with the following properties and methods:

```typescript
interface UseAIResult {
  /**
   * Generated content from the AI
   */
  content: string;
  
  /**
   * Whether the AI is currently generating content
   */
  isLoading: boolean;
  
  /**
   * Error message if the AI generation failed
   */
  error: string | null;
  
  /**
   * Progress of the streaming response (0-100)
   */
  progress: number;
  
  /**
   * Generate content using a template ID and parameters
   */
  generateContent: (templateId: string, params: TemplateParams) => Promise<string>;
  
  /**
   * Generate content using a raw prompt
   */
  generateFromPrompt: (prompt: string) => Promise<string>;
  
  /**
   * Reset the state of the hook
   */
  reset: () => void;
}
```

### Return Value Details

- `content`: The generated content (empty string if not yet generated)
- `isLoading`: Boolean indicating if content is currently being generated
- `error`: Error message if generation failed, null otherwise
- `progress`: Progress percentage for streaming responses (0-100)
- `generateContent`: Function to generate content using a template ID and parameters
- `generateFromPrompt`: Function to generate content using a raw prompt
- `reset`: Function to reset the hook state (clear content, error, and progress)

## Error Handling

The `useAI` hook provides several ways to handle errors:

1. **Error State**: The `error` property contains the error message if generation failed
2. **Error Callback**: The `onError` callback is called with the error object
3. **Promise Rejection**: The `generateContent` and `generateFromPrompt` methods return promises that reject with the error

```tsx
const {
  error,
  generateContent
} = useAI({
  onError: (err) => {
    console.error('Error in useAI hook:', err);
    // Show a toast notification, etc.
  }
});

// Using the error state
{error && <div className="error-message">{error}</div>}

// Using try/catch
const handleGenerate = async () => {
  try {
    await generateContent('improve-text', { content: inputText });
  } catch (err) {
    console.error('Error caught in component:', err);
  }
};
```

## Streaming Support

The `useAI` hook supports streaming responses, which show content as it's generated:

```tsx
const {
  content,
  isLoading,
  progress,
  generateContent
} = useAI({
  streaming: true,
  onStream: (chunk, progress) => {
    console.log(`Received chunk, progress: ${progress}%`);
  }
});

// Render a progress bar
{isLoading && (
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
)}
```

## Analytics Integration

The `useAI` hook automatically integrates with the analytics service to track AI usage:

- Tracks feature usage with template IDs
- Measures response times
- Records success and error rates
- Estimates token usage

No additional code is needed to enable analytics tracking.

## Examples

### Using with Template-Based Generation

```tsx
import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';

const IntroductionImprover = () => {
  const [introduction, setIntroduction] = useState('');
  
  const {
    content,
    isLoading,
    error,
    generateContent,
    reset
  } = useAI({
    streaming: true,
    onComplete: (improvedContent) => {
      console.log('Generation complete!');
    }
  });
  
  const handleImprove = async () => {
    reset();
    try {
      await generateContent('improve-introduction', {
        content: introduction,
        tone: 'academic',
        length: 'maintain'
      });
    } catch (err) {
      // Error handling is also done via the error state and onError callback
      console.error('Error improving introduction:', err);
    }
  };
  
  const handleUseImproved = () => {
    setIntroduction(content);
    reset();
  };
  
  return (
    <div className="introduction-improver">
      <h2>Introduction</h2>
      
      <textarea
        value={introduction}
        onChange={(e) => setIntroduction(e.target.value)}
        placeholder="Write your introduction here..."
        rows={5}
        className="w-full p-2 border rounded"
      />
      
      <div className="mt-2 flex space-x-2">
        <button
          onClick={handleImprove}
          disabled={isLoading || !introduction}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          {isLoading ? 'Improving...' : 'Improve Introduction'}
        </button>
        
        {content && (
          <button
            onClick={handleUseImproved}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Use Improved Version
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-red-600">
          Error: {error}
        </div>
      )}
      
      {content && (
        <div className="mt-4">
          <h3 className="font-medium">Improved Introduction:</h3>
          <div className="p-3 border rounded bg-gray-50">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroductionImprover;
```

### Using with Raw Prompt Generation

```tsx
import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';

const CustomPromptGenerator = () => {
  const [prompt, setPrompt] = useState('');
  
  const {
    content,
    isLoading,
    error,
    progress,
    generateFromPrompt
  } = useAI({
    streaming: true
  });
  
  const handleGenerate = async () => {
    try {
      await generateFromPrompt(prompt);
    } catch (err) {
      console.error('Error with custom prompt:', err);
    }
  };
  
  return (
    <div className="custom-prompt-generator">
      <h2>Custom AI Prompt</h2>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        rows={3}
        className="w-full p-2 border rounded"
      />
      
      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt}
        className="mt-2 px-3 py-1 bg-purple-600 text-white rounded"
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      
      {isLoading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-red-600">
          Error: {error}
        </div>
      )}
      
      {content && (
        <div className="mt-4">
          <h3 className="font-medium">Generated Content:</h3>
          <div className="p-3 border rounded bg-gray-50">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPromptGenerator;
```

### Using with a Custom Client

```tsx
import React, { useEffect, useState } from 'react';
import { useAI } from '../hooks/useAI';
import { AIClient } from '../services/aiClient';

const CustomClientExample = () => {
  const [customClient, setCustomClient] = useState(null);
  
  // Create a custom client with specific settings
  useEffect(() => {
    setCustomClient(new AIClient({
      model: 'gpt-4-turbo-preview',
      maxTokens: 500,
      temperature: 0.9 // More creative responses
    }));
  }, []);
  
  const {
    content,
    isLoading,
    generateFromPrompt
  } = useAI({
    client: customClient, // Use the custom client
    streaming: true
  });
  
  const handleGenerateStory = async () => {
    if (!customClient) return;
    
    try {
      await generateFromPrompt(
        'Write a short, creative story about a robot discovering emotions.'
      );
    } catch (err) {
      console.error('Error generating story:', err);
    }
  };
  
  return (
    <div>
      <button
        onClick={handleGenerateStory}
        disabled={isLoading || !customClient}
      >
        Generate Creative Story
      </button>
      
      {content && (
        <div className="story-container">
          <h3>Generated Story:</h3>
          <div className="story-content">{content}</div>
        </div>
      )}
    </div>
  );
};

export default CustomClientExample;
```