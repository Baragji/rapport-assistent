import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateUrl,
  validateYear,
  validateMinLength,
  validateReference
} from '../validationUtils';

describe('validationUtils', () => {
  describe('validateRequired', () => {
    it('should validate required fields correctly', () => {
      expect(validateRequired('', 'Field').isValid).toBe(false);
      expect(validateRequired('  ', 'Field').isValid).toBe(false);
      expect(validateRequired('value', 'Field').isValid).toBe(true);
    });

    it('should return appropriate error messages', () => {
      expect(validateRequired('', 'Title').message).toBe('Title is required');
      expect(validateRequired('value', 'Title').message).toBe('');
    });
  });

  describe('validateUrl', () => {
    it('should validate URLs correctly', () => {
      expect(validateUrl('https://example.com').isValid).toBe(true);
      expect(validateUrl('http://sub.domain.co.uk/path?query=1').isValid).toBe(true);
      expect(validateUrl('not-a-url').isValid).toBe(false);
      expect(validateUrl('www.example.com').isValid).toBe(false); // Missing protocol
    });

    it('should handle required flag correctly', () => {
      expect(validateUrl('', false).isValid).toBe(true); // Not required, empty is valid
      expect(validateUrl('', true).isValid).toBe(false); // Required, empty is invalid
    });
  });

  describe('validateYear', () => {
    it('should validate years correctly', () => {
      expect(validateYear('2020').isValid).toBe(true);
      expect(validateYear('202').isValid).toBe(false); // Not 4 digits
      expect(validateYear('20201').isValid).toBe(false); // More than 4 digits
      
      const currentYear = new Date().getFullYear();
      const futureYear = (currentYear + 1).toString();
      expect(validateYear(futureYear).isValid).toBe(false); // Future year
    });

    it('should handle required flag correctly', () => {
      expect(validateYear('', false).isValid).toBe(true); // Not required, empty is valid
      expect(validateYear('', true).isValid).toBe(false); // Required, empty is invalid
    });
  });

  describe('validateMinLength', () => {
    it('should validate minimum length correctly', () => {
      expect(validateMinLength('abc', 3, 'Field').isValid).toBe(true);
      expect(validateMinLength('ab', 3, 'Field').isValid).toBe(false);
      expect(validateMinLength('   abc   ', 3, 'Field').isValid).toBe(true); // Trims whitespace
    });

    it('should return appropriate error messages', () => {
      const result = validateMinLength('ab', 3, 'Content');
      expect(result.message).toBe('Content must be at least 3 characters (1 more needed)');
      expect(validateMinLength('abc', 3, 'Content').message).toBe('');
    });
  });

  describe('validateReference', () => {
    it('should validate a complete reference correctly', () => {
      const reference = {
        title: 'Test Title',
        author: 'Test Author',
        year: '2020',
        url: 'https://example.com',
        publisher: 'Test Publisher',
        type: 'Article'
      };
      
      const result = validateReference(reference);
      
      expect(result.title.isValid).toBe(true);
      expect(result.author.isValid).toBe(true);
      expect(result.year.isValid).toBe(true);
      expect(result.url.isValid).toBe(true);
      expect(result.type.isValid).toBe(true);
    });

    it('should validate a reference with missing optional fields', () => {
      const reference = {
        title: 'Test Title',
        author: 'Test Author',
        type: 'Article'
      };
      
      const result = validateReference(reference);
      
      expect(result.title.isValid).toBe(true);
      expect(result.author.isValid).toBe(true);
      expect(result.year.isValid).toBe(true); // Optional field, empty is valid
      expect(result.url.isValid).toBe(true); // Optional field, empty is valid
      expect(result.type.isValid).toBe(true);
    });

    it('should validate a reference with invalid fields', () => {
      const reference = {
        title: '',
        author: '',
        year: '2030', // Future year
        url: 'not-a-url',
        type: ''
      };
      
      const result = validateReference(reference);
      
      expect(result.title.isValid).toBe(false);
      expect(result.author.isValid).toBe(false);
      expect(result.year.isValid).toBe(false);
      expect(result.url.isValid).toBe(false);
      expect(result.type.isValid).toBe(false);
    });
  });
});