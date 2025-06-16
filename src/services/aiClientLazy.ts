/**
 * Lazy-loaded AI client to reduce initial bundle size
 * This module dynamically imports the OpenAI SDK only when needed
 */

import type { AIClient, AIClientConfig } from './aiClient';

let aiClientInstance: AIClient | null = null;

/**
 * Lazy load the AI client
 * @param config Optional configuration for the AI client
 * @returns Promise that resolves to the AI client instance
 */
export async function getAIClient(config?: AIClientConfig): Promise<AIClient> {
  if (aiClientInstance) {
    return aiClientInstance;
  }

  // Dynamic import to split the OpenAI SDK into a separate chunk
  const { AIClient } = await import('./aiClient');
  aiClientInstance = new AIClient(config);

  return aiClientInstance;
}

/**
 * Check if AI client is available without loading it
 * @returns True if AI client is already loaded
 */
export function isAIClientLoaded(): boolean {
  return aiClientInstance !== null;
}

/**
 * Reset the AI client instance (useful for testing)
 */
export function resetAIClient(): void {
  aiClientInstance = null;
}

export default getAIClient;
