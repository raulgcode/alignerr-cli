import prompts from 'prompts';

/**
 * Prompts user for filename if not provided
 */
export async function promptForFilename(providedFilename?: string): Promise<string> {
  if (providedFilename) {
    return providedFilename;
  }

  const response = await prompts({
    type: 'text',
    name: 'filename',
    message: 'Enter the tar filename (e.g., submission.tar):',
    validate: (value) => value.length > 0 ? true : 'Filename is required',
  });

  if (!response.filename) {
    throw new Error('Filename is required');
  }

  return response.filename;
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
