import React from 'react';
import type { Reference } from '../utils/documentUtils';

interface ReferencesProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
  disabled?: boolean;
}

const References: React.FC<ReferencesProps> = ({ references, onChange, disabled = false }) => {
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
              key={index} 
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
                  <input
                    id={`title-${index}`}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reference.title}
                    onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                    disabled={disabled}
                    required
                    data-testid={`title-input-${index}`}
                  />
                  {!reference.title && (
                    <p className="mt-1 text-sm text-red-500">Title is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`author-${index}`}>
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`author-${index}`}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reference.author}
                    onChange={(e) => handleFieldChange(index, 'author', e.target.value)}
                    disabled={disabled}
                    required
                    data-testid={`author-input-${index}`}
                  />
                  {!reference.author && (
                    <p className="mt-1 text-sm text-red-500">Author is required</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`year-${index}`}>
                    Year
                  </label>
                  <input
                    id={`year-${index}`}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reference.year || ''}
                    onChange={(e) => handleFieldChange(index, 'year', e.target.value)}
                    placeholder="YYYY"
                    disabled={disabled}
                    data-testid={`year-input-${index}`}
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`type-${index}`}>
                    Type
                  </label>
                  <select
                    id={`type-${index}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reference.type}
                    onChange={(e) => handleFieldChange(index, 'type', e.target.value as Reference['type'])}
                    disabled={disabled}
                    data-testid={`type-select-${index}`}
                  >
                    <option value="Article">Article</option>
                    <option value="Book">Book</option>
                    <option value="Website">Website</option>
                    <option value="Journal">Journal</option>
                    <option value="Conference">Conference</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`publisher-${index}`}>
                    Publisher
                  </label>
                  <input
                    id={`publisher-${index}`}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reference.publisher || ''}
                    onChange={(e) => handleFieldChange(index, 'publisher', e.target.value)}
                    disabled={disabled}
                    data-testid={`publisher-input-${index}`}
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`url-${index}`}>
                    URL
                  </label>
                  <input
                    id={`url-${index}`}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reference.url || ''}
                    onChange={(e) => handleFieldChange(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    disabled={disabled}
                    data-testid={`url-input-${index}`}
                  />
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