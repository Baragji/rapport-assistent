import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    // Check if the spinner is rendered
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();

    // Check if the spinner icon is rendered
    const spinnerIcon = screen.getByTestId('loading-spinner-icon');
    expect(spinnerIcon).toBeInTheDocument();

    // Check if the visible label is not shown by default
    const visibleLabel = screen.queryByTestId('loading-spinner-label');
    expect(visibleLabel).not.toBeInTheDocument();
  });

  it('renders with custom size and variant', () => {
    render(<LoadingSpinner size="large" variant="secondary" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();

    const spinnerIcon = screen.getByTestId('loading-spinner-icon');
    expect(spinnerIcon).toHaveClass('h-8', 'w-8'); // large size
    expect(spinnerIcon).toHaveClass('text-gray-600'); // secondary variant
  });

  it('renders with label when showLabel is true', () => {
    render(<LoadingSpinner showLabel={true} />);

    const label = screen.getByTestId('loading-spinner-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Loading...');
  });

  it('renders with custom label text', () => {
    const customLabel = 'Processing...';
    render(<LoadingSpinner showLabel={true} label={customLabel} />);

    const label = screen.getByTestId('loading-spinner-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent(customLabel);
  });

  it('renders with custom test ID', () => {
    const testId = 'custom-spinner';
    render(<LoadingSpinner testId={testId} />);

    const spinner = screen.getByTestId(testId);
    expect(spinner).toBeInTheDocument();

    const spinnerIcon = screen.getByTestId(`${testId}-icon`);
    expect(spinnerIcon).toBeInTheDocument();
  });

  it('applies additional class names', () => {
    const className = 'custom-class';
    render(<LoadingSpinner className={className} />);

    const spinnerIcon = screen.getByTestId('loading-spinner-icon');
    expect(spinnerIcon).toHaveClass(className);
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('role', 'status');

    const srText = screen.getByText('Loading...', { selector: '.sr-only' });
    expect(srText).toBeInTheDocument();
  });
});
