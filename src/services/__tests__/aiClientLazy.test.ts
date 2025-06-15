import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAIClient, isAIClientLoaded, resetAIClient } from '../aiClientLazy';

// Mock the aiClient module
vi.mock('../aiClient', () => {
  const AIClientMock = vi.fn();
  return { 
    AIClient: AIClientMock
  };
});

describe('aiClientLazy', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetAIClient(); // Reset the singleton instance
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAIClient', () => {
    it('should create a new AIClient instance on first call', async () => {
      const { AIClient } = await import('../aiClient');
      
      const client = await getAIClient();
      
      expect(AIClient).toHaveBeenCalledTimes(1);
      expect(client).toBeDefined();
    });

    it('should return the same instance on subsequent calls', async () => {
      const { AIClient } = await import('../aiClient');
      
      const client1 = await getAIClient();
      const client2 = await getAIClient();
      
      expect(AIClient).toHaveBeenCalledTimes(1); // Should only be called once
      expect(client1).toBe(client2); // Should be the same instance
    });

    it('should pass config to AIClient constructor', async () => {
      const { AIClient } = await import('../aiClient');
      const config = { apiKey: 'test-key', model: 'test-model' };
      
      await getAIClient(config);
      
      expect(AIClient).toHaveBeenCalledWith(config);
    });
  });

  describe('isAIClientLoaded', () => {
    it('should return false when client is not loaded', () => {
      expect(isAIClientLoaded()).toBe(false);
    });

    it('should return true after client is loaded', async () => {
      await getAIClient();
      expect(isAIClientLoaded()).toBe(true);
    });
  });

  describe('resetAIClient', () => {
    it('should reset the client instance', async () => {
      const { AIClient } = await import('../aiClient');
      
      // Load the client
      await getAIClient();
      expect(isAIClientLoaded()).toBe(true);
      expect(AIClient).toHaveBeenCalledTimes(1);
      
      // Reset the client
      resetAIClient();
      expect(isAIClientLoaded()).toBe(false);
      
      // Load again - should create a new instance
      await getAIClient();
      expect(AIClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('default export', () => {
    it('should export getAIClient as default', async () => {
      const defaultExport = await import('../aiClientLazy');
      expect(defaultExport.default).toBe(getAIClient);
    });
  });
});