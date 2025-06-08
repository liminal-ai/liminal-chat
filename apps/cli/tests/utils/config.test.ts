import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig, getConfigPath } from '../../src/utils/config';

// Mock modules
vi.mock('fs');
vi.mock('os', () => ({
  homedir: vi.fn(() => '/home/user')
}));

describe('Config Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should return default config when no env vars or files', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const config = loadConfig();
      
      expect(config).toEqual({
        baseUrl: 'http://localhost:8787',
        apiKey: undefined,
        timeout: 30000
      });
    });

    it('should load config from environment variables', () => {
      process.env.LIMINAL_API_URL = 'http://custom.api:9000';
      process.env.LIMINAL_API_KEY = 'test-key-123';
      process.env.LIMINAL_TIMEOUT = '60000';
      
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const config = loadConfig();
      
      expect(config).toEqual({
        baseUrl: 'http://custom.api:9000',
        apiKey: 'test-key-123',
        timeout: 60000
      });
    });

    it('should load config from local file when present', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => 
        p === path.join(process.cwd(), '.liminal.json')
      );
      
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        baseUrl: 'http://file.api:8080',
        apiKey: 'file-key-456',
        timeout: 45000
      }));
      
      const config = loadConfig();
      
      expect(config).toEqual({
        baseUrl: 'http://file.api:8080',
        apiKey: 'file-key-456',
        timeout: 45000
      });
    });

    it('should load config from home directory when local not found', () => {
      vi.mocked(os.homedir).mockReturnValue('/home/user');
      vi.mocked(fs.existsSync).mockImplementation((p) => 
        p === '/home/user/.liminal.json'
      );
      
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        baseUrl: 'http://home.api:7070',
        apiKey: 'home-key-789'
      }));
      
      const config = loadConfig();
      
      expect(config).toEqual({
        baseUrl: 'http://home.api:7070',
        apiKey: 'home-key-789',
        timeout: 30000  // Uses default when not in file
      });
    });

    it('should prioritize env vars over file config', () => {
      process.env.LIMINAL_API_URL = 'http://env.api:5000';
      
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        baseUrl: 'http://file.api:8080',
        apiKey: 'file-key-456',
        timeout: 45000
      }));
      
      const config = loadConfig();
      
      expect(config.baseUrl).toBe('http://env.api:5000');
      expect(config.apiKey).toBe('file-key-456'); // From file since not in env
      expect(config.timeout).toBe(45000); // From file since not in env
    });

    it('should handle invalid JSON in config file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const config = loadConfig();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Could not parse config file')
      );
      expect(config).toEqual({
        baseUrl: 'http://localhost:8787',
        apiKey: undefined,
        timeout: 30000
      });
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle file read errors gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const config = loadConfig();
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(config).toEqual({
        baseUrl: 'http://localhost:8787',
        apiKey: undefined,
        timeout: 30000
      });
      
      consoleWarnSpy.mockRestore();
    });

    it('should parse timeout as integer', () => {
      process.env.LIMINAL_TIMEOUT = '5000.5';
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const config = loadConfig();
      
      expect(config.timeout).toBe(5000);
      expect(typeof config.timeout).toBe('number');
    });
  });

  describe('getConfigPath', () => {
    it('should return local config path when exists', () => {
      const localPath = path.join(process.cwd(), '.liminal.json');
      vi.mocked(fs.existsSync).mockImplementation((p) => p === localPath);
      
      const configPath = getConfigPath();
      
      expect(configPath).toBe(localPath);
    });

    it('should return home config path when only home exists', () => {
      vi.mocked(os.homedir).mockReturnValue('/home/user');
      const homePath = '/home/user/.liminal.json';
      vi.mocked(fs.existsSync).mockImplementation((p) => p === homePath);
      
      const configPath = getConfigPath();
      
      expect(configPath).toBe(homePath);
    });

    it('should return null when no config file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const configPath = getConfigPath();
      
      expect(configPath).toBeNull();
    });

    it('should prefer local over home config', () => {
      const localPath = path.join(process.cwd(), '.liminal.json');
      vi.mocked(fs.existsSync).mockReturnValue(true); // All paths exist
      
      const configPath = getConfigPath();
      
      expect(configPath).toBe(localPath);
    });
  });
});