import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportForm from '../ReportForm';

// Mock the AIAssistButton component
vi.mock('../AIAssistButton', () => ({
  default: ({ 
    templateId, 
    onContentGenerated, 
    label, 
    disabled, 
    testId = 'ai-assist-button',
  }: {
    templateId: string;
    templateParams?: Record<string, unknown>;
    onContentGenerated: (content: string) => void;
    label: string;
    disabled?: boolean;
    testId?: string;
    streaming?: boolean;
    references?: Array<Record<string, unknown>>;
  }) => (
    <button
      data-testid={testId}
      onClick={() => onContentGenerated(`Generated content for ${templateId}`)}
      disabled={disabled}
    >
      {label}
    </button>
  ),
}));

// Mock the References component
vi.mock('../References', () => ({
  default: ({ references, onChange, disabled, errors, touched, onBlur }: {
    references: Record<string, unknown>[];
    onChange: (refs: Record<string, unknown>[]) => void;
    disabled?: boolean;
    errors?: Record<number, Record<string, { isValid: boolean; message: string }>>;
    touched?: Record<number, Record<string, boolean>>;
    onBlur?: (index: number, field: string) => void;
  }) => (
    <div data-testid="mock-references">
      <div data-testid="references-data" style={{ display: 'none' }}>
        {JSON.stringify(references)}
      </div>
      <div data-testid="references-disabled" style={{ display: 'none' }}>
        {disabled ? 'true' : 'false'}
      </div>
      <div data-testid="references-errors" style={{ display: 'none' }}>
        {JSON.stringify(errors)}
      </div>
      <div data-testid="references-touched" style={{ display: 'none' }}>
        {JSON.stringify(touched)}
      </div>
      <button
        data-testid="mock-add-reference"
        onClick={() => onChange([...references, { title: 'New Ref', author: 'Test Author', type: 'Article' }])}
        disabled={disabled}
      >
        Add Reference
      </button>
      <button
        data-testid="mock-blur-reference"
        onClick={() => onBlur && onBlur(0, 'title')}
      >
        Trigger Blur
      </button>
    </div>
  ),
}));

// Mock the document utils
vi.mock('../../utils/documentUtils', () => ({
  generateMarkdownReport: vi.fn((title: string, content: string, category: string, references = []) => {
    let markdown = `# ${title}\n\n**Category:** ${category}\n\n${content}`;
    if (references.length > 0) {
      markdown += '\n\n## References\n';
      references.forEach((ref: { author: string; title: string }, index: number) => {
        markdown += `${index + 1}. ${ref.author}. *${ref.title}*\n`;
      });
    }
    return markdown;
  }),
  convertMarkdownToDocx: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })),
  formatReference: vi.fn((ref: { author: string; title: string }) => `${ref.author}. *${ref.title}*`),
}));

// Mock @rjsf/core Form component with a simpler approach
vi.mock('@rjsf/core', () => ({
  default: ({ schema, formData, onSubmit, disabled, children }: {
    schema: Record<string, unknown>;
    formData: Record<string, unknown>;
    onSubmit: (data: { formData?: Record<string, unknown> }) => void;
    disabled: boolean;
    children: React.ReactNode;
  }) => (
    <div data-testid="rjsf-form">
      <div data-testid="form-schema" style={{ display: 'none' }}>
        {JSON.stringify(schema)}
      </div>
      <div data-testid="form-data" style={{ display: 'none' }}>
        {JSON.stringify(formData)}
      </div>
      <div data-testid="form-disabled" style={{ display: 'none' }}>
        {disabled ? 'true' : 'false'}
      </div>
      <button
        data-testid="mock-submit-button"
        onClick={() => onSubmit({ formData })}
        disabled={disabled}
      >
        Mock Submit
      </button>
      {children}
    </div>
  ),
}));

// Mock validator
vi.mock('@rjsf/validator-ajv8', () => ({
  default: {},
}));

