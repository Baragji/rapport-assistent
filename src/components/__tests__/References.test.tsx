import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import References from '../References';
import type { Reference } from '../../utils/documentUtils';
import type { ValidationResult } from '../../utils/validationUtils';

describe('References Component', () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  const sampleReferences: Reference[] = [
    {
      title: 'Test Title 1',
      author: 'Test Author 1',
      year: '2023',
      type: 'Article',
      publisher: 'Test Publisher',
      url: 'https://example.com',
    },
    {
      title: 'Test Title 2',
      author: 'Test Author 2',
      type: 'Book',
    },
  ];

  const mockErrors: Record<number, Record<string, ValidationResult>> = {
    0: {
      title: { isValid: true, message: '' },
      author: { isValid: false, message: 'Author is required' },
      year: { isValid: true, message: '' },
      url: { isValid: false, message: 'Invalid URL format' },
      type: { isValid: true, message: '' },
    },
  };

  const mockTouched: Record<number, Record<string, boolean>> = {
    0: {
      title: true,
      author: true,
      year: false,
      url: true,
      type: false,
    },
  };

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnBlur.mockClear();
  });

  it('renders empty state when no references are provided', () => {
    render(<References references={[]} onChange={mockOnChange} />);

    expect(screen.getByText('References')).toBeInTheDocument();
    expect(screen.getByText('No references added yet.')).toBeInTheDocument();
    expect(screen.getByTestId('add-reference-button')).toBeInTheDocument();
  });

  it('renders references when provided', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    expect(screen.getByText('Reference #1')).toBeInTheDocument();
    expect(screen.getByText('Reference #2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Title 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Author 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Publisher')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Title 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Author 2')).toBeInTheDocument();
  });

  it('adds a new reference when Add Reference button is clicked', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('add-reference-button'));

    expect(mockOnChange).toHaveBeenCalledWith([
      ...sampleReferences,
      { title: '', author: '', type: 'Article' },
    ]);
  });

  it('removes a reference when remove button is clicked', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('remove-reference-0'));

    expect(mockOnChange).toHaveBeenCalledWith([sampleReferences[1]]);
  });

  it('moves a reference up when up button is clicked', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('move-up-1'));

    expect(mockOnChange).toHaveBeenCalledWith([sampleReferences[1], sampleReferences[0]]);
  });

  it('moves a reference down when down button is clicked', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('move-down-0'));

    expect(mockOnChange).toHaveBeenCalledWith([sampleReferences[1], sampleReferences[0]]);
  });

  it('does not move up the first reference', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('move-up-0'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('does not move down the last reference', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('move-down-1'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('updates a reference field when input changes', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    fireEvent.change(screen.getByTestId('title-input-0'), { target: { value: 'Updated Title' } });

    expect(mockOnChange).toHaveBeenCalledWith([
      { ...sampleReferences[0], title: 'Updated Title' },
      sampleReferences[1],
    ]);
  });

  it('disables all interactive elements when disabled prop is true', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} disabled={true} />);

    expect(screen.getByTestId('add-reference-button')).toBeDisabled();
    expect(screen.getByTestId('remove-reference-0')).toBeDisabled();
    expect(screen.getByTestId('move-up-1')).toBeDisabled();
    expect(screen.getByTestId('move-down-0')).toBeDisabled();
    expect(screen.getByTestId('title-input-0')).toBeDisabled();
    expect(screen.getByTestId('author-input-0')).toBeDisabled();
    expect(screen.getByTestId('year-input-0')).toBeDisabled();
    expect(screen.getByTestId('type-select-0')).toBeDisabled();
    expect(screen.getByTestId('publisher-input-0')).toBeDisabled();
    expect(screen.getByTestId('url-input-0')).toBeDisabled();
  });

  it('shows validation feedback for required fields', () => {
    const referencesWithEmptyFields: Reference[] = [
      {
        title: '',
        author: '',
        type: 'Article',
      },
    ];

    const mockErrors = {
      0: {
        title: { isValid: false, message: 'Title is required' },
        author: { isValid: false, message: 'Author is required' },
      },
    };

    const mockTouched = {
      0: {
        title: true,
        author: true,
      },
    };

    render(
      <References
        references={referencesWithEmptyFields}
        onChange={mockOnChange}
        errors={mockErrors}
        touched={mockTouched}
      />
    );

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Author is required')).toBeInTheDocument();
  });

  it('renders all reference type options', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);

    const typeSelect = screen.getByTestId('type-select-0');

    expect(typeSelect).toBeInTheDocument();

    const options = Array.from(typeSelect.querySelectorAll('option')).map(option => option.value);
    expect(options).toEqual(['Article', 'Book', 'Website', 'Journal', 'Conference', 'Other']);
  });

  // New tests for validation features
  it('displays validation errors from props', () => {
    render(
      <References
        references={sampleReferences}
        onChange={mockOnChange}
        errors={mockErrors}
        touched={mockTouched}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByText('Author is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
  });

  it('calls onBlur handler when fields lose focus', () => {
    render(
      <References
        references={sampleReferences}
        onChange={mockOnChange}
        errors={mockErrors}
        touched={mockTouched}
        onBlur={mockOnBlur}
      />
    );

    fireEvent.blur(screen.getByTestId('title-input-0'));
    expect(mockOnBlur).toHaveBeenCalledWith(0, 'title');

    fireEvent.blur(screen.getByTestId('author-input-0'));
    expect(mockOnBlur).toHaveBeenCalledWith(0, 'author');
  });

  it('applies correct validation classes to fields', () => {
    render(
      <References
        references={sampleReferences}
        onChange={mockOnChange}
        errors={mockErrors}
        touched={mockTouched}
        onBlur={mockOnBlur}
      />
    );

    // Title is valid and touched
    const titleInput = screen.getByTestId('title-input-0');
    expect(titleInput.className).toContain('border-green-500');

    // Author is invalid and touched
    const authorInput = screen.getByTestId('author-input-0');
    expect(authorInput.className).toContain('border-red-500');

    // URL is invalid and touched
    const urlInput = screen.getByTestId('url-input-0');
    expect(urlInput.className).toContain('border-red-500');

    // Year is not touched, so should have default styling
    const yearInput = screen.getByTestId('year-input-0');
    expect(yearInput.className).toContain('border-gray-300');
  });

  it('shows checkmark icon for valid fields', () => {
    render(
      <References
        references={sampleReferences}
        onChange={mockOnChange}
        errors={mockErrors}
        touched={mockTouched}
        onBlur={mockOnBlur}
      />
    );

    // Title is valid and touched, should have checkmark
    const titleField = screen.getByTestId('title-input-0').parentElement;
    expect(titleField?.innerHTML).toContain('svg');

    // Author is invalid and touched, should not have checkmark
    const authorField = screen.getByTestId('author-input-0').parentElement;
    expect(authorField?.querySelectorAll('svg').length).toBe(0);
  });

  it('sets aria-invalid attribute correctly', () => {
    render(
      <References
        references={sampleReferences}
        onChange={mockOnChange}
        errors={mockErrors}
        touched={mockTouched}
        onBlur={mockOnBlur}
      />
    );

    // Title is valid
    expect(screen.getByTestId('title-input-0')).not.toHaveAttribute('aria-invalid', 'true');

    // Author is invalid
    expect(screen.getByTestId('author-input-0')).toHaveAttribute('aria-invalid', 'true');

    // URL is invalid
    expect(screen.getByTestId('url-input-0')).toHaveAttribute('aria-invalid', 'true');
  });
});
