import { AIClient } from './aiClient';
import { templateRegistry } from '../prompts/templateRegistry';

/**
 * Template category types for organizing prompt templates
 */
export const TemplateCategory = {
  INTRODUCTION: 'introduction',
  METHODOLOGY: 'methodology',
  ANALYSIS: 'analysis',
  CONCLUSION: 'conclusion',
  REFERENCES: 'references',
  GENERAL: 'general'
} as const;

export type TemplateCategoryType = typeof TemplateCategory[keyof typeof TemplateCategory];

/**
 * Interface for prompt template metadata
 */
export interface PromptTemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategoryType;
  version: string;
  tags: string[];
}

/**
 * Interface for a complete prompt template
 */
export interface PromptTemplate extends PromptTemplateMetadata {
  template: string;
  exampleInput?: Record<string, unknown>;
  exampleOutput?: string;
}

/**
 * Input parameters for generating content from a template
 */
export interface TemplateParams {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Service for managing and using prompt templates
 */
export class PromptService {
  private templates: Map<string, PromptTemplate> = new Map();
  private aiClient: AIClient;
  
  /**
   * Initialize the prompt service with the AI client
   */
  constructor(aiClient: AIClient) {
    this.aiClient = aiClient;
    this.loadDefaultTemplates();
  }
  
  /**
   * Load the default templates into the service
   */
  private loadDefaultTemplates(): void {
    // Load templates from the external registry
    for (const template of templateRegistry) {
      this.templates.set(template.id, template);
    }
  }
  
  /**
   * Register a new template or update an existing one
   * @param template The template to register
   * @returns True if successful, false if failed
   */
  registerTemplate(template: PromptTemplate): boolean {
    if (!template.id || !template.template) {
      console.error('Template must have an ID and template text');
      return false;
    }
    
    this.templates.set(template.id, template);
    return true;
  }
  
  /**
   * Get a template by ID
   * @param id The template ID
   * @returns The template or undefined if not found
   */
  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }
  
  /**
   * Get all templates
   * @returns Array of all templates
   */
  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
  
  /**
   * Get templates by category
   * @param category The template category
   * @returns Array of templates in the category
   */
  getTemplatesByCategory(category: TemplateCategoryType): PromptTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }
  
  /**
   * Get templates by tag
   * @param tag The tag to filter by
   * @returns Array of templates with the tag
   */
  getTemplatesByTag(tag: string): PromptTemplate[] {
    return this.getAllTemplates().filter(template => template.tags.includes(tag));
  }
  
  /**
   * Fill a template with parameters
   * @param templateId The template ID
   * @param params The parameters to fill the template with
   * @returns The filled template string or null if template not found
   */
  fillTemplate(templateId: string, params: TemplateParams): string | null {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error(`Template with ID ${templateId} not found`);
      return null;
    }
    
    let filledTemplate = template.template;
    
    // Replace all parameters in the template
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        filledTemplate = filledTemplate.replace(regex, String(value));
      }
    }
    
    // Check if there are any unreplaced parameters
    const unreplacedParams = filledTemplate.match(/{{[^}]+}}/g);
    if (unreplacedParams) {
      console.warn(`Some parameters were not replaced: ${unreplacedParams.join(', ')}`);
    }
    
    return filledTemplate;
  }
  
  /**
   * Generate content using a template and the AI client
   * @param templateId The template ID
   * @param params The parameters to fill the template with
   * @param streaming Whether to use streaming API
   * @param onStream Callback for streaming updates
   * @returns The generated content or null if failed
   */
  async generateContent(
    templateId: string, 
    params: TemplateParams,
    streaming = false,
    onStream?: (chunk: string, progress: number) => void
  ): Promise<string | null> {
    const filledTemplate = this.fillTemplate(templateId, params);
    if (!filledTemplate) {
      return null;
    }
    
    try {
      let content: string;
      
      if (streaming && onStream) {
        content = await this.aiClient.generateContentStream(filledTemplate, onStream);
      } else {
        content = await this.aiClient.generateContent(filledTemplate);
      }
      
      return content;
    } catch (error) {
      console.error('Error generating content from template:', error);
      return null;
    }
  }
}

// Create AIClient instance with appropriate configuration
const createAIClient = () => {
  // In test environment, we'll use a mock or special configuration
  if (import.meta.env.MODE === 'test') {
    // Return a minimal mock for tests
    return {
      generateContent: async (prompt: string) => `Generated content for: ${prompt.substring(0, 20)}...`
    } as AIClient;
  }
  
  // For production/development, use the real client
  return new AIClient();
};

// Export a singleton instance for use throughout the application
export const promptService = new PromptService(createAIClient());

// Default export for easier imports
export default promptService;