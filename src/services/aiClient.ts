import OpenAI from 'openai';

/**
 * Custom error types for AI client operations
 */
export const AIErrorType = {
  AUTHENTICATION: 'authentication_error',
  RATE_LIMIT: 'rate_limit_error',
  SERVER: 'server_error',
  TIMEOUT: 'timeout_error',
  INVALID_REQUEST: 'invalid_request_error',
  NETWORK: 'network_error',
  UNKNOWN: 'unknown_error'
} as const;

export type AIErrorTypeValue = typeof AIErrorType[keyof typeof AIErrorType];

/**
 * Custom error class for AI operations
 */
export class AIError extends Error {
  type: AIErrorTypeValue;
  retryable: boolean;
  originalError?: unknown;

  constructor(
    message: string, 
    type: AIErrorTypeValue = AIErrorType.UNKNOWN, 
    retryable = false,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

/**
 * Configuration options for the AI client
 */
export interface AIClientConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * OpenAI client for generating AI-assisted content
 * This service handles communication with the OpenAI API
 */
export class AIClient {
  private client: OpenAI;
  private config: Required<AIClientConfig>;
  
  /**
   * Default configuration values
   */
  private static readonly DEFAULT_CONFIG: Required<AIClientConfig> = {
    apiKey: '',
    model: 'gpt-4',
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000
  };
  
  /**
   * Initialize the OpenAI client with API key from environment variables
   */
  constructor(config: AIClientConfig = {}) {
    // Merge provided config with defaults and environment variables
    this.config = {
      ...AIClient.DEFAULT_CONFIG,
      ...config,
      apiKey: config.apiKey || import.meta.env.VITE_OPENAI_API_KEY || AIClient.DEFAULT_CONFIG.apiKey
    };
    
    if (!this.config.apiKey) {
      console.error('OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    this.client = new OpenAI({
      apiKey: this.config.apiKey || 'dummy-key-for-development',
      timeout: this.config.timeout,
      dangerouslyAllowBrowser: import.meta.env.MODE === 'test' || import.meta.env.VITE_ALLOW_BROWSER === 'true',
    });
  }
  
  /**
   * Generate content using OpenAI's completion API with retry logic
   * @param prompt The prompt to send to the API
   * @returns The generated text
   * @throws AIError if all retries fail
   */
  async generateContent(prompt: string): Promise<string> {
    if (!prompt || prompt.trim() === '') {
      throw new AIError(
        'Prompt cannot be empty',
        AIErrorType.INVALID_REQUEST,
        false
      );
    }
    
    let lastError: AIError | null = null;
    
    // Try the request up to maxRetries times
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        // Add exponential backoff if this is a retry
        if (attempt > 0) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const response = await this.client.chat.completions.create({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        });
        
        // Check if we have a valid response with choices
        if (!response.choices || response.choices.length === 0) {
          throw new AIError(
            'Received empty response from OpenAI',
            AIErrorType.UNKNOWN,
            true
          );
        }
        
        // Get the content (which might be an empty string, but that's valid)
        const content = response.choices[0]?.message?.content ?? '';
        
        return content;
      } catch (error) {
        lastError = this.handleError(error);
        
        // If the error is not retryable, break immediately
        if (!lastError.retryable) {
          break;
        }
        
        // Log retry attempt
        console.warn(`Retry attempt ${attempt + 1}/${this.config.maxRetries} after error: ${lastError.message}`);
      }
    }
    
    // If we've exhausted all retries or had a non-retryable error
    throw lastError || new AIError(
      'Failed to generate AI content after multiple attempts',
      AIErrorType.UNKNOWN,
      false
    );
  }
  
  /**
   * Classify and handle errors from the OpenAI API
   * @param error The error from the API call
   * @returns A standardized AIError
   */
  private handleError(error: unknown): AIError {
    // OpenAI API errors
    if (error instanceof Error) {
      // Cast to unknown first, then to a type with status property
      const errorObj = error as unknown as { status?: number; message: string };
      
      // Handle OpenAI API errors
      const status = errorObj.status;
      
      if (status === 401 || status === 403) {
        return new AIError(
          'Authentication error: Please check your API key',
          AIErrorType.AUTHENTICATION,
          false,
          error
        );
      }
      
      if (status === 429) {
        return new AIError(
          'Rate limit exceeded: Too many requests',
          AIErrorType.RATE_LIMIT,
          true,
          error
        );
      }
      
      if (status !== undefined && status >= 500) {
        return new AIError(
          'OpenAI server error: Please try again later',
          AIErrorType.SERVER,
          true,
          error
        );
      }
      
      if (status === 408 || error.message.includes('timeout')) {
        return new AIError(
          'Request timed out: Please try again later',
          AIErrorType.TIMEOUT,
          true,
          error
        );
      }
      
      if (status === 400) {
        return new AIError(
          'Invalid request: ' + error.message,
          AIErrorType.INVALID_REQUEST,
          false,
          error
        );
      }
      
      // Network errors are generally retryable
      if (error.message.includes('network') || error.message.includes('connection')) {
        return new AIError(
          'Network error: Please check your internet connection',
          AIErrorType.NETWORK,
          true,
          error
        );
      }
    }
    
    // Default case for unknown errors
    return new AIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      AIErrorType.UNKNOWN,
      true,
      error
    );
  }
  
  /**
   * Check if the API key is valid and the service is available
   * @returns True if the service is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      // Make a minimal request to check if the API is accessible
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('AI service availability check failed:', error);
      return false;
    }
  }
}

// Export a singleton instance for use throughout the application
export const aiClient = new AIClient();

// Default export for easier imports
export default aiClient;