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

### Basic Command

```bash
npx alignerr submission --init --file=<filename>.tar --uuid=<uuid>
```

### Examples

1. **With all parameters provided:**
```bash
npx alignerr submission --init --file=my-submission.tar --uuid=123e4567-e89b-12d3-a456-426614174000
```

2. **With interactive prompts (no parameters):**
```bash
npx alignerr submission --init
```
The CLI will prompt you for:
- Filename (if not provided)
- UUID (if not provided)

3. **With partial parameters:**
```bash
npx alignerr submission --init --file=submission.tar
# Will prompt only for UUID
```

## What It Does

When you run the initialization command, the CLI will:

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

## Configuration

The base path can be configured via the `.env` file:

```bash
ALIGNERR_BASE_PATH=~/Documents/projects/alignerr
```

If not set, it defaults to `~/Documents/projects/alignerr`.

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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
