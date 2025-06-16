import React, { useState } from 'react';
import { submitFeedback } from '../services/feedbackService';
import { trackEvent } from '../services/analyticsService';

export interface AIFeedbackProps {
  /**
   * The ID of the content that was generated
   */
  contentId: string;

  /**
   * The template ID that was used to generate the content
   */
  templateId: string;

  /**
   * Additional metadata about the generated content
   */
  metadata?: Record<string, unknown>;

  /**
   * Callback when feedback is submitted
   */
  onFeedbackSubmitted?: (rating: number, comments: string) => void;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * Component for collecting user feedback on AI-generated content
 */
const AIFeedback: React.FC<AIFeedbackProps> = ({
  contentId,
  templateId,
  metadata = {},
  onFeedbackSubmitted,
  className = '',
  testId = 'ai-feedback',
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /**
   * Handle rating selection
   */
  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
  };

  /**
   * Handle comments change
   */
  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === null) {
      setError('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitFeedback({
        contentId,
        templateId,
        rating,
        comments,
        metadata,
        timestamp: new Date().toISOString(),
      });

      // Track feedback submission event
      trackEvent('feedback_submit', 'ai_content_feedback', {
        templateId,
        rating,
        hasComments: comments.length > 0,
      });

      setSubmitted(true);
      onFeedbackSubmitted?.(rating, comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If feedback has been submitted, show a thank you message
  if (submitted) {
    return (
      <div
        className={`ai-feedback-submitted p-3 bg-green-50 border border-green-200 rounded-md ${className}`}
        data-testid={`${testId}-submitted`}
      >
        <p className="text-green-700 text-sm font-medium">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div
      className={`ai-feedback p-3 xs:p-4 bg-gray-50 border border-gray-200 rounded-md ${className}`}
      data-testid={testId}
    >
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        How helpful was this AI suggestion?
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Rating buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[1, 2, 3, 4, 5].map(value => (
            <button
              key={value}
              type="button"
              className={`
                min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center
                ${
                  rating === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
                transition-colors
              `}
              onClick={() => handleRatingSelect(value)}
              data-testid={`${testId}-rating-${value}`}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Comments textarea */}
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          rows={2}
          placeholder="Additional comments (optional)"
          value={comments}
          onChange={handleCommentsChange}
          data-testid={`${testId}-comments`}
        />

        {/* Error message */}
        {error && (
          <div className="mt-2 text-sm text-red-600" data-testid={`${testId}-error`}>
            {error}
          </div>
        )}

        {/* Submit button */}
        <div className="mt-2 flex justify-center xs:justify-end">
          <button
            type="submit"
            className={`
              min-h-[44px] px-3 py-1 text-sm rounded-md w-full xs:w-auto
              ${
                isSubmitting
                  ? 'bg-gray-400 cursor-wait'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            `}
            disabled={isSubmitting}
            data-testid={`${testId}-submit`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIFeedback;
