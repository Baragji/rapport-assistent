# Rapport Assistent API Documentation

## Overview

This directory contains API documentation for the key services and components in Rapport Assistent. These APIs are intended for developers who want to extend or customize the application.

## Table of Contents

1. [AI Client API](./ai-client.md)
2. [Prompt Service API](./prompt-service.md)
3. [Analytics Service API](./analytics-service.md)
4. [Feedback Service API](./feedback-service.md)
5. [useAI Hook API](./use-ai-hook.md)
6. [Components API](./components.md)

## Getting Started

To use these APIs in your own components or extensions, import them as shown in the examples below:

```typescript
// Import services
import { AIClient } from '../services/aiClient';
import { promptService } from '../services/promptService';
import { trackEvent, trackAIUsage } from '../services/analyticsService';
import { submitFeedback } from '../services/feedbackService';

// Import hooks
import { useAI } from '../hooks/useAI';

// Import components
import AIAssistButton from '../components/AIAssistButton';
import AIFeedback from '../components/AIFeedback';
```

## API Design Principles

The APIs in Rapport Assistent follow these design principles:

1. **Consistency**: Similar patterns and naming conventions across all APIs
2. **Type Safety**: Comprehensive TypeScript types for all APIs
3. **Error Handling**: Clear error patterns and recovery mechanisms
4. **Documentation**: Detailed documentation with examples
5. **Testability**: All APIs are designed to be easily testable

## Common Patterns

### Error Handling

Most asynchronous APIs use a try/catch pattern:

```typescript
try {
  const result = await client.generateContent(prompt);
  // Handle success
} catch (error) {
  if (error instanceof AIError) {
    // Handle specific AI error
    console.error(`AI Error: ${error.message} (${error.type})`);
  } else {
    // Handle generic error
    console.error('Unknown error:', error);
  }
}
```

### Callback Patterns

Many components and hooks accept callback functions for key events:

```typescript
<AIAssistButton
  templateId="improve-introduction"
  templateParams={{ content: currentText }}
  onContentGenerated={(content) => {
    // Handle generated content
  }}
  onError={(error) => {
    // Handle error
  }}
/>
```

### Configuration Objects

Most APIs accept configuration objects rather than multiple parameters:

```typescript
const { generateContent } = useAI({
  streaming: true,
  onStream: (chunk, progress) => {
    // Handle streaming updates
  },
  onComplete: (content) => {
    // Handle completion
  }
});
```

## API Versioning

The current API version is 1.0.0. APIs are considered stable and will follow semantic versioning for future changes.

## Contributing to the API Documentation

If you find issues or want to improve the API documentation, please follow these guidelines:

1. Use clear, concise language
2. Include practical examples
3. Document all parameters and return values
4. Highlight potential errors and edge cases
5. Keep the formatting consistent

## License

The API documentation is licensed under the MIT License, the same as the rest of the Rapport Assistent project.