import fs from 'fs/promises';
import path from 'path';
import { config, expandHomePath, getCurrentDateString } from '../utils/config.js';
import { promptForFilename, promptForUuid } from '../utils/prompts.js';
import { getCurrentCommitHash } from '../utils/git.js';

/**
 * Creates the submission directory structure
 */
async function createSubmissionDirectory(dateString: string): Promise<string> {
  const basePath = expandHomePath(config.basePath);
  const submissionDir = path.join(basePath, 'submissions', dateString);
  
  await fs.mkdir(submissionDir, { recursive: true });
  
  return submissionDir;
}

/**
 * Creates the tar file
 */
async function createTarFile(submissionDir: string, filename: string): Promise<void> {
  const tarPath = path.join(submissionDir, filename);
  
  // Create an empty tar file (placeholder)
  // In real implementation, this would create an actual tar archive
  await fs.writeFile(tarPath, '');
  
  console.log(`✓ Created tar file: ${tarPath}`);
}

/**
 * Saves the git commit hash to a file
 */
async function saveCommitHash(submissionDir: string, hash: string): Promise<void> {
  const hashFile = path.join(submissionDir, `initial-hash.${hash}`);
  await fs.writeFile(hashFile, hash);
  
  console.log(`✓ Current commit: ${hash}`);
  console.log(`✓ Saved commit hash to: ${hashFile}`);
}

/**
 * Saves the UUID to a file
 */
async function saveUuid(submissionDir: string, uuid: string): Promise<void> {
  const uuidFile = path.join(submissionDir, `uuid.${uuid}`);
  await fs.writeFile(uuidFile, uuid);
  
  console.log(`✓ Task UUID: ${uuid}`);
  console.log(`✓ Saved UUID to: ${uuidFile}`);
}

/**
 * Initializes a new submission
 */
export async function initSubmission(
  providedFilename?: string,
  providedUuid?: string
): Promise<void> {
  try {
    console.log('🚀 Initializing alignerr submission...\n');
    
    // Get filename and UUID (prompt if not provided)
    const filename = await promptForFilename(providedFilename);
    const uuid = await promptForUuid(providedUuid);
    
    // Get current date
    const dateString = getCurrentDateString();
    
    // Create submission directory
    const submissionDir = await createSubmissionDirectory(dateString);
    console.log(`✓ Created directory: ${submissionDir}\n`);
    
    // Create tar file
    await createTarFile(submissionDir, filename);
    
    // Get and save git commit hash
    const commitHash = await getCurrentCommitHash();
    await saveCommitHash(submissionDir, commitHash);
    
    // Save UUID
    await saveUuid(submissionDir, uuid);
    
    console.log('\n✅ Submission initialized successfully!');
  } catch (error) {
    console.error('\n❌ Error initializing submission:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
