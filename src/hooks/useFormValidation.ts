import { useState, useCallback, useEffect, useRef } from 'react';
import type { Reference } from '../utils/documentUtils';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateReference,
  validateUrl,
  validateYear,
  validateEmail,
  type ValidationResult,
  type ValidationTiming,
} from '../utils/validationUtils';

export type FormErrors = {
  title: ValidationResult;
  content: ValidationResult;
  references: Record<number, Record<string, ValidationResult>>;
  [key: string]: ValidationResult | Record<number, Record<string, ValidationResult>>;
};

export type TouchedFields = {
  title: boolean;
  content: boolean;
  references: Record<number, Record<string, boolean>>;
  [key: string]: boolean | Record<number, Record<string, boolean>>;
};

export type DirtyFields = {
  title: boolean;
  content: boolean;
  references: Record<number, Record<string, boolean>>;
  [key: string]: boolean | Record<number, Record<string, boolean>>;
};

export type ValidationOptions = {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  validationDelay?: number;
  validateOnInit?: boolean;
  showSuccessMessages?: boolean;
};

export type FormData = {
  title: string;
  content: string;
  category: string;
  references: Reference[];
  [key: string]: unknown;
};

export type FieldValidationRules = {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: unknown) => ValidationResult;
    timing?: ValidationTiming;
    dependsOn?: string[];
  };
};

const defaultOptions: ValidationOptions = {
  validateOnChange: true,
  validateOnBlur: true,
  validateOnMount: false,
  validationDelay: 300, // ms
  validateOnInit: false,
  showSuccessMessages: true,
};

/**
 * Enhanced custom hook for real-time form validation
 * @param formData The form data to validate
 * @param options Validation options
 * @param customRules Optional custom validation rules
 * @returns Validation state and handlers
 */
