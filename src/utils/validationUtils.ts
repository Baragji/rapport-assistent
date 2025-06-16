/**
 * Validation utilities for form fields with enhanced real-time validation
 */

export type ValidationResult = {
  isValid: boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  suggestions?: string[];
};

export type FieldValidation = {
  [key: string]: ValidationResult;
};

export type ValidationTiming = 'immediate' | 'delayed' | 'onBlur';

/**
 * Validates a required field
 * @param value The field value
 * @param fieldName The name of the field for the error message
 * @returns ValidationResult object
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const trimmedValue = value.trim();
  
  if (trimmedValue.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
      severity: 'error'
    };
  }
  
  return {
    isValid: true,
    message: ''
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
    return { 
      isValid: false, 
      message: 'URL is required',
      severity: 'error'
    };
  }

  // Check for common URL patterns without protocol
  if (value.trim() && !value.includes('://')) {
    const commonDomainPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+/;
    if (commonDomainPattern.test(value)) {
      return { 
        isValid: false, 
        message: 'URL is missing protocol (http:// or https://)',
        severity: 'warning',
        suggestions: [`https://${value}`]
      };
    }
  }

  try {
    // Check if it's a valid URL
    new URL(value);
    return { isValid: true, message: '' };
  } catch {
    return { 
      isValid: false, 
      message: 'Please enter a valid URL (e.g., https://example.com)',
      severity: 'error'
    };
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
    return { 
      isValid: false, 
      message: 'Year is required',
      severity: 'error'
    };
  }

  // Check if it's a valid year (4 digits, not in the future)
  const yearRegex = /^\d{4}$/;
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(value, 10);

  if (!yearRegex.test(value)) {
    // If it's a 2-digit year, suggest the full year
    if (/^\d{2}$/.test(value)) {
      const century = currentYear.toString().slice(0, 2);
      return { 
        isValid: false, 
        message: 'Year must be a 4-digit number',
        severity: 'warning',
        suggestions: [`${century}${value}`]
      };
    }
    
    return { 
      isValid: false, 
      message: 'Year must be a 4-digit number',
      severity: 'error'
    };
  }

  if (yearNum > currentYear) {
    return { 
      isValid: false, 
      message: 'Year cannot be in the future',
      severity: 'error'
    };
  }

  // Warn about very old years that might be typos
  if (yearNum < 1900) {
    return { 
      isValid: true, 
      message: 'This year is quite old. Please verify it is correct.',
      severity: 'warning'
    };
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
  
  if (trimmedValue.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
      severity: 'error'
    };
  }
  
  if (trimmedValue.length < minLength) {
    const remaining = minLength - trimmedValue.length;
    return {
      isValid: false,
      message: `${fieldName} must be at least ${minLength} characters (${remaining} more needed)`,
      severity: 'error'
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates a text field for maximum length
 * @param value The text to validate
 * @param maxLength Maximum allowed length
 * @param fieldName The name of the field for the error message
 * @returns ValidationResult object
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult => {
  if (value.length > maxLength) {
    const excess = value.length - maxLength;
    return {
      isValid: false,
      message: `${fieldName} must be at most ${maxLength} characters (${excess} too many)`,
      severity: 'error'
    };
  }
  
  // Warning when approaching the limit
  if (value.length > maxLength * 0.9) {
    const remaining = maxLength - value.length;
    return {
      isValid: true,
      message: `${remaining} characters remaining`,
      severity: 'warning'
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates email format
 * @param value The email to validate
 * @param required Whether the field is required
 * @returns ValidationResult object
 */
export const validateEmail = (value: string, required = false): ValidationResult => {
  // If not required and empty, it's valid
  if (!required && !value.trim()) {
    return { isValid: true, message: '' };
  }

  // If required and empty, it's invalid
  if (required && !value.trim()) {
    return { 
      isValid: false, 
      message: 'Email is required',
      severity: 'error'
    };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value)) {
    // Check for common mistakes
    if (value.includes(' ')) {
      return { 
        isValid: false, 
        message: 'Email cannot contain spaces',
        severity: 'error',
        suggestions: [value.replace(/\s+/g, '')]
      };
    }
    
    if (!value.includes('@')) {
      return { 
        isValid: false, 
        message: 'Email must contain @ symbol',
        severity: 'error'
      };
    }
    
    if (!value.includes('.')) {
      return { 
        isValid: false, 
        message: 'Email must contain a domain with a dot',
        severity: 'error'
      };
    }
    
    return { 
      isValid: false, 
      message: 'Please enter a valid email address',
      severity: 'error'
    };
  }
  
  return { isValid: true, message: '' };
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