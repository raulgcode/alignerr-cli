import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentCommitHash } from '../utils/git.js';
import { exec } from 'child_process';

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('git utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentCommitHash', () => {
    it('should return commit hash from git command', async () => {
      const mockHash = 'abc123def456';
      const mockExec = exec as any;
      
      mockExec.mockImplementation((cmd: string, callback: Function) => {
        callback(null, { stdout: `${mockHash}\n`, stderr: '' });
      });

      const result = await getCurrentCommitHash();
      expect(result).toBe(mockHash);
    });

    it('should throw error if git command fails', async () => {
      const mockExec = exec as any;
      
      mockExec.mockImplementation((cmd: string, callback: Function) => {
        callback(new Error('Git not found'), { stdout: '', stderr: '' });
      });

      await expect(getCurrentCommitHash()).rejects.toThrow('Failed to get git commit hash');
    });
  });
});
