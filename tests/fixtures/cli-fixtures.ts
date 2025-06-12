import { test as base } from './base-fixtures'
import { spawn, ChildProcess } from 'child_process'

type CLIFixtures = {
  cli: CLITestHelper
}

export const cliTest = base.extend<CLIFixtures>({
  cli: async (_unused, use) => {
    const helper = new CLITestHelper()
    await use(helper)
    await helper.cleanup()
  }
})

class CLITestHelper {
  private processes: ChildProcess[] = []

  async run(args: string[], options: { timeout?: number; input?: string } = {}) {
    return new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve, reject) => {
      const child = spawn('node', ['apps/cli/dist/index.js', ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' }
      })
      
      this.processes.push(child)
      
      let stdout = ''
      let stderr = ''
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })
      
      if (options.input) {
        child.stdin?.write(options.input)
        child.stdin?.end()
      }
      
      const timeout = setTimeout(() => {
        child.kill()
        reject(new Error(`CLI command timed out after ${options.timeout || 10000}ms`))
      }, options.timeout || 10000)
      
      child.on('close', (exitCode) => {
        clearTimeout(timeout)
        resolve({ stdout, stderr, exitCode: exitCode || 0 })
      })
    })
  }

  async cleanup() {
    for (const process of this.processes) {
      if (!process.killed) {
        process.kill()
      }
    }
    this.processes = []
  }
} 