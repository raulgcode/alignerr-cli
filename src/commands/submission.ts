import { Command } from 'commander';
import { initSubmission } from '../services/submissionService.js';

export const submissionCommand = new Command('submission')
  .description('Manage alignerr submissions')
  .option('--init', 'Initialize a new submission')
  .option('--file <filename>', 'Tar filename (e.g., submission.tar)')
  .option('--uuid <uuid>', 'Task UUID')
  .option('--source <path>', 'Source folder path where git commands will be executed')
  .option('--clean', 'Delete existing submission directory before creating new one')
  .action(async (options) => {
    if (options.init) {
      await initSubmission(options.file, options.uuid, options.source, options.clean);
    } else {
      console.log('Please use --init flag to initialize a submission');
    }
  });
