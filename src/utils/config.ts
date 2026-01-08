import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  basePath: process.env.ALIGNERR_BASE_PATH || '~/Documents/projects/alignerr',
  sourcePath: process.env.ALIGNERR_SOURCE_PATH || '',
};

/**
 * Expands tilde (~) in path to user's home directory
 */
export function expandHomePath(filepath: string): string {
  if (filepath === '~' || filepath.startsWith('~/')) {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    return filepath === '~' ? homeDir : path.join(homeDir, filepath.slice(2));
  }
  return filepath;
}

/**
 * Gets the current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