// Mock the useFormValidation hook
vi.mock('../../hooks/useFormValidation', () => ({
  default: vi.fn().mockReturnValue({
    errors: {
      title: { isValid: true, message: '' },
      content: { isValid: true, message: '' },
      references: {},
    },
    touched: {
      title: false,
      content: false,
      references: {},
    },
    isFormValid: true,
    isSubmitting: false,
    validateForm: vi.fn().mockReturnValue(true),
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
    handleSubmit: vi.fn((callback) => (e: React.FormEvent) => {
      e.preventDefault();
      callback(e);
    }),
    setIsSubmitting: vi.fn(),
  }),
}));

// Import the mocked module
import useFormValidationModule from '../../hooks/useFormValidation';

describe('ReportForm Component', () => {
  const mockOnSubmit = vi.fn();
  const useFormValidation = vi.mocked(useFormValidationModule);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock implementation for useFormValidation
    useFormValidation.mockReturnValue({
      errors: {
        title: { isValid: true, message: '' },
        content: { isValid: true, message: '' },
        references: {},
      },
      touched: {
        title: false,
        content: false,
        references: {},
      },
      isFormValid: true,
      isSubmitting: false,
      validateForm: vi.fn().mockReturnValue(true),
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn((callback) => (e: React.FormEvent) => {
        e.preventDefault();
        callback(e);
      }),
      setIsSubmitting: vi.fn(),
    });
  });

  it('renders with default elements', () => {
    render(<ReportForm />);
    
    expect(screen.getByText('Create New Report')).toBeInTheDocument();
    expect(screen.getByTestId('rjsf-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Report' })).toBeInTheDocument();
  });

  it('renders with correct initial form data', () => {
    render(<ReportForm />);
    
    const formDataElement = screen.getByTestId('form-data');
    const formData = JSON.parse(formDataElement.textContent ?? '{}');
    
    expect(formData.title).toBe('');
    expect(formData.content).toBe('');
    expect(formData.category).toBe('Technical');
    expect(formData.references).toEqual([]);
  });

  it('applies correct CSS classes for styling', () => {
    render(<ReportForm />);
    
    const container = screen.getByText('Create New Report').closest('.bg-white');
    expect(container).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-md');
    
    const title = screen.getByText('Create New Report');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'mb-4', 'text-gray-800');
    
    const button = screen.getByRole('button', { name: 'Generate Report' });
    expect(button).toHaveClass('px-4', 'py-2', 'rounded', 'bg-blue-600', 'text-white');
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);
    
    // Mock a delayed response
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    vi.mocked(convertMarkdownToDocx).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    expect(screen.getByRole('button', { name: 'Generating...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generating...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Generating...' })).toHaveClass('opacity-70', 'cursor-not-allowed');
  });

  it('calls onSubmit callback when provided', async () => {
    const user = userEvent.setup();
    render(<ReportForm onSubmit={mockOnSubmit} />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: '',
        content: '',
        category: 'Technical',
        references: [],
      });
    });
  });

  it('generates markdown report with correct data', async () => {
    const user = userEvent.setup();
    const { generateMarkdownReport } = await import('../../utils/documentUtils');
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(generateMarkdownReport).toHaveBeenCalledWith(
        '',
        '',
        'Technical',
        []
      );
    });
  });

  it('calls convertMarkdownToDocx with correct parameters', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx, generateMarkdownReport } = await import('../../utils/documentUtils');
    
    // Mock the markdown generation to return a specific value
    vi.mocked(generateMarkdownReport).mockReturnValue('# \n\n**Category:** Technical\n\n');
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(convertMarkdownToDocx).toHaveBeenCalledWith(
        '# \n\n**Category:** Technical\n\n',
        ''
      );
    });
  });

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Report generated and downloaded successfully!')).toBeInTheDocument();
    });
    
    const successMessage = screen.getByText('Report generated and downloaded successfully!').closest('div');
    expect(successMessage).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('shows error message when submission fails', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    
    // Mock the conversion to throw an error
    vi.mocked(convertMarkdownToDocx).mockRejectedValue(new Error('Conversion failed'));
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error generating report. Please try again.')).toBeInTheDocument();
    });
    
    const errorMessage = screen.getByText('Error generating report. Please try again.').closest('div');
    expect(errorMessage).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('clears previous messages on new submission', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    
    // Reset the mock to resolve successfully first
    vi.mocked(convertMarkdownToDocx).mockResolvedValue(new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    
    // First submission - success
    await user.click(mockSubmitButton);
    await waitFor(() => {
      expect(screen.getByText('Report generated and downloaded successfully!')).toBeInTheDocument();
    });
    
    // Second submission - should clear previous message
    vi.mocked(convertMarkdownToDocx).mockRejectedValue(new Error('New error'));
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Report generated and downloaded successfully!')).not.toBeInTheDocument();
      expect(screen.getByText('Error generating report. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles form submission with empty formData gracefully', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);
    
    // Test that the component handles the default empty form data correctly
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    const { generateMarkdownReport, convertMarkdownToDocx } = await import('../../utils/documentUtils');
    
    await waitFor(() => {
      expect(generateMarkdownReport).toHaveBeenCalledWith('', '', 'Technical', []);
      expect(convertMarkdownToDocx).toHaveBeenCalled();
    });
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    
    // Mock a delayed response
    vi.mocked(convertMarkdownToDocx).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    // Form should be disabled during submission
    const formDisabledElement = screen.getByTestId('form-disabled');
    expect(formDisabledElement.textContent).toBe('true');
  });

  it('passes correct schema to form component', () => {
    render(<ReportForm />);
    
    const schemaElement = screen.getByTestId('form-schema');
    const schema = JSON.parse(schemaElement.textContent ?? '{}');
    
    expect(schema.type).toBe('object');
    expect(schema.required).toEqual(['title', 'content']);
    expect(schema.properties.title.type).toBe('string');
    expect(schema.properties.content.type).toBe('string');
    expect(schema.properties.category.type).toBe('string');
    expect(schema.properties.category.enum).toEqual(['Technical', 'Business', 'Research', 'Other']);
    expect(schema.properties.references.type).toBe('array');
    expect(schema.properties.references.items.type).toBe('object');
    expect(schema.properties.references.items.required).toEqual(['title', 'author']);
  });
  
  it('includes references section in schema', () => {
    render(<ReportForm />);
    
    const schemaElement = screen.getByTestId('form-schema');
    const schema = JSON.parse(schemaElement.textContent ?? '{}');
    
    // Check that references array is properly defined
    expect(schema.properties.references.type).toBe('array');
    expect(schema.properties.references.title).toBe('References');
    expect(schema.properties.references.items.type).toBe('object');
    
    // Check reference item properties
    const refItemProps = schema.properties.references.items.properties;
    expect(refItemProps.title.type).toBe('string');
    expect(refItemProps.author.type).toBe('string');
    expect(refItemProps.year.type).toBe('string');
    expect(refItemProps.url.type).toBe('string');
    expect(refItemProps.url.format).toBe('uri');
    expect(refItemProps.type.enum).toContain('Book');
    expect(refItemProps.type.enum).toContain('Article');
    expect(refItemProps.type.enum).toContain('Website');
  });
  
  it('renders the References component with correct props', () => {
    render(<ReportForm />);
    
    expect(screen.getByTestId('mock-references')).toBeInTheDocument();
    
    const referencesDataElement = screen.getByTestId('references-data');
    expect(JSON.parse(referencesDataElement.textContent ?? '[]')).toEqual([]);
  });
  
  // New tests for validation features
  it('initializes useFormValidation with correct parameters', () => {
    render(<ReportForm />);
    
    expect(useFormValidation).toHaveBeenCalledWith(
      {
        title: '',
        content: '',
        category: 'Technical',
        references: [],
      },
      {
        validateOnChange: true,
        validateOnBlur: true,
        validateOnMount: false,
      }
    );
  });
  
  it('passes validation errors to References component', () => {
    // Mock validation errors
    useFormValidation.mockReturnValue({
      errors: {
        title: { isValid: false, message: 'Title is required' },
        content: { isValid: true, message: '' },
        references: {
          0: {
            title: { isValid: false, message: 'Reference title is required' },
            author: { isValid: true, message: '' },
          },
        },
      },
      touched: {
        title: true,
        content: false,
        references: {
          0: {
            title: true,
            author: true,
          },
        },
      },
      isFormValid: false,
      isSubmitting: false,
      validateForm: vi.fn().mockReturnValue(false),
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      setIsSubmitting: vi.fn(),
    });
    
    render(<ReportForm />);
    
    // Check that errors are passed to References component
    const referencesErrorsElement = screen.getByTestId('references-errors');
    const referencesErrors = JSON.parse(referencesErrorsElement.textContent ?? '{}');
    
    expect(referencesErrors[0].title.isValid).toBe(false);
    expect(referencesErrors[0].title.message).toBe('Reference title is required');
    
    // Check that touched state is passed to References component
    const referencesTouchedElement = screen.getByTestId('references-touched');
    const referencesTouched = JSON.parse(referencesTouchedElement.textContent ?? '{}');
    
    expect(referencesTouched[0].title).toBe(true);
    expect(referencesTouched[0].author).toBe(true);
  });
  
  it('displays validation errors for title and content', () => {
    // Mock validation errors
    useFormValidation.mockReturnValue({
      errors: {
        title: { isValid: false, message: 'Title is required' },
        content: { isValid: false, message: 'Content must be at least 10 characters' },
        references: {},
      },
      touched: {
        title: true,
        content: true,
        references: {},
      },
      isFormValid: false,
      isSubmitting: false,
      validateForm: vi.fn().mockReturnValue(false),
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      setIsSubmitting: vi.fn(),
    });
    
    render(<ReportForm />);
    
    // Check that error messages are displayed
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Content must be at least 10 characters')).toBeInTheDocument();
  });
  
  it('disables submit button when form is invalid', () => {
    // Mock invalid form
    useFormValidation.mockReturnValue({
      errors: {
        title: { isValid: false, message: 'Title is required' },
        content: { isValid: true, message: '' },
        references: {},
      },
      touched: {
        title: true,
        content: false,
        references: {},
      },
      isFormValid: false,
      isSubmitting: false,
      validateForm: vi.fn().mockReturnValue(false),
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      setIsSubmitting: vi.fn(),
    });
    
    render(<ReportForm />);
    
    // Submit button should be disabled
    const submitButton = screen.getByRole('button', { name: 'Generate Report' });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('bg-gray-400');
  });
  
  it('shows form completion progress indicator', () => {
    // Mock partially valid form
    useFormValidation.mockReturnValue({
      errors: {
        title: { isValid: true, message: '' },
        content: { isValid: false, message: 'Content is required' },
        references: {},
      },
      touched: {
        title: true,
        content: true,
        references: {},
      },
      isFormValid: false,
      isSubmitting: false,
      validateForm: vi.fn().mockReturnValue(false),
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      setIsSubmitting: vi.fn(),
    });
    
    render(<ReportForm />);
    
    // Progress indicator should show "Required fields missing"
    expect(screen.getByText('Required fields missing')).toBeInTheDocument();
    
    // Progress bar should be partially filled
    const progressBar = screen.getByText('Required fields missing').parentElement?.nextElementSibling?.firstElementChild;
    expect(progressBar).toHaveStyle('width: 50%');
  });
  
  it('calls validation functions when fields change', async () => {
    const user = userEvent.setup();
    const mockHandleChange = vi.fn();
    const mockHandleBlur = vi.fn();
    
    // Mock validation functions
    useFormValidation.mockReturnValue({
      errors: {
        title: { isValid: true, message: '' },
        content: { isValid: true, message: '' },
        references: {},
      },
      touched: {
        title: false,
        content: false,
        references: {},
      },
      isFormValid: true,
      isSubmitting: false,
      validateForm: vi.fn().mockReturnValue(true),
      handleBlur: mockHandleBlur,
      handleChange: mockHandleChange,
      handleSubmit: vi.fn(),
      setIsSubmitting: vi.fn(),
    });
    
    render(<ReportForm />);
    
    // Simulate changing title field
    const titleInput = screen.getByTestId('title-input');
    await user.type(titleInput, 'New Title');
    
    // handleChange should be called with field name and value
    expect(mockHandleChange).toHaveBeenCalledWith('title', 'New Title');
    
    // Simulate blur event
    await user.tab();
    
    // handleBlur should be called with field name
    expect(mockHandleBlur).toHaveBeenCalledWith('title');
  });
  
  it('validates form before submission', async () => {
    const user = userEvent.setup();
    const mockValidateForm = vi.fn().mockReturnValue(false);
    
    // Mock invalid form
    useFormValidation.mockReturnValue({
      errors: {
        title: { isValid: false, message: 'Title is required' },
        content: { isValid: true, message: '' },
        references: {},
      },
      touched: {
        title: true,
        content: false,
        references: {},
      },
      isFormValid: false,
      isSubmitting: false,
      validateForm: mockValidateForm,
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn((callback) => (e: React.FormEvent) => {
        e.preventDefault();
        if (mockValidateForm()) {
          callback(e);
        }
      }),
      setIsSubmitting: vi.fn(),
    });
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    // validateForm should be called
    expect(mockValidateForm).toHaveBeenCalled();
    
    // Error message should be displayed
    expect(screen.getByText('Please fix the validation errors before submitting.')).toBeInTheDocument();
  });
  
  it('renders the References component with correct props', () => {
    render(<ReportForm />);
    
    expect(screen.getByTestId('mock-references')).toBeInTheDocument();
    
    const referencesDataElement = screen.getByTestId('references-data');
    expect(JSON.parse(referencesDataElement.textContent ?? '[]')).toEqual([]);
    
    const referencesDisabledElement = screen.getByTestId('references-disabled');
    expect(referencesDisabledElement.textContent).toBe('false');
  });
  
  it('updates form data when References component changes', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);
    
    // Click the mock add reference button
    await user.click(screen.getByTestId('mock-add-reference'));
    
    // Check that the form data was updated
    const formDataElement = screen.getByTestId('form-data');
    const formData = JSON.parse(formDataElement.textContent ?? '{}');
    
    expect(formData.references).toHaveLength(1);
    expect(formData.references[0].title).toBe('New Ref');
    expect(formData.references[0].author).toBe('Test Author');
    expect(formData.references[0].type).toBe('Article');
  });
  
  it('disables References component when form is submitting', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);
    
    // Mock a delayed response
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    vi.mocked(convertMarkdownToDocx).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    // Submit the form
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    // Check that the References component is disabled
    const referencesDisabledElement = screen.getByTestId('references-disabled');
    expect(referencesDisabledElement.textContent).toBe('true');
  });

  it('logs errors to console when submission fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    
    const testError = new Error('Test error');
    vi.mocked(convertMarkdownToDocx).mockRejectedValue(testError);
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error generating report:', testError);
    });
    
    consoleSpy.mockRestore();
  });

  it('resets loading state after error', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    
    vi.mocked(convertMarkdownToDocx).mockRejectedValue(new Error('Test error'));
    
    render(<ReportForm />);
    
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error generating report. Please try again.')).toBeInTheDocument();
    });
    
    // Button should be back to normal state
    expect(screen.getByRole('button', { name: 'Generate Report' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Report' })).not.toBeDisabled();
  });

  // AI integration tests
  it('renders AI assist buttons with correct props', () => {
    render(<ReportForm />);
    
    // Check that the AI assist buttons are rendered with the correct props
    expect(screen.getByTestId('generate-title-button')).toBeInTheDocument();
    expect(screen.getByTestId('improve-content-button')).toBeInTheDocument();
    expect(screen.getByTestId('generate-content-button')).toBeInTheDocument();
    
    // Check that the improve content button is disabled when there's no content
    expect(screen.getByTestId('improve-content-button')).toBeDisabled();
  });
  
  it('disables AI buttons during form submission', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
    
    // Mock a delayed response
    vi.mocked(convertMarkdownToDocx).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<ReportForm />);
    
    // Submit the form
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);
    
    // Check that the AI buttons are disabled
    expect(screen.getByTestId('generate-title-button')).toBeDisabled();
    expect(screen.getByTestId('improve-content-button')).toBeDisabled();
    expect(screen.getByTestId('generate-content-button')).toBeDisabled();
  });
});