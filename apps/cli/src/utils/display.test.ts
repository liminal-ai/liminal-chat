import { describe, it, expect, vi, beforeEach } from 'vitest';
import { displaySuccess, displayError, displayResponse, displayTokenUsage } from './display';

describe('Display Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should display success message', () => {
    displaySuccess('Connected');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✓ Connected'));
  });

  it('should display error message', () => {
    displayError('Connection failed');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('✗ Connection failed'));
  });

  it('should display response', () => {
    const response = {
      content: 'Echo: Test',
      model: 'echo-1.0',
      usage: { promptTokens: 1, completionTokens: 3, totalTokens: 4 }
    };
    displayResponse(response);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Echo: Test'));
  });

  it('should display token usage', () => {
    displayTokenUsage({ promptTokens: 5, completionTokens: 10, totalTokens: 15 });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Tokens: 5 in, 10 out'));
  });
});