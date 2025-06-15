# Prompt Service API

## Overview

The Prompt Service manages AI prompt templates, allowing for consistent and customizable AI interactions. It handles template loading, parameter filling, and integration with the AI client.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [API Reference](#api-reference)
4. [Template Structure](#template-structure)
5. [Parameter Filling](#parameter-filling)
6. [Template Categories](#template-categories)
7. [Examples](#examples)

## Installation

The Prompt Service is included in the Rapport Assistent codebase. To use it in your components, import it from the services directory:

```typescript
import { promptService } from '../services/promptService';
```

## Basic Usage

```typescript
import { promptService } from '../services/promptService';
import { AIClient } from '../services/aiClient';

const generateImprovedIntroduction = async (originalIntroduction) => {
  // Fill the template with parameters
  const filledTemplate = promptService.fillTemplate('improve-introduction', {
    content: originalIntroduction,
    tone: 'academic'
  });
  
  if (!filledTemplate) {
    throw new Error('Template not found');
  }
  
  // Use the filled template with the AI client
  const client = new AIClient();
  return await client.generateContent(filledTemplate);
};
```

## API Reference

### `promptService` Object

The main service object for working with prompt templates.

#### Methods

##### `fillTemplate`

```typescript
fillTemplate(templateId: string, params: TemplateParams): string | null
```

Fills a template with the provided parameters.

Parameters:
- `templateId`: The ID of the template to fill
- `params`: Object containing parameter values to insert into the template

Returns:
- The filled template as a string, or null if the template is not found

##### `getTemplate`

```typescript
getTemplate(templateId: string): Template | null
```

Gets a template by its ID.

Parameters:
- `templateId`: The ID of the template to retrieve

Returns:
- The template object, or null if not found

##### `getAllTemplates`

```typescript
getAllTemplates(): Template[]
```

Gets all available templates.

Returns:
- Array of all template objects

##### `getTemplatesByCategory`

```typescript
getTemplatesByCategory(category: string): Template[]
```

Gets templates filtered by category.

Parameters:
- `category`: The category to filter by

Returns:
- Array of template objects in the specified category

### Types

#### `Template`

```typescript
interface Template {
  /**
   * Unique identifier for the template
   */
  id: string;
  
  /**
   * Human-readable description of the template
   */
  description: string;
  
  /**
   * The template text with parameter placeholders
   */
  template: string;
  
  /**
   * Array of parameter names required by the template
   */
  parameters: string[];
  
  /**
   * Optional category for organizing templates
   */
  category?: string;
  
  /**
   * Optional example inputs and outputs
   */
  examples?: Array<{
    [key: string]: string;
    output: string;
  }>;
}
```

#### `TemplateParams`

```typescript
type TemplateParams = Record<string, string | number | boolean>;
```

## Template Structure

Templates are stored as JSON files in the `src/templates` directory with the following structure:

```json
{
  "id": "improve-introduction",
  "description": "Improves the introduction section of a report",
  "category": "content-improvement",
  "template": "Improve the following introduction for an academic report:\n\n{{content}}\n\nTone: {{tone}}",
  "parameters": ["content", "tone"],
  "examples": [
    {
      "content": "This is a report about climate change.",
      "tone": "academic",
      "output": "This comprehensive report examines the multifaceted impacts of climate change on global ecosystems and human societies."
    }
  ]
}
```

### Required Fields

- `id`: Unique identifier for the template
- `description`: Human-readable description
- `template`: The template text with parameter placeholders
- `parameters`: Array of parameter names required by the template

### Optional Fields

- `category`: Category for organizing templates
- `examples`: Example inputs and outputs for the template

## Parameter Filling

Parameters in templates are denoted by double curly braces: `{{parameterName}}`.

The `fillTemplate` method replaces these placeholders with the values provided in the `params` object:

```typescript
const filledTemplate = promptService.fillTemplate('improve-introduction', {
  content: 'This is my introduction paragraph.',
  tone: 'academic'
});

// Result:
// "Improve the following introduction for an academic report:
//
// This is my introduction paragraph.
//
// Tone: academic"
```

### Parameter Validation

The service validates that all required parameters are provided:

```typescript
// Missing 'tone' parameter
const filledTemplate = promptService.fillTemplate('improve-introduction', {
  content: 'This is my introduction paragraph.'
});

// Result: null (template not filled due to missing parameter)
```

## Template Categories

Templates can be organized into categories for better management:

```typescript
// Get all templates in the 'content-improvement' category
const contentTemplates = promptService.getTemplatesByCategory('content-improvement');

// Common categories
const categories = [
  'content-improvement',
  'structure-suggestions',
  'reference-integration',
  'language-enhancement',
  'academic-writing'
];
```

## Examples

### Creating a Custom Template Programmatically

```typescript
import { promptService } from '../services/promptService';
import { TemplateLoader } from '../services/templateLoader';

// Define a new template
const customTemplate = {
  id: 'custom-summary',
  description: 'Generates a summary of the provided content',
  category: 'content-generation',
  template: 'Generate a {{length}} summary of the following content:\n\n{{content}}',
  parameters: ['content', 'length'],
  examples: [
    {
      content: "Lorem ipsum dolor sit amet...",
      length: "brief",
      output: "A short summary of the lorem ipsum text."
    }
  ]
};

// Add the template to the loader
TemplateLoader.addTemplate(customTemplate);

// Now you can use it with the prompt service
const filledTemplate = promptService.fillTemplate('custom-summary', {
  content: 'Your long content here...',
  length: 'concise'
});
```

### Using Templates with References

```typescript
import { promptService } from '../services/promptService';
import { AIClient } from '../services/aiClient';

const generateContentWithReferences = async (content, references) => {
  // Format references as a string
  const referencesText = references
    .map(ref => `- ${ref.title} by ${ref.author}${ref.year ? ` (${ref.year})` : ''}`)
    .join('\n');
  
  // Fill the template with content and references
  const filledTemplate = promptService.fillTemplate('improve-with-references', {
    content,
    references: referencesText
  });
  
  if (!filledTemplate) {
    throw new Error('Template not found');
  }
  
  // Generate content using the AI client
  const client = new AIClient();
  return await client.generateContent(filledTemplate);
};

// Usage
const content = "Climate change is affecting our planet.";
const references = [
  { title: "Climate Change Impact Report", author: "Smith, J.", year: "2022" },
  { title: "Global Warming Trends", author: "Johnson, A.", year: "2021" }
];

const improvedContent = await generateContentWithReferences(content, references);
```

### Creating a Template Selection UI

```tsx
import React, { useState, useEffect } from 'react';
import { promptService } from '../services/promptService';
import { useAI } from '../hooks/useAI';

const TemplateSelector = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [params, setParams] = useState({});
  
  const {
    content,
    isLoading,
    generateContent
  } = useAI();
  
  // Load templates on component mount
  useEffect(() => {
    const allTemplates = promptService.getAllTemplates();
    setTemplates(allTemplates);
  }, []);
  
  // Update params when template changes
  useEffect(() => {
    if (selectedTemplate) {
      // Initialize params with empty values
      const initialParams = {};
      selectedTemplate.parameters.forEach(param => {
        initialParams[param] = '';
      });
      setParams(initialParams);
    }
  }, [selectedTemplate]);
  
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = promptService.getTemplate(templateId);
    setSelectedTemplate(template);
  };
  
  const handleParamChange = (param, value) => {
    setParams(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await generateContent(selectedTemplate.id, params);
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };
  
  return (
    <div className="template-selector">
      <h2>Template Selector</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Select Template:</label>
        <select
          onChange={handleTemplateChange}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select a template --</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.description}
            </option>
          ))}
        </select>
      </div>
      
      {selectedTemplate && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Parameters:</h3>
          
          {selectedTemplate.parameters.map(param => (
            <div key={param} className="mb-2">
              <label className="block mb-1">{param}:</label>
              <input
                type="text"
                value={params[param] || ''}
                onChange={(e) => handleParamChange(param, e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
          
          <button
            onClick={handleGenerate}
            disabled={isLoading || Object.values(params).some(v => !v)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      )}
      
      {content && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Generated Content:</h3>
          <div className="p-4 border rounded bg-gray-50">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
```