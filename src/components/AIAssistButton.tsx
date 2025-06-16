import React, { useState, useEffect } from 'react';
import { useAI } from '../hooks/useAI';
import AIFeedback from './AIFeedback';
import { trackEvent } from '../services/analyticsService';
import LoadingSpinner from './LoadingSpinner';

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

  /**
   * Whether to show feedback UI after content generation
   */
  showFeedback?: boolean;

  /**
   * Animation type for the button
   */
  animation?: 'pulse' | 'bounce' | 'scale' | 'none';

  /**
   * Whether to show ripple effect on click
   */
  ripple?: boolean;
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
  showFeedback = false,
  animation = 'scale',
  ripple = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [contentId, setContentId] = useState<string>('');
  const [showFeedbackUI, setShowFeedbackUI] = useState(false);
  const [rippleEffect, setRippleEffect] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Use the AI hook for content generation
  const {
    isLoading,
    error,
    progress: aiProgress,
    generateContent,
    reset,
  } = useAI({
    streaming,
    onStream: (_chunk, progress) => {
      setProgress(progress);
    },
    onComplete: (content, metadata) => {
      // Generate a unique content ID if not provided
      const generatedContentId = (metadata?.contentId as string) || `${templateId}-${Date.now()}`;
      setContentId(generatedContentId);

      // Call the callback with the generated content
      onContentGenerated(content);

      // Show feedback UI if enabled
      if (showFeedback) {
        setShowFeedbackUI(true);
      }
    },
    onError: error => {
      console.error('Error generating content:', error);
      // Auto-clear error after 5 seconds
      setTimeout(() => reset(), 5000);

      // Hide feedback UI on error
      setShowFeedbackUI(false);
    },
  });

  // Update progress when AI progress changes
  useEffect(() => {
    setProgress(aiProgress);
  }, [aiProgress]);

  // Size classes
  const sizeClasses = {
    small: 'px-2 py-1 text-xs min-h-[36px] min-w-[36px]',
    medium: 'px-3 py-1.5 text-sm min-h-[40px] min-w-[40px]',
    large: 'px-4 py-2 text-base min-h-[44px] min-w-[44px]',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  // Animation classes
  const animationClasses = {
    pulse: 'hover:animate-pulse-custom',
    bounce: 'hover:animate-bounce',
    scale: 'transform transition-transform-200 hover:scale-105 active:scale-95',
    none: '',
  };

  // State-based classes
  let stateClasses = '';
  if (isLoading) {
    stateClasses = 'opacity-90 cursor-wait';
  } else if (disabled) {
    stateClasses = 'opacity-50 cursor-not-allowed';
  }

  // Combined classes
  const buttonClasses = `
    rounded transition-all-200 flex items-center justify-center relative overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${animationClasses[animation]}
    ${stateClasses}
    ${className}
  `;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;

    if (ripple) {
      // Calculate ripple position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Activate ripple
      setRippleEffect({ x, y, active: true });

      // Reset ripple after animation
      setTimeout(() => {
        setRippleEffect(prev => ({ ...prev, active: false }));
      }, 600);
    }

    // Track button click event
    trackEvent('button_click', 'ai_assist_button', {
      templateId,
      hasReferences: references && references.length > 0,
      referenceCount: references ? references.length : 0,
    });

    // Reset state
    reset();

    // Add references to template params if provided
    const enhancedParams = {
      ...templateParams,
    };

    // Add references context if available
    if (references && references.length > 0) {
      const referencesText = references
        .map(ref => {
          const yearText = ref.year ? ` (${ref.year})` : '';
          return `- ${ref.title} by ${ref.author}${yearText}`;
        })
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
      return (
        <LoadingSpinner
          size="small"
          variant="light"
          className="mr-2"
          testId={`${testId}-spinner`}
        />
      );
    }

    if (icon) {
      return <span className="mr-2">{icon}</span>;
    }

    return <span className="mr-2 animate-pulse-custom">✨</span>;
  };

  // Render progress bar if streaming and in progress
  const renderProgressBar = () => {
    if (isLoading && streaming && progress > 0) {
      return (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all-300"
            style={{ width: `${progress}%` }}
            data-testid={`${testId}-progress`}
          ></div>
        </div>
      );
    }
    return null;
  };

  /**
   * Handle feedback submission
   */
  const handleFeedbackSubmitted = (rating: number, comments: string) => {
    // Hide feedback UI after submission
    setShowFeedbackUI(false);

    console.log(`Feedback submitted for ${contentId}: ${rating}/5 - ${comments}`);
  };

  return (
    <div className="ai-assist-button-container w-full xs:w-auto">
      <button
        type="button"
        className={buttonClasses}
        onClick={handleClick}
        disabled={isLoading || disabled}
        title={tooltip}
        data-testid={testId}
      >
        {/* Ripple effect */}
        {ripple && rippleEffect.active && (
          <span
            className="absolute bg-white bg-opacity-30 rounded-full animate-ripple"
            style={{
              top: rippleEffect.y,
              left: rippleEffect.x,
              transform: 'translate(-50%, -50%)',
            }}
            data-testid={`${testId}-ripple`}
          />
        )}

        {renderButtonIcon()}
        <span className="whitespace-nowrap">{label}</span>
      </button>

      {renderProgressBar()}

      {error && (
        <div className="mt-2 text-sm text-red-600 animate-fade-in" data-testid={`${testId}-error`}>
          {error}
        </div>
      )}

      {showFeedbackUI && contentId && (
        <div className="mt-3 animate-fade-in-up" data-testid={`${testId}-feedback`}>
          <AIFeedback
            contentId={contentId}
            templateId={templateId}
            metadata={{
              templateParams,
              references: references.length > 0 ? references : undefined,
            }}
            onFeedbackSubmitted={handleFeedbackSubmitted}
            testId={`${testId}-feedback-component`}
          />
        </div>
      )}
    </div>
  );
};

export default AIAssistButton;
