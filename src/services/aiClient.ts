import OpenAI from 'openai';

/**
 * OpenAI client for generating AI-assisted content
 * This service handles communication with the OpenAI API
 */
export class AIClient {
  private client: OpenAI;
  
  /**
   * Initialize the OpenAI client with API key from environment variables
   */
  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey || 'dummy-key-for-development',
    });
  }
  
  /**
   * Generate content using OpenAI's completion API
   * @param prompt The prompt to send to the API
   * @returns The generated text
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating content from OpenAI:', error);
      throw new Error('Failed to generate AI content. Please try again later.');
    }
  }
}

// Export a singleton instance for use throughout the application
export const aiClient = new AIClient();

// Default export for easier imports
export default aiClient;