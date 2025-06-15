import { describe, it, expect } from 'vitest';
import { TemplateLoader } from '../templateLoader';
import { TemplateCategory } from '../../services/promptService';

describe('TemplateLoader', () => {
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
      
      expect(() => TemplateLoader.loadFromJson(invalidJson)).toThrow();
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
  });
});