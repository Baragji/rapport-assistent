import { useState, useCallback, useEffect } from 'react';
import type { Reference } from '../utils/documentUtils';
import {
  validateRequired,
  validateMinLength,
  validateReference,
  type ValidationResult,
} from '../utils/validationUtils';

export type FormErrors = {
  title: ValidationResult;
  content: ValidationResult;
  references: Record<number, Record<string, ValidationResult>>;
};

export type TouchedFields = {
  title: boolean;
  content: boolean;
  references: Record<number, Record<string, boolean>>;
};

export type ValidationOptions = {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
};

export type FormData = {
  title: string;
  content: string;
  category: string;
  references: Reference[];
};

const defaultOptions: ValidationOptions = {
  validateOnChange: true,
  validateOnBlur: true,
  validateOnMount: false,
};

/**
 * Custom hook for form validation
 * @param formData The form data to validate
 * @param options Validation options
 * @returns Validation state and handlers
 */
export const useFormValidation = (
  formData: FormData,
  options: ValidationOptions = defaultOptions
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

  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the entire form
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {
      title: validateRequired(formData.title, 'Report title'),
      content: validateMinLength(formData.content, 10, 'Report content'),
      references: {},
    };

    // Validate each reference
    formData.references.forEach((reference, index) => {
      newErrors.references[index] = validateReference(reference);
    });

    setErrors(newErrors);

    // Check if the form is valid
    const isTitleValid = newErrors.title.isValid;
    const isContentValid = newErrors.content.isValid;
    
    // Check if all references are valid
    const areReferencesValid = Object.values(newErrors.references).every((referenceErrors) => {
      return Object.values(referenceErrors).every((error) => error.isValid);
    });

    setIsFormValid(isTitleValid && isContentValid && areReferencesValid);
    
    return isTitleValid && isContentValid && areReferencesValid;
  }, [formData]);

  // Handle field blur
  const handleBlur = useCallback(
    (field: string, referenceIndex?: number, referenceField?: string) => {
      if (referenceIndex !== undefined && referenceField) {
        // Handle reference field blur
        setTouched((prev) => ({
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
        setTouched((prev) => ({
          ...prev,
          [field]: true,
        }));
      }

      if (options.validateOnBlur) {
        validateForm();
      }
    },
    [options.validateOnBlur, validateForm]
  );

  // Handle field change
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_field: string, _value: string, _referenceIndex?: number, _referenceField?: string) => {
      if (options.validateOnChange) {
        validateForm();
      }
    },
    [options.validateOnChange, validateForm]
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
    [formData, validateForm]
  );

  // Validate on mount if needed
  useEffect(() => {
    if (options.validateOnMount) {
      validateForm();
    }
  }, [options.validateOnMount, validateForm]);

  // Validate when form data changes if validateOnChange is true
  useEffect(() => {
    if (options.validateOnChange) {
      validateForm();
    }
  }, [formData, options.validateOnChange, validateForm]);

  return {
    errors,
    touched,
    isFormValid,
    isSubmitting,
    validateForm,
    handleBlur,
    handleChange,
    handleSubmit,
    setIsSubmitting,
  };
};

export default useFormValidation;