import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportForm from '../ReportForm';

// Mock the References component
vi.mock('../References', () => ({
  default: ({ references, onChange, disabled }: {
    references: Record<string, unknown>[];
    onChange: (refs: Record<string, unknown>[]) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="mock-references">
      <div data-testid="references-data" style={{ display: 'none' }}>
        {JSON.stringify(references)}
      </div>
      <div data-testid="references-disabled" style={{ display: 'none' }}>
        {disabled ? 'true' : 'false'}
      </div>
      <button
        data-testid="mock-add-reference"
        onClick={() => onChange([...references, { title: 'New Ref', author: 'Test Author', type: 'Article' }])}
        disabled={disabled}
      >
        Add Reference
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

describe('ReportForm Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
    const referencesData = JSON.parse(referencesDataElement.textContent ?? '[]');
    expect(referencesData).toEqual([]);
    
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
});