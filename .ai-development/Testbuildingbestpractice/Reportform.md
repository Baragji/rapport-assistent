Testing Best Practices for React Components with Vitest
Mock Strategy and Organization
Create comprehensive mock objects at the top of test files with consistent structure and complete type definitions:

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

Copy

Insert

Component Mock Implementation
Mock complex components with functional implementations that preserve testability:

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

Copy

Insert

Hidden Test Data Pattern
Use hidden elements to expose component state for testing without affecting the UI:

vi.mock('../References', () => ({
  default: ({ references, onChange, disabled, errors, touched, onBlur }) => (
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

Copy

Insert

Utility Function Mocking
Mock utility functions with realistic implementations that maintain business logic:

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

Copy

Insert

Hook Mocking with Dynamic Return Values
Mock custom hooks with the ability to dynamically change return values during tests:

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
  const useFormValidation = vi.mocked(useFormValidationModule);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementation in beforeEach
    useFormValidation.mockReturnValue({
      // ... complete mock implementation
    });
  });
});

Copy

Insert

Test Structure and Organization
Organize tests with descriptive names that clearly indicate what is being tested:

describe('ReportForm Component', () => {
  const mockOnSubmit = vi.fn();
  const useFormValidation = vi.mocked(useFormValidationModule);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to consistent state
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
});

Copy

Insert

CSS Class Testing
Test CSS classes to ensure proper styling and responsive behavior:

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

Copy

Insert

Async Operation Testing
Test loading states and async operations with proper timing control:

it('shows loading state when submitting', async () => {
  render(<ReportForm />);

  // Mock a delayed response
  const { convertMarkdownToDocx } = await import('../../utils/documentUtils');
  vi.mocked(convertMarkdownToDocx).mockImplementation(
    () => new Promise(resolve => setTimeout(resolve, 100))
  );

  const mockSubmitButton = screen.getByTestId('mock-submit-button');
  mockSubmitButton.click();

  expect(screen.getByText('Generating Report...')).toBeInTheDocument();
  const submitButton = screen.getByTestId('generate-report-button');
  expect(submitButton).toBeDisabled();
  expect(submitButton).toHaveClass('opacity-90', 'cursor-wait');
});

Copy

Insert

Error Handling Testing
Test error scenarios with proper mock implementations:

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

Copy

Insert

Success State Testing
Test success scenarios with proper assertions on UI feedback:

it('shows success message after successful submission', async () => {
  const user = userEvent.setup();
  render(<ReportForm />);

  const mockSubmitButton = screen.getByTestId('mock-submit-button');
  await user.click(mockSubmitButton);

  await waitFor(() => {
    expect(screen.getByText('Report generated and downloaded successfully!')).toBeInTheDocument();
  });

  const successMessage = screen
    .getByText('Report generated and downloaded successfully!')
    .closest('div');
  expect(successMessage).toHaveClass('bg-green-100', 'text-green-700');
});

Copy

Insert

Dynamic Mock State Testing
Test different component states by dynamically changing mock return values:

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

Copy

Insert

Function Call Verification
Verify that functions are called with correct parameters:

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

Copy

Insert

Edge Case Testing
Test edge cases and boundary conditions:

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

Copy

Insert

Responsive Design Best Practices
CSS Custom Properties and Responsive Classes
Use CSS custom properties for consistent spacing and responsive design patterns:

:root {
  --spacing: .25rem;
  --container-6xl: 72rem;
  --text-xs: .75rem;
  --text-xs--line-height: calc(1 / .75);
  --default-transition-duration: .15s;
  --default-transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}

Copy

Insert

Touch-Friendly Interface Design
Implement touch-friendly components with minimum touch target sizes:

