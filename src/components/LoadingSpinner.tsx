import React from 'react';

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Color variant of the spinner
   */
  variant?: 'primary' | 'secondary' | 'light' | 'dark';

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Whether to show a label next to the spinner
   */
  showLabel?: boolean;

  /**
   * Custom label text (defaults to "Loading...")
   */
  label?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * LoadingSpinner component for displaying loading states
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'primary',
  className = '',
  showLabel = false,
  label = 'Loading...',
  testId = 'loading-spinner',
}) => {
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
  };

  // Variant classes
  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    light: 'text-white',
    dark: 'text-gray-800',
  };

  // Combined classes
  const spinnerClasses = `
    inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent
    motion-reduce:animate-[spin_1.5s_linear_infinite]
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <div className="inline-flex items-center gap-2" role="status" data-testid={testId}>
      <div className={spinnerClasses} data-testid={`${testId}-icon`}>
        <span className="sr-only">Loading...</span>
      </div>
      {showLabel && (
        <span className={`text-sm ${variantClasses[variant]}`} data-testid={`${testId}-label`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
