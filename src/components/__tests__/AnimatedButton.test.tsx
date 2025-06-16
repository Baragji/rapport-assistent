import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnimatedButton from '../AnimatedButton';

// Mock the LoadingSpinner component
vi.mock('../LoadingSpinner', () => ({
  default: ({ size, variant, testId }: { size: string; variant: string; testId: string }) => (
    <div data-testid={testId} data-size={size} data-variant={variant}>
      Loading...
    </div>
  ),
}));

describe('AnimatedButton', () => {
  it('renders with default props', () => {
    render(<AnimatedButton>Click me</AnimatedButton>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600'); // primary variant
    expect(button).not.toBeDisabled();
  });

  it('renders in loading state', () => {
    render(<AnimatedButton isLoading>Click me</AnimatedButton>);

    const button = screen.getByTestId('animated-button');
    expect(button).toHaveClass('cursor-wait');

    const spinner = screen.getByTestId('animated-button-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<AnimatedButton disabled>Click me</AnimatedButton>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<AnimatedButton variant="primary">Primary</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<AnimatedButton variant="secondary">Secondary</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');

    rerender(<AnimatedButton variant="outline">Outline</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('border-blue-600');

    rerender(<AnimatedButton variant="success">Success</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-green-600');

    rerender(<AnimatedButton variant="danger">Danger</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<AnimatedButton size="small">Small</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('text-xs');

    rerender(<AnimatedButton size="medium">Medium</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('text-sm');

    rerender(<AnimatedButton size="large">Large</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('text-base');
  });

  it('renders with different animation types', () => {
    const { rerender } = render(<AnimatedButton animation="pulse">Pulse</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('hover:animate-pulse');

    rerender(<AnimatedButton animation="bounce">Bounce</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('hover:animate-bounce');

    rerender(<AnimatedButton animation="scale">Scale</AnimatedButton>);
    expect(screen.getByRole('button')).toHaveClass('hover:scale-105');

    rerender(<AnimatedButton animation="none">None</AnimatedButton>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('hover:animate-pulse');
    expect(button).not.toHaveClass('hover:animate-bounce');
    expect(button).not.toHaveClass('hover:scale-105');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<AnimatedButton onClick={handleClick}>Click me</AnimatedButton>);

    fireEvent.click(screen.getByTestId('animated-button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <AnimatedButton onClick={handleClick} disabled>
        Click me
      </AnimatedButton>
    );

    fireEvent.click(screen.getByTestId('animated-button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(
      <AnimatedButton onClick={handleClick} isLoading>
        Click me
      </AnimatedButton>
    );

    fireEvent.click(screen.getByTestId('animated-button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with an icon', () => {
    const icon = <span data-testid="test-icon">🔍</span>;
    render(<AnimatedButton icon={icon}>With Icon</AnimatedButton>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders with custom class name', () => {
    const className = 'custom-class';
    render(<AnimatedButton className={className}>Custom Class</AnimatedButton>);

    expect(screen.getByRole('button')).toHaveClass(className);
  });

  it('renders with tooltip', () => {
    const tooltip = 'Button tooltip';
    render(<AnimatedButton tooltip={tooltip}>With Tooltip</AnimatedButton>);

    expect(screen.getByRole('button')).toHaveAttribute('title', tooltip);
  });

  it('renders with custom test ID', () => {
    const testId = 'custom-button';
    render(<AnimatedButton testId={testId}>Custom Test ID</AnimatedButton>);

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders ripple effect when clicked', () => {
    render(
      <AnimatedButton ripple={true} testId="ripple-button">
        With Ripple
      </AnimatedButton>
    );

    const button = screen.getByTestId('ripple-button');
    fireEvent.click(button, { clientX: 50, clientY: 50 });

    const ripple = screen.getByTestId('ripple-button-ripple');
    expect(ripple).toBeInTheDocument();
    expect(ripple).toHaveClass('animate-ripple');
  });
});
