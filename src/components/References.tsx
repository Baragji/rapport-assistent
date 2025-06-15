import React from 'react';
import type { Reference } from '../utils/documentUtils';
import type { ValidationResult } from '../utils/validationUtils';

interface ReferencesProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
  disabled?: boolean;
  errors?: Record<number, Record<string, ValidationResult>>;
  touched?: Record<number, Record<string, boolean>>;
  onBlur?: (index: number, field: string) => void;
}

const References: React.FC<ReferencesProps> = ({ 
  references, 
  onChange, 
  disabled = false,
  errors = {},
  touched = {},
  onBlur
}) => {
  // Default empty reference
  const emptyReference: Reference = {
    title: '',
    author: '',
    type: 'Article',
  };

  // Add a new reference
  const handleAddReference = () => {
    onChange([...references, { ...emptyReference }]);
  };

  // Remove a reference at a specific index
  const handleRemoveReference = (index: number) => {
    const updatedReferences = [...references];
    updatedReferences.splice(index, 1);
    onChange(updatedReferences);
  };

  // Move a reference up in the list
  const handleMoveUp = (index: number) => {
    if (index === 0) return; // Can't move up if already at the top
    const updatedReferences = [...references];
    const temp = updatedReferences[index];
    updatedReferences[index] = updatedReferences[index - 1];
    updatedReferences[index - 1] = temp;
    onChange(updatedReferences);
  };

  // Move a reference down in the list
  const handleMoveDown = (index: number) => {
    if (index === references.length - 1) return; // Can't move down if already at the bottom
    const updatedReferences = [...references];
    const temp = updatedReferences[index];
    updatedReferences[index] = updatedReferences[index + 1];
    updatedReferences[index + 1] = temp;
    onChange(updatedReferences);
  };

  // Update a specific field of a reference
  const handleFieldChange = (index: number, field: keyof Reference, value: string) => {
    const updatedReferences = [...references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [field]: value,
    };
    onChange(updatedReferences);
  };

  // Handle field blur for validation
  const handleFieldBlur = (index: number, field: string) => {
    if (onBlur) {
      onBlur(index, field);
    }
  };

  // Get validation state for a reference field
  const getValidationState = (index: number, field: string) => {
    if (!touched[index] || !touched[index][field]) return null;
    return errors[index] && errors[index][field] && !errors[index][field].isValid ? 'invalid' : 'valid';
  };

  // Get validation class for a reference field
  const getValidationClass = (index: number, field: string) => {
    const state = getValidationState(index, field);
    if (state === 'valid') return 'border-green-500 focus:ring-green-500';
    if (state === 'invalid') return 'border-red-500 focus:ring-red-500';
    return 'border-gray-300 focus:ring-blue-500';
  };

  return (
    <div className="references-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">References</h3>
        <button
          type="button"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          onClick={handleAddReference}
          disabled={disabled}
          data-testid="add-reference-button"
        >
          Add Reference
        </button>
      </div>

      {references.length === 0 ? (
        <div className="text-gray-500 italic mb-4">No references added yet.</div>
      ) : (
        <div className="space-y-4">
          {references.map((reference, index) => (
            <div 
              key={`reference-${index}-${reference.title.substring(0, 10)}`} 
              className="reference-item p-4 border border-gray-200 rounded-md bg-gray-50"
              data-testid={`reference-item-${index}`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">Reference #{index + 1}</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || disabled}
                    title="Move Up"
                    data-testid={`move-up-${index}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === references.length - 1 || disabled}
                    title="Move Down"
                    data-testid={`move-down-${index}`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                    onClick={() => handleRemoveReference(index)}
                    disabled={disabled}
                    title="Remove"
                    data-testid={`remove-reference-${index}`}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`title-${index}`}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id={`title-${index}`}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getValidationClass(index, 'title')}`}
                      value={reference.title}
                      onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                      onBlur={() => handleFieldBlur(index, 'title')}
                      disabled={disabled}
                      required
                      data-testid={`title-input-${index}`}
                      aria-invalid={getValidationState(index, 'title') === 'invalid'}
                      aria-describedby={`title-error-${index}`}
                    />
                    {getValidationState(index, 'title') === 'valid' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched[index]?.title && errors[index]?.title && !errors[index]?.title.isValid && (
                    <p className="mt-1 text-sm text-red-600" id={`title-error-${index}`}>
                      {errors[index]?.title.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`author-${index}`}>
                    Author <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id={`author-${index}`}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getValidationClass(index, 'author')}`}
                      value={reference.author}
                      onChange={(e) => handleFieldChange(index, 'author', e.target.value)}
                      onBlur={() => handleFieldBlur(index, 'author')}
                      disabled={disabled}
                      required
                      data-testid={`author-input-${index}`}
                      aria-invalid={getValidationState(index, 'author') === 'invalid'}
                      aria-describedby={`author-error-${index}`}
                    />
                    {getValidationState(index, 'author') === 'valid' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched[index]?.author && errors[index]?.author && !errors[index]?.author.isValid && (
                    <p className="mt-1 text-sm text-red-600" id={`author-error-${index}`}>
                      {errors[index]?.author.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`year-${index}`}>
                    Year
                  </label>
                  <div className="relative">
                    <input
                      id={`year-${index}`}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getValidationClass(index, 'year')}`}
                      value={reference.year || ''}
                      onChange={(e) => handleFieldChange(index, 'year', e.target.value)}
                      onBlur={() => handleFieldBlur(index, 'year')}
                      placeholder="YYYY"
                      disabled={disabled}
                      data-testid={`year-input-${index}`}
                      aria-invalid={getValidationState(index, 'year') === 'invalid'}
                      aria-describedby={`year-error-${index}`}
                    />
                    {getValidationState(index, 'year') === 'valid' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched[index]?.year && errors[index]?.year && !errors[index]?.year.isValid && (
                    <p className="mt-1 text-sm text-red-600" id={`year-error-${index}`}>
                      {errors[index]?.year.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`type-${index}`}>
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id={`type-${index}`}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getValidationClass(index, 'type')}`}
                      value={reference.type}
                      onChange={(e) => handleFieldChange(index, 'type', e.target.value as Reference['type'])}
                      onBlur={() => handleFieldBlur(index, 'type')}
                      disabled={disabled}
                      data-testid={`type-select-${index}`}
                      aria-invalid={getValidationState(index, 'type') === 'invalid'}
                      aria-describedby={`type-error-${index}`}
                    >
                      <option value="Article">Article</option>
                      <option value="Book">Book</option>
                      <option value="Website">Website</option>
                      <option value="Journal">Journal</option>
                      <option value="Conference">Conference</option>
                      <option value="Other">Other</option>
                    </select>
                    {getValidationState(index, 'type') === 'valid' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched[index]?.type && errors[index]?.type && !errors[index]?.type.isValid && (
                    <p className="mt-1 text-sm text-red-600" id={`type-error-${index}`}>
                      {errors[index]?.type.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`publisher-${index}`}>
                    Publisher
                  </label>
                  <div className="relative">
                    <input
                      id={`publisher-${index}`}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getValidationClass(index, 'publisher')}`}
                      value={reference.publisher || ''}
                      onChange={(e) => handleFieldChange(index, 'publisher', e.target.value)}
                      onBlur={() => handleFieldBlur(index, 'publisher')}
                      disabled={disabled}
                      data-testid={`publisher-input-${index}`}
                      aria-invalid={getValidationState(index, 'publisher') === 'invalid'}
                      aria-describedby={`publisher-error-${index}`}
                    />
                    {getValidationState(index, 'publisher') === 'valid' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched[index]?.publisher && errors[index]?.publisher && !errors[index]?.publisher.isValid && (
                    <p className="mt-1 text-sm text-red-600" id={`publisher-error-${index}`}>
                      {errors[index]?.publisher.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`url-${index}`}>
                    URL
                  </label>
                  <div className="relative">
                    <input
                      id={`url-${index}`}
                      type="url"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getValidationClass(index, 'url')}`}
                      value={reference.url || ''}
                      onChange={(e) => handleFieldChange(index, 'url', e.target.value)}
                      onBlur={() => handleFieldBlur(index, 'url')}
                      placeholder="https://example.com"
                      disabled={disabled}
                      data-testid={`url-input-${index}`}
                      aria-invalid={getValidationState(index, 'url') === 'invalid'}
                      aria-describedby={`url-error-${index}`}
                    />
                    {getValidationState(index, 'url') === 'valid' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {touched[index]?.url && errors[index]?.url && !errors[index]?.url.isValid && (
                    <p className="mt-1 text-sm text-red-600" id={`url-error-${index}`}>
                      {errors[index]?.url.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default References;