import prompts from 'prompts';
import path from 'path';

/**
 * Generates filename from source path using root folder name
 */
export function generateFilenameFromPath(sourcePath: string): string {
  const folderName = path.basename(sourcePath);
  return `${folderName}.tar`;
}

/**
 * Gets filename - uses provided filename or generates from source path
 */
export async function promptForFilename(providedFilename?: string, sourcePath?: string): Promise<string> {
  if (providedFilename) {
    return providedFilename;
  }

  // If no filename provided, generate from source path
  if (sourcePath) {
    return generateFilenameFromPath(sourcePath);
  }

  // Fallback: should not reach here, but use cwd if needed
  return generateFilenameFromPath(process.cwd());
}

/**
 * Prompts user for UUID if not provided
 */
export async function promptForUuid(providedUuid?: string): Promise<string> {
  if (providedUuid) {
    return providedUuid;
  }

  const response = await prompts({
    type: 'text',
    name: 'uuid',
    message: 'Enter the task UUID:',
    validate: (value) => value.length > 0 ? true : 'UUID is required',
  });

  if (!response.uuid) {
    throw new Error('UUID is required');
  }

  return response.uuid;
}
