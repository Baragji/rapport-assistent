import { TemplateCategory, type PromptTemplate, type TemplateCategoryType } from '../services/promptService';

/**
 * Interface for JSON template files
 */
export interface TemplateFile {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  tags: string[];
  template: string;
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
      
      // Convert string category to enum
      const category = this.stringToCategoryEnum(templateData.category);
      
      return {
        id: templateData.id,
        name: templateData.name,
        description: templateData.description,
        category,
        version: templateData.version,
        tags: templateData.tags,
        template: templateData.template,
        exampleInput: templateData.exampleInput,
        exampleOutput: templateData.exampleOutput
      };
    } catch (error) {
      console.error('Error loading template from JSON:', error);
      throw new Error('Failed to load template from JSON');
    }
  }
  
  /**
   * Convert a string category to the TemplateCategory type
   * @param category The category string
   * @returns The corresponding TemplateCategory value
   */
  private static stringToCategoryEnum(category: string): TemplateCategoryType {
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
    return templateJsonArray.map(json => this.loadFromJson(json));
  }
}

export default TemplateLoader;