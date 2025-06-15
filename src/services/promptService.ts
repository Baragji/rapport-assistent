import { AIClient } from './aiClient';

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
    // Load templates from the templates directory
    const defaultTemplates = [
      // Introduction templates
      {
        id: 'introduction-academic',
        name: 'Academic Introduction',
        description: 'Creates an academic introduction for a report',
        category: TemplateCategory.INTRODUCTION,
        version: '1.0.0',
        tags: ['academic', 'introduction', 'formal'],
        template: `
          Write an academic introduction for a report on the topic of {{topic}}.
          The introduction should:
          - Provide context and background information
          - Clearly state the purpose of the report
          - Outline the scope and limitations
          - Present the main research question or hypothesis: {{researchQuestion}}
          - Briefly mention the methodology used
          - Use formal academic language
          - Be approximately 250-300 words
        `,
        exampleInput: {
          topic: 'Climate change impacts on coastal communities',
          researchQuestion: 'How are rising sea levels affecting infrastructure in coastal cities?'
        },
        exampleOutput: 'Climate change represents one of the most significant challenges facing humanity in the 21st century...'
      },
      
      // Methodology templates
      {
        id: 'methodology-qualitative',
        name: 'Qualitative Research Methodology',
        description: 'Describes a qualitative research methodology',
        category: TemplateCategory.METHODOLOGY,
        version: '1.0.0',
        tags: ['methodology', 'qualitative', 'research'],
        template: `
          Write a methodology section for a qualitative research study on {{topic}}.
          The methodology should:
          - Describe the qualitative approach used ({{approach}})
          - Explain the participant selection process and criteria
          - Detail the data collection methods
          - Outline the data analysis procedures
          - Address ethical considerations
          - Discuss limitations of the methodology
          - Use appropriate academic terminology
          - Be approximately 300-350 words
        `,
        exampleInput: {
          topic: 'Work-life balance in remote work environments',
          approach: 'phenomenological study'
        },
        exampleOutput: 'This study employed a qualitative research design using a phenomenological approach to explore...'
      },
      
      // Analysis templates
      {
        id: 'analysis-data',
        name: 'Data Analysis',
        description: 'Provides a framework for analyzing research data',
        category: TemplateCategory.ANALYSIS,
        version: '1.0.0',
        tags: ['analysis', 'data', 'research'],
        template: `
          Write an analysis section for a report on {{topic}} based on the following data points:
          {{dataPoints}}
          
          The analysis should:
          - Identify key patterns and trends in the data
          - Compare and contrast different findings
          - Relate the findings to the research question: {{researchQuestion}}
          - Support claims with evidence from the data
          - Consider alternative interpretations
          - Use critical thinking and analytical reasoning
          - Be approximately 400-450 words
        `,
        exampleInput: {
          topic: 'Consumer behavior in e-commerce',
          researchQuestion: 'How does website design influence purchasing decisions?',
          dataPoints: '- 67% of users abandoned carts when navigation was complex\n- Average time spent on simplified interfaces was 3.5 minutes longer\n- Conversion rates were 23% higher on redesigned pages'
        },
        exampleOutput: 'The analysis of consumer behavior data reveals several significant patterns related to website design...'
      },
      
      // Conclusion templates
      {
        id: 'conclusion-recommendations',
        name: 'Conclusion with Recommendations',
        description: 'Creates a conclusion with actionable recommendations',
        category: TemplateCategory.CONCLUSION,
        version: '1.0.0',
        tags: ['conclusion', 'recommendations', 'summary'],
        template: `
          Write a conclusion for a report on {{topic}} that includes recommendations.
          
          The conclusion should:
          - Summarize the key findings from the research
          - Answer the main research question: {{researchQuestion}}
          - Discuss the implications of the findings
          - Provide 3-5 specific, actionable recommendations
          - Suggest areas for future research
          - End with a compelling final statement
          - Be approximately 300-350 words
        `,
        exampleInput: {
          topic: 'Employee retention strategies in tech companies',
          researchQuestion: 'What factors most influence employee retention in the technology sector?'
        },
        exampleOutput: 'This research has examined the multifaceted factors influencing employee retention in technology companies...'
      },
      
      // References templates
      {
        id: 'references-formatter',
        name: 'References Formatter',
        description: 'Formats reference entries according to academic standards',
        category: TemplateCategory.REFERENCES,
        version: '1.0.0',
        tags: ['references', 'citation', 'formatting'],
        template: `
          Format the following references according to the {{citationStyle}} citation style:
          
          {{rawReferences}}
          
          Please ensure:
          - All references are properly formatted
          - References are sorted alphabetically by author's last name
          - All required information is included for each reference type
          - DOIs are included where available
        `,
        exampleInput: {
          citationStyle: 'APA 7th edition',
          rawReferences: 'Smith, J. (2020) Climate Change and Society, Journal of Environmental Studies, 45(2)\nBrown, A and Johnson, T, 2019, Digital Transformation in Business, Harvard Business Review'
        },
        exampleOutput: 'Brown, A., & Johnson, T. (2019). Digital transformation in business. Harvard Business Review.\n\nSmith, J. (2020). Climate change and society. Journal of Environmental Studies, 45(2). https://doi.org/10.xxxx/xxxxx'
      },
      
      // General templates
      {
        id: 'improve-clarity',
        name: 'Improve Clarity and Coherence',
        description: 'Enhances the clarity and coherence of a text passage',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['clarity', 'coherence', 'editing'],
        template: `
          Improve the clarity and coherence of the following text while maintaining its original meaning:
          
          {{originalText}}
          
          Please:
          - Enhance sentence structure and flow
          - Improve paragraph transitions
          - Ensure logical progression of ideas
          - Maintain academic tone and style
          - Correct any grammatical or spelling errors
          - Keep approximately the same length
        `,
        exampleInput: {
          originalText: 'The research showed results that were significant. The participants in the study responded to the treatment. This has implications for future studies and also for practice in the field.'
        },
        exampleOutput: 'The research demonstrated statistically significant results. Participants responded positively to the treatment protocol, showing marked improvement across key metrics. These findings have important implications for both future research directions and practical applications in the field.'
      },
      {
        id: 'red-thread',
        name: 'Enhance Red Thread',
        description: 'Improves the "red thread" (logical connection) throughout a document',
        category: TemplateCategory.GENERAL,
        version: '1.0.0',
        tags: ['red thread', 'coherence', 'structure'],
        template: `
          Analyze the following document sections and suggest improvements to strengthen the "red thread" (logical connection) throughout:
          
          Introduction:
          {{introduction}}
          
          Main sections:
          {{mainSections}}
          
          Conclusion:
          {{conclusion}}
          
          Please provide:
          - An analysis of how well the document maintains a clear focus and purpose
          - Specific suggestions for improving connections between sections
          - Recommendations for strengthening the logical flow from introduction to conclusion
          - Ideas for recurring themes or concepts that could be emphasized
          - 2-3 concrete examples of revisions that would enhance the red thread
        `,
        exampleInput: {
          introduction: 'This report examines sustainable urban planning practices in Nordic cities...',
          mainSections: 'Section 1: Transportation infrastructure\nSection 2: Energy efficiency in buildings\nSection 3: Public green spaces',
          conclusion: 'The findings indicate that integrated approaches to urban sustainability yield the best results.'
        },
        exampleOutput: 'Analysis of Red Thread:\nThe document presents related topics within urban sustainability but could more explicitly connect these elements throughout...'
      }
    ];
    
    // Add templates to the map
    for (const template of defaultTemplates) {
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