#!/usr/bin/env node
import { Command } from 'commander';
import { submissionCommand } from './commands/submission.js';

const program = new Command();

program
  .name('alignerr')
  .description('CLI tool for managing alignerr submissions')
  .version('1.0.0');

program.addCommand(submissionCommand);

program.parse();