.btn-touch {
  min-height: 44px;
  min-width: 44px;
  padding: .5rem .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-responsive {
  width: 100%;
  min-height: 44px;
  padding: .5rem .75rem;
  border-radius: .375rem;
  font-size: 1rem;
  line-height: 1.5;
}

@media (min-width: 320px) {
  .input-responsive {
    padding: .625rem .875rem;
  }
}

Copy

Insert

Progressive Enhancement Layout
Design layouts that work on small screens first, then enhance for larger screens:

.container-responsive {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
}

@media (min-width: 480px) {
  .container-responsive {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .container-responsive {
    padding-left: 2rem;
    padding-right: 2rem;
    max-width: 90%;
  }
}

@media (min-width: 1024px) {
  .container-responsive {
    max-width: 85%;
  }
}

Copy

Insert

Responsive Typography
Implement scalable typography that adapts to screen size:

.text-title-responsive {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

@media (min-width: 320px) {
  .text-title-responsive {
    font-size: 1.5rem;
  }
}

.text-subtitle-responsive {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.3;
}

@media (min-width: 320px) {
  .text-subtitle-responsive {
    font-size: 1.125rem;
  }
}

Copy

Insert

Flexible Grid Systems
Create responsive grid systems that adapt to different screen sizes:

.grid-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 480px) {
  .grid-responsive {
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
}

Copy

Insert

Mobile-First Component Design
Design components that stack on mobile and align horizontally on larger screens:

.mobile-stack {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

@media (min-width: 480px) {
  .mobile-stack {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
}

.button-group-responsive {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  width: 100%;
}

@media (min-width: 480px) {
  .button-group-responsive {
    flex-direction: row;
    width: auto;
  }
}

Copy

Insert

Orientation-Specific Optimizations
Handle different device orientations with specific CSS rules:

@media screen and (orientation: portrait) and (max-width: 480px) {
  .grid-responsive {
    grid-template-columns: 1fr !important;
  }
  .card-responsive {
    padding: .75rem !important;
  }
  .form-group-responsive {
    margin-bottom: .75rem !important;
  }
}

@media screen and (orientation: landscape) and (max-height: 480px) {
  .card-responsive {
    max-height: 85vh;
    overflow-y: auto;
    padding: .75rem !important;
  }
  .text-title-responsive {
    font-size: 1.125rem !important;
  }
  .text-subtitle-responsive {
    font-size: 1rem !important;
  }
}

Copy

Insert

Accessible Form Controls
Design form controls that work well on touch devices:

.touch-friendly-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right .5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  min-height: 44px;
}

Copy

Insert

Dark Mode Support
Implement dark mode support with proper contrast ratios:

@media (prefers-color-scheme: dark) {
  .card-responsive {
    background-color: #1f2937;
    color: #f3f4f6;
  }
  
  input, textarea, select {
    background-color: #374151 !important;
    border-color: #4b5563 !important;
    color: #f3f4f6 !important;
  }
  
  .text-gray-700 {
    color: #d1d5db !important;
  }
  
  .text-gray-600 {
    color: #e5e7eb !important;
  }
  
  .bg-gray-50 {
    background-color: #374151 !important;
  }
  
  .bg-gray-100 {
    background-color: #4b5563 !important;
  }
  
  .border-gray-200 {
    border-color: #4b5563 !important;
  }
}

Copy

Insert

Performance and Accessibility
Respect user preferences for reduced motion:

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-fade-in-up,
  .animate-fade-in-down,
  .animate-slide-in-right,
  .animate-pulse-custom,
  .skeleton-loading,
  .animate-ripple {
    animation: none !important;
    transition: none !important;
  }
}

Copy

Insert

Print Optimization
Optimize layouts for print media:

@media print {
  body {
    background-color: #fff !important;
    color: #000 !important;
  }
  
  .card-responsive {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
    -moz-column-break-inside: avoid;
    break-inside: avoid;
  }
  
  button, .btn-touch, [type="button"], [type="submit"] {
    display: none !important;
  }
  
  input, textarea, select {
    border: 1px solid #e5e7eb !important;
    background-color: #fff !important;
  }
  
  .grid-responsive {
    display: block !important;
  }
  
  p, li, td, th {
    font-size: 12pt !important;
    line-height: 1.4 !important;
  }
  
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid !important;
  }
  
  img, svg {
    max-width: 100% !important;
    page-break-inside: avoid !important;
  }
}

Copy

Insert

Source: src/components/__tests__/ReportForm.test.tsx