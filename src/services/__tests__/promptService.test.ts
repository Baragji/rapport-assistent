import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptService, TemplateCategory } from '../promptService';
import type { PromptTemplate } from '../promptService';
import { AIClient } from '../aiClient';

// Mock the AIClient
vi.mock('../aiClient', () => {
  return {
    AIClient: vi.fn().mockImplementation(() => ({
      generateContent: vi.fn().mockResolvedValue('Generated content')
    }))
  };
});

describe('PromptService', () => {
  let promptService: PromptService;
  let mockAiClient: AIClient;
  
  beforeEach(() => {
    // Create a new instance for each test
    mockAiClient = new AIClient();
    promptService = new PromptService(mockAiClient);
  });
  
  describe('initialization', () => {
    it('should initialize with default templates', () => {
      const templates = promptService.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      
      // Check that we have templates in different categories
      const introTemplates = promptService.getTemplatesByCategory(TemplateCategory.INTRODUCTION);
      const methodologyTemplates = promptService.getTemplatesByCategory(TemplateCategory.METHODOLOGY);
      
      expect(introTemplates.length).toBeGreaterThan(0);
      expect(methodologyTemplates.length).toBeGreaterThan(0);
    });
  });
  
  describe('template management', () => {
    it('should register a new template', () => {
      const newTemplate: PromptTemplate = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'This is a {{test}} template'
      };
      
      const result = promptService.registerTemplate(newTemplate);
      expect(result).toBe(true);
      
      const retrievedTemplate = promptService.getTemplate('test-template');
      expect(retrievedTemplate).toEqual(newTemplate);
    });
    
    it('should not register a template without an ID', () => {
      const invalidTemplate = {
        name: 'Invalid Template',
        description: 'A template without an ID',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'This is an invalid template'
      } as PromptTemplate;
      
      const result = promptService.registerTemplate(invalidTemplate);
      expect(result).toBe(false);
    });
    
    it('should get templates by category', () => {
      const generalTemplates = promptService.getTemplatesByCategory(TemplateCategory.GENERAL);
      expect(generalTemplates.length).toBeGreaterThan(0);
      expect(generalTemplates.every(t => t.category === TemplateCategory.GENERAL)).toBe(true);
    });
    
    it('should get templates by tag', () => {
      // Register a template with a specific tag for testing
      const taggedTemplate: PromptTemplate = {
        id: 'tagged-template',
        name: 'Tagged Template',
        description: 'A template with a specific tag',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['specific-tag'],
        template: 'This is a template with a specific tag'
      };
      
      promptService.registerTemplate(taggedTemplate);
      
      const templates = promptService.getTemplatesByTag('specific-tag');
      expect(templates.length).toBe(1);
      expect(templates[0].id).toBe('tagged-template');
    });
  });
  
  describe('template filling', () => {
    it('should fill a template with parameters', () => {
      // Register a test template
      const testTemplate: PromptTemplate = {
        id: 'param-test',
        name: 'Parameter Test',
        description: 'A template for testing parameter filling',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'Hello {{name}}, welcome to {{place}}!'
      };
      
      promptService.registerTemplate(testTemplate);
      
      const filled = promptService.fillTemplate('param-test', {
        name: 'John',
        place: 'Wonderland'
      });
      
      expect(filled).toBe('Hello John, welcome to Wonderland!');
    });
    
    it('should return null if template is not found', () => {
      const filled = promptService.fillTemplate('non-existent-template', {
        param: 'value'
      });
      
      expect(filled).toBeNull();
    });
    
    it('should handle missing parameters', () => {
      // Register a test template
      const testTemplate: PromptTemplate = {
        id: 'missing-param-test',
        name: 'Missing Parameter Test',
        description: 'A template for testing missing parameters',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'Hello {{name}}, welcome to {{place}}!'
      };
      
      promptService.registerTemplate(testTemplate);
      
      // Only provide one parameter
      const filled = promptService.fillTemplate('missing-param-test', {
        name: 'John'
      });
      
      // The missing parameter should remain as {{place}}
      expect(filled).toBe('Hello John, welcome to {{place}}!');
    });
  });
  
  describe('content generation', () => {
    it('should generate content using a template', async () => {
      // Register a test template
      const testTemplate: PromptTemplate = {
        id: 'generation-test',
        name: 'Generation Test',
        description: 'A template for testing content generation',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'Generate content about {{topic}}'
      };
      
      promptService.registerTemplate(testTemplate);
      
      const content = await promptService.generateContent('generation-test', {
        topic: 'artificial intelligence'
      });
      
      // The mock AIClient should return 'Generated content'
      expect(content).toBe('Generated content');
      
      // Verify that the AIClient was called with the filled template
      expect(mockAiClient.generateContent).toHaveBeenCalledWith(
        'Generate content about artificial intelligence'
      );
    });
    
    it('should return null if template filling fails', async () => {
      const content = await promptService.generateContent('non-existent-template', {
        param: 'value'
      });
      
      expect(content).toBeNull();
      expect(mockAiClient.generateContent).not.toHaveBeenCalled();
    });
    
    it('should handle errors from the AI client', async () => {
      // Mock the AIClient to throw an error
      vi.mocked(mockAiClient.generateContent).mockRejectedValueOnce(new Error('AI error'));
      
      // Register a test template
      const testTemplate: PromptTemplate = {
        id: 'error-test',
        name: 'Error Test',
        description: 'A template for testing error handling',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'This will cause an error'
      };
      
      promptService.registerTemplate(testTemplate);
      
      const content = await promptService.generateContent('error-test', {});
      
      expect(content).toBeNull();
    });
  });
});