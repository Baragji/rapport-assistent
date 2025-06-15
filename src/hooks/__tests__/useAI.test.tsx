import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAI } from '../useAI';
import { AIClient, AIError, AIErrorType } from '../../services/aiClient';
import { promptService } from '../../services/promptService';

// Mock the AIClient
vi.mock('../../services/aiClient', () => ({
  AIClient: vi.fn(),
  AIErrorType: {
    AUTHENTICATION: 'authentication_error',
    RATE_LIMIT: 'rate_limit_error',
    SERVER: 'server_error',
    TIMEOUT: 'timeout_error',
    INVALID_REQUEST: 'invalid_request_error',
    NETWORK: 'network_error',
    UNKNOWN: 'unknown_error',
    STREAM_ERROR: 'stream_error'
  },
  AIError: class AIError extends Error {
    type: string;
    retryable: boolean;
    originalError?: unknown;

    constructor(
      message: string, 
      type: string = 'unknown_error', 
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
}));

// Mock the promptService
vi.mock('../../services/promptService', () => ({
  promptService: {
    fillTemplate: vi.fn(),
  },
}));

describe('useAI Hook', () => {
  let mockClient: {
    generateContent: ReturnType<typeof vi.fn>;
    generateContentStream: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock client
    mockClient = {
      generateContent: vi.fn(),
      generateContentStream: vi.fn(),
    };
    
    // Mock the AIClient constructor
    vi.mocked(AIClient).mockImplementation(() => mockClient as unknown as AIClient);
    
    // Mock the promptService.fillTemplate
    vi.mocked(promptService.fillTemplate).mockImplementation((templateId, params) => {
      return `Filled template for ${templateId} with params: ${JSON.stringify(params)}`;
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAI());
    
    expect(result.current.content).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it('generates content using a template', async () => {
    mockClient.generateContent.mockResolvedValue('Generated content');
    
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      await result.current.generateContent('test-template', { param1: 'value1' });
    });
    
    expect(promptService.fillTemplate).toHaveBeenCalledWith('test-template', { param1: 'value1' });
    expect(mockClient.generateContent).toHaveBeenCalled();
    expect(result.current.content).toBe('Generated content');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(100);
  });

  it('generates content using a raw prompt', async () => {
    mockClient.generateContent.mockResolvedValue('Generated from raw prompt');
    
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      await result.current.generateFromPrompt('Raw prompt text');
    });
    
    expect(mockClient.generateContent).toHaveBeenCalledWith('Raw prompt text');
    expect(result.current.content).toBe('Generated from raw prompt');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles errors during content generation', async () => {
    mockClient.generateContent.mockRejectedValue(new AIError('API error', AIErrorType.SERVER, true));
    
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      try {
        await result.current.generateContent('test-template', { param1: 'value1' });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Expected error
      }
    });
    
    expect(result.current.error).toBe('API error');
    expect(result.current.isLoading).toBe(false);
  });

  it('uses streaming when enabled', async () => {
    // Mock the streaming function to call the callback with chunks
    mockClient.generateContentStream.mockImplementation(async (_prompt: string, callback: (chunk: string, progress: number) => void) => {
      callback('Chunk 1', 25);
      callback('Chunk 2', 50);
      callback('Chunk 3', 75);
      callback('', 100);
      return 'Chunk 1Chunk 2Chunk 3';
    });
    
    const onStreamMock = vi.fn();
    const onCompleteMock = vi.fn();
    
    const { result } = renderHook(() => useAI({
      streaming: true,
      onStream: onStreamMock,
      onComplete: onCompleteMock
    }));
    
    await act(async () => {
      await result.current.generateContent('test-template', { param1: 'value1' });
    });
    
    expect(mockClient.generateContentStream).toHaveBeenCalled();
    expect(onStreamMock).toHaveBeenCalledTimes(4);
    expect(onStreamMock).toHaveBeenCalledWith('Chunk 1', 25);
    expect(onStreamMock).toHaveBeenCalledWith('Chunk 2', 50);
    expect(onStreamMock).toHaveBeenCalledWith('Chunk 3', 75);
    expect(onStreamMock).toHaveBeenCalledWith('', 100);
    expect(onCompleteMock).toHaveBeenCalledWith('Chunk 1Chunk 2Chunk 3');
    expect(result.current.content).toBe('Chunk 1Chunk 2Chunk 3');
    expect(result.current.progress).toBe(100);
  });

  it('resets state correctly', async () => {
    mockClient.generateContent.mockResolvedValue('Generated content');
    
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      await result.current.generateContent('test-template', { param1: 'value1' });
    });
    
    expect(result.current.content).toBe('Generated content');
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.content).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it('calls error callback when provided', async () => {
    const error = new AIError('API error', AIErrorType.SERVER, true);
    mockClient.generateContent.mockRejectedValue(error);
    
    const onErrorMock = vi.fn();
    
    const { result } = renderHook(() => useAI({
      onError: onErrorMock
    }));
    
    await act(async () => {
      try {
        await result.current.generateContent('test-template', { param1: 'value1' });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Expected error
      }
    });
    
    expect(onErrorMock).toHaveBeenCalledWith(error);
  });

  it('handles template not found error', async () => {
    vi.mocked(promptService.fillTemplate).mockReturnValue(null);
    
    const { result } = renderHook(() => useAI());
    
    await act(async () => {
      try {
        await result.current.generateContent('non-existent-template', { param1: 'value1' });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Expected error
      }
    });
    
    expect(result.current.error).toContain('not found');
    expect(result.current.isLoading).toBe(false);
  });
});