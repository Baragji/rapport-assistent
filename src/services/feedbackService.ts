/**
 * Interface for feedback data
 */
export interface FeedbackData {
  /**
   * The ID of the content that was generated
   */
  contentId: string;

  /**
   * The template ID that was used to generate the content
   */
  templateId: string;

  /**
   * User rating (1-5)
   */
  rating: number;

  /**
   * Optional user comments
   */
  comments?: string;

  /**
   * Additional metadata about the generated content
   */
  metadata?: Record<string, unknown>;

  /**
   * Timestamp when the feedback was submitted
   */
  timestamp: string;
}

/**
 * Interface for feedback storage options
 */
export interface FeedbackStorageOptions {
  /**
   * Whether to store feedback in local storage
   */
  useLocalStorage?: boolean;

  /**
   * Whether to send feedback to the server
   */
  sendToServer?: boolean;

  /**
   * Custom endpoint for submitting feedback
   */
  endpoint?: string;
}

/**
 * Default storage options
 */
const DEFAULT_STORAGE_OPTIONS: FeedbackStorageOptions = {
  useLocalStorage: true,
  sendToServer: false,
  endpoint: 'https://example.com/api/feedback',
};

/**
 * Local storage key for feedback data
 */
const FEEDBACK_STORAGE_KEY = 'rapport-ai-feedback';

/**
 * Submit user feedback on AI-generated content
 *
 * @param feedback The feedback data to submit
 * @param options Storage options for the feedback
 * @returns Promise that resolves when feedback is submitted
 */
export const submitFeedback = async (
  feedback: FeedbackData,
  options: FeedbackStorageOptions = DEFAULT_STORAGE_OPTIONS
): Promise<void> => {
  // Validate the feedback data
  if (feedback.rating < 1 || feedback.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  if (!feedback.contentId) {
    throw new Error('Content ID is required');
  }

  if (!feedback.templateId) {
    throw new Error('Template ID is required');
  }

  // Store in local storage if enabled
  if (options.useLocalStorage) {
    try {
      // Get existing feedback data
      const existingData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const feedbackArray: FeedbackData[] = existingData ? JSON.parse(existingData) : [];

      // Add new feedback
      feedbackArray.push(feedback);

      // Store updated array
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackArray));
    } catch (error) {
      console.error('Failed to store feedback in local storage:', error);
      // Continue execution - local storage failure shouldn't block other methods
    }
  }

  // Send to server if enabled
  if (options.sendToServer) {
    try {
      const response = await fetch(options.endpoint || DEFAULT_STORAGE_OPTIONS.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Server returned ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('Failed to send feedback to server:', error);
      throw error;
    }
  }
};

/**
 * Get all stored feedback from local storage
 *
 * @returns Array of feedback data
 */
export const getStoredFeedback = (): FeedbackData[] => {
  try {
    const storedData = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Failed to retrieve feedback from local storage:', error);
    return [];
  }
};

/**
 * Clear all stored feedback from local storage
 */
export const clearStoredFeedback = (): void => {
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear feedback from local storage:', error);
  }
};

/**
 * Get feedback statistics
 *
 * @returns Statistics about the stored feedback
 */
export const getFeedbackStats = (): {
  totalCount: number;
  averageRating: number;
  ratingCounts: Record<number, number>;
} => {
  const feedback = getStoredFeedback();

  if (feedback.length === 0) {
    return {
      totalCount: 0,
      averageRating: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  // Calculate average rating
  const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
  const averageRating = totalRating / feedback.length;

  // Count ratings by value
  const ratingCounts = feedback.reduce(
    (counts, item) => {
      counts[item.rating] = (counts[item.rating] || 0) + 1;
      return counts;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  );

  return {
    totalCount: feedback.length,
    averageRating,
    ratingCounts,
  };
};
