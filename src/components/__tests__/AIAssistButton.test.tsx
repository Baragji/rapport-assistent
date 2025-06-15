import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AIAssistButton from '../AIAssistButton';
import { promptService } from '../../services/promptService';

// Mock the promptService
vi.mock('../../services/promptService', () => ({
  promptService: {
    generateContent: vi.fn(),
  },
}));

describe('AIAssistButton', () => {
  const mockTemplateId = 'test-template';
  const mockTemplateParams = { topic: 'Test Topic' };
  const mockOnContentGenerated = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with default props', () => {
    render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
      />
    );
    
    const button = screen.getByTestId('ai-assist-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('AI Assist');
    expect(button).not.toBeDisabled();
  });
  
  it('renders with custom label and is disabled', () => {
    render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
        label="Generate Content"
        disabled={true}
      />
    );
    
    const button = screen.getByTestId('ai-assist-button');
    expect(button).toHaveTextContent('Generate Content');
    expect(button).toBeDisabled();
  });
  
  // Helper function to create a delayed promise
  const createDelayedPromise = (value: string, delay: number): Promise<string> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(value), delay);
    });
  };

  it('shows loading state when generating content', async () => {
    // Mock the generateContent to return a promise that doesn't resolve immediately
    vi.mocked(promptService.generateContent).mockImplementation(
      () => createDelayedPromise('Generated content', 100)
    );
    
    render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
      />
    );
    
    const button = screen.getByTestId('ai-assist-button');
    fireEvent.click(button);
    
    // Button should be in loading state
    expect(button).toHaveClass('opacity-70');
    expect(button).toHaveClass('cursor-wait');
    
    // Wait for the content generation to complete
    await waitFor(() => {
      expect(mockOnContentGenerated).toHaveBeenCalledWith('Generated content');
    });
  });
  
  it('calls onContentGenerated with the generated content', async () => {
    vi.mocked(promptService.generateContent).mockResolvedValue('Generated content');
    
    render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
      />
    );
    
    const button = screen.getByTestId('ai-assist-button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(promptService.generateContent).toHaveBeenCalledWith(mockTemplateId, mockTemplateParams);
      expect(mockOnContentGenerated).toHaveBeenCalledWith('Generated content');
    });
  });
  
  it('displays an error message when content generation fails', async () => {
    vi.mocked(promptService.generateContent).mockRejectedValue(new Error('API error'));
    
    render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
      />
    );
    
    const button = screen.getByTestId('ai-assist-button');
    fireEvent.click(button);
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('ai-assist-button-error');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('API error');
    });
  });
  
  it('renders with different size variants', () => {
    const { rerender } = render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
        size="small"
      />
    );
    
    let button = screen.getByTestId('ai-assist-button');
    expect(button).toHaveClass('px-2 py-1 text-xs');
    
    rerender(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
        size="large"
      />
    );
    
    button = screen.getByTestId('ai-assist-button');
    expect(button).toHaveClass('px-4 py-2 text-base');
  });
  
  it('renders with different style variants', () => {
    const { rerender } = render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
        variant="secondary"
      />
    );
    
    let button = screen.getByTestId('ai-assist-button');
    expect(button).toHaveClass('bg-gray-200');
    
    rerender(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
        variant="outline"
      />
    );
    
    button = screen.getByTestId('ai-assist-button');
    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('border-blue-600');
  });
  
  it('applies custom className', () => {
    render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
        className="custom-class"
      />
    );
    
    const button = screen.getByTestId('ai-assist-button');
    expect(button).toHaveClass('custom-class');
  });
  
  it('displays tooltip when provided', () => {
    render(
      <AIAssistButton
        templateId={mockTemplateId}
        templateParams={mockTemplateParams}
        onContentGenerated={mockOnContentGenerated}
        tooltip="Generate content with AI"
      />
    );
    
    const button = screen.getByTestId('ai-assist-button');
    expect(button).toHaveAttribute('title', 'Generate content with AI');
  });
});