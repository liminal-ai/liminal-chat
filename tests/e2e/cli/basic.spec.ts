import { cliTest as test } from '../../fixtures/cli-fixtures'
import { expect } from '@playwright/test'

test.describe('CLI Basic Commands', () => {
  test('should show help when no arguments provided', async ({ cli }) => {
    const result = await cli.run([])
    
    // CLI should show help and exit with code 0
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('help') // Should contain help information
  })
  
  test('should show version information', async ({ cli }) => {
    const result = await cli.run(['--version'])
    
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/) // Should contain version number
  })

  test('should handle invalid commands gracefully', async ({ cli }) => {
    const result = await cli.run(['invalid-command'])
    
    expect(result.exitCode).not.toBe(0) // Should exit with error code
    expect(result.stderr.length).toBeGreaterThan(0) // Should output error message
  })
}) 