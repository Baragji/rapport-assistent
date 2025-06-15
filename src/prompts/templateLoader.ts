import { TemplateCategory, type PromptTemplate, type TemplateCategoryType } from '../services/promptService';

/**
 * Interface for JSON template files
 */
export interface TemplateFile {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  version?: string;
  tags?: string[];
  template?: string;
  exampleInput?: Record<string, string>;
  exampleOutput?: string;
}

/**
 * Utility class for loading templates from JSON files
 */
export class TemplateLoader {
  /**
   * Load a template from a JSON file
   * @param templateJson The JSON content of the template file
   * @returns A PromptTemplate object
   */
  static loadFromJson(templateJson: string): PromptTemplate {
    try {
      const templateData = JSON.parse(templateJson) as TemplateFile;
      
      // Validate required fields
      if (!templateData.id) {
        throw new Error('Template ID is required');
      }
      if (!templateData.name) {
        throw new Error('Template name is required');
      }
      if (!templateData.description) {
        throw new Error('Template description is required');
      }
      if (!templateData.version) {
        throw new Error('Template version is required');
      }
      if (!templateData.template) {
        throw new Error('Template content is required');
      }
      
      // Convert string category to enum
      const category = this.stringToCategoryEnum(templateData.category);
      
      return {
        id: templateData.id,
        name: templateData.name,
        description: templateData.description,
        category,
        version: templateData.version,
        tags: templateData.tags || [],
        template: templateData.template,
        exampleInput: templateData.exampleInput,
        exampleOutput: templateData.exampleOutput
      };
    } catch (error) {
      // Re-throw validation errors directly
      if (error instanceof Error && 
          (error.message.includes('required') || 
           error.message.includes('Template'))) {
        console.error('Template validation error:', error);
        throw error;
      }
      
      // For other errors (like JSON parsing), use the generic message
      console.error('Error loading template from JSON:', error);
      throw new Error('Failed to load template from JSON');
    }
  }
  
  /**
   * Convert a string category to the TemplateCategory type
   * @param category The category string
   * @returns The corresponding TemplateCategory value
   */
  private static stringToCategoryEnum(category?: string): TemplateCategoryType {
    if (!category) {
      return TemplateCategory.GENERAL;
    }
    
    switch (category.toLowerCase()) {
      case 'introduction':
        return TemplateCategory.INTRODUCTION;
      case 'methodology':
        return TemplateCategory.METHODOLOGY;
      case 'analysis':
        return TemplateCategory.ANALYSIS;
      case 'conclusion':
        return TemplateCategory.CONCLUSION;
      case 'references':
        return TemplateCategory.REFERENCES;
      case 'general':
      default:
        return TemplateCategory.GENERAL;
    }
  }
  
  /**
   * Load multiple templates from JSON files
   * @param templateJsonArray Array of JSON strings
   * @returns Array of PromptTemplate objects
   */
  static loadMultipleFromJson(templateJsonArray: string[]): PromptTemplate[] {
    const templates: PromptTemplate[] = [];
    
    for (const json of templateJsonArray) {
      try {
        const template = this.loadFromJson(json);
        templates.push(template);
      } catch (error) {
        console.error('Error loading template from JSON array:', error);
        throw error;
      }
    }
    
    return templates;
  }
}

export default TemplateLoader;