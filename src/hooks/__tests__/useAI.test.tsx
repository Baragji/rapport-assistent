import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAI } from '../useAI';
import type { AIClient } from '../../services/aiClient';
import { promptService } from '../../services/promptService';
import { createMockAIClient } from '../../test-utils/aiTestUtils';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { getFeatureFlag } from '../../utils/featureFlags';

// Mock the lazy AI client
vi.mock('../../services/aiClientLazy', () => ({
  getAIClient: vi.fn(),
}));

// Mock the AIClient module for dynamic imports
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
    STREAM_ERROR: 'stream_error',
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
  },
}));

// Mock the promptService
vi.mock('../../services/promptService', () => ({
  promptService: {
    fillTemplate: vi.fn(),
  },
}));

// Mock the performance monitor
vi.mock('../../utils/performanceMonitor', () => ({
  performanceMonitor: {
    startMetric: vi.fn(),
    endMetric: vi.fn(),
    trackAIOperation: vi.fn(),
  },
}));

// Mock the feature flags
vi.mock('../../utils/featureFlags', () => ({
  getFeatureFlag: vi.fn(),
}));

describe('useAI Hook', () => {
  let mockClient: ReturnType<typeof createMockAIClient>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mock client using test utilities
    mockClient = createMockAIClient();

    // Mock the lazy client loader
    const { getAIClient } = await import('../../services/aiClientLazy');
    vi.mocked(getAIClient).mockResolvedValue({
      generateContent: mockClient.generateContent,
      generateContentStream: mockClient.generateContentStream,
      checkAvailability: mockClient.checkAvailability,
    } as unknown as AIClient);

    // Mock the promptService.fillTemplate
    vi.mocked(promptService.fillTemplate).mockImplementation((templateId, params) => {
      return `Filled template for ${templateId} with params: ${JSON.stringify(params)}`;
    });

    // Mock feature flags to return false by default
    vi.mocked(getFeatureFlag).mockImplementation(flag => {
      if (flag === 'AI_LAZY_LOADING') return false;
      if (flag === 'AI_PERFORMANCE_MONITORING') return false;
      return false;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    const { result } = renderHook(() =>
      useAI({
        client: mockClient as unknown as AIClient,
      })
    );

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

    const { result } = renderHook(() =>
      useAI({
        client: mockClient as unknown as AIClient,
      })
    );

    await act(async () => {
      await result.current.generateFromPrompt('Raw prompt text');
    });

    expect(mockClient.generateContent).toHaveBeenCalledWith('Raw prompt text');
    expect(result.current.content).toBe('Generated from raw prompt');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles errors during content generation', async () => {
    const { AIError, AIErrorType } = await import('../../services/aiClient');
    const error = new AIError('API error', AIErrorType.SERVER, true);

    // Create a custom client with the error
    const customClient = {
      generateContent: vi.fn().mockRejectedValueOnce(error),
      generateContentStream: vi.fn(),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
      })
    );

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
    // Create a custom client with streaming implementation
    const streamImplementation = async (
      _prompt: string,
      callback?: (chunk: string, progress: number) => void
    ) => {
      if (callback) {
        callback('Chunk 1', 25);
        callback('Chunk 2', 50);
        callback('Chunk 3', 75);
        callback('', 100);
      }
      return 'Chunk 1Chunk 2Chunk 3';
    };

    const customClient = {
      generateContent: vi.fn(),
      generateContentStream: vi.fn().mockImplementation(streamImplementation),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    const onStreamMock = vi.fn();
    const onCompleteMock = vi.fn();

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
        streaming: true,
        onStream: onStreamMock,
        onComplete: onCompleteMock,
      })
    );

    await act(async () => {
      await result.current.generateContent('test-template', { param1: 'value1' });
    });

    expect(customClient.generateContentStream).toHaveBeenCalled();
    expect(onStreamMock).toHaveBeenCalledTimes(4);
    expect(onStreamMock).toHaveBeenCalledWith('Chunk 1', 25);
    expect(onStreamMock).toHaveBeenCalledWith('Chunk 2', 50);
    expect(onStreamMock).toHaveBeenCalledWith('Chunk 3', 75);
    expect(onStreamMock).toHaveBeenCalledWith('', 100);
    expect(onCompleteMock).toHaveBeenCalledWith('Chunk 1Chunk 2Chunk 3', expect.any(Object));
    expect(result.current.content).toBe('Chunk 1Chunk 2Chunk 3');
    expect(result.current.progress).toBe(100);
  });

  it('uses streaming for raw prompts when enabled', async () => {
    // Create a custom client with streaming implementation
    const streamImplementation = async (
      _prompt: string,
      callback?: (chunk: string, progress: number) => void
    ) => {
      if (callback) {
        callback('Raw 1', 25);
        callback('Raw 2', 50);
        callback('Raw 3', 75);
        callback('', 100);
      }
      return 'Raw 1Raw 2Raw 3';
    };

    const customClient = {
      generateContent: vi.fn(),
      generateContentStream: vi.fn().mockImplementation(streamImplementation),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    const onStreamMock = vi.fn();

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
        streaming: true,
        onStream: onStreamMock,
      })
    );

    await act(async () => {
      await result.current.generateFromPrompt('Raw prompt text');
    });

    expect(customClient.generateContentStream).toHaveBeenCalled();
    expect(onStreamMock).toHaveBeenCalledTimes(4);
    expect(result.current.content).toBe('Raw 1Raw 2Raw 3');
  });

  it('resets state correctly', async () => {
    // Create a custom client
    const customClient = {
      generateContent: vi.fn().mockResolvedValue('Generated content'),
      generateContentStream: vi.fn(),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
      })
    );

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
    const { AIError, AIErrorType } = await import('../../services/aiClient');
    const error = new AIError('API error', AIErrorType.SERVER, true);

    // Create a custom client with the error
    const customClient = {
      generateContent: vi.fn().mockRejectedValueOnce(error),
      generateContentStream: vi.fn(),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    const onErrorMock = vi.fn();

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
        onError: onErrorMock,
      })
    );

    await act(async () => {
      try {
        await result.current.generateContent('test-template', { param1: 'value1' });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Expected error
      }
    });

    expect(onErrorMock).toHaveBeenCalled();
    expect(onErrorMock.mock.calls[0][0].message).toBe('API error');
    expect(onErrorMock.mock.calls[0][0].type).toBe(AIErrorType.SERVER);
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

  it('uses provided client instance when available', async () => {
    const customClient = createMockAIClient();
    customClient.generateContent.mockResolvedValue('Custom client response');

    const { result } = renderHook(() =>
      useAI({
        client: customClient as unknown as AIClient,
      })
    );

    await act(async () => {
      await result.current.generateFromPrompt('Test prompt');
    });

    expect(customClient.generateContent).toHaveBeenCalledWith('Test prompt');
    expect(result.current.content).toBe('Custom client response');

    // The lazy loader should not be called
    const { getAIClient } = await import('../../services/aiClientLazy');
    expect(getAIClient).not.toHaveBeenCalled();
  });

  it('uses lazy loading when feature flag is enabled', async () => {
    // Enable the lazy loading feature flag
    vi.mocked(getFeatureFlag).mockImplementation(flag => {
      return flag === 'AI_LAZY_LOADING';
    });

    mockClient.generateContent.mockResolvedValue('Lazy loaded response');

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.generateFromPrompt('Test prompt');
    });

    const { getAIClient } = await import('../../services/aiClientLazy');
    expect(getAIClient).toHaveBeenCalled();
    expect(mockClient.generateContent).toHaveBeenCalledWith('Test prompt');
    expect(result.current.content).toBe('Lazy loaded response');
  });

  it('uses direct import when lazy loading is disabled', async () => {
    // Disable the lazy loading feature flag
    vi.mocked(getFeatureFlag).mockReturnValue(false);

    // Mock the AIClient constructor
    const { AIClient } = await import('../../services/aiClient');
    const mockAIClientInstance = createMockAIClient();
    vi.mocked(AIClient).mockImplementation(() => mockAIClientInstance as unknown as AIClient);

    mockAIClientInstance.generateContent.mockResolvedValue('Direct import response');

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.generateFromPrompt('Test prompt');
    });

    expect(AIClient).toHaveBeenCalled();
    expect(mockAIClientInstance.generateContent).toHaveBeenCalledWith('Test prompt');
    expect(result.current.content).toBe('Direct import response');
  });

  it('uses performance monitoring when feature flag is enabled', async () => {
    // Enable the performance monitoring feature flag
    vi.mocked(getFeatureFlag).mockImplementation(flag => {
      return flag === 'AI_PERFORMANCE_MONITORING';
    });

    mockClient.generateContent.mockResolvedValue('Monitored response');

    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.generateContent('test-template', { param1: 'value1' });
    });

    expect(performanceMonitor.startMetric).toHaveBeenCalledWith(
      'ai-template-test-template',
      expect.any(Object)
    );
    expect(performanceMonitor.trackAIOperation).toHaveBeenCalledWith(
      'generate',
      'test-template',
      expect.any(Number),
      true,
      undefined,
      expect.any(Number)
    );
    expect(performanceMonitor.endMetric).toHaveBeenCalledWith('ai-template-test-template');
  });

  it('tracks failed operations with performance monitoring', async () => {
    // Enable the performance monitoring feature flag
    vi.mocked(getFeatureFlag).mockImplementation(flag => {
      return flag === 'AI_PERFORMANCE_MONITORING';
    });

    const { AIError, AIErrorType } = await import('../../services/aiClient');
    const error = new AIError('API error', AIErrorType.SERVER, true);

    // Create a custom client with the error
    const customClient = {
      generateContent: vi.fn().mockRejectedValueOnce(error),
      generateContentStream: vi.fn(),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    // Reset all performance monitor mocks to ensure clean tracking
    vi.mocked(performanceMonitor.startMetric).mockClear();
    vi.mocked(performanceMonitor.trackAIOperation).mockClear();
    vi.mocked(performanceMonitor.endMetric).mockClear();

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
      })
    );

    await act(async () => {
      try {
        await result.current.generateContent('test-template', { param1: 'value1' });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Expected error
      }
    });

    // Verify the performance tracking was called exactly once
    expect(performanceMonitor.trackAIOperation).toHaveBeenCalledTimes(1);
    expect(performanceMonitor.trackAIOperation).toHaveBeenCalledWith(
      'generate',
      'test-template',
      expect.any(Number),
      false,
      'API error'
    );
  });

  it('handles non-AIError errors during generation', async () => {
    // Create a regular Error
    const regularError = new Error('Regular error');

    // Create a custom client with the error
    const customClient = {
      generateContent: vi.fn().mockRejectedValueOnce(regularError),
      generateContentStream: vi.fn(),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
      })
    );

    await act(async () => {
      try {
        await result.current.generateContent('test-template', { param1: 'value1' });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Expected error
      }
    });

    // Just verify the error state directly
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Regular error');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles non-Error objects during generation', async () => {
    // Create a non-Error object
    const nonErrorObject = { message: 'Not an error' };

    // Create a custom client with the error
    const customClient = {
      generateContent: vi.fn().mockRejectedValueOnce(nonErrorObject),
      generateContentStream: vi.fn(),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
      })
    );

    await act(async () => {
      try {
        await result.current.generateContent('test-template', { param1: 'value1' });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Expected error
      }
    });

    // Just verify the error state directly
    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('monitors raw prompt generation with performance monitoring', async () => {
    // Enable the performance monitoring feature flag
    vi.mocked(getFeatureFlag).mockImplementation(flag => {
      return flag === 'AI_PERFORMANCE_MONITORING';
    });

    // Create a custom client
    const customClient = {
      generateContent: vi.fn().mockResolvedValue('Monitored raw response'),
      generateContentStream: vi.fn(),
      checkAvailability: vi.fn(),
    } as unknown as AIClient;

    // Reset the mocks to ensure clean tracking
    vi.mocked(performanceMonitor.startMetric).mockClear();
    vi.mocked(performanceMonitor.trackAIOperation).mockClear();
    vi.mocked(performanceMonitor.endMetric).mockClear();

    const { result } = renderHook(() =>
      useAI({
        client: customClient,
      })
    );

    await act(async () => {
      await result.current.generateFromPrompt('Raw test prompt');
    });

    // Verify start metric was called correctly
    expect(performanceMonitor.startMetric).toHaveBeenCalledTimes(1);
    expect(performanceMonitor.startMetric).toHaveBeenCalledWith('ai-raw-prompt', {
      promptLength: 'Raw test prompt'.length,
    });

    // Verify tracking was called correctly
    expect(performanceMonitor.trackAIOperation).toHaveBeenCalledTimes(1);
    expect(performanceMonitor.trackAIOperation).toHaveBeenCalledWith(
      'generate',
      'raw-prompt',
      expect.any(Number),
      true,
      undefined,
      expect.any(Number)
    );

    // Verify end metric was called correctly
    expect(performanceMonitor.endMetric).toHaveBeenCalledTimes(1);
    expect(performanceMonitor.endMetric).toHaveBeenCalledWith('ai-raw-prompt');
  });
});
