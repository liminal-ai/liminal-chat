# Feature 004: Testing Framework Modernization

## Overview
Modernize and consolidate testing architecture across all tiers, migrating to Vitest for unit tests and implementing Playwright for integration and E2E testing, creating a unified, high-performance testing strategy.

## Goals

1. **Framework Consolidation**: Single testing framework (Vitest) for all unit tests
2. **Performance Optimization**: Faster test execution and developer feedback loops
3. **Modern Tooling**: Latest testing best practices and tooling
4. **Comprehensive Coverage**: Systematic coverage across unit, integration, and E2E layers
5. **Developer Experience**: Streamlined testing workflow and debugging capabilities

## Architecture Evolution

### Current State
```text
Domain:  Jest (123 unit tests) + Supertest integration
CLI:     Vitest (89 unit tests) + Custom integration  
Edge:    Vitest (6 unit tests) + Basic E2E
Total:   Mixed frameworks, incomplete coverage
```

### After Feature 004
```text
All Tiers: Vitest (unified unit testing)
Integration: Playwright HTTP API testing (Edge + Domain)
E2E: Playwright + Node child_process (CLI workflows)
Total: Unified framework, comprehensive coverage
```

## Technical Foundation

### Framework Selection Rationale
- **Vitest v3.2.2+**: Latest stable version with proven NestJS compatibility via SWC plugin, faster execution than Jest, native ESM support
- **Playwright v1.50.0+**: Superior HTTP API testing capabilities, excellent debugging tools, built-in CI/CD integration
- **SWC**: Required for NestJS + Vitest compatibility, replaces ts-jest for faster compilation
- **@testing-library/react v16.0+**: Component testing alignment with modern React patterns

### Performance Targets Matrix
| Test Tier | Execution Time | Startup Time | Coverage Target |
|-----------|---------------|--------------|-----------------|
| Unit Tests | <2s per suite | N/A | 80% overall |
| Integration Tests | <30s per suite | <5s server boot | 100% endpoints |
| E2E Tests | <10s per workflow | <5s CLI startup | All workflows |
| Watch Mode | <500ms change detection | N/A | Real-time |

## Implementation Stories

Detailed implementation specifications are provided in individual story documents:

### [Story 1: Jest to Vitest Migration for Domain Tier](1-jest-to-vitest-migration/jest-to-vitest-migration.md)
**Strategic Goal**: Eliminate Jest dependency, establish Vitest as unified unit testing framework
- Migrate 123 existing tests with zero functionality loss
- Implement SWC configuration for NestJS compatibility
- Maintain current coverage threshold (75%+) while improving execution speed

### [Story 2: Playwright Framework Setup and Configuration](2-playwright-framework-setup/playwright-framework-setup.md)
**Strategic Goal**: Establish robust integration and E2E testing foundation
- Replace fragmented testing tools with unified Playwright infrastructure
- Create reusable fixtures and test utilities for all subsequent stories
- Configure CI/CD pipeline integration with proper artifact collection

### [Story 3: Domain API Integration Tests with Playwright](3-domain-api-integration-tests/domain-api-integration-tests.md)
**Strategic Goal**: Replace Supertest with modern HTTP API testing
- Validate all Domain endpoints with real HTTP calls (no mocking)
- Implement comprehensive streaming endpoint testing
- Establish error scenario validation patterns

### [Story 4: Edge Proxy Integration Tests and Validation](4-edge-proxy-integration-tests/edge-proxy-integration-tests.md)
**Strategic Goal**: Validate Edge tier's proxy behavior and cross-tier communication
- Test Edge → Domain communication pathways
- Validate CORS, security headers, and proxy behavior
- Implement timeout and error propagation testing

### [Story 5: CLI End-to-End Test Automation](5-cli-e2e-automation/cli-e2e-automation.md)
**Strategic Goal**: Automate complete CLI user workflows
- Test both batch and interactive CLI modes
- Validate configuration and authentication flows
- Implement cross-platform compatibility testing

