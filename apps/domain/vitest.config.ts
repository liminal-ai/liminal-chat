import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    typecheck: {
      enabled: true
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'test/',
        'src/main.ts'
      ],
      thresholds: {
        statements: 80,
        branches: 80, 
        functions: 80,
        lines: 80,
        // Specific higher thresholds for core modules
        './src/domain/**/*.ts': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90
        },
        './src/providers/**/*.ts': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90
        }
      }
    }
  }
})