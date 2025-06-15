import React, { useState, useEffect } from 'react';
import { useAI } from '../hooks/useAI';

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
  
  /**
   * Whether to use streaming responses
   */
  streaming?: boolean;
  
  /**
   * References to include in the context
   */
  references?: Array<{
    title: string;
    author: string;
    year?: string;
    url?: string;
    publisher?: string;
    type?: string;
  }>;
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
  streaming = true,
  references = [],
}) => {
  const [progress, setProgress] = useState(0);
  
  // Use the AI hook for content generation
  const {
    isLoading,
    error,
    progress: aiProgress,
    generateContent,
    reset
  } = useAI({
    streaming,
    onStream: (_chunk, progress) => {
      setProgress(progress);
    },
    onComplete: (content) => {
      onContentGenerated(content);
    },
    onError: (error) => {
      console.error('Error generating content:', error);
      // Auto-clear error after 5 seconds
      setTimeout(() => reset(), 5000);
    }
  });
  
  // Update progress when AI progress changes
  useEffect(() => {
    setProgress(aiProgress);
  }, [aiProgress]);
  
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
    
    // Reset state
    reset();
    
    // Add references to template params if provided
    const enhancedParams = {
      ...templateParams
    };
    
    // Add references context if available
    if (references && references.length > 0) {
      const referencesText = references
        .map(ref => `- ${ref.title} by ${ref.author}${ref.year ? ` (${ref.year})` : ''}`)
        .join('\n');
      
      enhancedParams.references = referencesText;
    }
    
    try {
      // Generate content using the template
      await generateContent(templateId, enhancedParams);
    } catch (err) {
      // Error handling is done in the useAI hook
      console.error('Error in handleClick:', err);
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
  
  // Render progress bar if streaming and in progress
  const renderProgressBar = () => {
    if (isLoading && streaming && progress > 0) {
      return (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
            data-testid={`${testId}-progress`}
          ></div>
        </div>
      );
    }
    return null;
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
      
      {renderProgressBar()}
      
      {error && (
        <div className="mt-2 text-sm text-red-600" data-testid={`${testId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AIAssistButton;