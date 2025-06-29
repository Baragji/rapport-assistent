import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFormValidation } from '../useFormValidation';
import type { FormData } from '../useFormValidation';

// Mock validateReference function to avoid circular dependencies
vi.mock('../../utils/validationUtils', async () => {
  const actual = await vi.importActual('../../utils/validationUtils');
  return {
    ...actual,
    validateReference: vi.fn().mockImplementation(() => ({
      title: { isValid: true, message: '' },
      author: { isValid: true, message: '' },
      year: { isValid: true, message: '' },
      url: { isValid: true, message: '' },
      type: { isValid: true, message: '' }
    }))
  };
});

describe('useFormValidation', () => {
  const mockFormData: FormData = {
    title: '',
    content: '',
    category: 'Technical',
    references: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty errors', () => {
    const { result } = renderHook(() => useFormValidation(mockFormData));

    expect(result.current.errors.title.isValid).toBe(false); // Initially false because empty title is invalid
    expect(result.current.errors.content.isValid).toBe(false); // Initially false because empty content is invalid
    expect(result.current.isFormValid).toBe(false);
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() => useFormValidation(mockFormData, { validateOnMount: true }));

    expect(result.current.errors.title.isValid).toBe(false);
    expect(result.current.errors.title.message).toBe('Report title is required');
    expect(result.current.isFormValid).toBe(false);
  });

  it('should validate content minimum length', () => {
    const formData = { ...mockFormData, title: 'Test Title', content: 'Short' };

    const { result } = renderHook(() => useFormValidation(formData, { validateOnMount: true }));

    expect(result.current.errors.content.isValid).toBe(false);
    expect(result.current.errors.content.message).toBe(
      'Report content must be at least 10 characters (5 more needed)'
    );
    expect(result.current.isFormValid).toBe(false);
  });

  it('should validate form as valid when all fields are valid', () => {
    const formData = {
      ...mockFormData,
      title: 'Test Title',
      content: 'This is a valid content with more than 10 characters',
    };

    const { result } = renderHook(() => useFormValidation(formData, { validateOnMount: true }));

    expect(result.current.errors.title.isValid).toBe(true);
    expect(result.current.errors.content.isValid).toBe(true);
    expect(result.current.isFormValid).toBe(true);
  });

  it('should mark fields as touched on blur', () => {
    const { result } = renderHook(() => useFormValidation(mockFormData));

    act(() => {
      result.current.handleBlur('title');
    });

    expect(result.current.touched.title).toBe(true);
    expect(result.current.touched.content).toBe(false);
  });

  it('should validate references', () => {
    // We're using mocked validateReference that always returns valid
    const formData = {
      ...mockFormData,
      title: 'Test Title',
      content: 'This is a valid content with more than 10 characters',
      references: [
        { title: 'Test Reference', author: 'Test Author', year: '2023', url: 'https://example.com', type: 'Article' as const },
      ],
    };

    const { result } = renderHook(() => useFormValidation(formData, { validateOnMount: true }));

    // With our mock, all references should be valid
    expect(result.current.errors.references[0]).toBeDefined();
    expect(result.current.isFormValid).toBe(true);
  });

  it('should handle reference field blur', () => {
    const formData = {
      ...mockFormData,
      references: [{ title: '', author: '', year: '', url: '', type: 'Article' as const }],
    };

    const { result } = renderHook(() => useFormValidation(formData));

    act(() => {
      result.current.handleBlur('references', 0, 'title');
    });

    // Check if the references object exists and has the expected structure
    expect(result.current.touched.references).toBeDefined();
    expect(result.current.touched.references[0]).toBeDefined();
    
    // Check if the title field is marked as touched
    if (result.current.touched.references[0]) {
      expect(result.current.touched.references[0].title).toBe(true);
    }
  });

  it('should handle form submission', () => {
    const formData = {
      ...mockFormData,
      title: 'Test Title',
      content: 'This is a valid content with more than 10 characters',
    };

    const mockOnSubmit = vi.fn();
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    const { result } = renderHook(() => useFormValidation(formData));

    act(() => {
      const submitHandler = result.current.handleSubmit(mockOnSubmit);
      submitHandler(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith(formData);
  });

  it('should not submit invalid form', () => {
    const mockOnSubmit = vi.fn();
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    const { result } = renderHook(() => useFormValidation(mockFormData));

    act(() => {
      const submitHandler = result.current.handleSubmit(mockOnSubmit);
      submitHandler(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
