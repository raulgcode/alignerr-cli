# Alignerr CLI

A CLI tool for managing alignerr project submissions with automatic git tracking and organized file structure.

## Features

- 📁 Automatic directory structure creation with date-based organization
- 🔒 Git commit tracking for submissions
- 🆔 UUID-based task identification
- ⚙️ Configurable base path via environment variables
- 🎯 Interactive prompts for missing parameters
- ✅ Full TypeScript support with type safety
- 🧪 Comprehensive test coverage

## Installation

### For Development

1. Clone the repository:
```bash
git clone <repository-url>
cd alignerr-cli
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` to set your base path (optional):
```bash
ALIGNERR_BASE_PATH=~/Documents/projects/alignerr
```

5. Build the project:
```bash
npm run build
```

6. Link the CLI globally for local testing:
```bash
npm link
```

### For Production

```bash
npm install -g alignerr
```

## Usage

### Basic Commands

**Initialize a new submission:**
```bash
npx alignerr submission --init --file=<filename>.tar --uuid=<uuid> --source=<path-to-source-folder> --clean
```

**Finalize a submission:**
```bash
npx alignerr submission --final --source=<path-to-source-folder>
```

### Examples

**Initialization Examples:**

1. **With all parameters provided:**
```bash
npx alignerr submission --init --file=my-submission.tar --uuid=123e4567-e89b-12d3-a456-426614174000 --source=/path/to/project
```

2. **With clean flag to start fresh:**
```bash
npx alignerr submission --init --uuid=abc123 --source=/path/to/project --clean
# This will delete any existing submissions for today's date before creating new ones
```

3. **With interactive prompts (no parameters):**
```bash
npx alignerr submission --init
```
The CLI will prompt you for:
- Filename (if not provided)
- UUID (if not provided)

4. **With partial parameters:**
```bash
npx alignerr submission --init --file=submission.tar
# Will prompt only for UUID
```

5. **Using source from environment variable:**
```bash
# Set ALIGNERR_SOURCE_PATH in .env, then run:
npx alignerr submission --init --file=submission.tar --uuid=abc123
# Will use source path from .env
```

**Finalization Examples:**

1. **Finalize with explicit source path:**
```bash
npx alignerr submission --final --source=/path/to/project
```

2. **Finalize using source from environment variable:**
```bash
# Set ALIGNERR_SOURCE_PATH in .env, then run:
npx alignerr submission --final
# Will use source path from .env
```

3. **Finalize using current directory:**
```bash
# From your project directory:
cd /path/to/project
npx alignerr submission --final
```

### Source Path Priority

The `--source` parameter determines where git commands will be executed. The priority order is:

1. **Command line parameter** (`--source` flag) - highest priority
2. **Environment variable** (`ALIGNERR_SOURCE_PATH` in `.env`)
3. **Current working directory** - default fallback

This allows you to track git commits from different project directories while creating submissions.

## What It Does

### Init Command

When you run the initialization command (`--init`), the CLI will:

1. **Create organized directory structure:**
   ```
   ~/Documents/projects/alignerr/submissions/YYYY-MM-DD/
   ```

2. **Create the tar file:**
   ```
   ~/Documents/projects/alignerr/submissions/YYYY-MM-DD/<filename>.tar
   ```

3. **Capture current git commit:**
   - Runs `git rev-parse HEAD`
   - Prints the commit hash to console
   - Saves to: `initial-hash.<hash>`

4. **Save task UUID:**
   - Prints UUID to console
   - Saves to: `uuid.<uuid>`

### Final Command

When you run the finalization command (`--final`), the CLI will:

1. **Read initialization data:**
   - Reads commit hash from `initial-hash.<hash>` file
   - Reads UUID from `uuid.<uuid>` file
   - If either file is missing, shows error and explains that `--init` must be run first

2. **Extract tar file:**
   - Extracts the tar file created during init to verify contents

3. **Stage all changes:**
   - Runs `git add -A` to ensure new files are included in the diff

4. **Create diff file:**
   - Runs `git diff <commit_hash> > ~/<uuid>_final.diff`
   - Creates the diff file in your home directory
   - Diff shows all changes from the initial commit to current state

5. **Validate changes:**
   - Applies the diff to the extracted files using `git apply`
   - Shows success message if changes apply cleanly
   - Shows error message with details if changes fail to apply
   - Helps verify that your changes are compatible with the initial submission

