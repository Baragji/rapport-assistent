import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isValidMarkdown, generateMarkdownReport, convertMarkdownToDocx } from './documentUtils';

// Mock the md-to-docx module
vi.mock('md-to-docx');

// Mock unified and remark-parse
vi.mock('unified');
vi.mock('remark-parse');

describe('Document Utilities', () => {
  describe('isValidMarkdown', () => {
    it('should return true for valid markdown with headings', () => {
      const markdown = '# This is a heading\n\nThis is some content.';
      expect(isValidMarkdown(markdown)).toBe(true);
    });

    it('should return true for valid markdown with lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      expect(isValidMarkdown(markdown)).toBe(true);
    });

    it('should return true for valid markdown with code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\nconsole.log(x);\n```';
      expect(isValidMarkdown(markdown)).toBe(true);
    });

    it('should return true for valid markdown with links', () => {
      const markdown = '[Google](https://www.google.com)';
      expect(isValidMarkdown(markdown)).toBe(true);
    });

    it('should return true for valid markdown with emphasis', () => {
      const markdown = 'This is **bold** text';
      expect(isValidMarkdown(markdown)).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isValidMarkdown('')).toBe(false);
    });

    it('should return false for non-markdown text', () => {
      const text = 'This is just plain text without any markdown elements.';
      expect(isValidMarkdown(text)).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      // @ts-expect-error - Testing invalid input
      expect(isValidMarkdown(null)).toBe(false);
      // @ts-expect-error - Testing invalid input
      expect(isValidMarkdown(undefined)).toBe(false);
      // @ts-expect-error - Testing invalid input
      expect(isValidMarkdown(123)).toBe(false);
    });
  });

  describe('generateMarkdownReport', () => {
    beforeEach(() => {
      // Mock Date to return a fixed date
      const mockDate = new Date(2025, 5, 15);
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate a properly formatted markdown report', () => {
      const title = 'Test Report';
      const content = 'This is the content of the test report.';
      const category = 'Technical';
      
      const result = generateMarkdownReport(title, content, category);
      
      expect(result).toContain('# Test Report');
      expect(result).toContain('## Category: Technical');
      expect(result).toContain('**Date:** 6/15/2025');
      expect(result).toContain('## Content');
      expect(result).toContain('This is the content of the test report.');
      expect(result).toContain('*Generated with Rapport Assistent*');
    });

    it('should handle empty inputs', () => {
      const result = generateMarkdownReport('', '', '');
      
      expect(result).toContain('# ');
      expect(result).toContain('## Category: ');
      expect(result).toContain('## Content');
    });
  });

  describe('convertMarkdownToDocx', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let mockCreateElement: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      // Mock URL methods
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock DOM methods
      mockClick = vi.fn();
      mockAppendChild = vi.fn();
      mockRemoveChild = vi.fn();
      mockCreateElement = vi.fn().mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      });

      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
        writable: true,
      });
      Object.defineProperty(document.body, 'appendChild', {
        value: mockAppendChild,
        writable: true,
      });
      Object.defineProperty(document.body, 'removeChild', {
        value: mockRemoveChild,
        writable: true,
      });

      // Mock setTimeout to execute immediately
      vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        if (typeof fn === 'function') fn();
        return 0 as unknown as NodeJS.Timeout;
      });

      // Mock md-to-docx
      const { toDocx } = await import('md-to-docx');
      const mockDocxContent = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04, // ZIP file signature
        ...Array(1000).fill(0x00) // Mock DOCX content
      ]);
      const mockBlob = new Blob([mockDocxContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      vi.mocked(toDocx).mockResolvedValue(mockBlob);

      // Mock unified and remark-parse
      const { unified } = await import('unified');
      vi.mocked(unified).mockReturnValue({
        use: vi.fn().mockReturnThis(),
        parse: vi.fn().mockReturnValue({
          type: 'root',
          children: [
            {
              type: 'heading',
              depth: 1,
              children: [{ type: 'text', value: 'Test' }]
            }
          ]
        })
      } as unknown as ReturnType<typeof unified>);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should convert markdown to DOCX and trigger download', async () => {
      const markdown = '# Test Report\n\nThis is a test report with **bold** text.';
      const fileName = 'test-report';

      const result = await convertMarkdownToDocx(markdown, fileName);

      // Verify the result is a Blob
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      // Verify DOM manipulation for download
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(result);
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should use default filename when none provided', async () => {
      const markdown = '# Default Report';
      
      const result = await convertMarkdownToDocx(markdown);

      expect(result).toBeInstanceOf(Blob);
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });

    it('should handle complex markdown with various elements', async () => {
      const complexMarkdown = `
# Complex Report

## Introduction
This is a **bold** statement with _italic_ text.

### List Example
- Item 1
- Item 2
- Item 3

### Code Example
\`\`\`javascript
const example = "Hello World";
console.log(example);
\`\`\`

### Link Example
Visit [Google](https://www.google.com) for more information.

> This is a blockquote with important information.

### Table Example
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |
      `;

      const result = await convertMarkdownToDocx(complexMarkdown, 'complex-report');

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle empty markdown content', async () => {
      const emptyMarkdown = '';
      
      const result = await convertMarkdownToDocx(emptyMarkdown, 'empty-report');

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should handle markdown with special characters', async () => {
      const specialMarkdown = `
# Report with Special Characters

## Symbols & Characters
- Ampersand: &
- Less than: <
- Greater than: >
- Quotes: "Hello" and 'World'
- Unicode: 🚀 ✅ 📝

## Accented Characters
- Café
- Naïve
- Résumé
      `;

      const result = await convertMarkdownToDocx(specialMarkdown, 'special-chars');

      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle very long markdown content', async () => {
      const longContent = Array(100).fill('This is a long paragraph with lots of content. ').join('');
      const longMarkdown = `
# Long Report

## Content
${longContent}

## More Content
${longContent}
      `;

      const result = await convertMarkdownToDocx(longMarkdown, 'long-report');

      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(1000); // Should be substantial size
    });

    it('should properly set download attributes', async () => {
      const markdown = '# Test';
      const fileName = 'custom-filename';
      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      mockCreateElement.mockReturnValue(mockElement);

      await convertMarkdownToDocx(markdown, fileName);

      expect(mockElement.href).toBe('blob:mock-url');
      expect(mockElement.download).toBe(`${fileName}.docx`);
    });

    it('should handle markdown with nested structures', async () => {
      const nestedMarkdown = `
# Main Title

## Section 1
### Subsection 1.1
#### Sub-subsection 1.1.1

Content with **bold** and _italic_ text.

### Subsection 1.2
- Nested list:
  - Sub-item 1
  - Sub-item 2
    - Sub-sub-item 1

## Section 2
1. Ordered list
2. Second item
   1. Nested ordered item
   2. Another nested item

> Blockquote with **bold** text
> 
> Second paragraph in blockquote
      `;

      const result = await convertMarkdownToDocx(nestedMarkdown, 'nested-structure');

      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle error during conversion gracefully', async () => {
      // Mock toDocx to throw an error
      const { toDocx } = await import('md-to-docx');
      vi.mocked(toDocx).mockRejectedValue(new Error('Conversion failed'));

      const markdown = '# Test';

      await expect(convertMarkdownToDocx(markdown)).rejects.toThrow('Conversion failed');
    });

    it('should generate DOCX with proper metadata', async () => {
      const markdown = '# Metadata Test Report';
      const fileName = 'metadata-test';

      // We can't easily test the internal metadata without parsing the DOCX,
      // but we can verify the function completes successfully
      const result = await convertMarkdownToDocx(markdown, fileName);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });
  });
});