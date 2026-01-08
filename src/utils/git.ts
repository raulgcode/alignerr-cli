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

/**
 * Adds all files to git staging area
 * @param cwd - The directory where the git command should be executed
 */
export async function gitAddAll(cwd?: string): Promise<void> {
  try {
    const options = cwd ? { cwd } : {};
    await execAsync('git add -A', options);
  } catch (error) {
    throw new Error(`Failed to run git add -A: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a diff from a specific commit to current state
 * @param commitHash - The commit hash to diff from
 * @param outputPath - The path where the diff file should be saved
 * @param cwd - The directory where the git command should be executed
 */
export async function createGitDiff(commitHash: string, outputPath: string, cwd?: string): Promise<void> {
  try {
    const options = cwd ? { cwd } : {};
    await execAsync(`git diff ${commitHash} > ${outputPath}`, options);
  } catch (error) {
    throw new Error(`Failed to create git diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Applies a diff file to the current working directory
 * @param diffPath - The path to the diff file
 * @param cwd - The directory where the git command should be executed
 * @returns Object with success status and error message if failed
 */
export async function applyGitDiff(diffPath: string, cwd?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const options = cwd ? { cwd } : {};
    await execAsync(`git apply "${diffPath}"`, options);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
