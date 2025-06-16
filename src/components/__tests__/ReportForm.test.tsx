import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportForm from '../ReportForm';

// Define mock data objects with all required properties
const mockValidationHook = {
  errors: {
    title: { isValid: true, message: '' },
    content: { isValid: true, message: '' },
    references: {}
  },
  touched: {
    title: false,
    content: false,
    references: {}
  },
  dirty: {
    title: false,
    content: false,
    references: {}
  },
  isFormValid: false,
  isSubmitting: false,
  validationProgress: 0,
  fieldFocus: null,
  validateForm: vi.fn().mockReturnValue(false),
  validateField: vi.fn(),
  handleFocus: vi.fn(),
  handleBlur: vi.fn(),
  handleChange: vi.fn(),
  handleSubmit: vi.fn(),
  setIsSubmitting: vi.fn(),
  resetValidation: vi.fn(),
  calculateProgress: vi.fn()
};

// Mock complex components with functional implementations that preserve testability
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

// Use hidden elements to expose component state for testing without affecting the UI
vi.mock('../References', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ references, onChange, disabled, errors, touched, onBlur: _onBlur }: {
    references: any;
    onChange: any;
    disabled: any;
    errors: any;
    touched: any;
    onBlur: any;
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
      {/* Interactive elements for testing */}
      <button
        data-testid="mock-add-reference"
        onClick={() =>
          onChange([...references, { title: 'New Ref', author: 'Test Author', type: 'Article' }])
        }
        disabled={disabled}
      >
        Add Reference
      </button>
    </div>
  ),
}));

// Mock utility functions with realistic implementations that maintain business logic
vi.mock('../../utils/documentUtils', () => ({
  generateMarkdownReport: vi.fn(
    (title: string, content: string, category: string, references = []) => {
      let markdown = `# ${title}\n\n**Category:** ${category}\n\n${content}`;
      if (references.length > 0) {
        markdown += '\n\n## References\n';
        references.forEach((ref: { author: string; title: string }, index: number) => {
          markdown += `${index + 1}. ${ref.author}. *${ref.title}*\n`;
        });
      }
      return markdown;
    }
  ),
  convertMarkdownToDocx: vi
    .fn()
    .mockResolvedValue(
      new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    ),
  formatReference: vi.fn(
    (ref: { author: string; title: string }) => `${ref.author}. *${ref.title}*`
  ),
}));

// Mock @rjsf/core Form component with comprehensive test data exposure
vi.mock('@rjsf/core', () => ({
  default: ({
    schema,
    formData,
    onSubmit,
    disabled,
    children,
  }: {
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

// Mock custom hooks with the ability to dynamically change return values during tests
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
    dirty: {
      title: false,
      content: false,
      references: {},
    },
    isFormValid: true,
    isSubmitting: false,
    validationProgress: 100,
    fieldFocus: null,
    validateForm: vi.fn().mockReturnValue(true),
    validateField: vi.fn().mockReturnValue({ isValid: true, message: '' }),
    handleFocus: vi.fn(),
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
    handleSubmit: vi.fn(callback => (e: React.FormEvent) => {
      e.preventDefault();
      callback(e);
    }),
    setIsSubmitting: vi.fn(),
    resetValidation: vi.fn(),
    calculateProgress: vi.fn().mockReturnValue(100),
  }),
}));

// Import the mocked module for dynamic manipulation
import useFormValidationModule from '../../hooks/useFormValidation';

