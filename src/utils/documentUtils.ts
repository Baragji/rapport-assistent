// We'll use a simple approach instead of md-to-docx for now
// import { toDocx } from 'md-to-docx';

/**
 * Converts markdown content to a DOCX file and triggers download
 * @param markdown The markdown content to convert
 * @param fileName The name of the file to download (without extension)
 */
export const convertMarkdownToDocx = async (
  markdown: string,
  fileName: string = 'report'
): Promise<Blob> => {
  try {
    // Create a simple Blob as a placeholder
    // In a real app, we would use a proper markdown-to-docx conversion
    const docxBlob = new Blob([markdown], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    // Create a download link and trigger download
    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return docxBlob;
  } catch (error) {
    console.error('Error converting markdown to DOCX:', error);
    throw error;
  }
};

/**
 * Validates if a string contains valid markdown
 * This is a simple validation that checks for common markdown elements
 * @param markdown The markdown string to validate
 * @returns boolean indicating if the string contains valid markdown
 */
export const isValidMarkdown = (markdown: string): boolean => {
  if (!markdown || typeof markdown !== 'string') {
    return false;
  }
  
  // Check for common markdown patterns
  const headingPattern = /^#{1,6}\s.+$/m;
  const listPattern = /^[-*+]\s.+$/m;
  const codeBlockPattern = /```[\s\S]*?```/;
  const linkPattern = /\[.+\]\(.+\)/;
  const emphasisPattern = /(\*\*|__).+(\*\*|__)/;
  
  return (
    headingPattern.test(markdown) ||
    listPattern.test(markdown) ||
    codeBlockPattern.test(markdown) ||
    linkPattern.test(markdown) ||
    emphasisPattern.test(markdown)
  );
};

/**
 * Generates a sample markdown report based on form data
 * @param title The report title
 * @param content The report content
 * @param category The report category
 * @returns A formatted markdown string
 */
export const generateMarkdownReport = (
  title: string,
  content: string,
  category: string
): string => {
  const date = new Date().toLocaleDateString();
  
  return `# ${title}

## Category: ${category}
**Date:** ${date}

## Content
${content}

---
*Generated with Rapport Assistent*
`;
};