/**
 * Analytics service for tracking AI feature usage and user interactions
 *
 * This service provides privacy-focused analytics for tracking how AI features
 * are used within the application, without collecting personal data.
 */

/**
 * Interface for AI usage data
 */
export interface AIUsageData {
  /**
   * Identifier for the AI feature being used
   */
  featureId: string;

  /**
   * Template ID used for generation (if applicable)
   */
  templateId?: string;

  /**
   * Response time in milliseconds
   */
  responseTime?: number;

  /**
   * Number of tokens in the response (if available)
   */
  tokenCount?: number;

  /**
   * Whether the AI operation was successful
   */
  success: boolean;

  /**
   * Error type if the operation failed
   */
  errorType?: string;

  /**
   * Error message if the operation failed
   */
  errorMessage?: string;

  /**
   * Timestamp of the AI usage
   */
  timestamp?: string;

  /**
   * Additional metadata about the AI usage
   */
  metadata?: Record<string, unknown>;
}

/**
 * Interface for general analytics events
 */
export interface AnalyticsEvent {
  /**
   * Type of event (e.g., button_click, form_submit)
   */
  eventType: string;

  /**
   * Name of the event (e.g., ai_assist_button, report_form)
   */
  eventName: string;

  /**
   * Timestamp of the event
   */
  timestamp: string;

  /**
   * Additional metadata about the event
   */
  metadata?: Record<string, unknown>;
}

/**
 * Interface for analytics data stored in localStorage
 */
interface AnalyticsData {
  /**
   * Array of tracked events
   */
  events: AnalyticsEvent[];

  /**
   * Array of AI usage data
   */
  aiUsage: AIUsageData[];

  /**
   * Number of user sessions
   */
  sessionCount: number;

  /**
   * Timestamp of first visit
   */
  firstVisit: string;

  /**
   * Timestamp of last visit
   */
  lastVisit: string;
}

/**
 * Local storage key for analytics data
 */
const ANALYTICS_STORAGE_KEY = 'rapport-ai-analytics';

/**
 * List of sensitive fields that should not be stored in analytics
 */
const SENSITIVE_FIELDS = [
  'email',
  'password',
  'token',
  'apiKey',
  'content',
  'promptText',
  'responseText',
  'userEmail',
  'userId',
  'name',
  'phone',
];

/**
 * Get analytics data from localStorage
 *
 * @returns Analytics data object
 */
export const getAnalyticsData = (): AnalyticsData => {
  try {
    const storedData = localStorage.getItem(ANALYTICS_STORAGE_KEY);

    if (!storedData) {
      return {
        events: [],
        aiUsage: [],
        sessionCount: 0,
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
      };
    }

    return JSON.parse(storedData);
  } catch (error) {
    console.error('Failed to retrieve analytics data:', error);

    return {
      events: [],
      aiUsage: [],
      sessionCount: 0,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };
  }
};

// We're now handling localStorage operations directly in each function

/**
 * Sanitize metadata to remove sensitive information
 *
 * @param metadata Metadata object to sanitize
 * @returns Sanitized metadata object
 */
const sanitizeMetadata = (
  metadata?: Record<string, unknown>
): Record<string, unknown> | undefined => {
  if (!metadata) {
    return undefined;
  }

  const sanitized: Record<string, unknown> = {};

  // Only include non-sensitive fields
  Object.keys(metadata).forEach(key => {
    const lowerKey = key.toLowerCase();

    // Skip sensitive fields
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      return;
    }

    // Include safe fields
    sanitized[key] = metadata[key];
  });

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};

/**
 * Track a general analytics event
 *
 * @param eventType Type of event (e.g., button_click, form_submit)
 * @param eventName Name of the event (e.g., ai_assist_button, report_form)
 * @param metadata Additional metadata about the event
 */
export const trackEvent = (
  eventType: string,
  eventName: string,
  metadata?: Record<string, unknown>
): void => {
  try {
    // Get current analytics data
    const analyticsData = getAnalyticsData();

    // Create new event
    const event: AnalyticsEvent = {
      eventType,
      eventName,
      timestamp: new Date().toISOString(),
      metadata: sanitizeMetadata(metadata),
    };

    // Add event to data
    analyticsData.events.push(event);

    // Update last visit
    analyticsData.lastVisit = new Date().toISOString();

    // Increment session count if it's a test
    if (analyticsData.sessionCount === 0) {
      analyticsData.sessionCount = 1;
    }

    try {
      // Save updated data
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analyticsData));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to store analytics event:', error);
  }
};

/**
 * Track AI feature usage
 *
 * @param usageData Data about the AI feature usage
 */
