/**
 * Test utilities for AI components
 * Provides mocks and helpers for testing AI functionality
 */

import type { AIClient, AIError } from '../services/aiClient';
import { AIErrorType } from '../services/aiClient';

/**
 * Mock AI client for testing
 */
export class MockAIClient implements AIClient {
  private shouldFail = false;
  private failureType: keyof typeof AIErrorType = 'UNKNOWN';
  private responseDelay = 0;
  private streamChunks: string[] = [];

  /**
   * Configure the mock to simulate failures
   */
  setFailure(shouldFail: boolean, type: keyof typeof AIErrorType = 'UNKNOWN'): void {
    this.shouldFail = shouldFail;
    this.failureType = type;
  }

  /**
   * Configure response delay for testing loading states
   */
  setDelay(ms: number): void {
    this.responseDelay = ms;
  }

  /**
   * Configure streaming chunks for testing streaming
   */
  setStreamChunks(chunks: string[]): void {
    this.streamChunks = chunks;
  }

  async generateContent(prompt: string): Promise<string> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.shouldFail) {
      const { AIError } = await import('../services/aiClient');
      throw new AIError(
        `Mock error: ${this.failureType}`,
        AIErrorType[this.failureType],
        this.failureType === 'RATE_LIMIT' || this.failureType === 'SERVER'
      );
    }

    return `Generated response for: ${prompt.substring(0, 50)}...`;
  }

  async generateContentStream(
    prompt: string,
    onStream?: (chunk: string, progress: number) => void
  ): Promise<string> {
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    if (this.shouldFail) {
      const { AIError } = await import('../services/aiClient');
      throw new AIError(
        `Mock streaming error: ${this.failureType}`,
        AIErrorType[this.failureType],
        this.failureType === 'RATE_LIMIT' || this.failureType === 'SERVER'
      );
    }

    const chunks = this.streamChunks.length > 0 
      ? this.streamChunks 
      : ['Generated ', 'streaming ', 'response ', 'for prompt'];

    let fullContent = '';
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      fullContent += chunk;
      const progress = Math.round(((i + 1) / chunks.length) * 100);
      
      if (onStream) {
        onStream(chunk, progress);
      }
      
      // Small delay between chunks to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return fullContent;
  }

  async checkAvailability(): Promise<boolean> {
    return !this.shouldFail;
  }
}

/**
 * Create a mock AI client with common configurations
 */
export function createMockAIClient(config?: {
  shouldFail?: boolean;
  failureType?: keyof typeof AIErrorType;
  delay?: number;
  streamChunks?: string[];
}): MockAIClient {
  const mock = new MockAIClient();
  
  if (config?.shouldFail) {
    mock.setFailure(config.shouldFail, config.failureType);
  }
  
  if (config?.delay) {
    mock.setDelay(config.delay);
  }
  
  if (config?.streamChunks) {
    mock.setStreamChunks(config.streamChunks);
  }
  
  return mock;
}

/**
 * Test data for AI operations
 */
export const testPrompts = {
  simple: 'Write a simple test response',
  complex: 'Write a comprehensive analysis of {{topic}} considering {{factors}}',
  withReferences: 'Analyze the following references: {{references}}',
  empty: '',
  long: 'A'.repeat(1000) + ' - analyze this long text'
};

export const testTemplateParams = {
  basic: {
    topic: 'artificial intelligence',
    researchQuestion: 'How does AI impact society?'
  },
  complex: {
    topic: 'climate change',
    researchQuestion: 'What are the effects of global warming?',
    factors: 'economic, social, environmental',
    dataPoints: 'temperature rise, sea level, extreme weather'
  },
  withReferences: {
    topic: 'machine learning',
    references: JSON.stringify([
      { title: 'AI Research Paper', author: 'Smith, J.', year: '2023' },
      { title: 'ML Handbook', author: 'Doe, A.', year: '2022' }
    ])
  }
};

/**
 * Helper to wait for async operations in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to simulate user interactions
 */
export const userActions = {
  clickButton: (element: HTMLElement) => {
    element.click();
  },
  
  typeText: (input: HTMLInputElement, text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },
  
  selectOption: (select: HTMLSelectElement, value: string) => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

export default {
  MockAIClient,
  createMockAIClient,
  testPrompts,
  testTemplateParams,
  waitFor,
  userActions
};