import { describe, it, expect } from 'vitest';
import { expandHomePath, getCurrentDateString } from '../utils/config.js';

describe('config utils', () => {
  describe('expandHomePath', () => {
    it('should expand tilde to home directory', () => {
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      const result = expandHomePath('~/test/path');
      expect(result).toContain(homeDir);
      expect(result).toContain('test/path');
    });

    it('should return path unchanged if no tilde', () => {
      const path = '/absolute/path';
      const result = expandHomePath(path);
      expect(result).toBe(path);
    });
  });

  describe('getCurrentDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const result = getCurrentDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return current date', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const expected = `${year}-${month}-${day}`;
      
      const result = getCurrentDateString();
      expect(result).toBe(expected);
    });
  });
});
