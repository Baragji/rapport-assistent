import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PromptService, TemplateCategory, type PromptTemplate } from '../promptService';
import { AIClient } from '../aiClient';

// Mock the AIClient
vi.mock('../aiClient', () => ({
  AIClient: vi.fn().mockImplementation(() => ({
    generateContent: vi.fn(),
    generateContentStream: vi.fn()
  }))
}));

// Mock the templateRegistry
vi.mock('../../prompts/templateRegistry', () => ({
  templateRegistry: [
    {
      id: 'test-template-1',
      name: 'Test Template 1',
      description: 'A test template',
      category: 'introduction',
      version: '1.0.0',
      tags: ['test', 'introduction'],
      template: 'This is a {{test}} template'
    },
    {
      id: 'test-template-2',
      name: 'Test Template 2',
      description: 'Another test template',
      category: 'methodology',
      version: '1.0.0',
      tags: ['test', 'methodology'],
      template: 'This is another {{test}} template'
    }
  ]
}));

describe('PromptService', () => {
  let promptService: PromptService;
  let mockAIClient: AIClient;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a mock AIClient
    mockAIClient = new AIClient();
    
    // Create a new PromptService instance with the mock AIClient
    promptService = new PromptService(mockAIClient);
    
    // Spy on console methods
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
  
  describe('constructor', () => {
    it('should initialize with default templates', () => {
      expect(promptService.getAllTemplates().length).toBe(2);
      expect(promptService.getTemplate('test-template-1')).toBeDefined();
      expect(promptService.getTemplate('test-template-2')).toBeDefined();
    });
  });
  
  describe('registerTemplate', () => {
    it('should register a new template', () => {
      const newTemplate: PromptTemplate = {
        id: 'new-template',
        name: 'New Template',
        description: 'A new template',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['new'],
        template: 'This is a new template'
      };
      
      const result = promptService.registerTemplate(newTemplate);
      
      expect(result).toBe(true);
      expect(promptService.getTemplate('new-template')).toEqual(newTemplate);
    });
    
    it('should update an existing template', () => {
      const updatedTemplate: PromptTemplate = {
        id: 'test-template-1',
        name: 'Updated Template',
        description: 'An updated template',
        category: TemplateCategory.GENERAL,
        version: '1.1.0',
        tags: ['updated'],
        template: 'This is an updated template'
      };
      
      const result = promptService.registerTemplate(updatedTemplate);
      
      expect(result).toBe(true);
      expect(promptService.getTemplate('test-template-1')).toEqual(updatedTemplate);
    });
    
    it('should reject templates without an ID', () => {
      const invalidTemplate = {
        name: 'Invalid Template',
        description: 'A template without an ID',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['invalid'],
        template: 'This is an invalid template'
      } as PromptTemplate;
      
      const result = promptService.registerTemplate(invalidTemplate);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Template must have an ID and template text'
      );
    });
    
    it('should reject templates without template text', () => {
      const invalidTemplate = {
        id: 'invalid-template',
        name: 'Invalid Template',
        description: 'A template without template text',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['invalid']
      } as PromptTemplate;
      
      const result = promptService.registerTemplate(invalidTemplate);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Template must have an ID and template text'
      );
    });
  });
  
  describe('getTemplate', () => {
    it('should return a template by ID', () => {
      const template = promptService.getTemplate('test-template-1');
      
      expect(template).toBeDefined();
      expect(template?.id).toBe('test-template-1');
    });
    
    it('should return undefined for non-existent templates', () => {
      const template = promptService.getTemplate('non-existent');
      
      expect(template).toBeUndefined();
    });
  });
  
  describe('getAllTemplates', () => {
    it('should return all templates', () => {
      const templates = promptService.getAllTemplates();
      
      expect(templates.length).toBe(2);
      expect(templates[0].id).toBe('test-template-1');
      expect(templates[1].id).toBe('test-template-2');
    });
  });
  
  describe('getTemplatesByCategory', () => {
    it('should return templates by category', () => {
      const introTemplates = promptService.getTemplatesByCategory(TemplateCategory.INTRODUCTION);
      const methTemplates = promptService.getTemplatesByCategory(TemplateCategory.METHODOLOGY);
      const analysisTemplates = promptService.getTemplatesByCategory(TemplateCategory.ANALYSIS);
      
      expect(introTemplates.length).toBe(1);
      expect(introTemplates[0].id).toBe('test-template-1');
      
      expect(methTemplates.length).toBe(1);
      expect(methTemplates[0].id).toBe('test-template-2');
      
      expect(analysisTemplates.length).toBe(0);
    });
  });
  
  describe('getTemplatesByTag', () => {
    it('should return templates by tag', () => {
      const testTemplates = promptService.getTemplatesByTag('test');
      const introTemplates = promptService.getTemplatesByTag('introduction');
      const methTemplates = promptService.getTemplatesByTag('methodology');
      const nonExistentTemplates = promptService.getTemplatesByTag('non-existent');
      
      expect(testTemplates.length).toBe(2);
      expect(introTemplates.length).toBe(1);
      expect(introTemplates[0].id).toBe('test-template-1');
      expect(methTemplates.length).toBe(1);
      expect(methTemplates[0].id).toBe('test-template-2');
      expect(nonExistentTemplates.length).toBe(0);
    });
  });
  
  describe('fillTemplate', () => {
    it('should fill a template with parameters', () => {
      const filled = promptService.fillTemplate('test-template-1', { test: 'sample' });
      
      expect(filled).toBe('This is a sample template');
    });
    
    it('should handle multiple parameters', () => {
      // Register a template with multiple parameters
      promptService.registerTemplate({
        id: 'multi-param',
        name: 'Multi Parameter Template',
        description: 'A template with multiple parameters',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'Hello {{name}}, welcome to {{place}}!'
      });
      
      const filled = promptService.fillTemplate('multi-param', { 
        name: 'John', 
        place: 'Paris' 
      });
      
      expect(filled).toBe('Hello John, welcome to Paris!');
    });
    
    it('should return null for non-existent templates', () => {
      const filled = promptService.fillTemplate('non-existent', { test: 'sample' });
      
      expect(filled).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Template with ID non-existent not found'
      );
    });
    
    it('should warn about unreplaced parameters', () => {
      const filled = promptService.fillTemplate('test-template-1', {});
      
      expect(filled).toBe('This is a {{test}} template');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Some parameters were not replaced: {{test}}'
      );
    });
    
    it('should handle null and undefined parameter values', () => {
      const filled = promptService.fillTemplate('test-template-1', { 
        test: null,
        other: undefined 
      });
      
      expect(filled).toBe('This is a {{test}} template');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Some parameters were not replaced: {{test}}'
      );
    });
    
    it('should convert non-string parameter values to strings', () => {
      // Register a template with numeric and boolean parameters
      promptService.registerTemplate({
        id: 'mixed-types',
        name: 'Mixed Types Template',
        description: 'A template with different parameter types',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['test'],
        template: 'Count: {{count}}, Active: {{active}}'
      });
      
      const filled = promptService.fillTemplate('mixed-types', { 
        count: 42, 
        active: true 
      });
      
      expect(filled).toBe('Count: 42, Active: true');
    });
  });
  
  describe('generateContent', () => {
    it('should generate content using a template', async () => {
      // Mock the AIClient.generateContent method
      vi.mocked(mockAIClient.generateContent).mockResolvedValue('Generated content');
      
      const content = await promptService.generateContent('test-template-1', { test: 'sample' });
      
      expect(content).toBe('Generated content');
      expect(mockAIClient.generateContent).toHaveBeenCalledWith('This is a sample template');
    });
    
    it('should return null if template is not found', async () => {
      const content = await promptService.generateContent('non-existent', { test: 'sample' });
      
      expect(content).toBeNull();
      expect(mockAIClient.generateContent).not.toHaveBeenCalled();
    });
    
    it('should handle errors during content generation', async () => {
      vi.mocked(mockAIClient.generateContent).mockRejectedValue(new Error('API error'));
      
      const content = await promptService.generateContent('test-template-1', { test: 'sample' });
      
      expect(content).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating content from template:',
        expect.any(Error)
      );
    });
    
    it('should use streaming when enabled', async () => {
      // Mock the streaming function to call the callback with chunks
      vi.mocked(mockAIClient.generateContentStream).mockImplementation(async (_prompt: string, callback?: (chunk: string, progress: number) => void) => {
        if (callback) {
          callback('Chunk 1', 25);
          callback('Chunk 2', 50);
          callback('Chunk 3', 75);
          callback('', 100);
        }
        return 'Chunk 1Chunk 2Chunk 3';
      });
      
      const onStreamMock = vi.fn();
      
      const content = await promptService.generateContent(
        'test-template-1', 
        { test: 'sample' },
        true,
        onStreamMock
      );
      
      expect(content).toBe('Chunk 1Chunk 2Chunk 3');
      expect(mockAIClient.generateContentStream).toHaveBeenCalledWith(
        'This is a sample template',
        expect.any(Function)
      );
      expect(onStreamMock).toHaveBeenCalledTimes(4);
      expect(onStreamMock).toHaveBeenCalledWith('Chunk 1', 25);
      expect(onStreamMock).toHaveBeenCalledWith('Chunk 2', 50);
      expect(onStreamMock).toHaveBeenCalledWith('Chunk 3', 75);
      expect(onStreamMock).toHaveBeenCalledWith('', 100);
    });
  });
  
  describe('singleton instance', () => {
    it('should export a singleton instance', async () => {
      // Import the singleton
      const { promptService: singletonService } = await import('../promptService');
      
      expect(singletonService).toBeInstanceOf(PromptService);
    });
    
    it('should export the singleton as default', async () => {
      // Import the default export
      const defaultExport = await import('../promptService');
      
      expect(defaultExport.default).toBe(defaultExport.promptService);
    });
    
    it('should use a mock client in test mode', async () => {
      // Save original env
      const originalEnv = { ...import.meta.env };
      
      // Mock environment variable
      vi.stubGlobal('import.meta.env', {
        ...import.meta.env,
        MODE: 'test'
      });
      
      // Re-import to trigger the test mode code path
      const { promptService: testService } = await import('../promptService');
      
      // Test the mock client
      const result = await testService.generateContent('test-template-1', { test: 'sample' });
      expect(result).toContain('Generated content for:');
      
      // Restore original env
      vi.stubGlobal('import.meta.env', originalEnv);
    });
  });
});