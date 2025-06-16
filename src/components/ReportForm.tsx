import { useState, useEffect } from 'react';
import Form from '@rjsf/core';
import type { JSONSchema7 } from 'json-schema';
import validator from '@rjsf/validator-ajv8';
import { convertMarkdownToDocx, generateMarkdownReport } from '../utils/documentUtils';
import type { Reference } from '../utils/documentUtils';
import References from './References';
import AIAssistButton from './AIAssistButton';
import useFormValidation, { type FieldValidationRules } from '../hooks/useFormValidation';

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

// Define custom validation rules
const validationRules: FieldValidationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    timing: 'delayed',
  },
  content: {
    required: true,
    minLength: 10,
    maxLength: 10000,
    timing: 'delayed',
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
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [characterCount, setCharacterCount] = useState({ title: 0, content: 0 });

  // Use our enhanced validation hook
  const {
    errors,
    touched,
    dirty,
    isFormValid,
    validationProgress,
    fieldFocus,
    handleFocus,
    handleBlur,
    handleChange,
    validateForm,
    validateField,
    calculateProgress,
  } = useFormValidation(formData, {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: false,
    validationDelay: 300,
    showSuccessMessages: true,
  }, validationRules);

  // Update character counts when form data changes
  useEffect(() => {
    setCharacterCount({
      title: formData.title.length,
      content: formData.content.length,
    });
  }, [formData.title, formData.content]);

  // Calculate progress width for the progress bar
  const getProgressWidth = () => {
    return `${validationProgress}%`;
  };

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
    const newTitle = generatedTitle.trim();
    setFormData({
      ...formData,
      title: newTitle
    });
    setIsGeneratingTitle(false);
    
    // Validate the field after AI generation
    const validationResult = validateField('title', newTitle);
    if (!validationResult.isValid) {
      setMessage({
        text: `Generated title needs attention: ${validationResult.message}`,
        type: 'warning',
      });
    }
  };
  
  // Handle AI-generated content
  const handleContentGenerated = (generatedContent: string) => {
    const newContent = generatedContent.trim();
    setFormData({
      ...formData,
      content: newContent
    });
    setIsGeneratingContent(false);
    
    // Validate the field after AI generation
    const validationResult = validateField('content', newContent);
    if (!validationResult.isValid) {
      setMessage({
        text: `Generated content needs attention: ${validationResult.message}`,
        type: 'warning',
      });
    }
  };

  // Handle field change with validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    handleChange(field, value);
    
    // Clear any messages when user starts typing
    if (message && dirty[field as keyof typeof dirty]) {
      setMessage(null);
    }
  };

  // Handle field blur with validation
  const handleFieldBlur = (field: string) => {
    handleBlur(field, undefined, undefined);
  };
  
  // Handle field focus
  const handleFieldFocus = (field: string) => {
    handleFocus(field);
  };

  // Get validation state for a field
  const getValidationState = (field: string) => {
    if (!touched[field as keyof typeof touched]) return null;
    
    const error = errors[field as keyof typeof errors];
    // Check if it's a simple ValidationResult or a nested object for references
    if ('isValid' in error) {
      // Check severity first, even if isValid is false
      if (error.severity === 'warning') return 'warning';
      if (!error.isValid) return 'invalid';
      return 'valid';
    }
    
    // For references or other complex fields, default to valid
    return 'valid';
  };

  // Get validation class for a field
  const getValidationClass = (field: string) => {
    const state = getValidationState(field);
    if (state === 'valid') return 'border-green-500 focus:ring-green-500';
    if (state === 'warning') return 'border-yellow-500 focus:ring-yellow-500';
    if (state === 'invalid') return 'border-red-500 focus:ring-red-500';
    
    // Add focus highlight when field is focused
    if (fieldFocus === field) return 'border-blue-500 focus:ring-blue-500 ring-2 ring-blue-200';
    
    return 'border-gray-300 focus:ring-blue-500';
  };
  
  // Get validation icon for a field
  const getValidationIcon = (field: string) => {
    const state = getValidationState(field);
    
    if (state === 'valid') {
      return (
        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (state === 'warning') {
      return (
        <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (state === 'invalid') {
      return (
        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return null;
  };
  
  // Get validation message color class
  const getValidationMessageClass = (field: string) => {
    const state = getValidationState(field);
    if (state === 'valid') return 'text-green-600';
    if (state === 'warning') return 'text-yellow-600';
    if (state === 'invalid') return 'text-red-600';
    return '';
  };

  return (
    <div className="card-responsive">
      <h2 className="text-title-responsive mb-4 text-gray-800">Create New Report</h2>
      
      {message && (
        <div
          className={`mb-4 p-3 rounded flex items-start gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 
            message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}
        >
          {message.type === 'success' && (
            <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {message.type === 'warning' && (
            <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {message.type === 'error' && (
            <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}
      
      {/* Custom field templates with AI assist buttons and validation */}
      <div className="form-group-responsive">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-2 gap-2">
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
            onFocus={() => handleFieldFocus('title')}
            className={`mt-1 block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 min-h-[44px] px-3 py-2 ${getValidationClass('title')}`}
            aria-invalid={getValidationState('title') === 'invalid'}
            aria-describedby="title-error"
            data-testid="title-input"
            placeholder="Enter a descriptive title for your report"
          />
          {getValidationState('title') && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {getValidationIcon('title')}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-1">
          {touched.title && errors.title.message && (
            <p className={`text-sm ${getValidationMessageClass('title')}`} id="title-error" data-testid="title-error">
              {errors.title.message}
            </p>
          )}
          <p className="text-xs text-gray-500 ml-auto">
            {characterCount.title}/{validationRules.title.maxLength} characters
          </p>
        </div>
        
        {/* Show suggestions if available */}
        {touched.title && errors.title.suggestions && errors.title.suggestions.length > 0 && (
          <div className="mt-1">
            <p className="text-xs text-gray-700">Suggestions:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {errors.title.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded px-2 py-1"
                  onClick={() => handleFieldChange('title', suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
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
        <div className="form-group-responsive mt-4">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-2 gap-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Report Content <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
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
              onFocus={() => handleFieldFocus('content')}
              rows={8}
              className={`mt-1 block w-full rounded-md shadow-sm focus:outline-none focus:ring-2 px-3 py-2 ${getValidationClass('content')}`}
              aria-invalid={getValidationState('content') === 'invalid'}
              aria-describedby="content-error"
              data-testid="content-input"
              placeholder="Enter your report content here. You can use Markdown formatting."
            />
            {getValidationState('content') && (
              <div className="absolute top-3 right-3 pointer-events-none">
                {getValidationIcon('content')}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-1">
            {touched.content && errors.content.message && (
              <p className={`text-sm ${getValidationMessageClass('content')}`} id="content-error" data-testid="content-error">
                {errors.content.message}
              </p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {characterCount.content}/{validationRules.content.maxLength} characters
            </p>
          </div>
        </div>
        
        <div className="spacing-responsive border-t border-gray-200 pt-4 xs:pt-6">
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
          <div className="flex flex-col xs:flex-row justify-between text-sm text-gray-600 mb-1 gap-1">
            <span>Form completion</span>
            <span className={isFormValid ? 'text-green-600' : 'text-gray-600'}>
              {isFormValid ? 'Ready to submit' : `${validationProgress}% complete`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                isFormValid ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: getProgressWidth() }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center xs:justify-end">
          <button
            type="submit"
            className={`btn-touch rounded w-full xs:w-auto ${
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