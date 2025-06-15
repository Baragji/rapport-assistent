# AI Client API

## Overview

The AI Client provides a robust interface to the OpenAI API with error handling, retry mechanisms, and streaming support. It is the core service for all AI-assisted content generation in Rapport Assistent.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [API Reference](#api-reference)
4. [Error Handling](#error-handling)
5. [Configuration](#configuration)
6. [Streaming API](#streaming-api)
7. [Lazy Loading](#lazy-loading)
8. [Examples](#examples)

## Installation

The AI Client is included in the Rapport Assistent codebase and does not need separate installation. To use it in your components, import it from the services directory:

```typescript
import { AIClient } from '../services/aiClient';
```

## Basic Usage

```typescript
import { AIClient } from '../services/aiClient';

const generateImprovedContent = async (originalContent) => {
  const client = new AIClient();
  
  try {
    const improvedContent = await client.generateContent(
      `Improve this content: ${originalContent}`
    );
    return improvedContent;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};
```

## API Reference

### `AIClient` Class

The main class for interacting with the OpenAI API.

#### Constructor

```typescript
constructor(options?: AIClientOptions)
```

Options:
- `apiKey`: OpenAI API key (defaults to environment variable)
- `model`: Model to use (defaults to environment variable or 'gpt-4-turbo-preview')
- `maxTokens`: Maximum tokens to generate (defaults to environment variable or 1000)
- `temperature`: Temperature for generation (defaults to 0.7)
- `httpClient`: Custom HTTP client for API requests (for testing)

#### Methods

##### `generateContent`

```typescript
async generateContent(prompt: string): Promise<string>
```

Generates content based on the provided prompt.

Parameters:
- `prompt`: The prompt text to send to the AI model

Returns:
- A Promise that resolves to the generated content as a string

Throws:
- `AIError` with appropriate error type if generation fails

##### `generateContentStream`

```typescript
async generateContentStream(
  prompt: string,
  onChunk: (chunk: string, progress: number) => void
): Promise<string>
```

Generates content with streaming, calling the provided callback for each chunk.

Parameters:
- `prompt`: The prompt text to send to the AI model
- `onChunk`: Callback function called for each chunk of the response
  - `chunk`: The text chunk
  - `progress`: Progress percentage (0-100)

Returns:
- A Promise that resolves to the complete generated content as a string

Throws:
- `AIError` with appropriate error type if generation fails

### `AIError` Class

Custom error class for AI-related errors.

#### Constructor

```typescript
constructor(
  message: string,
  type: AIErrorType,
  retryable: boolean,
  originalError?: unknown
)
```

Parameters:
- `message`: Error message
- `type`: Error type from AIErrorType enum
- `retryable`: Whether the error can be retried
- `originalError`: Original error object (optional)

#### Properties

- `message`: Error message
- `type`: Error type from AIErrorType enum
- `retryable`: Whether the error can be retried
- `originalError`: Original error object (if available)

### `AIErrorType` Enum

Enum of possible AI error types:

- `RATE_LIMIT`: API rate limit exceeded
- `INVALID_REQUEST`: Invalid request parameters
- `API_ERROR`: General API error
- `NETWORK_ERROR`: Network connectivity issues
- `TIMEOUT`: Request timeout
- `UNKNOWN`: Unknown error

## Error Handling

The AI Client includes comprehensive error handling with the `AIError` class:

```typescript
import { AIClient, AIError, AIErrorType } from '../services/aiClient';

const client = new AIClient();

try {
  const result = await client.generateContent(prompt);
  // Handle successful result
} catch (error) {
  if (error instanceof AIError) {
    switch (error.type) {
      case AIErrorType.RATE_LIMIT:
        console.error('Rate limit exceeded. Try again later.');
        break;
      case AIErrorType.INVALID_REQUEST:
        console.error('Invalid request:', error.message);
        break;
      case AIErrorType.NETWORK_ERROR:
        console.error('Network error. Check your connection.');
        break;
      case AIErrorType.TIMEOUT:
        console.error('Request timed out. Try again.');
        break;
      default:
        console.error('AI error:', error.message);
    }
    
    if (error.retryable) {
      console.log('This error can be retried.');
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Configuration

The AI Client can be configured using environment variables:

```
VITE_OPENAI_API_KEY=your-api-key-here
VITE_OPENAI_MODEL=gpt-4-turbo-preview
VITE_OPENAI_MAX_TOKENS=1000
```

Or by passing options to the constructor:

```typescript
const client = new AIClient({
  apiKey: 'your-api-key-here',
  model: 'gpt-4-turbo-preview',
  maxTokens: 1000,
  temperature: 0.7
});
```

## Streaming API

The streaming API allows you to receive content in chunks as it's generated:

```typescript
import { AIClient } from '../services/aiClient';

const client = new AIClient();
let generatedContent = '';

try {
  const result = await client.generateContentStream(
    'Generate a short story about a robot.',
    (chunk, progress) => {
      // Append the chunk to the accumulated content
      generatedContent += chunk;
      
      // Update UI with progress
      updateProgressBar(progress);
      
      // Display the content as it arrives
      updateContentDisplay(generatedContent);
    }
  );
  
  console.log('Final content:', result);
} catch (error) {
  console.error('Error generating content:', error);
}
```

## Lazy Loading

For better performance, you can use the lazy-loaded version of the AI Client:

```typescript
import { getAIClient } from '../services/aiClientLazy';

const generateContent = async (prompt) => {
  // The AI Client is loaded only when needed
  const client = await getAIClient();
  return client.generateContent(prompt);
};
```

## Examples

### Basic Content Generation

```typescript
import { AIClient } from '../services/aiClient';

const client = new AIClient();

const improveText = async (text) => {
  const prompt = `Improve the following text to make it more professional and engaging:
  
${text}

Please maintain the original meaning and key points while enhancing the language.`;

  return await client.generateContent(prompt);
};

// Usage
const originalText = "This is a report about climate change. It's important.";
const improvedText = await improveText(originalText);
console.log(improvedText);
```

### Streaming with Progress Updates

```typescript
import { AIClient } from '../services/aiClient';
import React, { useState } from 'react';

const StreamingExample = () => {
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateContent = async () => {
    const client = new AIClient();
    setContent('');
    setProgress(0);
    setIsGenerating(true);
    
    try {
      await client.generateContentStream(
        'Write a short essay about the importance of clean energy.',
        (chunk, chunkProgress) => {
          setContent(prev => prev + chunk);
          setProgress(chunkProgress);
        }
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div>
      <button 
        onClick={generateContent}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Essay'}
      </button>
      
      {isGenerating && (
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
          <span>{progress}%</span>
        </div>
      )}
      
      <div className="content-box">
        {content || 'Generated content will appear here...'}
      </div>
    </div>
  );
};
```

### Error Handling with Retry

```typescript
import { AIClient, AIError } from '../services/aiClient';

const generateWithRetry = async (prompt, maxRetries = 3) => {
  const client = new AIClient();
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      return await client.generateContent(prompt);
    } catch (error) {
      if (error instanceof AIError && error.retryable && retries < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Retry ${retries + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        // Non-retryable error or max retries reached
        throw error;
      }
    }
  }
};

// Usage
try {
  const result = await generateWithRetry('Generate a complex analysis...');
  console.log('Success:', result);
} catch (error) {
  console.error('Failed after retries:', error);
}
```