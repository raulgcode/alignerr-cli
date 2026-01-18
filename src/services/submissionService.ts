import fs from 'fs/promises';
import path from 'path';
import * as tar from 'tar';
import process from 'process';
import ignore from 'ignore';
import { config, expandHomePath, getCurrentDateString } from '../utils/config.js';
import { promptForFilename, promptForUuid } from '../utils/prompts.js';
import { getCurrentCommitHash, gitAddAll, createGitDiff, applyGitDiff } from '../utils/git.js';

/**
 * Creates a tar from the claude-hfi session directory for the given UUID
 * and places it into the submission directory. If the session directory
 * does not exist, this is a no-op.
 */
async function createClaudeSessionTarIfPresent(uuid: string, submissionDir: string): Promise<string | null> {
  try {
    const sessionBaseRaw = config.claudeSessionPath || '/tmp/claude-hfi';
    const sessionBase = expandHomePath(sessionBaseRaw);
    const sessionDir = path.join(sessionBase, uuid);

    // Check if session directory exists
    try {
      const stats = await fs.stat(sessionDir);
      if (!stats.isDirectory()) {
        console.log(`ℹ CLAUDE session path exists but is not a directory: ${sessionDir}`);
        return null;
      }
    } catch (err) {
      // Directory doesn't exist - nothing to do
      console.log(`ℹ No CLAUDE session found at: ${sessionDir}`);
      return null;
    }

    const tarFilename = `${uuid}.tar`;
    const tarPath = path.join(submissionDir, tarFilename);

    console.log(`📦 Creating CLAUDE session tar from ${sessionDir} -> ${tarPath}`);

    await tar.create({
      gzip: false,
      file: tarPath,
      cwd: path.dirname(sessionDir),
    }, [path.basename(sessionDir)]);

    console.log(`✓ Created CLAUDE session tar: ${tarPath}`);
    return tarPath;
  } catch (error) {
    console.log(`⚠️  Failed to create CLAUDE session tar: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

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
 * Reads and parses .gitignore file from source directory
 */
async function readGitignore(sourcePath: string): Promise<ReturnType<typeof ignore>> {
  const ig = ignore();
  const gitignorePath = path.join(sourcePath, '.gitignore');

  try {
    const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
    ig.add(gitignoreContent);
    console.log(`✓ Loaded .gitignore patterns from source`);
  } catch (error) {
    // .gitignore might not exist, which is fine
    console.log(`ℹ No .gitignore found in source directory`);
  }

  return ig;
}

/**
 * Creates the tar file
 */
async function createTarFile(submissionDir: string, filename: string, sourcePath: string): Promise<void> {
  const tarPath = path.join(submissionDir, filename);

  try {
    // Read .gitignore patterns from source
    const ig = await readGitignore(sourcePath);

    // Create a tar archive from the source directory
    await tar.create(
      {
        gzip: false,
        file: tarPath,
        cwd: path.dirname(sourcePath),
        filter: (filepath: string) => {
          // Get relative path from the source parent directory
          const baseName = path.basename(sourcePath);
          const relativePath = filepath.startsWith(baseName + '/')
            ? filepath.substring(baseName.length + 1)
            : filepath;

          // Don't filter the root directory itself
          if (relativePath === '' || relativePath === baseName) {
            return true;
          }

          // Check against .gitignore patterns
          if (ig.ignores(relativePath)) {
            return false;
          }

          return true;
        },
      },
      [path.basename(sourcePath)]
    );

    console.log(`✓ Created tar file: ${tarPath}`);
  } catch (error) {
    throw new Error(`Failed to create tar file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts a tar file to a specific directory
 */
async function extractTarFile(tarPath: string, outputDir: string): Promise<string> {
  try {
    await tar.extract({
      file: tarPath,
      cwd: outputDir,
    });

    // Return the path of the extracted content
    // The tar was created from the source directory, so we need to find what was extracted
    const files = await fs.readdir(outputDir);
    const tarFileName = path.basename(tarPath);

    // Find the extracted directory (not the tar file itself, not system files)
    const extractedDir = await (async () => {
      for (const file of files) {
        if (file === tarFileName || file.startsWith('.') || file.startsWith('initial-hash.') || file.startsWith('uuid.')) {
          continue;
        }

        const fullPath = path.join(outputDir, file);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          return file;
        }
      }
      return null;
    })();

    if (!extractedDir) {
      throw new Error('Could not find extracted directory');
    }

    return path.join(outputDir, extractedDir);
  } catch (error) {
    throw new Error(`Failed to extract tar file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes a directory and all its contents
 */
async function removeDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Failed to remove directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

/**
 * Reads the commit hash from the initial-hash file
 */
async function readCommitHash(submissionDir: string): Promise<string> {
  try {
    const files = await fs.readdir(submissionDir);
    const hashFile = files.find(file => file.startsWith('initial-hash.'));

    if (!hashFile) {
      throw new Error('Commit hash file not found. Please run the init command first (--init).');
    }

    const hash = hashFile.replace('initial-hash.', '');
    return hash;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Submission directory not found: ${submissionDir}. Please run the init command first (--init).`);
    }
    throw error;
  }
}

/**
 * Reads the UUID from the uuid file
 */
async function readUuid(submissionDir: string): Promise<string> {
  try {
    const files = await fs.readdir(submissionDir);
    const uuidFile = files.find(file => file.startsWith('uuid.'));

    if (!uuidFile) {
      throw new Error('UUID file not found. Please run the init command first (--init).');
    }

    const uuid = uuidFile.replace('uuid.', '');
    return uuid;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Submission directory not found: ${submissionDir}. Please run the init command first (--init).`);
    }
    throw error;
  }
}

/**
 * Finalizes a submission by creating a diff from the initial commit
 */
export async function finalizeSubmission(providedSource?: string): Promise<void> {
  let extractedPath: string | null = null;

  try {
    console.log('🏁 Finalizing alignerr submission...\n');

    // Resolve source path first (parameter > env > cwd)
    const sourcePath = resolveSourcePath(providedSource);

    // Get current date
    const dateString = getCurrentDateString();

    // Get submission directory
    const basePath = expandHomePath(config.basePath);
    const submissionDir = path.join(basePath, 'submissions', dateString);

    // Read commit hash and UUID from files
    const commitHash = await readCommitHash(submissionDir);
    const uuid = await readUuid(submissionDir);

    console.log(`✓ Found initial commit hash: ${commitHash}`);
    console.log(`✓ Found task UUID: ${uuid}\n`);

    // Find the source code tar file (created during init, should NOT contain UUID in name)
    const files = await fs.readdir(submissionDir);
    const tarFile = files.find(f => f.endsWith('.tar') && !f.includes(uuid));

    if (!tarFile) {
      throw new Error('No source code tar file found in submission directory. Please run --init first.');
    }

    const tarPath = path.join(submissionDir, tarFile);

    // If there's a CLAUDE_HFI session for this uuid, create a tar from it
    // This happens AFTER finding the source tar so it doesn't interfere
    await createClaudeSessionTarIfPresent(uuid, submissionDir);

    // Extract tar file
    console.log('📦 Extracting tar file...');
    extractedPath = await extractTarFile(tarPath, submissionDir);
    console.log(`✓ Extracted to: ${extractedPath}\n`);

    // Run git add -A
    console.log('📦 Adding all files to git...');
    await gitAddAll(sourcePath);
    console.log(`✓ Executed: git add -A in ${sourcePath}\n`);

    // Create diff file
    const homePath = expandHomePath('~');
    const diffPath = path.join(homePath, `${uuid}_final.diff`);

    console.log('📝 Creating diff...');
    await createGitDiff(commitHash, diffPath, sourcePath);
    console.log(`✓ Created diff file: ${diffPath}`);

    // Copy diff file to submission directory
    const submissionDiffPath = path.join(submissionDir, `${uuid}_final.diff`);
    await fs.copyFile(diffPath, submissionDiffPath);
    console.log(`✓ Saved diff to submission folder: ${submissionDiffPath}\n`);

    // Apply the diff to the extracted directory
    console.log('🔧 Applying diff to extracted files...');
    const applyResult = await applyGitDiff(diffPath, extractedPath);

    if (applyResult.success) {
      console.log('✅ Diff applied successfully!\n');
      console.log('✅ All changes are compatible with the initial submission.');
    } else {
      console.log('❌ Failed to apply diff.\n');
      console.log('Reason:');
      console.log(applyResult.error);
      console.log('\n⚠️  This might indicate conflicts or incompatible changes.');
    }

    // Cleanup: Remove extracted directory
    if (extractedPath) {
      console.log('\n🧹 Cleaning up extracted files...');
      await removeDirectory(extractedPath);
      console.log(`✓ Removed: ${extractedPath}`);
    }

    console.log('\n✅ Submission finalized successfully!');
  } catch (error) {
    // Cleanup on error
    if (extractedPath) {
      try {
        await removeDirectory(extractedPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    console.error('\n❌ Error finalizing submission:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
