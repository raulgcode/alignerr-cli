import { describe, it, expect, vi } from 'vitest';
import { promptForFilename, promptForUuid, generateFilenameFromPath } from '../utils/prompts.js';

vi.mock('prompts', () => ({
  default: vi.fn(),
}));

describe('prompts utils', () => {
  describe('generateFilenameFromPath', () => {
    it('should generate filename from folder path', () => {
      const result = generateFilenameFromPath('/path/to/my-project');
      expect(result).toBe('my-project.tar');
    });

    it('should handle paths with trailing slash', () => {
      const result = generateFilenameFromPath('/path/to/my-project/');
      expect(result).toBe('my-project.tar');
    });
  });

  describe('promptForFilename', () => {
    it('should return provided filename if given', async () => {
      const filename = 'test.tar';
      const result = await promptForFilename(filename);
      expect(result).toBe(filename);
    });

    it('should generate filename from source path if not provided', async () => {
      const result = await promptForFilename(undefined, '/path/to/bentopdf');
      expect(result).toBe('bentopdf.tar');
    });

    it('should use cwd if no filename or source path provided', async () => {
      const result = await promptForFilename();
      expect(result).toContain('.tar');
    });
  });

  describe('promptForUuid', () => {
    it('should return provided UUID if given', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = await promptForUuid(uuid);
      expect(result).toBe(uuid);
    });
  });
});
