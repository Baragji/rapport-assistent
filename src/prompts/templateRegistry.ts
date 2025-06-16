/**
 * Template registry for loading external JSON templates
 * This provides a cleaner separation between code and prompt templates
 */

import type { PromptTemplate, TemplateCategoryType } from '../services/promptService';

// Import JSON templates (these will be bundled but separated from code)
import introductionTemplate from './templates/introduction.json';
import methodologyTemplate from './templates/methodology.json';
import redThreadTemplate from './templates/red-thread.json';

/**
 * Registry of all available templates
 */
export const templateRegistry: PromptTemplate[] = [
  // External JSON templates
  introductionTemplate as PromptTemplate,
  methodologyTemplate as PromptTemplate,
  redThreadTemplate as PromptTemplate,

  // Fallback hardcoded templates for critical functionality
  {
    id: 'analysis-data',
    name: 'Data Analysis',
    description: 'Generate data analysis and findings section',
    category: 'analysis' as TemplateCategoryType,
    version: '1.0.0',
    tags: ['analysis', 'data', 'findings'],
    template: `Create a comprehensive data analysis section for a research study on {{topic}}. The analysis should:

1. Present key findings related to {{researchQuestion}}
2. Analyze data points: {{dataPoints}}
3. Identify patterns, trends, and relationships
4. Compare results with existing literature
5. Discuss statistical significance where applicable
6. Present findings in a logical, structured manner

Use clear, objective language and support all claims with evidence from the data.`,
    exampleInput: {
      topic: 'user behavior analysis',
      researchQuestion: 'How do users interact with the interface?',
      dataPoints: 'Click rates, time on page, conversion metrics',
    },
  },

  {
    id: 'improve-clarity',
    name: 'Improve Text Clarity',
    description: 'Improve the clarity and readability of text',
    category: 'general' as TemplateCategoryType,
    version: '1.0.0',
    tags: ['clarity', 'improvement', 'editing'],
    template: `Improve the clarity, readability, and flow of the following text while maintaining its original meaning and academic tone:

Original text: {{originalText}}

Please:
1. Enhance sentence structure and flow
2. Improve word choice and precision
3. Ensure logical progression of ideas
4. Maintain the original meaning and tone
5. Fix any grammatical or stylistic issues

Provide the improved version that is clearer and more engaging while preserving the academic integrity.`,
    exampleInput: {
      originalText: 'The research showed results that were significant.',
    },
  },
];

/**
 * Get all templates from the registry
 */
export function getAllTemplates(): PromptTemplate[] {
  return templateRegistry;
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return templateRegistry.find(template => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategoryType): PromptTemplate[] {
  return templateRegistry.filter(template => template.category === category);
}

export default templateRegistry;
