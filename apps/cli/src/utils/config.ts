import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Load environment variables
dotenv.config();

export interface EdgeClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export function loadConfig(): EdgeClientConfig {
  // Priority: CLI args > env vars > config file > defaults
  const config: EdgeClientConfig = {
    baseUrl: process.env.LIMINAL_API_URL || 'http://localhost:8787',
    apiKey: process.env.LIMINAL_API_KEY,
    timeout: parseInt(process.env.LIMINAL_TIMEOUT || '30000', 10)
  };

  // Try to load from config file if exists
  const configPaths = [
    path.join(process.cwd(), '.liminal.json'),
    path.join(os.homedir(), '.liminal.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        // Only override if not already set by env vars
        if (!process.env.LIMINAL_API_URL && fileConfig.baseUrl) {
          config.baseUrl = fileConfig.baseUrl;
        }
        if (!process.env.LIMINAL_API_KEY && fileConfig.apiKey) {
          config.apiKey = fileConfig.apiKey;
        }
        if (!process.env.LIMINAL_TIMEOUT && fileConfig.timeout) {
          config.timeout = fileConfig.timeout;
        }
        break; // Use first found config file
      } catch (error) {
        // Ignore invalid config files
        console.warn(`Warning: Could not parse config file at ${configPath}`);
      }
    }
  }

  return config;
}

export function getConfigPath(): string | null {
  const configPaths = [
    path.join(process.cwd(), '.liminal.json'),
    path.join(os.homedir(), '.liminal.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }

  return null;
}