import { useState } from 'react';
import Form from '@rjsf/core';
import type { JSONSchema7 } from 'json-schema';
import validator from '@rjsf/validator-ajv8';
import { convertMarkdownToDocx, generateMarkdownReport } from '../utils/documentUtils';

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
  },
};

// Define UI schema for better form layout
const uiSchema = {
  content: {
    'ui:widget': 'textarea',
    'ui:options': {
      rows: 10,
    },
  },
};

// Define the form data interface
interface FormData {
  title: string;
  content: string;
  category: string;
}

// Define props for the ReportForm component
interface ReportFormProps {
  onSubmit?: (data: FormData) => void;
}

const ReportForm = ({ onSubmit }: ReportFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: 'Technical',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: any) => {
    if (!e.formData) return;
    
    const formData = e.formData as FormData;
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Update local state
      setFormData(formData);
      
      // Generate markdown report
      const markdown = generateMarkdownReport(
        formData.title,
        formData.content,
        formData.category
      );
      
      // Convert to DOCX and download
      await convertMarkdownToDocx(markdown, formData.title);
      
      // Show success message
      setMessage({
        text: 'Report generated and downloaded successfully!',
        type: 'success',
      });
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(formData);
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
      
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={handleSubmit}
        disabled={isSubmitting}
        validator={validator}
      >
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ReportForm;