#!/usr/bin/env node

import { program } from 'commander';
import { EdgeClient } from './api/edge-client';
import { createChatCommand } from './commands/chat';
import { createProvidersCommand } from './commands/providers';
import { displayError } from './utils/display';

async function main() {
  // Set up basic program info
  program
    .name('liminal')
    .description('CLI for Liminal Type Chat')
    .version('0.1.0');

  // Create shared client instance
  const client = new EdgeClient();

  // Add commands
  program.addCommand(createChatCommand(client));
  program.addCommand(createProvidersCommand(client));

  // Parse command line arguments
  await program.parseAsync(process.argv);
}

// Handle unhandled rejections
process.on('unhandledRejection', (error: any) => {
  displayError(`Unexpected error: ${error.message}`);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  displayError(`Fatal error: ${error.message}`);
  process.exit(1);
});