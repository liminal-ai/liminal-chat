#!/usr/bin/env node
import { Command } from 'commander';
import { EdgeClient } from './api/edge-client';
import { createChatCommand } from './commands/chat';
import { createProvidersCommand } from './commands/providers';
import { loadConfig } from './utils/config';

const program = new Command();
const config = loadConfig();
const client = new EdgeClient(config);

program
  .name('liminal')
  .description('CLI for Liminal Type Chat')
  .version('1.0.0');

program.addCommand(createChatCommand(client));
program.addCommand(createProvidersCommand(client));

program.parse();