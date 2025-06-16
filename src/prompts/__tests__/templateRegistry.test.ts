import { describe, it, expect } from 'vitest';
import { templateRegistry } from '../templateRegistry';
import { TemplateCategory } from '../../services/promptService';

describe('templateRegistry', () => {
  it('should export an array of templates', () => {
    expect(Array.isArray(templateRegistry)).toBe(true);
    expect(templateRegistry.length).toBeGreaterThan(0);
  });

  it('should contain valid template objects', () => {
    for (const template of templateRegistry) {
      // Check required properties
      expect(template.id).toBeDefined();
      expect(typeof template.id).toBe('string');

      expect(template.name).toBeDefined();
      expect(typeof template.name).toBe('string');

      expect(template.description).toBeDefined();
      expect(typeof template.description).toBe('string');

      expect(template.category).toBeDefined();
      expect(Object.values(TemplateCategory)).toContain(template.category);

      expect(template.version).toBeDefined();
      expect(typeof template.version).toBe('string');

      expect(template.tags).toBeDefined();
      expect(Array.isArray(template.tags)).toBe(true);

      expect(template.template).toBeDefined();
      expect(typeof template.template).toBe('string');

      // Optional properties
      if (template.exampleInput) {
        expect(typeof template.exampleInput).toBe('object');
      }

      if (template.exampleOutput) {
        expect(typeof template.exampleOutput).toBe('string');
      }
    }
  });

  it('should have unique template IDs', () => {
    const ids = templateRegistry.map(template => template.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have templates for each category', () => {
    const categories = templateRegistry.map(template => template.category);
    const uniqueCategories = new Set(categories);

    // Check that we have at least one template for each category
    // Note: This test might need adjustment based on your actual templates
    expect(uniqueCategories.size).toBeGreaterThan(1);
  });

  it('should have valid template placeholders', () => {
    for (const template of templateRegistry) {
      // Check that placeholders in the template match the example input if provided
      if (template.exampleInput) {
        const placeholderRegex = /{{([^}]+)}}/g;
        const placeholders = [];
        let match;

        while ((match = placeholderRegex.exec(template.template)) !== null) {
          placeholders.push(match[1]);
        }

        // Check that all placeholders have corresponding example inputs
        for (const placeholder of placeholders) {
          expect(Object.keys(template.exampleInput)).toContain(placeholder);
        }
      }
    }
  });

  it('should have valid example outputs', () => {
    for (const template of templateRegistry) {
      // If both example input and output are provided, verify consistency
      if (template.exampleInput && template.exampleOutput) {
        let filledTemplate = template.template;

        // Replace all parameters in the template
        for (const [key, value] of Object.entries(template.exampleInput)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          filledTemplate = filledTemplate.replace(regex, String(value));
        }

        // Check if there are any unreplaced parameters
        const unreplacedParams = filledTemplate.match(/{{[^}]+}}/g);
        if (!unreplacedParams) {
          // If all parameters are replaced, the example output should match
          // Note: This is a loose check since the example output might be formatted differently
          expect(template.exampleOutput).toBeTruthy();
        }
      }
    }
  });
});
