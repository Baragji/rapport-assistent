# Components API

## Overview

This document provides API documentation for the key React components in Rapport Assistent, focusing on the AI-related components added in Sprint 2.

## Table of Contents

1. [AIAssistButton](#aiassistbutton)
2. [AIFeedback](#aifeedback)
3. [References](#references)
4. [ReportForm](#reportform)
5. [PieChart](#piechart)

## AIAssistButton

The `AIAssistButton` component provides a user-friendly way to trigger AI-assisted content generation.

### Props

```typescript
export interface AIAssistButtonProps {
  /**
   * The template ID to use for generating content
   */
  templateId: string;
  
  /**
   * Parameters to pass to the template
   */
  templateParams: Record<string, string | number | boolean>;
  
  /**
   * Callback function when content is generated successfully
   */
  onContentGenerated: (content: string) => void;
  
  /**
   * Button label text
   */
  label?: string;
  
  /**
   * Icon to display next to the label
   */
  icon?: React.ReactNode;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Button size variant
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Button appearance variant
   */
  variant?: 'primary' | 'secondary' | 'outline';
  
  /**
   * Tooltip text
   */
  tooltip?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
  
  /**
   * Whether to use streaming responses
   */
  streaming?: boolean;
  
  /**
   * References to include in the context
   */
  references?: Array<{
    title: string;
    author: string;
    year?: string;
    url?: string;
    publisher?: string;
    type?: string;
  }>;
  
  /**
   * Whether to show feedback UI after content generation
   */
  showFeedback?: boolean;
}
```

### Basic Usage

```tsx
import React, { useState } from 'react';
import AIAssistButton from '../components/AIAssistButton';

const MyComponent = () => {
  const [content, setContent] = useState('');
  
  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your content here..."
      />
      
      <AIAssistButton
        templateId="improve-content"
        templateParams={{ content }}
        onContentGenerated={(improvedContent) => setContent(improvedContent)}
        label="Improve Content"
        variant="primary"
        size="medium"
        streaming={true}
        showFeedback={true}
      />
    </div>
  );
};
```

### With References

```tsx
import React, { useState } from 'react';
import AIAssistButton from '../components/AIAssistButton';

const MyComponent = () => {
  const [content, setContent] = useState('');
  
  const references = [
    {
      title: "Climate Change: A Comprehensive Review",
      author: "Smith, J.",
      year: "2022",
      publisher: "Science Journal"
    },
    {
      title: "Environmental Policy in the 21st Century",
      author: "Johnson, A.",
      year: "2021",
      url: "https://example.com/policy"
    }
  ];
  
  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your content here..."
      />
      
      <AIAssistButton
        templateId="improve-content-with-references"
        templateParams={{ content }}
        references={references}
        onContentGenerated={(improvedContent) => setContent(improvedContent)}
        label="Improve with References"
      />
    </div>
  );
};
```

## AIFeedback

The `AIFeedback` component allows users to provide feedback on AI-generated content.

### Props

```typescript
export interface AIFeedbackProps {
  /**
   * Unique identifier for the content being rated
   */
  contentId: string;
  
  /**
   * Template ID used to generate the content
   */
  templateId: string;
  
  /**
   * Additional metadata about the content
   */
  metadata?: Record<string, unknown>;
  
  /**
   * Callback function when feedback is submitted
   */
  onFeedbackSubmitted: (rating: number, comments: string) => void;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}
```

### Basic Usage

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

## References

The `References` component provides a user interface for managing references in a report.

### Props

```typescript
export interface ReferencesProps {
  /**
   * Array of reference objects
   */
  references: Reference[];
  
  /**
   * Callback function when references are updated
   */
  onChange: (references: Reference[]) => void;
  
  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

export interface Reference {
  /**
   * Reference title
   */
  title: string;
  
  /**
   * Reference author
   */
  author: string;
  
  /**
   * Publication year
   */
  year?: string;
  
  /**
   * URL to the reference
   */
  url?: string;
  
  /**
   * Publisher name
   */
  publisher?: string;
  
  /**
   * Reference type (e.g., book, article, website)
   */
  type?: string;
}
```

### Basic Usage

```tsx
import React, { useState } from 'react';
import References from '../components/References';
import type { Reference } from '../components/References';

const MyComponent = () => {
  const [references, setReferences] = useState<Reference[]>([
    {
      title: "Climate Change: A Comprehensive Review",
      author: "Smith, J.",
      year: "2022",
      publisher: "Science Journal"
    }
  ]);
  
  return (
    <div>
      <h3>References</h3>
      
      <References
        references={references}
        onChange={setReferences}
      />
    </div>
  );
};
```

## ReportForm

The `ReportForm` component is the main form for creating and editing reports.

### Props

```typescript
export interface ReportFormProps {
  /**
   * Initial form data
   */
  initialData?: ReportData;
  
  /**
   * Callback function when the form is submitted
   */
  onSubmit: (data: ReportData) => Promise<void>;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

export interface ReportData {
  /**
   * Report title
   */
  title: string;
  
  /**
   * Report author
   */
  author: string;
  
  /**
   * Report introduction
   */
  introduction: string;
  
  /**
   * Report main content
   */
  content: string;
  
  /**
   * Report conclusion
   */
  conclusion: string;
  
  /**
   * Report references
   */
  references: Reference[];
  
  /**
   * Report metadata
   */
  metadata?: Record<string, unknown>;
}
```

### Basic Usage

```tsx
import React from 'react';
import ReportForm from '../components/ReportForm';
import type { ReportData } from '../components/ReportForm';

const MyComponent = () => {
  const handleSubmit = async (data: ReportData) => {
    try {
      // Save the report data
      await saveReport(data);
      alert('Report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report');
    }
  };
  
  return (
    <div>
      <h2>Create Report</h2>
      
      <ReportForm
        initialData={{
          title: '',
          author: '',
          introduction: '',
          content: '',
          conclusion: '',
          references: []
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
```

## PieChart

The `PieChart` component visualizes report statistics as a pie chart.

### Props

```typescript
export interface PieChartProps {
  /**
   * Chart data
   */
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
      borderWidth?: number;
    }>;
  };
  
  /**
   * Chart title
   */
  title?: string;
  
  /**
   * Chart height in pixels
   */
  height?: number;
  
  /**
   * Whether to show statistics
   */
  showStats?: boolean;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}
```

### Basic Usage

```tsx
import React from 'react';
import PieChart from '../components/PieChart';

const MyComponent = () => {
  const chartData = {
    labels: ['Academic', 'Business', 'Technical', 'Other'],
    datasets: [
      {
        data: [12, 8, 5, 3],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <div>
      <h3>Report Categories</h3>
      
      <PieChart
        data={chartData}
        title="Report Categories"
        height={300}
        showStats={true}
      />
    </div>
  );
};
```