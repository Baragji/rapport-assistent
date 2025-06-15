import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIClient, AIError, AIErrorType } from '../aiClient';
import OpenAI from 'openai';

// Mock the OpenAI module
vi.mock('openai', () => {
  const OpenAIMock = vi.fn();
  OpenAIMock.prototype.chat = {
    completions: {
      create: vi.fn()
    }
  };
  OpenAIMock.prototype.models = {
    list: vi.fn()
  };
  return { default: OpenAIMock };
});

describe('AIClient', () => {
  let aiClient: AIClient;
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockModelsList: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Setup the mock implementation
    mockCreate = vi.fn();
    mockModelsList = vi.fn();
    
    // @ts-expect-error - Mocking the OpenAI client
    OpenAI.prototype.chat.completions.create = mockCreate;
    // @ts-expect-error - Mocking the OpenAI client
    OpenAI.prototype.models.list = mockModelsList;
    
    // Create a new client instance with a test API key
    aiClient = new AIClient({
      apiKey: 'test-api-key',
      maxRetries: 2,
      retryDelay: 10 // Short delay for tests
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('should initialize with default config when no config is provided', () => {
      const client = new AIClient();
      expect(client).toBeInstanceOf(AIClient);
    });
    
    it('should use provided config values', () => {
      const client = new AIClient({
        apiKey: 'custom-key',
        model: 'custom-model',
        maxRetries: 5
      });
      expect(client).toBeInstanceOf(AIClient);
      // We can't directly test private properties, but we can test behavior
    });
  });
  
  describe('generateContent', () => {
    it('should successfully generate content', async () => {
      const expectedResponse = {
        choices: [
          {
            message: {
              content: 'Generated content'
            }
          }
        ]
      };
      
      mockCreate.mockResolvedValueOnce(expectedResponse);
      
      const result = await aiClient.generateContent('Test prompt');
      
      expect(result).toBe('Generated content');
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test prompt' }],
        temperature: 0.7,
        max_tokens: 1000
      });
    });
    
    it('should throw an error for empty prompts', async () => {
      await expect(aiClient.generateContent('')).rejects.toThrow(AIError);
      await expect(aiClient.generateContent('')).rejects.toMatchObject({
        type: AIErrorType.INVALID_REQUEST,
        retryable: false
      });
      
      expect(mockCreate).not.toHaveBeenCalled();
    });
    
    it('should retry on retryable errors', async () => {
      // First call fails with a retryable error
      const rateLimitError = new Error('Rate limit exceeded');
      Object.assign(rateLimitError, { status: 429 });
      
      mockCreate.mockRejectedValueOnce(rateLimitError);
      
      // Second call succeeds
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Generated after retry'
            }
          }
        ]
      });
      
      const result = await aiClient.generateContent('Test prompt');
      
      expect(result).toBe('Generated after retry');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });
    
    it('should not retry on non-retryable errors', async () => {
      // Call fails with a non-retryable error
      const authError = { 
        status: 401, 
        message: 'Invalid API key' 
      };
      
      // Create a proper Error object with the status property
      const error = new Error('Invalid API key');
      Object.assign(error, authError);
      
      mockCreate.mockRejectedValueOnce(error);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
      
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
    
    it('should throw after exhausting all retries', async () => {
      // All calls fail with retryable errors
      const serverError = new Error('Server error');
      Object.assign(serverError, { status: 500 });
      
      mockCreate.mockRejectedValueOnce(serverError);
      mockCreate.mockRejectedValueOnce(serverError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
      
      expect(mockCreate).toHaveBeenCalledTimes(2); // maxRetries is 2
    });
    
    it('should handle empty responses', async () => {
      // Mock a valid response with empty content
      mockCreate.mockResolvedValueOnce({
        choices: [{ 
          message: { 
            content: '' 
          } 
        }]
      });
      
      // This should not throw an error since the content is empty but valid
      const result = await aiClient.generateContent('Test prompt');
      expect(result).toBe('');
    });
    
    it('should handle missing response data', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: []
      });
      
      try {
        await aiClient.generateContent('Test prompt');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(AIError);
      }
    });
  });
  
  describe('checkAvailability', () => {
    it('should return true when the service is available', async () => {
      mockModelsList.mockResolvedValueOnce({ data: [] });
      
      const result = await aiClient.checkAvailability();
      
      expect(result).toBe(true);
      expect(mockModelsList).toHaveBeenCalledTimes(1);
    });
    
    it('should return false when the service is unavailable', async () => {
      mockModelsList.mockRejectedValueOnce(new Error('Service unavailable'));
      
      const result = await aiClient.checkAvailability();
      
      expect(result).toBe(false);
      expect(mockModelsList).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid API key');
      Object.assign(authError, { status: 401 });
      
      mockCreate.mockRejectedValueOnce(authError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
    });
    
    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      Object.assign(rateLimitError, { status: 429 });
      
      mockCreate.mockRejectedValueOnce(rateLimitError);
      mockCreate.mockRejectedValueOnce(rateLimitError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
    });
    
    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      Object.assign(serverError, { status: 500 });
      
      mockCreate.mockRejectedValueOnce(serverError);
      mockCreate.mockRejectedValueOnce(serverError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
    });
    
    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      Object.assign(timeoutError, { status: 408 });
      
      mockCreate.mockRejectedValueOnce(timeoutError);
      mockCreate.mockRejectedValueOnce(timeoutError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
    });
    
    it('should handle invalid request errors', async () => {
      const invalidRequestError = new Error('Invalid request parameters');
      Object.assign(invalidRequestError, { status: 400 });
      
      mockCreate.mockRejectedValueOnce(invalidRequestError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
    });
    
    it('should handle network errors', async () => {
      const networkError = new Error('network error occurred');
      
      mockCreate.mockRejectedValueOnce(networkError);
      mockCreate.mockRejectedValueOnce(networkError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
    });
    
    it('should handle unknown errors', async () => {
      const unknownError = new Error('Unknown error');
      
      mockCreate.mockRejectedValueOnce(unknownError);
      mockCreate.mockRejectedValueOnce(unknownError);
      
      await expect(aiClient.generateContent('Test prompt')).rejects.toThrow(AIError);
    });
  });
});