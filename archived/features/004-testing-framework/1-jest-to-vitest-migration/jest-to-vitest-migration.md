# Jest to Vitest Migration for Domain Tier

## Objective
Migrate Domain tier from Jest to Vitest with SWC plugin, ensuring full compatibility with NestJS testing module while improving performance and developer experience.

## Background
The Domain tier currently uses Jest with 123 unit tests achieving 75.89% coverage. Research shows that Vitest + SWC now fully supports NestJS testing patterns, resolving historical compatibility issues that originally forced Jest adoption.

## Scope

### In Scope
- Install and configure Vitest with SWC plugin
- Migrate all 123 existing Jest unit tests to Vitest syntax
- Maintain compatibility with @nestjs/testing module
- Preserve existing coverage thresholds and quality gates
- Update CI/CD pipeline configurations
- Documentation for new testing patterns

### Out of Scope
- Integration test migration (Story 3)
- E2E test changes
- Other tier unit test changes
- New test case additions

## Technical Requirements

### Dependencies to Install
```json
{
  "devDependencies": {
    "vitest": "^3.2.2",
    "unplugin-swc": "^1.5.1",
    "@swc/core": "^1.7.26",
    "@vitest/coverage-v8": "^3.2.2",
    "@types/supertest": "^6.0.2"
  }
}
```

### Vitest Configuration
```typescript
// apps/domain/vitest.config.ts
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
    setupFiles: ['./test/setup.ts'],
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
          branches: 90,
          functions: 90,
          lines: 90
        },
        './src/providers/**/*.ts': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
        }
      }
    }
  }
})
```

### Migration Patterns

#### Import Changes
```typescript
// Before (Jest)
import { Test, TestingModule } from '@nestjs/testing'
// Mock setup
jest.mock('../some-module')
const mockFunction = jest.fn()

// After (Vitest)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
// Mock setup
vi.mock('../some-module')
const mockFunction = vi.fn()
```

#### Test Structure Migration
```typescript
// Before (Jest)
describe('UserService', () => {
  let service: UserService
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          }
        }
      ]
    }).compile()
    
    service = module.get<UserService>(UserService)
  })
  
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

// After (Vitest)
describe('UserService', () => {
  let service: UserService
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: vi.fn(),
            save: vi.fn(),
          }
        }
      ]
    }).compile()
    
    service = module.get<UserService>(UserService)
  })
  
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
```

### Package.json Updates
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:cov": "vitest --coverage",
    "test:debug": "vitest --inspect-brk --no-file-parallelism",
    "test:ui": "vitest --ui"
  }
}
```

## Acceptance Criteria

### Functional Criteria
- [ ] **All 123 tests migrated**: Every Jest test converted to Vitest syntax
- [ ] **All tests passing**: Zero test failures after migration
- [ ] **Coverage maintained**: 75%+ overall, 90%+ for domain/providers modules
- [ ] **@nestjs/testing compatibility**: All NestJS testing patterns work correctly
- [ ] **Performance improved**: Test execution time <2s (baseline Jest performance)

### Technical Criteria
- [ ] **Vitest + SWC configured**: Proper TypeScript compilation and metadata support
- [ ] **Mock functionality**: All jest.fn() converted to vi.fn() and working
- [ ] **Module mocking**: All module mocks converted and functional
- [ ] **Setup files**: Test setup and teardown working correctly
- [ ] **Coverage reporting**: HTML and JSON reports generated correctly

### Quality Criteria  
- [ ] **No deprecated warnings**: Clean console output during test runs
- [ ] **Type safety**: All TypeScript types working correctly
- [ ] **CI compatibility**: Tests run successfully in CI environment
- [ ] **Watch mode**: File watching and incremental testing working
- [ ] **Debug support**: Test debugging in VS Code/IDE working

### Documentation Criteria
- [ ] **Migration guide**: Document changes made and patterns used
- [ ] **Developer guide**: Updated testing documentation for team
- [ ] **Troubleshooting**: Common issues and solutions documented
- [ ] **Performance metrics**: Before/after performance comparison documented

## Implementation Notes

### Migration Strategy
1. **Parallel setup**: Install Vitest alongside Jest initially
2. **Gradual migration**: Migrate tests in logical groups (by module/feature)
3. **Validation**: Run both Jest and Vitest in parallel during transition
4. **Cleanup**: Remove Jest dependencies after full migration

### Test Groups for Migration
1. **Core domain logic** (highest priority)
2. **Provider implementations** 
3. **Controller logic**
4. **Utility functions**
5. **Integration helpers**

### Common Migration Gotchas
- **Global imports**: Vitest requires explicit imports of test functions
- **Mock timing**: Some mock patterns may need adjustment
- **Async testing**: Ensure async/await patterns are correctly migrated
- **Coverage exclusions**: Adjust file patterns for Vitest coverage
- **TypeScript paths**: Ensure path mapping works with Vitest

### Rollback Plan
If migration encounters blocking issues:
1. Revert to Jest configuration
2. Document specific incompatibilities discovered
3. Plan incremental resolution approach
4. Consider hybrid approach if necessary

### Performance Validation
- [ ] Measure Jest baseline performance
- [ ] Compare Vitest performance after migration
- [ ] Document performance improvements
- [ ] Identify any performance regressions

## Dependencies
- **Upstream**: None
- **Downstream**: Story 2 (Playwright setup) can proceed in parallel
- **Blocking**: None

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Code review completed
- [ ] Documentation updated
- [ ] CI/CD pipeline updated
- [ ] Performance metrics validated
- [ ] Team training completed
- [ ] Rollback plan documented 