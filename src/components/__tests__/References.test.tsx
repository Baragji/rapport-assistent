import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import References from '../References';
import type { Reference } from '../../utils/documentUtils';

describe('References Component', () => {
  const mockOnChange = vi.fn();
  
  const sampleReferences: Reference[] = [
    {
      title: 'Test Title 1',
      author: 'Test Author 1',
      year: '2023',
      type: 'Article',
      publisher: 'Test Publisher',
      url: 'https://example.com'
    },
    {
      title: 'Test Title 2',
      author: 'Test Author 2',
      type: 'Book'
    }
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
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
      { title: '', author: '', type: 'Article' }
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
    
    expect(mockOnChange).toHaveBeenCalledWith([
      sampleReferences[1],
      sampleReferences[0]
    ]);
  });

  it('moves a reference down when down button is clicked', () => {
    render(<References references={sampleReferences} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByTestId('move-down-0'));
    
    expect(mockOnChange).toHaveBeenCalledWith([
      sampleReferences[1],
      sampleReferences[0]
    ]);
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
      sampleReferences[1]
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
        type: 'Article'
      }
    ];
    
    render(<References references={referencesWithEmptyFields} onChange={mockOnChange} />);
    
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
});