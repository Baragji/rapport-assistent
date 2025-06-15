import { useState } from 'react';
import Form from '@rjsf/core';
import type { JSONSchema7 } from 'json-schema';
import validator from '@rjsf/validator-ajv8';
import { convertMarkdownToDocx, generateMarkdownReport } from '../utils/documentUtils';
import type { Reference } from '../utils/documentUtils';
import References from './References';

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
  content: {
    'ui:widget': 'textarea',
    'ui:options': {
      rows: 10,
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
      
      <Form<ReportFormData>
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={handleSubmit}
        disabled={isSubmitting}
        validator={validator}
      >
        <div className="mt-6 mb-6 border-t border-gray-200 pt-6">
          <References 
            references={formData.references} 
            onChange={handleReferencesChange}
            disabled={isSubmitting}
          />
        </div>
        
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