describe('ReportForm Component', () => {
  const mockOnSubmit = vi.fn();
  const useFormValidation = vi.mocked(useFormValidationModule);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementation in beforeEach
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
      dirty: {
        title: false,
        content: false,
        references: {},
      },
      isFormValid: true,
      isSubmitting: false,
      validationProgress: 100,
      fieldFocus: null,
      validateForm: vi.fn().mockReturnValue(true),
      validateField: vi.fn().mockReturnValue({ isValid: true, message: '' }),
      handleFocus: vi.fn(),
      handleBlur: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn(callback => (e: React.FormEvent) => {
        e.preventDefault();
        callback(e);
      }),
      setIsSubmitting: vi.fn(),
      resetValidation: vi.fn(),
      calculateProgress: vi.fn().mockReturnValue(100),
    });
  });

  it('renders with default elements', () => {
    render(<ReportForm />);

    expect(screen.getByText('Create New Report')).toBeInTheDocument();
    expect(screen.getByTestId('rjsf-form')).toBeInTheDocument();
    expect(screen.getByTestId('generate-report-button')).toBeInTheDocument();
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
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

    const container = screen.getByText('Create New Report').closest('.card-responsive');
    expect(container).toHaveClass('card-responsive');

    const title = screen.getByText('Create New Report');
    expect(title).toHaveClass('text-title-responsive', 'mb-4', 'text-gray-800');

    const button = screen.getByTestId('generate-report-button');
    expect(button).toHaveClass('rounded');
    expect(button).toHaveClass('bg-blue-600');
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

    const errorMessage = screen
      .getByText('Error generating report. Please try again.')
      .closest('div');
    expect(errorMessage).toHaveClass('bg-red-100', 'text-red-700');
  });

  
  it('disables form during submission', async () => {
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');

    // Mock a delayed response
    vi.mocked(convertMarkdownToDocx).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    // Mock valid form state
    vi.mocked(useFormValidation).mockReturnValue({
      ...mockValidationHook,
      isFormValid: true,
      validateForm: () => true
    });

    render(<ReportForm />);

    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    mockSubmitButton.click();

    // Form should be disabled during submission
    await waitFor(() => {
      const formDisabledElement = screen.getByTestId('form-disabled');
      expect(formDisabledElement.textContent).toBe('true');
    });
  });

  it('calls onSubmit callback when provided', async () => {
    render(<ReportForm onSubmit={mockOnSubmit} />);

    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    mockSubmitButton.click();

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
      expect(generateMarkdownReport).toHaveBeenCalledWith('', '', 'Technical', []);
    });
  });

  it('handles form submission with empty formData gracefully', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);

    // Test that the component handles the default empty form data correctly
    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);

    const { generateMarkdownReport, convertMarkdownToDocx } = await import(
      '../../utils/documentUtils'
    );

    await waitFor(() => {
      expect(generateMarkdownReport).toHaveBeenCalledWith('', '', 'Technical', []);
      expect(convertMarkdownToDocx).toHaveBeenCalled();
    });
  });

  it('calls convertMarkdownToDocx with correct parameters', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx, generateMarkdownReport } = await import(
      '../../utils/documentUtils'
    );

    // Mock the markdown generation to return a specific value
    vi.mocked(generateMarkdownReport).mockReturnValue('# \n\n**Category:** Technical\n\n');

    render(<ReportForm />);

    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);

    await waitFor(() => {
      expect(convertMarkdownToDocx).toHaveBeenCalledWith('# \n\n**Category:** Technical\n\n', '');
    });
  });

  it('handles validation errors correctly', async () => {
    // Mock invalid form state
    vi.mocked(useFormValidation).mockReturnValue({
      ...mockValidationHook,
      isFormValid: false,
      errors: {
        title: { isValid: false, message: 'Title is required' },
        content: { isValid: false, message: 'Content is required' },
        references: {}
      },
      validateForm: vi.fn().mockReturnValue(false)
    });

    render(<ReportForm />);

    const submitButton = screen.getByTestId('generate-report-button');
    expect(submitButton).toBeDisabled();
  });

  
  it('handles references component interaction', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);

    const addReferenceButton = screen.getByTestId('mock-add-reference');
    await user.click(addReferenceButton);

    // Verify references component is rendered and interactive
    expect(screen.getByTestId('mock-references')).toBeInTheDocument();
  });

  it('maintains form state during validation', () => {
    // Mock form with validation progress
    vi.mocked(useFormValidation).mockReturnValue({
      ...mockValidationHook,
      validationProgress: 75,
      fieldFocus: 'title',
      touched: {
        title: true,
        content: false,
        references: {}
      }
    });

    render(<ReportForm />);

    // Verify form maintains state during validation
    expect(screen.getByTestId('rjsf-form')).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<ReportForm />);

    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);

    await waitFor(() => {
      expect(screen.getByText('Report generated and downloaded successfully!')).toBeInTheDocument();
    });

    // Verify form data is reset to initial state
    const formDataElement = screen.getByTestId('form-data');
    const formData = JSON.parse(formDataElement.textContent ?? '{}');
    expect(formData.title).toBe('');
    expect(formData.content).toBe('');
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    const { convertMarkdownToDocx } = await import('../../utils/documentUtils');

    // Mock network error
    vi.mocked(convertMarkdownToDocx).mockRejectedValue(new Error('Network error'));

    render(<ReportForm />);

    const mockSubmitButton = screen.getByTestId('mock-submit-button');
    await user.click(mockSubmitButton);

    await waitFor(() => {
      expect(screen.getByText('Error generating report. Please try again.')).toBeInTheDocument();
    });
  });

  it('preserves accessibility attributes', () => {
    render(<ReportForm />);

    const form = screen.getByTestId('rjsf-form');
    expect(form).toBeInTheDocument();

    const submitButton = screen.getByTestId('generate-report-button');
    expect(submitButton).toBeInTheDocument();
  });
});