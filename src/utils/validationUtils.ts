/**
 * Validation utilities for form fields
 */

export type ValidationResult = {
  isValid: boolean;
  message: string;
};

export type FieldValidation = {
  [key: string]: ValidationResult;
};

/**
 * Validates a required field
 * @param value The field value
 * @param fieldName The name of the field for the error message
 * @returns ValidationResult object
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const trimmedValue = value.trim();
  return {
    isValid: trimmedValue.length > 0,
    message: trimmedValue.length > 0 ? '' : `${fieldName} is required`,
  };
};

/**
 * Validates a URL field
 * @param value The URL to validate
 * @param required Whether the field is required
 * @returns ValidationResult object
 */
export const validateUrl = (value: string, required = false): ValidationResult => {
  // If not required and empty, it's valid
  if (!required && !value.trim()) {
    return { isValid: true, message: '' };
  }

  // If required and empty, it's invalid
  if (required && !value.trim()) {
    return { isValid: false, message: 'URL is required' };
  }

  try {
    // Check if it's a valid URL
    new URL(value);
    return { isValid: true, message: '' };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL (e.g., https://example.com)' };
  }
};

/**
 * Validates a year field
 * @param value The year to validate
 * @param required Whether the field is required
 * @returns ValidationResult object
 */
export const validateYear = (value: string, required = false): ValidationResult => {
  // If not required and empty, it's valid
  if (!required && !value.trim()) {
    return { isValid: true, message: '' };
  }

  // If required and empty, it's invalid
  if (required && !value.trim()) {
    return { isValid: false, message: 'Year is required' };
  }

  // Check if it's a valid year (4 digits, not in the future)
  const yearRegex = /^\d{4}$/;
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(value, 10);

  if (!yearRegex.test(value)) {
    return { isValid: false, message: 'Year must be a 4-digit number' };
  }

  if (yearNum > currentYear) {
    return { isValid: false, message: 'Year cannot be in the future' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates a text field with minimum length
 * @param value The text to validate
 * @param minLength Minimum required length
 * @param fieldName The name of the field for the error message
 * @returns ValidationResult object
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): ValidationResult => {
  const trimmedValue = value.trim();
  return {
    isValid: trimmedValue.length >= minLength,
    message:
      trimmedValue.length >= minLength
        ? ''
        : `${fieldName} must be at least ${minLength} characters`,
  };
};

/**
 * Validates a reference object
 * @param reference The reference object to validate
 * @returns Object with validation results for each field
 */
export const validateReference = (reference: {
  title: string;
  author: string;
  year?: string;
  url?: string;
  publisher?: string;
  type: string;
}): Record<string, ValidationResult> => {
  return {
    title: validateRequired(reference.title, 'Title'),
    author: validateRequired(reference.author, 'Author'),
    year: validateYear(reference.year || '', false),
    url: validateUrl(reference.url || '', false),
    type: validateRequired(reference.type, 'Type'),
  };
};