export const useFormValidation = (
  formData: FormData,
  options: ValidationOptions = defaultOptions,
  customRules?: FieldValidationRules
) => {
  const [errors, setErrors] = useState<FormErrors>({
    title: { isValid: true, message: '' },
    content: { isValid: true, message: '' },
    references: {},
  });

  const [touched, setTouched] = useState<TouchedFields>({
    title: false,
    content: false,
    references: {},
  });

  const [dirty, setDirty] = useState<DirtyFields>({
    title: false,
    content: false,
    references: {},
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [fieldFocus, setFieldFocus] = useState<string | null>(null);

  // Use refs for debounced validation
  const validationTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const initialRender = useRef(true);
  const previousValues = useRef<Record<string, unknown>>({});

  // Calculate form completion percentage
  const calculateProgress = useCallback(() => {
    const requiredFields = ['title', 'content'];
    const totalFields = requiredFields.length;
    let validFields = 0;

    requiredFields.forEach(field => {
      const error = errors[field];
      if (error && 'isValid' in error && error.isValid) {
        validFields++;
      }
    });

    const progress = Math.round((validFields / totalFields) * 100);
    setValidationProgress(progress);
    return progress;
  }, [errors]);

  // Validate a single field
  const validateField = useCallback(
    (field: string, value: unknown, timing: ValidationTiming = 'immediate'): ValidationResult => {
      // Skip validation if timing doesn't match
      if (customRules?.[field]?.timing && customRules[field].timing !== timing) {
        return { isValid: true, message: '' };
      }

      // Check dependencies
      if (customRules?.[field]?.dependsOn) {
        const dependencies = customRules[field].dependsOn || [];
        const dependenciesValid = dependencies.every(dep => {
          const error = errors[dep];
          return (error && 'isValid' in error && error.isValid) || !touched[dep];
        });

        if (!dependenciesValid) {
          return {
            isValid: false,
            message: 'Please fix errors in related fields first',
            severity: 'info',
          };
        }
      }

      // Custom validation function takes precedence
      if (customRules?.[field]?.validate) {
        return customRules[field].validate!(value);
      }

      // Standard validations based on field name
      if (field === 'title') {
        return validateRequired(value as string, 'Report title');
      }

      if (field === 'content') {
        const minLengthResult = validateMinLength(value as string, 10, 'Report content');
        if (!minLengthResult.isValid) return minLengthResult;

        // Optional max length validation
        if (customRules?.content?.maxLength) {
          return validateMaxLength(
            value as string,
            customRules.content.maxLength,
            'Report content'
          );
        }

        return minLengthResult;
      }

      if (field === 'email') {
        return validateEmail(value as string, customRules?.email?.required);
      }

      if (field === 'url') {
        return validateUrl(value as string, customRules?.url?.required);
      }

      if (field === 'year') {
        return validateYear(value as string, customRules?.year?.required);
      }

      // Generic validations based on rules
      if (customRules?.[field]) {
        const rules = customRules[field];

        if (rules.required && (value === undefined || value === null || value === '')) {
          return {
            isValid: false,
            message: `${field} is required`,
            severity: 'error',
          };
        }

        if (typeof value === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            return validateMinLength(value, rules.minLength, field);
          }

          if (rules.maxLength && value.length > rules.maxLength) {
            return validateMaxLength(value, rules.maxLength, field);
          }

          if (rules.pattern && !rules.pattern.test(value)) {
            return {
              isValid: false,
              message: `${field} format is invalid`,
              severity: 'error',
            };
          }
        }
      }

      return { isValid: true, message: '' };
    },
    [errors, touched, customRules]
  );

  // Validate the entire form
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {
      title: validateField('title', formData.title, 'immediate'),
      content: validateField('content', formData.content, 'immediate'),
      references: {},
    };

    // Add custom fields from customRules
    if (customRules) {
      Object.keys(customRules).forEach(field => {
        if (field !== 'title' && field !== 'content' && field !== 'references') {
          newErrors[field] = validateField(field, formData[field], 'immediate');
        }
      });
    }

    // Validate each reference
    formData.references.forEach((reference, index) => {
      newErrors.references[index] = validateReference(reference);
    });

    setErrors(newErrors);

    // Check if the form is valid
    const isTitleValid = newErrors.title.isValid;
    const isContentValid = newErrors.content.isValid;

    // Check if all custom fields are valid
    const areCustomFieldsValid = customRules
      ? Object.keys(customRules)
          .filter(field => field !== 'title' && field !== 'content' && field !== 'references')
          .every(field => {
            const error = newErrors[field];
            return error && 'isValid' in error && error.isValid;
          })
      : true;

    // Check if all references are valid
    const areReferencesValid = Object.values(newErrors.references).every(referenceErrors => {
      return Object.values(referenceErrors).every(error => error.isValid);
    });

    const formValid = isTitleValid && isContentValid && areReferencesValid && areCustomFieldsValid;
    setIsFormValid(formValid);

    // Update progress
    calculateProgress();

    return formValid;
  }, [formData, validateField, calculateProgress, customRules]);

  // Debounced validation for a field
  const debouncedValidateField = useCallback(
    (field: string, value: unknown) => {
      // Clear any existing timer for this field
      if (validationTimers.current[field]) {
        clearTimeout(validationTimers.current[field]);
      }

      // Set a new timer
      validationTimers.current[field] = setTimeout(() => {
        const result = validateField(field, value, 'delayed');

        setErrors(prev => ({
          ...prev,
          [field]: result,
        }));

        // Update form validity
        validateForm();
      }, options.validationDelay || 300);
    },
    [validateField, validateForm, options.validationDelay]
  );

  // Handle field focus
  const handleFocus = useCallback(
    (field: string, referenceIndex?: number, referenceField?: string) => {
      if (referenceIndex !== undefined && referenceField) {
        setFieldFocus(`references[${referenceIndex}].${referenceField}`);
      } else {
        setFieldFocus(field);
      }
    },
    []
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: string, referenceIndex?: number, referenceField?: string) => {
      setFieldFocus(null);

      if (referenceIndex !== undefined && referenceField) {
        // Handle reference field blur
        setTouched(prev => ({
          ...prev,
          references: {
            ...prev.references,
            [referenceIndex]: {
              ...(prev.references[referenceIndex] || {}),
              [referenceField]: true,
            },
          },
        }));
      } else {
        // Handle main field blur
        setTouched(prev => ({
          ...prev,
          [field]: true,
        }));
      }

      if (options.validateOnBlur) {
        // Clear any pending debounced validation
        if (validationTimers.current[field]) {
          clearTimeout(validationTimers.current[field]);
          delete validationTimers.current[field];
        }

        // Validate immediately on blur
        const result = validateField(field, formData[field], 'onBlur');

        setErrors(prev => ({
          ...prev,
          [field]: result,
        }));

        validateForm();
      }
    },
    [options.validateOnBlur, validateField, validateForm, formData]
  );

  // Handle field change with real-time validation
  const handleChange = useCallback(
    (field: string, value: unknown, referenceIndex?: number, referenceField?: string) => {
      // Mark field as dirty
      if (referenceIndex !== undefined && referenceField) {
        setDirty(prev => ({
          ...prev,
          references: {
            ...prev.references,
            [referenceIndex]: {
              ...(prev.references[referenceIndex] || {}),
              [referenceField]: true,
            },
          },
        }));
      } else {
        setDirty(prev => ({
          ...prev,
          [field]: true,
        }));
      }

      // Store previous value for comparison
      previousValues.current[field] = formData[field];

      if (options.validateOnChange) {
        // Use debounced validation for better UX
        debouncedValidateField(field, value);
      }
    },
    [options.validateOnChange, debouncedValidateField, formData]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (data: FormData) => void) => {
      return (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched: TouchedFields = {
          title: true,
          content: true,
          references: {},
        };

        // Add custom fields
        if (customRules) {
          Object.keys(customRules).forEach(field => {
            if (field !== 'title' && field !== 'content' && field !== 'references') {
              allTouched[field] = true;
            }
          });
        }

        formData.references.forEach((_, index) => {
          allTouched.references[index] = {
            title: true,
            author: true,
            year: true,
            url: true,
            publisher: true,
            type: true,
          };
        });

        setTouched(allTouched);

        // Validate the form
        const isValid = validateForm();

        if (isValid) {
          onSubmit(formData);
        }

        setIsSubmitting(false);
      };
    },
    [formData, validateForm, customRules]
  );

  // Reset form validation state
  const resetValidation = useCallback(() => {
    setErrors({
      title: { isValid: true, message: '' },
      content: { isValid: true, message: '' },
      references: {},
    });

    setTouched({
      title: false,
      content: false,
      references: {},
    });

    setDirty({
      title: false,
      content: false,
      references: {},
    });

    setIsFormValid(false);
    setValidationProgress(0);
    setFieldFocus(null);

    // Clear all timers
    Object.keys(validationTimers.current).forEach(key => {
      clearTimeout(validationTimers.current[key]);
    });
    validationTimers.current = {};
    previousValues.current = {};
  }, []);

  // Validate on mount if needed
  useEffect(() => {
    if (options.validateOnMount || options.validateOnInit) {
      // Inline validation to avoid circular dependency
      const newErrors: FormErrors = {
        title: validateField('title', formData.title, 'immediate'),
        content: validateField('content', formData.content, 'immediate'),
        references: {},
      };
      
      // Validate each reference
      formData.references.forEach((reference, index) => {
        newErrors.references[index] = validateReference(reference);
      });
      
      setErrors(newErrors);
      
      // Check form validity
      const isTitleValid = newErrors.title.isValid;
      const isContentValid = newErrors.content.isValid;
      const areReferencesValid = Object.values(newErrors.references).every(referenceErrors => {
        return Object.values(referenceErrors).every(error => error.isValid);
      });
      
      setIsFormValid(isTitleValid && isContentValid && areReferencesValid);
      calculateProgress();
    }

    // Set initialRender to false after first render
    initialRender.current = false;

    // Cleanup timers on unmount
    return () => {
      Object.keys(validationTimers.current).forEach(key => {
        clearTimeout(validationTimers.current[key]);
      });
    };
  }, [options.validateOnMount, options.validateOnInit, formData, validateField, calculateProgress]);

  // Validate when form data changes if validateOnChange is true
  useEffect(() => {
    if (!initialRender.current && options.validateOnChange) {
      // Use a local version of validateForm to avoid circular dependency
      const newErrors: FormErrors = {
        title: validateField('title', formData.title, 'immediate'),
        content: validateField('content', formData.content, 'immediate'),
        references: {},
      };
      
      // Validate each reference
      formData.references.forEach((reference, index) => {
        newErrors.references[index] = validateReference(reference);
      });
      
      setErrors(newErrors);
      
      // Check form validity
      const isTitleValid = newErrors.title.isValid;
      const isContentValid = newErrors.content.isValid;
      const areReferencesValid = Object.values(newErrors.references).every(referenceErrors => {
        return Object.values(referenceErrors).every(error => error.isValid);
      });
      
      setIsFormValid(isTitleValid && isContentValid && areReferencesValid);
      calculateProgress();
    }
  }, [formData, options.validateOnChange, validateField, calculateProgress]);

  return {
    errors,
    touched,
    dirty,
    isFormValid,
    isSubmitting,
    validationProgress,
    fieldFocus,
    validateForm,
    validateField,
    handleFocus,
    handleBlur,
    handleChange,
    handleSubmit,
    setIsSubmitting,
    resetValidation,
    calculateProgress,
  };
};

export default useFormValidation;
