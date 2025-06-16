import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface AnimatedButtonProps {
  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Function to call when button is clicked
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Button type
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Whether the button is in loading state
   */
  isLoading?: boolean;

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
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Icon to display before the button text
   */
  icon?: React.ReactNode;

  /**
   * Loading spinner variant
   */
  spinnerVariant?: 'primary' | 'secondary' | 'light' | 'dark';

  /**
   * Tooltip text
   */
  tooltip?: string;

  /**
   * Test ID for testing
   */
  testId?: string;

  /**
   * Animation type
   */
  animation?: 'pulse' | 'bounce' | 'scale' | 'none';

  /**
   * Whether to show ripple effect on click
   */
  ripple?: boolean;
}

/**
 * AnimatedButton component with loading states and animations
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  isLoading = false,
  disabled = false,
  size = 'medium',
  variant = 'primary',
  className = '',
  icon,
  spinnerVariant = 'light',
  tooltip,
  testId = 'animated-button',
  animation = 'scale',
  ripple = true,
}) => {
  const [rippleEffect, setRippleEffect] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

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
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  // Animation classes
  const animationClasses = {
    pulse: 'hover:animate-pulse',
    bounce: 'hover:animate-bounce',
    scale: 'transform transition-transform duration-200 hover:scale-105 active:scale-95',
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
    rounded transition-colors flex items-center justify-center relative overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${animationClasses[animation]}
    ${stateClasses}
    ${className}
  `;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    // Call onClick handler
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
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

      {/* Button content */}
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <LoadingSpinner
            size={size === 'small' ? 'small' : 'medium'}
            variant={spinnerVariant}
            testId={`${testId}-spinner`}
          />
        ) : icon ? (
          <span className="mr-1">{icon}</span>
        ) : null}

        <span>{children}</span>
      </div>
    </button>
  );
};

export default AnimatedButton;