6. **Cleanup:**
   - Removes the extracted directory
   - Maintains only the original tar file

## Configuration

The CLI can be configured via the `.env` file:

```bash
# Base path for submissions storage
ALIGNERR_BASE_PATH=~/Documents/projects/alignerr

# Source folder path where git commands will be executed (optional)
# If not set, git commands will run in the current directory
ALIGNERR_SOURCE_PATH=/path/to/your/project
```

**Configuration options:**

- `ALIGNERR_BASE_PATH`: Base directory for storing submissions (defaults to `~/Documents/projects/alignerr`)
- `ALIGNERR_SOURCE_PATH`: Default source directory for git operations (optional, defaults to current directory)

## Development

### Run in Development Mode

```bash
npm run dev -- submission --init
```

### Build

```bash
npm run build
```

### Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
alignerr-cli/
├── src/
│   ├── commands/
│   │   └── submission.ts      # Submission command definition
│   ├── services/
│   │   └── submissionService.ts  # Core submission logic
│   ├── utils/
│   │   ├── config.ts          # Configuration and path utilities
│   │   ├── git.ts             # Git operations
│   │   └── prompts.ts         # Interactive prompts
│   ├── tests/
│   │   ├── config.test.ts     # Config tests
│   │   ├── git.test.ts        # Git tests
│   │   └── prompts.test.ts    # Prompts tests
│   └── index.ts               # CLI entry point
├── .env.example               # Environment configuration template
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Requirements

- Node.js >= 18.0.0
- Git installed and accessible via command line
- TypeScript >= 5.0.0 (dev dependency)

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with tsx
- `npm test` - Run tests with vitest
- `npm run test:coverage` - Run tests with coverage report

## Error Handling

The CLI includes comprehensive error handling:

- Validates required inputs
- Checks for git availability
- Creates directories recursively if they don't exist
- Provides clear error messages for troubleshooting

## Output Example

**Init Command:**

```
🚀 Initializing alignerr submission...

✓ Created directory: /Users/user/Documents/projects/alignerr/submissions/2026-01-08

✓ Created tar file: /Users/user/Documents/projects/alignerr/submissions/2026-01-08/submission.tar
✓ Current commit: abc123def456789...
✓ Saved commit hash to: /Users/user/Documents/projects/alignerr/submissions/2026-01-08/initial-hash.abc123def456789...
✓ Task UUID: 123e4567-e89b-12d3-a456-426614174000
✓ Saved UUID to: /Users/user/Documents/projects/alignerr/submissions/2026-01-08/uuid.123e4567-e89b-12d3-a456-426614174000

✅ Submission initialized successfully!
```

**Final Command:**

```
🏁 Finalizing alignerr submission...

✓ Found initial commit hash: abc123def456789...
✓ Found task UUID: 123e4567-e89b-12d3-a456-426614174000

📦 Extracting tar file...
✓ Extracted to: /Users/user/Documents/projects/alignerr/submissions/2026-01-08/project-name

📦 Adding all files to git...
✓ Executed: git add -A in /path/to/project

📝 Creating diff...
✓ Created diff file: /Users/user/123e4567-e89b-12d3-a456-426614174000_final.diff

🔧 Applying diff to extracted files...
✅ Diff applied successfully!

✅ All changes are compatible with the initial submission.

🧹 Cleaning up extracted files...
✓ Removed: /Users/user/Documents/projects/alignerr/submissions/2026-01-08/project-name

✅ Submission finalized successfully!
```

**Final Command (with errors):**

```
🏁 Finalizing alignerr submission...

✓ Found initial commit hash: abc123def456789...
✓ Found task UUID: 123e4567-e89b-12d3-a456-426614174000

📦 Extracting tar file...
✓ Extracted to: /Users/user/Documents/projects/alignerr/submissions/2026-01-08/project-name

📦 Adding all files to git...
✓ Executed: git add -A in /path/to/project

📝 Creating diff...
✓ Created diff file: /Users/user/123e4567-e89b-12d3-a456-426614174000_final.diff

🔧 Applying diff to extracted files...
❌ Failed to apply diff.

Reason:
error: patch failed: src/file.ts:10
error: src/file.ts: patch does not apply

⚠️  This might indicate conflicts or incompatible changes.

🧹 Cleaning up extracted files...
✓ Removed: /Users/user/Documents/projects/alignerr/submissions/2026-01-08/project-name

✅ Submission finalized successfully!
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
