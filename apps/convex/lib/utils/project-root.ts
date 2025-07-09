import * as path from 'path';
import * as fs from 'fs';

/**
 * Finds the project root by looking for package.json with "liminal-chat" name
 */
export function findProjectRoot(startPath: string = __dirname): string {
  let currentDir = startPath;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name === 'liminal-chat') {
          return currentDir;
        }
      } catch {
        // Continue searching if package.json is invalid
      }
    }

    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find liminal-chat project root');
}
