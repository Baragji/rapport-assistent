import React, { useState } from 'react';
import { promptService } from '../services/promptService';
import { AIError, AIErrorType } from '../services/aiClient';

export interface AIAssistButtonProps {
  /**
   * The template ID to use for generating content
   */
  templateId: string;
  
  /**
   * Parameters to pass to the template
   */
  templateParams: Record<string, string | number | boolean>;
  
  /**
   * Callback function when content is generated successfully
   */
  onContentGenerated: (content: string) => void;
  
  /**
   * Button label text
   */
  label?: string;
  
  /**
   * Icon to display next to the label
   */
  icon?: React.ReactNode;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Button size variant
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Button appearance variant
   */
  variant?: 'primary' | 'secondary' | 'outline';
  
  /**
   * Tooltip text
   */
  tooltip?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * AIAssistButton component for triggering AI-assisted content generation
 */
const AIAssistButton: React.FC<AIAssistButtonProps> = ({
  templateId,
  templateParams,
  onContentGenerated,
  label = 'AI Assist',
  icon,
  className = '',
  disabled = false,
  size = 'medium',
  variant = 'primary',
  tooltip,
  testId = 'ai-assist-button',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Size classes
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50',
  };
  
  // State-based classes
  let stateClasses = '';
  if (isLoading) {
    stateClasses = 'opacity-70 cursor-wait';
  } else if (disabled) {
    stateClasses = 'opacity-50 cursor-not-allowed';
  }
    
  // Combined classes
  const buttonClasses = `
    rounded transition-colors flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${stateClasses}
    ${className}
  `;
  
  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await promptService.generateContent(templateId, templateParams);
      
      if (!content) {
        throw new AIError(
          'Failed to generate content',
          AIErrorType.UNKNOWN,
          false
        );
      }
      
      onContentGenerated(content);
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render the appropriate icon based on state
  const renderButtonIcon = () => {
    if (isLoading) {
      return <span className="inline-block animate-spin mr-2">⟳</span>;
    }
    
    if (icon) {
      return <span className="mr-2">{icon}</span>;
    }
    
    return <span className="mr-2">✨</span>;
  };
  
  return (
    <div className="ai-assist-button-container">
      <button
        type="button"
        className={buttonClasses}
        onClick={handleClick}
        disabled={isLoading || disabled}
        title={tooltip}
        data-testid={testId}
      >
        {renderButtonIcon()}
        {label}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600" data-testid={`${testId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AIAssistButton;