import { useState, useCallback, useMemo } from 'react';
import { AIClient, AIError, AIErrorType } from '../services/aiClient';
import { promptService } from '../services/promptService';
import type { TemplateParams } from '../services/promptService';

/**
 * Interface for the useAI hook return value
 */
export interface UseAIResult {
  /**
   * Generated content from the AI
   */
  content: string;
  
  /**
   * Whether the AI is currently generating content
   */
  isLoading: boolean;
  
  /**
   * Error message if the AI generation failed
   */
  error: string | null;
  
  /**
   * Progress of the streaming response (0-100)
   */
  progress: number;
  
  /**
   * Generate content using a template ID and parameters
   */
  generateContent: (templateId: string, params: TemplateParams) => Promise<string>;
  
  /**
   * Generate content using a raw prompt
   */
  generateFromPrompt: (prompt: string) => Promise<string>;
  
  /**
   * Reset the state of the hook
   */
  reset: () => void;
}

/**
 * Options for the useAI hook
 */
export interface UseAIOptions {
  /**
   * Custom AI client instance
   */
  client?: AIClient;
  
  /**
   * Whether to use streaming responses
   */
  streaming?: boolean;
  
  /**
   * Callback for streaming updates
   */
  onStream?: (chunk: string, progress: number) => void;
  
  /**
   * Callback for when generation is complete
   */
  onComplete?: (content: string) => void;
  
  /**
   * Callback for when an error occurs
   */
  onError?: (error: AIError) => void;
}

/**
 * Hook for AI-assisted content generation
 * 
 * @param options Configuration options for the hook
 * @returns UseAIResult object with state and methods
 */
export const useAI = (options: UseAIOptions = {}): UseAIResult => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  // Use provided client or default to the singleton instance
  const client = useMemo(() => options.client || new AIClient(), [options.client]);
  
  /**
   * Reset the state of the hook
   */
  const reset = useCallback(() => {
    setContent('');
    setIsLoading(false);
    setError(null);
    setProgress(0);
  }, []);
  
  /**
   * Generate content using a template ID and parameters
   */
  const generateContent = useCallback(async (
    templateId: string, 
    params: TemplateParams
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Get the filled template
      const filledTemplate = promptService.fillTemplate(templateId, params);
      
      if (!filledTemplate) {
        throw new AIError(
          `Template with ID ${templateId} not found`,
          AIErrorType.INVALID_REQUEST,
          false
        );
      }
      
      let result: string;
      
      // Use streaming if enabled
      if (options.streaming) {
        result = await client.generateContentStream(
          filledTemplate,
          (chunk: string, progress: number) => {
            setContent(prev => prev + chunk);
            setProgress(progress);
            options.onStream?.(chunk, progress);
          }
        );
      } else {
        // Use regular generation
        result = await client.generateContent(filledTemplate);
        setContent(result);
        setProgress(100);
      }
      
      // Call onComplete callback
      options.onComplete?.(result);
      
      return result;
    } catch (err) {
      const aiError = err instanceof AIError 
        ? err 
        : new AIError(
            err instanceof Error ? err.message : 'Unknown error occurred',
            AIErrorType.UNKNOWN,
            false,
            err
          );
      
      setError(aiError.message);
      options.onError?.(aiError);
      
      throw aiError;
    } finally {
      setIsLoading(false);
    }
  }, [client, options]);
  
  /**
   * Generate content using a raw prompt
   */
  const generateFromPrompt = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      let result: string;
      
      // Use streaming if enabled
      if (options.streaming) {
        result = await client.generateContentStream(
          prompt,
          (chunk: string, progress: number) => {
            setContent(prev => prev + chunk);
            setProgress(progress);
            options.onStream?.(chunk, progress);
          }
        );
      } else {
        // Use regular generation
        result = await client.generateContent(prompt);
        setContent(result);
        setProgress(100);
      }
      
      // Call onComplete callback
      options.onComplete?.(result);
      
      return result;
    } catch (err) {
      const aiError = err instanceof AIError 
        ? err 
        : new AIError(
            err instanceof Error ? err.message : 'Unknown error occurred',
            AIErrorType.UNKNOWN,
            false,
            err
          );
      
      setError(aiError.message);
      options.onError?.(aiError);
      
      throw aiError;
    } finally {
      setIsLoading(false);
    }
  }, [client, options]);
  
  return {
    content,
    isLoading,
    error,
    progress,
    generateContent,
    generateFromPrompt,
    reset
  };
};

export default useAI;