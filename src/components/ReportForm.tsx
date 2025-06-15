import { useState } from 'react';
import Form from '@rjsf/core';
import type { JSONSchema7 } from 'json-schema';
import validator from '@rjsf/validator-ajv8';
import { convertMarkdownToDocx, generateMarkdownReport } from '../utils/documentUtils';
import type { Reference } from '../utils/documentUtils';
import References from './References';
import AIAssistButton from './AIAssistButton';

// Define the JSON schema for the form
const schema: JSONSchema7 = {
  type: 'object',
  required: ['title', 'content'],
  properties: {
    title: {
      type: 'string',
      title: 'Report Title',
    },
    content: {
      type: 'string',
      title: 'Report Content',
      description: 'You can use Markdown formatting',
    },
    category: {
      type: 'string',
      title: 'Category',
      enum: ['Technical', 'Business', 'Research', 'Other'],
      default: 'Technical',
    },
    references: {
      type: 'array',
      title: 'References',
      description: 'Add references to your report',
      items: {
        type: 'object',
        required: ['title', 'author'],
        properties: {
          title: {
            type: 'string',
            title: 'Title',
            description: 'Title of the reference'
          },
          author: {
            type: 'string',
            title: 'Author',
            description: 'Author of the reference'
          },
          year: {
            type: 'string',
            title: 'Year',
            description: 'Publication year'
          },
          url: {
            type: 'string',
            title: 'URL',
            description: 'Link to the reference (optional)',
            format: 'uri'
          },
          publisher: {
            type: 'string',
            title: 'Publisher',
            description: 'Publisher information (optional)'
          },
          type: {
            type: 'string',
            title: 'Type',
            description: 'Type of reference',
            enum: ['Book', 'Article', 'Website', 'Journal', 'Conference', 'Other'],
            default: 'Article'
          }
        }
      },
      default: []
    },
  },
};

// Define UI schema for better form layout
const uiSchema = {
  title: {
    'ui:options': {
      label: false, // We'll create a custom label with the AI assist button
    },
  },
  content: {
    'ui:widget': 'textarea',
    'ui:options': {
      rows: 10,
      label: false, // We'll create a custom label with the AI assist button
    },
  },
  // We'll use a custom component for references, so we hide it in the form
  references: {
    'ui:widget': 'hidden',
  },
};

// Define the form data interface
interface ReportFormData {
  title: string;
  content: string;
  category: string;
  references: Reference[];
}

// Define props for the ReportForm component
interface ReportFormProps {
  onSubmit?: (data: ReportFormData) => void;
}

const ReportForm = ({ onSubmit }: ReportFormProps) => {
  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    content: '',
    category: 'Technical',
    references: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const handleSubmit = async (e: { formData?: ReportFormData }) => {
    if (!e.formData) return;
    
    const submittedData = e.formData;
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Update local state
      setFormData(submittedData);
      
      // Generate markdown report
      const markdown = generateMarkdownReport(
        submittedData.title,
        submittedData.content,
        submittedData.category,
        submittedData.references
      );
      
      // Convert to DOCX and download
      await convertMarkdownToDocx(markdown, submittedData.title);
      
      // Show success message
      setMessage({
        text: 'Report generated and downloaded successfully!',
        type: 'success',
      });
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(submittedData);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage({
        text: 'Error generating report. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle references changes separately from the form
  const handleReferencesChange = (newReferences: Reference[]) => {
    setFormData({
      ...formData,
      references: newReferences
    });
  };
  
  // Handle AI-generated title
  const handleTitleGenerated = (generatedTitle: string) => {
    setFormData({
      ...formData,
      title: generatedTitle.trim()
    });
    setIsGeneratingTitle(false);
  };
  
  // Handle AI-generated content
  const handleContentGenerated = (generatedContent: string) => {
    setFormData({
      ...formData,
      content: generatedContent.trim()
    });
    setIsGeneratingContent(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Report</h2>
      
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      {/* Custom field templates with AI assist buttons */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="title-input" className="block text-sm font-medium text-gray-700">
            Report Title <span className="text-red-500">*</span>
          </label>
          <AIAssistButton
            templateId="introduction-academic"
            templateParams={{
              topic: formData.title ?? 'academic report',
              researchQuestion: 'What are the key aspects of this topic?'
            }}
            onContentGenerated={handleTitleGenerated}
            label="Generate Title"
            size="small"
            variant="outline"
            disabled={isSubmitting || isGeneratingTitle || isGeneratingContent}
            tooltip="Generate a title using AI"
            testId="generate-title-button"
            streaming={true}
            references={formData.references}
          />
        </div>
        <div id="title-input" className="sr-only" aria-hidden="true"></div>
      </div>
      
      <Form<ReportFormData>
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={handleSubmit}
        disabled={isSubmitting || isGeneratingTitle || isGeneratingContent}
        validator={validator}
      >
        {/* Content field with AI assist button */}
        <div className="mb-6 mt-4">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content-input" className="block text-sm font-medium text-gray-700">
              Report Content <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <AIAssistButton
                templateId="improve-clarity"
                templateParams={{
                  originalText: formData.content ?? ''
                }}
                onContentGenerated={handleContentGenerated}
                label="Improve"
                size="small"
                variant="outline"
                disabled={isSubmitting || isGeneratingTitle || isGeneratingContent || !formData.content}
                tooltip="Improve the clarity of your content"
                testId="improve-content-button"
                streaming={true}
                references={formData.references}
              />
              <AIAssistButton
                templateId="analysis-data"
                templateParams={{
                  topic: formData.title ?? 'the selected topic',
                  researchQuestion: 'What are the key findings?',
                  dataPoints: 'Generate comprehensive analysis'
                }}
                onContentGenerated={handleContentGenerated}
                label="Generate Content"
                size="small"
                variant="outline"
                disabled={isSubmitting || isGeneratingTitle || isGeneratingContent || !formData.title}
                tooltip="Generate content based on the title"
                testId="generate-content-button"
                streaming={true}
                references={formData.references}
              />
            </div>
          </div>
          <div id="content-input" className="sr-only" aria-hidden="true"></div>
        </div>
        
        <div className="mt-6 mb-6 border-t border-gray-200 pt-6">
          <References 
            references={formData.references} 
            onChange={handleReferencesChange}
            disabled={isSubmitting || isGeneratingTitle || isGeneratingContent}
          />
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              isSubmitting || isGeneratingTitle || isGeneratingContent ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting || isGeneratingTitle || isGeneratingContent}
          >
            {isSubmitting ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ReportForm;