import { toDocx } from 'md-to-docx';
import { unified } from 'unified';
import remarkParse from 'remark-parse';

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
    // Parse markdown to MDAST (Markdown Abstract Syntax Tree)
    const mdast = unified().use(remarkParse).parse(markdown);
    
    // Convert MDAST to DOCX using md-to-docx library
    const docxBlob = await toDocx(mdast, {
      title: fileName,
      creator: 'Rapport Assistent',
      description: 'Generated report document',
      subject: 'Report',
    }, {});
    
    // Create a download link and trigger download
    const url = URL.createObjectURL(docxBlob as Blob);
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
    
    return docxBlob as Blob;
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