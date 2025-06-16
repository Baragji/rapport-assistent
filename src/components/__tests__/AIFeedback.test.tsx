// React is imported automatically by Vitest
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AIFeedback from '../AIFeedback';
import { submitFeedback } from '../../services/feedbackService';

// Mock the feedback service
vi.mock('../../services/feedbackService', () => ({
  submitFeedback: vi.fn().mockResolvedValue(undefined),
}));

describe('AIFeedback Component', () => {
  const defaultProps = {
    contentId: 'test-content-123',
    templateId: 'test-template',
    testId: 'test-feedback',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AIFeedback {...defaultProps} />);

    // Check that the component renders
    expect(screen.getByTestId('test-feedback')).toBeInTheDocument();
    expect(screen.getByText('How helpful was this AI suggestion?')).toBeInTheDocument();

    // Check that all rating buttons are rendered
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`test-feedback-rating-${i}`)).toBeInTheDocument();
    }

    // Check that the comments textarea is rendered
    expect(screen.getByTestId('test-feedback-comments')).toBeInTheDocument();

    // Check that the submit button is rendered
    expect(screen.getByTestId('test-feedback-submit')).toBeInTheDocument();
  });

  it('shows error when submitting without selecting a rating', async () => {
    render(<AIFeedback {...defaultProps} />);

    // Submit without selecting a rating
    fireEvent.click(screen.getByTestId('test-feedback-submit'));

    // Check that an error message is displayed
    expect(screen.getByTestId('test-feedback-error')).toBeInTheDocument();
    expect(screen.getByText('Please select a rating before submitting')).toBeInTheDocument();

    // Verify that submitFeedback was not called
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it('submits feedback successfully', async () => {
    const onFeedbackSubmitted = vi.fn();

    render(
      <AIFeedback
        {...defaultProps}
        onFeedbackSubmitted={onFeedbackSubmitted}
        metadata={{ source: 'test' }}
      />
    );

    // Select a rating
    fireEvent.click(screen.getByTestId('test-feedback-rating-4'));

    // Add a comment
    fireEvent.change(screen.getByTestId('test-feedback-comments'), {
      target: { value: 'This was helpful!' },
    });

    // Submit the feedback
    fireEvent.click(screen.getByTestId('test-feedback-submit'));

    // Wait for the submission to complete
    await waitFor(() => {
      expect(submitFeedback).toHaveBeenCalledWith({
        contentId: 'test-content-123',
        templateId: 'test-template',
        rating: 4,
        comments: 'This was helpful!',
        metadata: { source: 'test' },
        timestamp: expect.any(String),
      });
    });

    // Check that the callback was called
    expect(onFeedbackSubmitted).toHaveBeenCalledWith(4, 'This was helpful!');

    // Wait for the thank you message to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('test-feedback-submitted')).toBeInTheDocument();
      expect(screen.getByText('Thank you for your feedback!')).toBeInTheDocument();
    });
  });

  it('handles submission errors', async () => {
    // Mock the submitFeedback function to reject
    (submitFeedback as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<AIFeedback {...defaultProps} />);

    // Select a rating
    fireEvent.click(screen.getByTestId('test-feedback-rating-3'));

    // Submit the feedback
    fireEvent.click(screen.getByTestId('test-feedback-submit'));

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('test-feedback-error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Check that we're still on the feedback form (not showing thank you message)
    expect(screen.getByTestId('test-feedback-submit')).toBeInTheDocument();
  });

  it('updates the selected rating when clicked', () => {
    render(<AIFeedback {...defaultProps} />);

    // Select rating 2
    fireEvent.click(screen.getByTestId('test-feedback-rating-2'));

    // Check that rating 2 has the selected class
    expect(screen.getByTestId('test-feedback-rating-2')).toHaveClass('bg-blue-500');

    // Select a different rating
    fireEvent.click(screen.getByTestId('test-feedback-rating-5'));

    // Check that rating 5 now has the selected class
    expect(screen.getByTestId('test-feedback-rating-5')).toHaveClass('bg-blue-500');

    // Check that rating 2 no longer has the selected class
    expect(screen.getByTestId('test-feedback-rating-2')).not.toHaveClass('bg-blue-500');
  });
});
