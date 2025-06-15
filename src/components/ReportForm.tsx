import { useState } from 'react';
import Form from '@rjsf/core';
import type { JSONSchema7 } from 'json-schema';
import validator from '@rjsf/validator-ajv8';
import { convertMarkdownToDocx, generateMarkdownReport } from '../utils/documentUtils';
import type { Reference } from '../utils/documentUtils';
import References from './References';
import AIAssistButton from './AIAssistButton';
import useFormValidation from '../hooks/useFormValidation';

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

  // Use our custom validation hook
  const {
    errors,
    touched,
    isFormValid,
    handleBlur,
    handleChange,
    validateForm,
  } = useFormValidation(formData, {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
  });

  const handleSubmit = async (e: { formData?: ReportFormData }) => {
    if (!e.formData) return;
    
    // Validate the form before submission
    if (!validateForm()) {
      setMessage({
        text: 'Please fix the validation errors before submitting.',
        type: 'error',
      });
      return;
    }
    
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

  // Handle field change with validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    handleChange(field, value);
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: string) => {
    handleBlur(field);
  };

  // Get validation state for a field
  const getValidationState = (field: string) => {
    if (!touched[field as keyof typeof touched]) return null;
    
    const error = errors[field as keyof typeof errors];
    // Check if it's a simple ValidationResult or a nested object for references
    if ('isValid' in error) {
      return error.isValid ? 'valid' : 'invalid';
    }
    
    // For references or other complex fields, default to valid
    return 'valid';
  };

  // Get validation class for a field
  const getValidationClass = (field: string) => {
    const state = getValidationState(field);
    if (state === 'valid') return 'border-green-500 focus:ring-green-500';
    if (state === 'invalid') return 'border-red-500 focus:ring-red-500';
    return 'border-gray-300 focus:ring-blue-500';
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
      
      {/* Custom field templates with AI assist buttons and validation */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
        <div className="relative">
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            onBlur={() => handleFieldBlur('title')}
            className={`mt-1 block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 ${getValidationClass('title')}`}
            aria-invalid={getValidationState('title') === 'invalid'}
            aria-describedby="title-error"
            data-testid="title-input"
          />
          {getValidationState('title') === 'valid' && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {touched.title && !errors.title.isValid && (
          <p className="mt-2 text-sm text-red-600" id="title-error" data-testid="title-error">
            {errors.title.message}
          </p>
        )}
      </div>
      
      <Form<ReportFormData>
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={handleSubmit}
        disabled={isSubmitting || isGeneratingTitle || isGeneratingContent}
        validator={validator}
      >
        {/* Content field with AI assist button and validation */}
        <div className="mb-6 mt-4">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
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
          <div className="relative">
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              onBlur={() => handleFieldBlur('content')}
              rows={10}
              className={`mt-1 block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 ${getValidationClass('content')}`}
              aria-invalid={getValidationState('content') === 'invalid'}
              aria-describedby="content-error"
              data-testid="content-input"
            />
            {getValidationState('content') === 'valid' && (
              <div className="absolute top-3 right-3 pointer-events-none">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {touched.content && !errors.content.isValid && (
            <p className="mt-2 text-sm text-red-600" id="content-error" data-testid="content-error">
              {errors.content.message}
            </p>
          )}
        </div>
        
        <div className="mt-6 mb-6 border-t border-gray-200 pt-6">
          <References 
            references={formData.references} 
            onChange={handleReferencesChange}
            disabled={isSubmitting || isGeneratingTitle || isGeneratingContent}
            errors={errors.references}
            touched={touched.references}
            onBlur={(index, field) => handleBlur('references', index, field)}
          />
        </div>
        
        {/* Form completion progress indicator */}
        <div className="mt-4 mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Form completion</span>
            <span className={isFormValid ? 'text-green-600' : 'text-gray-600'}>
              {isFormValid ? 'Ready to submit' : 'Required fields missing'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${isFormValid ? 'bg-green-600' : 'bg-blue-600'}`}
              style={{ width: `${isFormValid ? '100' : (touched.title && errors.title.isValid ? 50 : 0) + (touched.content && errors.content.isValid ? 50 : 0)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              isFormValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-400 text-white cursor-not-allowed'
            } transition-colors ${
              isSubmitting || isGeneratingTitle || isGeneratingContent ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={!isFormValid || isSubmitting || isGeneratingTitle || isGeneratingContent}
          >
            {isSubmitting ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ReportForm;