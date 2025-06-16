import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  submitFeedback,
  getStoredFeedback,
  clearStoredFeedback,
  getFeedbackStats,
  type FeedbackData,
} from '../feedbackService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Save original localStorage
const originalLocalStorage = window.localStorage;

// Mock fetch for server submission tests
const originalFetch = global.fetch;
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: 'https://example.com',
    clone: () => ({}) as Response,
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
  } as Response)
);

describe('Feedback Service', () => {
  const mockFeedback: FeedbackData = {
    contentId: 'test-content-123',
    templateId: 'test-template',
    rating: 4,
    comments: 'This was helpful!',
    metadata: { source: 'test' },
    timestamp: '2025-01-27T12:00:00Z',
  };

  beforeEach(() => {
    // Set up localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true });
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('submitFeedback', () => {
    it('stores feedback in localStorage by default', async () => {
      await submitFeedback(mockFeedback);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rapport-ai-feedback',
        JSON.stringify([mockFeedback])
      );
    });

    it('validates rating range', async () => {
      await expect(
        submitFeedback({
          ...mockFeedback,
          rating: 6, // Invalid rating
        })
      ).rejects.toThrow('Rating must be between 1 and 5');

      await expect(
        submitFeedback({
          ...mockFeedback,
          rating: 0, // Invalid rating
        })
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('validates required fields', async () => {
      await expect(
        submitFeedback({
          ...mockFeedback,
          contentId: '', // Empty content ID
        })
      ).rejects.toThrow('Content ID is required');

      await expect(
        submitFeedback({
          ...mockFeedback,
          templateId: '', // Empty template ID
        })
      ).rejects.toThrow('Template ID is required');
    });

    it('appends to existing feedback in localStorage', async () => {
      // Store initial feedback
      await submitFeedback(mockFeedback);

      // Store another feedback
      const secondFeedback: FeedbackData = {
        ...mockFeedback,
        contentId: 'test-content-456',
        rating: 5,
      };

      await submitFeedback(secondFeedback);

      // Check that both feedbacks are stored
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rapport-ai-feedback',
        JSON.stringify([mockFeedback, secondFeedback])
      );
    });

    it('sends feedback to server when enabled', async () => {
      // Reset the mock
      vi.resetAllMocks();

      // Mock a successful response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await submitFeedback(mockFeedback, { sendToServer: true });

      // Check that fetch was called with the correct arguments
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockFeedback),
      });
    });

    it('handles server errors', async () => {
      // Mock failed fetch response
      vi.resetAllMocks();
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ message: 'Server error' }),
        } as Response)
      );

      await expect(submitFeedback(mockFeedback, { sendToServer: true })).rejects.toThrow(
        'Server error'
      );
    });

    it('uses custom endpoint when provided', async () => {
      // Reset the mock
      vi.resetAllMocks();
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      );

      await submitFeedback(mockFeedback, {
        sendToServer: true,
        endpoint: 'https://example.com/custom/feedback/endpoint',
      });

      // Check that fetch was called with the custom endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/custom/feedback/endpoint',
        expect.any(Object)
      );
    });
  });

  describe('getStoredFeedback', () => {
    it('returns empty array when no feedback is stored', () => {
      const feedback = getStoredFeedback();
      expect(feedback).toEqual([]);
    });

    it('returns stored feedback', async () => {
      // Store some feedback
      await submitFeedback(mockFeedback);

      const feedback = getStoredFeedback();
      expect(feedback).toEqual([mockFeedback]);
    });

    it('handles localStorage errors', () => {
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      // Should return empty array and log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const feedback = getStoredFeedback();

      expect(feedback).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to retrieve feedback from local storage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clearStoredFeedback', () => {
    it('removes feedback from localStorage', async () => {
      // Store some feedback
      await submitFeedback(mockFeedback);

      // Clear feedback
      clearStoredFeedback();

      // Check that localStorage.removeItem was called
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('rapport-ai-feedback');

      // Check that feedback is cleared
      expect(getStoredFeedback()).toEqual([]);
    });

    it('handles localStorage errors', () => {
      // Mock localStorage.removeItem to throw an error
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      // Should log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      clearStoredFeedback();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear feedback from local storage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getFeedbackStats', () => {
    it('returns default stats when no feedback is stored', () => {
      const stats = getFeedbackStats();

      expect(stats).toEqual({
        totalCount: 0,
        averageRating: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    });

    it('calculates stats correctly', async () => {
      // Store some feedback with different ratings
      await submitFeedback({
        ...mockFeedback,
        contentId: 'content-1',
        rating: 4,
      });

      await submitFeedback({
        ...mockFeedback,
        contentId: 'content-2',
        rating: 5,
      });

      await submitFeedback({
        ...mockFeedback,
        contentId: 'content-3',
        rating: 3,
      });

      await submitFeedback({
        ...mockFeedback,
        contentId: 'content-4',
        rating: 4,
      });

      const stats = getFeedbackStats();

      expect(stats).toEqual({
        totalCount: 4,
        averageRating: 4, // (4 + 5 + 3 + 4) / 4 = 4
        ratingCounts: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 1 },
      });
    });
  });
});
