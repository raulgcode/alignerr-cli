import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in project root
// __dirname is src/utils, so go up two levels to reach project root
const projectRoot = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

export const config = {
  basePath: process.env.ALIGNERR_BASE_PATH || '~/Documents/projects/alignerr',
  sourcePath: process.env.ALIGNERR_SOURCE_PATH || '',
  claudeSessionPath: process.env.CLAUDE_HFI_SESSION_PATH || '/tmp/claude-hfi',
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