### [Story 6: Testing Documentation and Developer Playbook](6-testing-documentation-playbook/testing-documentation-playbook.md)
**Strategic Goal**: Ensure sustainable testing practices and developer adoption
- Create comprehensive testing strategy documentation
- Establish developer workflow guidelines and onboarding
- Document CI/CD optimization and debugging procedures

## Cross-Story Coordination Requirements

### Test Organization Strategy
Unified directory structure across all stories:
```bash
tests/
├── unit/           # Vitest unit tests (all tiers)
├── integration/    # Playwright API tests (Stories 3-4)
├── e2e/           # Playwright E2E tests (Story 5)
├── fixtures/      # Shared test data (Story 2 establishes patterns)
└── utils/         # Cross-tier testing utilities (Story 2)
```

### Migration Path Sequencing
**Phase 1 (Parallel)**: Stories 1 & 2 - Foundation establishment
**Phase 2 (Parallel)**: Stories 3, 4 & 5 - Implementation (requires Story 2 completion)
**Phase 3 (Sequential)**: Story 6 - Documentation and consolidation

### CI/CD Optimization Strategy
- **Parallel execution**: Tests run concurrently across tiers to meet <5 minute CI target
- **Dependency caching**: Node modules and Playwright browsers cached between runs
- **Selective execution**: Changed files trigger only relevant test suites
- **Failure isolation**: Individual test failures don't block entire pipeline
- **Artifact collection**: Screenshots, traces, and coverage reports for debugging

## Success Criteria

### Functional Requirements
- [ ] Single testing framework (Vitest) for all unit tests across all tiers
- [ ] Comprehensive integration test coverage for all API endpoints
- [ ] Complete E2E test automation for all CLI workflows
- [ ] Cross-tier test validation (Edge → Domain communication)
- [ ] Unified CI/CD pipeline with <5 minute execution time

### Technical Requirements
- [ ] 80% unit test coverage across all tiers (maintained from current levels)
- [ ] 100% API endpoint coverage (Domain and Edge tiers)
- [ ] All main CLI workflows covered by E2E tests
- [ ] Performance targets met per tier (see matrix above)
- [ ] Zero flaky tests in CI environment

### Operational Requirements
- [ ] Developer onboarding to new testing framework <30 minutes
- [ ] Test execution in CI <5 minutes (full suite)
- [ ] Clear failure debugging with proper artifact collection
- [ ] Automated test maintenance with health monitoring
- [ ] Complete documentation for sustainable practices

## Risk Mitigation Strategy

### Technical Risks
- **Breaking changes during migration**: Thorough validation at each story completion before proceeding
- **Performance regression**: Benchmark before/after migration with rollback procedures
- **NestJS compatibility issues**: SWC plugin resolves historical Jest/Vitest incompatibilities
- **CI/CD pipeline disruption**: Parallel implementation alongside existing tests until migration complete

### Process Risks
- **Developer adoption resistance**: Comprehensive documentation, training, and gradual migration
- **Test maintenance overhead**: Automated health monitoring and clear ownership models
- **Cross-story dependencies**: Clear sequencing requirements and completion gates
- **Timeline pressure**: Prioritized execution with well-defined rollback plans

## Framework Version Justification

**Vitest v3.2.2+**: 
- Latest stable with proven NestJS support via SWC
- 2-3x faster than Jest for our use cases
- Native ESM support eliminates configuration complexity

**Playwright v1.50.0+**:
- Superior HTTP API testing vs Supertest
- Built-in debugging tools reduce development time
- Unified approach for both integration and E2E testing

**SWC Latest**:
- Required for NestJS metadata handling with Vitest
- Significantly faster compilation than ts-jest
- Active development ensures continued compatibility

## Non-Goals

- **Visual regression testing**: Not included in this modernization scope
- **Load/performance testing**: Separate initiative, not part of framework consolidation
- **Cross-browser testing**: Focus on Node.js server environments
- **Automated test generation**: Manual test writing maintains quality control
- **Database integration testing**: Existing patterns sufficient for current needs