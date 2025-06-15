import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  trackEvent,
  trackAIUsage,
  getAnalyticsData,
  clearAnalyticsData
} from '../analyticsService';

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

// Mock performance.now
const originalPerformanceNow = performance.now;

describe('Analytics Service', () => {
  
  beforeEach(() => {
    // Set up localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    
    // Mock performance.now
    performance.now = vi.fn(() => 1000);
    
    vi.clearAllMocks();
    localStorageMock.clear();
  });
  
  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true });
    
    // Restore original performance.now
    performance.now = originalPerformanceNow;
  });
  
  describe('trackEvent', () => {
    it('stores event in localStorage', () => {
      trackEvent('button_click', 'ai_assist_button', { section: 'title' });
      
      // Get the stored data
      const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      const events = storedData.events;
      
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('button_click');
      expect(events[0].eventName).toBe('ai_assist_button');
      expect(events[0].metadata).toEqual({ section: 'title' });
      expect(events[0].timestamp).toBeDefined();
    });
    
    it('appends to existing events', () => {
      // Track first event
      trackEvent('button_click', 'ai_assist_button', { section: 'title' });
      
      // Track second event
      trackEvent('form_submit', 'report_form', { success: true });
      
      // Get the stored data from the second call
      const storedData = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
      const events = storedData.events;
      
      expect(events).toHaveLength(2);
      expect(events[0].eventName).toBe('ai_assist_button');
      expect(events[1].eventName).toBe('report_form');
    });
    
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw and should log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      trackEvent('button_click', 'ai_assist_button');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to store analytics event:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('trackAIUsage', () => {
    it('stores AI usage data in localStorage', () => {
      trackAIUsage({
        featureId: 'improve-title',
        templateId: 'title-improvement',
        responseTime: 1250,
        success: true
      });
      
      // Get the stored data
      const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      const usageData = storedData.aiUsage;
      
      expect(usageData).toHaveLength(1);
      expect(usageData[0].featureId).toBe('improve-title');
      expect(usageData[0].templateId).toBe('title-improvement');
      expect(usageData[0].responseTime).toBe(1250);
      expect(usageData[0].success).toBe(true);
      expect(usageData[0].timestamp).toBeDefined();
    });
    
    it('appends to existing AI usage data', () => {
      // Track first usage
      trackAIUsage({
        featureId: 'improve-title',
        templateId: 'title-improvement',
        responseTime: 1250,
        success: true
      });
      
      // Track second usage
      trackAIUsage({
        featureId: 'improve-content',
        templateId: 'content-improvement',
        responseTime: 1800,
        success: false,
        errorType: 'api_error'
      });
      
      // Get the stored data from the second call
      const storedData = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
      const usageData = storedData.aiUsage;
      
      expect(usageData).toHaveLength(2);
      expect(usageData[0].featureId).toBe('improve-title');
      expect(usageData[1].featureId).toBe('improve-content');
      expect(usageData[1].success).toBe(false);
      expect(usageData[1].errorType).toBe('api_error');
    });
    
    it('handles optional parameters correctly', () => {
      trackAIUsage({
        featureId: 'improve-title',
        success: true
      });
      
      // Get the stored data
      const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      const usageData = storedData.aiUsage[0];
      
      expect(usageData.featureId).toBe('improve-title');
      expect(usageData.success).toBe(true);
      expect(usageData.templateId).toBeUndefined();
      expect(usageData.timestamp).toBeDefined();
    });
    
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw and should log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      trackAIUsage({
        featureId: 'improve-title',
        success: true
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to store AI usage data:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('getAnalyticsData', () => {
    it('returns empty data when no analytics are stored', () => {
      const data = getAnalyticsData();
      
      expect(data).toEqual({
        events: [],
        aiUsage: [],
        sessionCount: 0,
        firstVisit: expect.any(String),
        lastVisit: expect.any(String)
      });
    });
    
    it('returns stored analytics data', () => {
      // Store some analytics data
      trackEvent('button_click', 'ai_assist_button');
      trackAIUsage({
        featureId: 'improve-title',
        success: true
      });
      
      const data = getAnalyticsData();
      
      expect(data.events).toHaveLength(1);
      expect(data.aiUsage).toHaveLength(1);
      expect(data.sessionCount).toBe(1);
      expect(data.firstVisit).toBeDefined();
      expect(data.lastVisit).toBeDefined();
    });
    
    it('handles localStorage errors', () => {
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      // Should return default data and log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const data = getAnalyticsData();
      
      expect(data).toEqual({
        events: [],
        aiUsage: [],
        sessionCount: 0,
        firstVisit: expect.any(String),
        lastVisit: expect.any(String)
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to retrieve analytics data:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('clearAnalyticsData', () => {
    it('removes analytics data from localStorage', () => {
      // Store some analytics data
      trackEvent('button_click', 'ai_assist_button');
      trackAIUsage({
        featureId: 'improve-title',
        success: true
      });
      
      // Clear analytics data
      clearAnalyticsData();
      
      // Check that localStorage.removeItem was called
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('rapport-ai-analytics');
      
      // Check that analytics data is cleared
      const data = getAnalyticsData();
      expect(data.events).toHaveLength(0);
      expect(data.aiUsage).toHaveLength(0);
    });
    
    it('handles localStorage errors', () => {
      // Mock localStorage.removeItem to throw an error
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      // Should log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      clearAnalyticsData();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear analytics data:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Analytics Data Structure', () => {
    it('maintains correct data structure with multiple events and AI usages', () => {
      // Track multiple events and AI usages
      trackEvent('button_click', 'ai_assist_button', { section: 'title' });
      trackEvent('form_submit', 'report_form', { success: true });
      
      trackAIUsage({
        featureId: 'improve-title',
        templateId: 'title-improvement',
        responseTime: 1250,
        success: true
      });
      
      trackAIUsage({
        featureId: 'improve-content',
        templateId: 'content-improvement',
        responseTime: 1800,
        success: false,
        errorType: 'api_error'
      });
      
      // Get analytics data
      const data = getAnalyticsData();
      
      // Check structure
      expect(data).toHaveProperty('events');
      expect(data).toHaveProperty('aiUsage');
      expect(data).toHaveProperty('sessionCount');
      expect(data).toHaveProperty('firstVisit');
      expect(data).toHaveProperty('lastVisit');
      
      // Check content
      expect(data.events).toHaveLength(2);
      expect(data.aiUsage).toHaveLength(2);
      expect(data.sessionCount).toBe(1);
      
      // Check event structure
      const event = data.events[0];
      expect(event).toHaveProperty('eventType');
      expect(event).toHaveProperty('eventName');
      expect(event).toHaveProperty('timestamp');
      expect(event).toHaveProperty('metadata');
      
      // Check AI usage structure
      const usage = data.aiUsage[0];
      expect(usage).toHaveProperty('featureId');
      expect(usage).toHaveProperty('templateId');
      expect(usage).toHaveProperty('responseTime');
      expect(usage).toHaveProperty('success');
      expect(usage).toHaveProperty('timestamp');
    });
  });
  
  describe('Privacy Considerations', () => {
    it('does not store personal data in analytics', () => {
      // Track event with potentially sensitive data
      trackEvent('form_submit', 'report_form', {
        title: 'My Personal Report',
        email: 'user@example.com',
        content: 'This is my private content'
      });
      
      // Get analytics data
      const data = getAnalyticsData();
      const event = data.events[0];
      
      // Metadata should be stored but without sensitive fields
      expect(event.metadata).toBeDefined();
      expect(event.metadata).not.toHaveProperty('email');
      expect(event.metadata).not.toHaveProperty('content');
      
      // Only safe metadata should be included
      expect(event.metadata).toEqual({
        title: 'My Personal Report'
      });
    });
    
    it('sanitizes AI usage data for privacy', () => {
      // Track AI usage with potentially sensitive data
      trackAIUsage({
        featureId: 'improve-content',
        templateId: 'content-improvement',
        responseTime: 1800,
        success: true,
        metadata: {
          promptText: 'This is my private prompt with personal information',
          responseText: 'This is the AI response with personal details',
          userEmail: 'user@example.com'
        }
      });
      
      // Get analytics data
      const data = getAnalyticsData();
      const usage = data.aiUsage[0];
      
      // Metadata should be stored but without sensitive fields
      expect(usage.metadata).toBeDefined();
      expect(usage.metadata).not.toHaveProperty('promptText');
      expect(usage.metadata).not.toHaveProperty('responseText');
      expect(usage.metadata).not.toHaveProperty('userEmail');
      
      // Only safe metadata like lengths should be included
      expect(usage.metadata).toEqual({});
    });
  });
});