import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Gets the current git commit hash
 */
export async function getCurrentCommitHash(): Promise<string> {
  try {
    const { stdout } = await execAsync('git rev-parse HEAD');
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get git commit hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