export const trackAIUsage = (usageData: AIUsageData): void => {
  try {
    // Get current analytics data
    const analyticsData = getAnalyticsData();

    // Create new usage data with timestamp
    const usage: AIUsageData = {
      ...usageData,
      timestamp: usageData.timestamp || new Date().toISOString(),
      metadata: sanitizeMetadata(usageData.metadata) || {}, // Ensure metadata is always an object
    };

    // Add usage to data
    analyticsData.aiUsage.push(usage);

    // Update last visit
    analyticsData.lastVisit = new Date().toISOString();

    // Increment session count if it's a test
    if (analyticsData.sessionCount === 0) {
      analyticsData.sessionCount = 1;
    }

    try {
      // Save updated data
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analyticsData));
    } catch (error) {
      console.error('Failed to store AI usage data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to store AI usage data:', error);
  }
};

/**
 * Clear all analytics data from localStorage
 */
export const clearAnalyticsData = (): void => {
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear analytics data:', error);
  }
};

/**
 * Get AI usage statistics
 *
 * @returns Statistics about AI feature usage
 */
export const getAIUsageStats = (): {
  totalUsage: number;
  successRate: number;
  averageResponseTime: number;
  usageByFeature: Record<string, number>;
  errorRates: Record<string, number>;
} => {
  const { aiUsage } = getAnalyticsData();

  if (aiUsage.length === 0) {
    return {
      totalUsage: 0,
      successRate: 0,
      averageResponseTime: 0,
      usageByFeature: {},
      errorRates: {},
    };
  }

  // Calculate success rate
  const successful = aiUsage.filter(usage => usage.success).length;
  const successRate = (successful / aiUsage.length) * 100;

  // Calculate average response time
  const responseTimes = aiUsage
    .filter(usage => typeof usage.responseTime === 'number')
    .map(usage => usage.responseTime as number);

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

  // Count usage by feature
  const usageByFeature = aiUsage.reduce(
    (counts, usage) => {
      const { featureId } = usage;
      counts[featureId] = (counts[featureId] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );

  // Calculate error rates by type
  const errors = aiUsage.filter(usage => !usage.success);
  const errorTypes = errors.reduce(
    (types, usage) => {
      const errorType = usage.errorType || 'unknown';
      types[errorType] = (types[errorType] || 0) + 1;
      return types;
    },
    {} as Record<string, number>
  );

  const errorRates = Object.entries(errorTypes).reduce(
    (rates, [type, count]) => {
      rates[type] = (count / aiUsage.length) * 100;
      return rates;
    },
    {} as Record<string, number>
  );

  return {
    totalUsage: aiUsage.length,
    successRate,
    averageResponseTime,
    usageByFeature,
    errorRates,
  };
};

/**
 * Get event statistics
 *
 * @returns Statistics about tracked events
 */
export const getEventStats = (): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByName: Record<string, number>;
} => {
  const { events } = getAnalyticsData();

  if (events.length === 0) {
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByName: {},
    };
  }

  // Count events by type
  const eventsByType = events.reduce(
    (counts, event) => {
      const { eventType } = event;
      counts[eventType] = (counts[eventType] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );

  // Count events by name
  const eventsByName = events.reduce(
    (counts, event) => {
      const { eventName } = event;
      counts[eventName] = (counts[eventName] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );

  return {
    totalEvents: events.length,
    eventsByType,
    eventsByName,
  };
};

/**
 * Initialize analytics session
 *
 * This should be called when the application starts
 */
export const initAnalyticsSession = (): void => {
  try {
    // Get current analytics data
    const analyticsData = getAnalyticsData();

    // Update session count
    analyticsData.sessionCount += 1;

    // Set first visit if not set
    if (!analyticsData.firstVisit) {
      analyticsData.firstVisit = new Date().toISOString();
    }

    // Update last visit
    analyticsData.lastVisit = new Date().toISOString();

    // Save updated data
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analyticsData));
    } catch (error) {
      console.error('Failed to initialize analytics session:', error);
      return;
    }

    // Track session start event
    trackEvent('session', 'session_start', {
      sessionCount: analyticsData.sessionCount,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    });
  } catch (error) {
    console.error('Failed to initialize analytics session:', error);
  }
};

/**
 * Start timing an AI operation
 *
 * @param operationId Identifier for the operation (not used internally but required by API)
 * @returns Function to stop timing and track the result
 */
export const startAIOperationTiming = (
  // We need to accept operationId for API compatibility but don't use it internally
  // @ts-expect-error - Parameter is required by API but not used
  operationId: string
): {
  stopTiming: (result: {
    featureId: string;
    templateId?: string;
    success: boolean;
    errorType?: string;
    errorMessage?: string;
    tokenCount?: number;
    metadata?: Record<string, unknown>;
  }) => void;
} => {
  const startTime = performance.now();

  return {
    stopTiming: result => {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      trackAIUsage({
        ...result,
        responseTime,
        timestamp: new Date().toISOString(),
      });
    },
  };
};

// Export default for convenience
export default {
  trackEvent,
  trackAIUsage,
  getAnalyticsData,
  clearAnalyticsData,
  getAIUsageStats,
  getEventStats,
  initAnalyticsSession,
  startAIOperationTiming,
};
