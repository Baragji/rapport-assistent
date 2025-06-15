import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isValidMarkdown, generateMarkdownReport } from './documentUtils';

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
});