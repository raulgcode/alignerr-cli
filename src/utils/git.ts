import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Gets the current git commit hash
 * @param cwd - The directory where the git command should be executed
 */
export async function getCurrentCommitHash(cwd?: string): Promise<string> {
  try {
    const options = cwd ? { cwd } : {};
    const { stdout } = await execAsync('git rev-parse HEAD', options);
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get git commit hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
