import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIClient, AIError, AIErrorType, type StreamCallback } from '../aiClient';
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

// Mock the import.meta.env
vi.mock('../../../vite-env.d.ts', () => ({
  import: {
    meta: {
      env: {
        MODE: 'test',
        VITE_OPENAI_API_KEY: 'test-env-key',
        VITE_ALLOW_BROWSER: 'true'
      }
    }
  }
}));

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
    
    // We need to mock the OpenAI client methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (OpenAI.prototype as any).chat = { 
      completions: { 
        create: mockCreate 
      } 
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (OpenAI.prototype as any).models = { 
      list: mockModelsList 
    };
    
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
    
    it('should use environment API key when no key is provided', () => {
      // Save original env
      const originalEnv = { ...import.meta.env };
      
      // Mock environment variable
      vi.stubGlobal('import.meta.env', {
        ...import.meta.env,
        VITE_OPENAI_API_KEY: 'env-api-key',
        MODE: 'test'
      });
      
      const client = new AIClient();
      expect(client).toBeInstanceOf(AIClient);
      
      // Restore original env
      vi.stubGlobal('import.meta.env', originalEnv);
    });
    
    it('should log error when API key is missing', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create client with empty API key and no environment fallback
      const client = new AIClient({ apiKey: '' });
      expect(client).toBeInstanceOf(AIClient);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI API key is missing')
      );
      
      consoleSpy.mockRestore();
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
    
    it('should use custom model when provided', async () => {
      const customClient = new AIClient({
        apiKey: 'test-api-key',
        model: 'gpt-3.5-turbo'
      });
      
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Custom model response' } }]
      });
      
      await customClient.generateContent('Test prompt');
      
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-3.5-turbo'
        })
      );
    });
    
    it('should use custom temperature when provided', async () => {
      const customClient = new AIClient({
        apiKey: 'test-api-key',
        temperature: 0.3
      });
      
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Custom temperature response' } }]
      });
      
      await customClient.generateContent('Test prompt');
      
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3
        })
      );
    });
    
    it('should use custom max tokens when provided', async () => {
      const customClient = new AIClient({
        apiKey: 'test-api-key',
        maxTokens: 500
      });
      
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Custom max tokens response' } }]
      });
      
      await customClient.generateContent('Test prompt');
      
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 500
        })
      );
    });
  });
  
  describe('generateContentStream', () => {
    // Mock for the stream
    const mockStream = async function* () {
      yield { choices: [{ delta: { content: 'Chunk 1' } }] };
      yield { choices: [{ delta: { content: 'Chunk 2' } }] };
      yield { choices: [{ delta: { content: 'Chunk 3' } }] };
      yield { choices: [{ delta: { content: '' } }] };
    };
    
    it('should successfully stream content', async () => {
      // Mock the create method to return an async generator
      mockCreate.mockResolvedValueOnce(mockStream());
      
      // Create a mock callback
      const onStream: StreamCallback = vi.fn();
      
      // Call the method
      const result = await aiClient.generateContentStream('Test prompt', onStream);
      
      // Check the result
      expect(result).toBe('Chunk 1Chunk 2Chunk 3');
      
      // Check that the callback was called for each chunk
      expect(onStream).toHaveBeenCalledTimes(4);
      expect(onStream).toHaveBeenCalledWith('Chunk 1', expect.any(Number));
      expect(onStream).toHaveBeenCalledWith('Chunk 2', expect.any(Number));
      expect(onStream).toHaveBeenCalledWith('Chunk 3', expect.any(Number));
      expect(onStream).toHaveBeenCalledWith('', 100); // Final progress update
      
      // Check that the OpenAI API was called with stream: true
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          stream: true
        })
      );
    });
    
    it('should throw an error for empty prompts in streaming mode', async () => {
      await expect(aiClient.generateContentStream('')).rejects.toThrow(AIError);
      await expect(aiClient.generateContentStream('')).rejects.toMatchObject({
        type: AIErrorType.INVALID_REQUEST,
        retryable: false
      });
      
      expect(mockCreate).not.toHaveBeenCalled();
    });
    
    it('should retry on retryable errors in streaming mode', async () => {
      // First call fails with a retryable error
      const rateLimitError = new Error('Rate limit exceeded');
      Object.assign(rateLimitError, { status: 429 });
      
      mockCreate.mockRejectedValueOnce(rateLimitError);
      
      // Second call succeeds
      mockCreate.mockResolvedValueOnce(mockStream());
      
      // Create a mock callback
      const onStream: StreamCallback = vi.fn();
      
      // Call the method
      const result = await aiClient.generateContentStream('Test prompt', onStream);
      
      // Check the result
      expect(result).toBe('Chunk 1Chunk 2Chunk 3');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });
    
    it('should handle streaming errors', async () => {
      // Mock a stream that throws an error
      const errorStream = async function* () {
        yield { choices: [{ delta: { content: 'Chunk 1' } }] };
        throw new Error('Stream error');
      };
      
      mockCreate.mockResolvedValueOnce(errorStream());
      
      // Create a mock callback
      const onStream: StreamCallback = vi.fn();
      
      // Call the method and expect it to throw
      await expect(aiClient.generateContentStream('Test prompt', onStream)).rejects.toThrow(AIError);
      
      // Check that the callback was called for the first chunk
      expect(onStream).toHaveBeenCalledWith('Chunk 1', expect.any(Number));
    });
    
    it('should handle empty delta content in stream', async () => {
      // Mock a stream with empty delta content
      const emptyDeltaStream = async function* () {
        yield { choices: [{ delta: {} }] };
        yield { choices: [{ delta: { content: 'Content' } }] };
        yield { choices: [{ delta: { content: undefined } }] };
      };
      
      mockCreate.mockResolvedValueOnce(emptyDeltaStream());
      
      // Create a mock callback
      const onStream: StreamCallback = vi.fn();
      
      // Call the method
      const result = await aiClient.generateContentStream('Test prompt', onStream);
      
      // Check the result - should only include the actual content
      expect(result).toBe('Content');
      
      // Check that the callback was only called for the chunk with content
      expect(onStream).toHaveBeenCalledWith('Content', expect.any(Number));
    });
    
    it('should work without a callback', async () => {
      mockCreate.mockResolvedValueOnce(mockStream());
      
      // Call the method without a callback
      const result = await aiClient.generateContentStream('Test prompt');
      
      // Check the result
      expect(result).toBe('Chunk 1Chunk 2Chunk 3');
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
    
    it('should log error when service check fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockModelsList.mockRejectedValueOnce(new Error('Service unavailable'));
      
      await aiClient.checkAvailability();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI service availability check failed'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error that will be recognized as an authentication error
      const authError = new Error('Invalid API key');
      Object.assign(authError, { status: 401 });
      
      mockCreate.mockRejectedValueOnce(authError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.AUTHENTICATION);
      await expect(result).rejects.toHaveProperty('retryable', false);
    });
    
    it('should handle rate limit errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error that will be recognized as a rate limit error
      const rateLimitError = new Error('Rate limit exceeded');
      Object.assign(rateLimitError, { status: 429 });
      
      // Mock all retry attempts to fail with the same error
      mockCreate.mockRejectedValue(rateLimitError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.RATE_LIMIT);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle server errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error that will be recognized as a server error
      const serverError = new Error('Internal server error');
      Object.assign(serverError, { status: 500 });
      
      // Mock all retry attempts to fail with the same error
      mockCreate.mockRejectedValue(serverError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.SERVER);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle timeout errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error that will be recognized as a timeout error
      const timeoutError = new Error('Request timeout');
      Object.assign(timeoutError, { status: 408 });
      
      // Mock all retry attempts to fail with the same error
      mockCreate.mockRejectedValue(timeoutError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.TIMEOUT);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle timeout errors by message', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error with a timeout message
      const timeoutError = new Error('The request timed out');
      
      // Mock all retry attempts to fail with the same error
      mockCreate.mockRejectedValue(timeoutError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.TIMEOUT);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle invalid request errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error that will be recognized as an invalid request error
      const invalidRequestError = new Error('Invalid request parameters');
      Object.assign(invalidRequestError, { status: 400 });
      
      mockCreate.mockRejectedValueOnce(invalidRequestError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.INVALID_REQUEST);
      await expect(result).rejects.toHaveProperty('retryable', false);
    });
    
    it('should handle network errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error with a network error message
      const networkError = new Error('network error occurred');
      
      // Mock all retry attempts to fail with the same error
      mockCreate.mockRejectedValue(networkError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.NETWORK);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle connection errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error with a connection error message
      const connectionError = new Error('connection error occurred');
      
      // Mock all retry attempts to fail with the same error
      mockCreate.mockRejectedValue(connectionError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.NETWORK);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle streaming errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create an error with a stream error type
      const streamError = new Error('stream error occurred');
      Object.assign(streamError, { type: 'stream_error' });
      
      // Mock all retry attempts to fail with the same error
      mockCreate.mockRejectedValue(streamError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.STREAM_ERROR);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle unknown errors', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create a generic error
      const unknownError = new Error('Unknown error');
      
      mockCreate.mockRejectedValueOnce(unknownError);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.UNKNOWN);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
    
    it('should handle non-Error objects', async () => {
      const { AIError, AIErrorType } = await import('../aiClient');
      
      // Create a non-Error object
      const nonErrorObject = { message: 'Not an Error instance' };
      
      mockCreate.mockRejectedValueOnce(nonErrorObject);
      
      const result = aiClient.generateContent('Test prompt');
      await expect(result).rejects.toThrow(AIError);
      await expect(result).rejects.toHaveProperty('type', AIErrorType.UNKNOWN);
      await expect(result).rejects.toHaveProperty('retryable', true);
    });
  });
  
  describe('AIError class', () => {
    it('should create an AIError with default values', () => {
      const error = new AIError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AIError);
      expect(error.name).toBe('AIError');
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(AIErrorType.UNKNOWN);
      expect(error.retryable).toBe(false);
      expect(error.originalError).toBeUndefined();
    });
    
    it('should create an AIError with custom values', () => {
      const originalError = new Error('Original error');
      const error = new AIError(
        'Test error',
        AIErrorType.RATE_LIMIT,
        true,
        originalError
      );
      
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(AIErrorType.RATE_LIMIT);
      expect(error.retryable).toBe(true);
      expect(error.originalError).toBe(originalError);
    });
  });
  
  describe('singleton instance', () => {
    it('should export a singleton instance', async () => {
      // Import the singleton
      const { aiClient: singletonClient } = await import('../aiClient');
      
      expect(singletonClient).toBeInstanceOf(AIClient);
    });
    
    it('should export the class as default', async () => {
      // Import the default export
      const defaultExport = await import('../aiClient');
      
      expect(defaultExport.default).toBe(defaultExport.aiClient);
    });
  });
});