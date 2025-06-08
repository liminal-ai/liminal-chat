import chalk from 'chalk';
import { LLMPromptResponse } from '../api/edge-client';

export function displaySuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function displayError(message: string): void {
  console.error(chalk.red(`✗ ${message}`));
}

export function displayResponse(response: LLMPromptResponse): void {
  console.log('\n' + chalk.blue(response.content));
}

export function displayTokenUsage(usage: { promptTokens: number; completionTokens: number }): void {
  console.log(chalk.gray(`\nTokens: ${usage.promptTokens} in, ${usage.completionTokens} out`));
}