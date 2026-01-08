import { describe, it, expect, vi } from 'vitest';
import { promptForFilename, promptForUuid } from '../utils/prompts.js';

vi.mock('prompts', () => ({
  default: vi.fn(),
}));

describe('prompts utils', () => {
  describe('promptForFilename', () => {
    it('should return provided filename if given', async () => {
      const filename = 'test.tar';
      const result = await promptForFilename(filename);
      expect(result).toBe(filename);
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
