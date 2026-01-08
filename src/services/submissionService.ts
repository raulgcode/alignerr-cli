import fs from 'fs/promises';
import path from 'path';
import * as tar from 'tar';
import process from 'process';
import { config, expandHomePath, getCurrentDateString } from '../utils/config.js';
import { promptForFilename, promptForUuid } from '../utils/prompts.js';
import { getCurrentCommitHash } from '../utils/git.js';

/**
 * Resolves the source path with priority: parameter > env > current directory
 */
function resolveSourcePath(providedSource?: string): string {
  // Priority 1: Command line parameter
  if (providedSource) {
    return expandHomePath(providedSource);
  }
  
  // Priority 2: Environment variable
  if (config.sourcePath) {
    return expandHomePath(config.sourcePath);
  }
  
  // Priority 3: Current working directory
  return process.cwd();
}

/**
 * Cleans the submission directory by removing all its contents
 */
async function cleanSubmissionDirectory(submissionDir: string): Promise<void> {
  try {
    await fs.rm(submissionDir, { recursive: true, force: true });
    console.log(`✓ Cleaned existing directory: ${submissionDir}`);
  } catch (error) {
    // Directory might not exist, which is fine
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Creates the submission directory structure
 */
async function createSubmissionDirectory(dateString: string, clean: boolean = false): Promise<string> {
  const basePath = expandHomePath(config.basePath);
  const submissionDir = path.join(basePath, 'submissions', dateString);
  
  if (clean) {
    await cleanSubmissionDirectory(submissionDir);
  }
  
  await fs.mkdir(submissionDir, { recursive: true });
  
  return submissionDir;
}

/**
 * Creates the tar file
 */
async function createTarFile(submissionDir: string, filename: string, sourcePath: string): Promise<void> {
  const tarPath = path.join(submissionDir, filename);
  
  try {
    // Create a tar archive from the source directory
    await tar.create(
      {
        gzip: false,
        file: tarPath,
        cwd: path.dirname(sourcePath),
      },
      [path.basename(sourcePath)]
    );
    
    console.log(`✓ Created tar file: ${tarPath}`);
  } catch (error) {
    throw new Error(`Failed to create tar file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Saves the git commit hash to a file
 */
async function saveCommitHash(submissionDir: string, hash: string, sourcePath: string): Promise<void> {
  const hashFile = path.join(submissionDir, `initial-hash.${hash}`);
  await fs.writeFile(hashFile, hash);
  
  console.log(`✓ Current commit: ${hash}`);
  console.log(`✓ Source directory: ${sourcePath}`);
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
  providedUuid?: string,
  providedSource?: string,
  clean: boolean = false
): Promise<void> {
  try {
    console.log('🚀 Initializing alignerr submission...\n');
    
    if (clean) {
      console.log('⚠️  Clean mode enabled - will delete existing files\n');
    }
    
    // Resolve source path first (parameter > env > cwd)
    const sourcePath = resolveSourcePath(providedSource);
    
    // Get filename and UUID (use source folder name for filename if not provided)
    const filename = await promptForFilename(providedFilename, sourcePath);
    const uuid = await promptForUuid(providedUuid);
    
    // Get current date
    const dateString = getCurrentDateString();
    
    // Create submission directory (clean if requested)
    const submissionDir = await createSubmissionDirectory(dateString, clean);
    console.log(`✓ Created directory: ${submissionDir}\n`);
    
    // Create tar file
    await createTarFile(submissionDir, filename, sourcePath);
    
    // Get and save git commit hash from source directory
    const commitHash = await getCurrentCommitHash(sourcePath);
    await saveCommitHash(submissionDir, commitHash, sourcePath);
    
    // Save UUID
    await saveUuid(submissionDir, uuid);
    
    console.log('\n✅ Submission initialized successfully!');
  } catch (error) {
    console.error('\n❌ Error initializing submission:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
