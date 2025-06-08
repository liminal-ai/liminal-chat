import { Command } from 'commander';
import chalk from 'chalk';
import { EdgeClient } from '../api/edge-client';

export function createProvidersCommand(client: EdgeClient): Command {
  const command = new Command('providers');
  command.description('List available LLM providers');
  
  command.action(async () => {
    try {
      const providers = await client.getProviders();
      
      console.log('\nAvailable LLM Providers:');
      
      if (!providers.providers || Object.keys(providers.providers).length === 0) {
        console.log('No providers available');
        return;
      }
      
      for (const [name, info] of Object.entries(providers.providers)) {
        const isDefault = name === providers.defaultProvider;
        const status = info.available ? chalk.green('✓ Configured') : chalk.red('✗ Not configured');
        
        console.log(`\n* ${name}${isDefault ? ' (default)' : ''} - ${info.description || ''}`);
        console.log(`  Status: ${status}`);
        if (info.models && info.models.length > 0) {
          console.log(`  Models: ${info.models.join(', ')}`);
        }
      }
      console.log(); // Add blank line at end
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });
  
  return command;
}