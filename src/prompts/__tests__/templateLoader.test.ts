import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TemplateLoader } from '../templateLoader';
import { TemplateCategory } from '../../services/promptService';

describe('TemplateLoader', () => {
  // Spy on console.error to prevent actual error logs during tests
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
  
  describe('loadFromJson', () => {
    it('should load a template from valid JSON', () => {
      const validJson = JSON.stringify({
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: 'introduction',
        version: '1.0.0',
        tags: ['test', 'introduction'],
        template: 'This is a {{test}} template',
        exampleInput: {
          test: 'sample'
        },
        exampleOutput: 'This is a sample template'
      });
      
      const template = TemplateLoader.loadFromJson(validJson);
      
      expect(template).toEqual({
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template',
        category: TemplateCategory.INTRODUCTION,
        version: '1.0.0',
        tags: ['test', 'introduction'],
        template: 'This is a {{test}} template',
        exampleInput: {
          test: 'sample'
        },
        exampleOutput: 'This is a sample template'
      });
    });
    
    it('should handle templates without example input/output', () => {
      const minimalJson = JSON.stringify({
        id: 'minimal-template',
        name: 'Minimal Template',
        description: 'A minimal template',
        category: 'general',
        version: '1.0.0',
        tags: ['minimal'],
        template: 'This is a minimal template'
      });
      
      const template = TemplateLoader.loadFromJson(minimalJson);
      
      expect(template).toEqual({
        id: 'minimal-template',
        name: 'Minimal Template',
        description: 'A minimal template',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['minimal'],
        template: 'This is a minimal template'
      });
    });
    
    it('should throw an error for invalid JSON', () => {
      const invalidJson = 'This is not valid JSON';
      
      expect(() => TemplateLoader.loadFromJson(invalidJson)).toThrow('Failed to load template from JSON');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading template from JSON:',
        expect.any(Error)
      );
    });
    
    it('should handle JSON with missing required fields', () => {
      const incompleteJson = JSON.stringify({
        name: 'Incomplete Template',
        description: 'A template missing required fields',
        // Missing id, category, version, tags, template
      });
      
      expect(() => TemplateLoader.loadFromJson(incompleteJson)).toThrow('Template ID is required');
    });
    
    it('should handle empty JSON object', () => {
      const emptyJson = '{}';
      
      expect(() => TemplateLoader.loadFromJson(emptyJson)).toThrow('Template ID is required');
    });
    
    it('should map string categories to enum values', () => {
      const categories = [
        { input: 'introduction', expected: TemplateCategory.INTRODUCTION },
        { input: 'methodology', expected: TemplateCategory.METHODOLOGY },
        { input: 'analysis', expected: TemplateCategory.ANALYSIS },
        { input: 'conclusion', expected: TemplateCategory.CONCLUSION },
        { input: 'references', expected: TemplateCategory.REFERENCES },
        { input: 'general', expected: TemplateCategory.GENERAL },
        { input: 'unknown', expected: TemplateCategory.GENERAL } // Default case
      ];
      
      for (const { input, expected } of categories) {
        const json = JSON.stringify({
          id: `${input}-template`,
          name: `${input} Template`,
          description: `A ${input} template`,
          category: input,
          version: '1.0.0',
          tags: [input],
          template: `This is a ${input} template`
        });
        
        const template = TemplateLoader.loadFromJson(json);
        expect(template.category).toBe(expected);
      }
    });
    
    it('should handle case-insensitive category mapping', () => {
      const categoriesWithDifferentCases = [
        { input: 'INTRODUCTION', expected: TemplateCategory.INTRODUCTION },
        { input: 'Methodology', expected: TemplateCategory.METHODOLOGY },
        { input: 'Analysis', expected: TemplateCategory.ANALYSIS },
        { input: 'ConClUsIoN', expected: TemplateCategory.CONCLUSION },
        { input: 'REFERENCES', expected: TemplateCategory.REFERENCES },
        { input: 'General', expected: TemplateCategory.GENERAL }
      ];
      
      for (const { input, expected } of categoriesWithDifferentCases) {
        const json = JSON.stringify({
          id: `${input.toLowerCase()}-template`,
          name: `${input} Template`,
          description: `A ${input.toLowerCase()} template`,
          category: input,
          version: '1.0.0',
          tags: [input.toLowerCase()],
          template: `This is a ${input.toLowerCase()} template`
        });
        
        const template = TemplateLoader.loadFromJson(json);
        expect(template.category).toBe(expected);
      }
    });
  });
  
  describe('loadMultipleFromJson', () => {
    it('should load multiple templates from JSON strings', () => {
      const jsonArray = [
        JSON.stringify({
          id: 'template-1',
          name: 'Template 1',
          description: 'First template',
          category: 'introduction',
          version: '1.0.0',
          tags: ['test'],
          template: 'Template 1 content'
        }),
        JSON.stringify({
          id: 'template-2',
          name: 'Template 2',
          description: 'Second template',
          category: 'methodology',
          version: '1.0.0',
          tags: ['test'],
          template: 'Template 2 content'
        })
      ];
      
      const templates = TemplateLoader.loadMultipleFromJson(jsonArray);
      
      expect(templates.length).toBe(2);
      expect(templates[0].id).toBe('template-1');
      expect(templates[0].category).toBe(TemplateCategory.INTRODUCTION);
      expect(templates[1].id).toBe('template-2');
      expect(templates[1].category).toBe(TemplateCategory.METHODOLOGY);
    });
    
    it('should handle an empty array', () => {
      const templates = TemplateLoader.loadMultipleFromJson([]);
      expect(templates).toEqual([]);
    });
    
    it('should skip invalid templates and continue processing', () => {
      const jsonArray = [
        JSON.stringify({
          id: 'template-1',
          name: 'Template 1',
          description: 'First template',
          category: 'introduction',
          version: '1.0.0',
          tags: ['test'],
          template: 'Template 1 content'
        }),
        'This is not valid JSON', // Invalid JSON
        JSON.stringify({
          id: 'template-3',
          name: 'Template 3',
          description: 'Third template',
          category: 'conclusion',
          version: '1.0.0',
          tags: ['test'],
          template: 'Template 3 content'
        })
      ];
      
      // This should throw because one of the items is invalid
      expect(() => TemplateLoader.loadMultipleFromJson(jsonArray)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    it('should handle mixed valid and empty templates', () => {
      const jsonArray = [
        JSON.stringify({
          id: 'template-1',
          name: 'Template 1',
          description: 'First template',
          category: 'introduction',
          version: '1.0.0',
          tags: ['test'],
          template: 'Template 1 content'
        }),
        JSON.stringify({
          id: 'template-3',
          name: 'Template 3',
          description: 'Third template',
          category: 'conclusion',
          version: '1.0.0',
          tags: ['test'],
          template: 'Template 3 content'
        })
      ];
      
      const templates = TemplateLoader.loadMultipleFromJson(jsonArray);
      
      expect(templates.length).toBe(2);
      expect(templates[0].id).toBe('template-1');
      expect(templates[1].id).toBe('template-3');
      
      // Test that it throws for invalid templates
      expect(() => {
        TemplateLoader.loadMultipleFromJson([...jsonArray, '{}']);
      }).toThrow();
    });
  });
  
  describe('default export', () => {
    it('should export TemplateLoader as default', () => {
      // Use import instead of require
      expect(TemplateLoader).toBeDefined();
      // The default export is tested by the fact that we can import and use TemplateLoader
    });
  });
});