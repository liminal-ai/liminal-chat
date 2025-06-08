import * as readline from 'readline';
import chalk from 'chalk';

export function promptForInput(message: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(chalk.yellow(`\n${message} `), (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}