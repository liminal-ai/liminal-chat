# Edge Testing Guide

## Quick Start

```bash
# Unit tests only (fast, no services required)
pnpm edge:test:unit                    # <2s

# Integration tests (requires services)
pnpm test:edge:integration:managed     # Auto-manages services

# Full Edge test suite with performance monitoring
pnpm test:edge:perf                    # <17s target
```

## Test Categories

### Unit Tests (15 tests, <2s)
- Pure validation logic testing
- No external dependencies
- Run during development for fast feedback
- Located in: `apps/edge/src/tests/index.test.ts`

### Integration Tests (74 tests, <15s)
- **Core Proxy** (12 tests): Request/response proxying
- **Streaming** (6 tests): SSE streaming functionality  
- **Error Handling** (18 tests): Error response consistency
- **Performance** (6 tests): Latency and concurrency
- **Security** (3 tests): CORS and headers
- **Health** (3 tests): Service health validation
- **Request Validation** (26 tests): Input validation and sanitization
- Located in: `tests/integration/edge/`

## Service Dependencies

### Unit Tests: ✅ No dependencies
### Integration Tests: ⚠️ Requires services
- Domain service (port 8766)
- Edge service (port 8787)

## Performance Targets

| Test Suite | Target | Current Baseline |
|------------|--------|------------------|
| Unit | <2s | ~1.2s |
| Integration | <15s | ~12.4s |
| Full Suite | <17s | ~13.6s |

## Available Commands

### Manual Execution
```bash
# Unit tests
pnpm edge:test:unit                    # Run unit tests only
pnpm edge:test:watch                   # Watch mode for development
pnpm edge:test:coverage                # Generate coverage report

# Integration tests  
pnpm edge:test:integration             # Run integration tests (services must be running)

# Combined
pnpm edge:test:all                     # Run both unit and integration
pnpm edge:test                         # Alias for edge:test:all
```

### Automated Service Management
```bash
# Managed execution (auto-starts/stops services)
pnpm test:edge:unit                    # Unit tests via service script
pnpm test:edge:integration:managed     # Integration tests with service management
pnpm test:edge:managed                 # Full test suite with service management
```

### Performance Monitoring
```bash
# Performance-monitored execution
pnpm test:edge:unit:perf               # Unit tests with timing
pnpm test:edge:integration:perf        # Integration tests with timing
pnpm test:edge:perf                    # Full suite with performance analysis
```

## Service Management

### Automatic (Recommended)
The service management script (`scripts/test-services.sh`) handles:
- Starting Domain and Edge services
- Health check validation
- Automatic cleanup on exit
- Proper error handling

### Manual Service Startup
```bash
# Terminal 1: Start Domain
pnpm domain:start

# Terminal 2: Start Edge  
pnpm edge:start

# Verify health
pnpm health:all

# Run tests
pnpm edge:test:integration
```

## Performance Monitoring

The performance monitor tracks:
- **Execution time** for each test suite
- **Baseline tracking** (rolling 5-run average)
- **Target compliance** against defined thresholds
- **Performance drift** detection (>20% change alerts)

Performance data is stored in `test-performance.json` for trend analysis.

### Performance Thresholds
- Unit tests: 2 seconds maximum
- Integration tests: 15 seconds maximum  
- Full test suite: 17 seconds maximum

## Troubleshooting

### Services won't start
```bash
# Check port conflicts
lsof -i :8766 :8767

# Kill conflicting processes
kill -9 $(lsof -t -i:8766)
kill -9 $(lsof -t -i:8787)

# Manual service startup
pnpm domain:start
pnpm edge:start
```

### Tests timing out
```bash
# Check service health
curl http://localhost:8766/health
curl http://localhost:8787/health

# Check service logs
pm2 logs domain
pm2 logs edge
```

### Performance degradation
```bash
# Check performance history
cat test-performance.json

# Reset baselines (if needed)
rm test-performance.json

# Run performance analysis
pnpm test:edge:perf
```

### TypeScript errors in tests
```bash
# Type check Edge service
pnpm -F @liminal-chat/edge typecheck

# Run linting
pnpm -F @liminal-chat/edge lint
```

## Test Structure

### Unit Test Organization
```
apps/edge/src/tests/
├── index.test.ts           # All unit tests
└── ...
```

### Integration Test Organization
```
tests/integration/edge/
├── fixtures/
│   ├── base-fixtures.ts    # Common test fixtures
│   └── edge-test-data.ts   # Test data generators
├── utils/
│   └── assertions.ts       # Custom assertions
├── health.spec.ts          # Health endpoint tests
├── proxy-behavior.spec.ts  # Core proxy functionality
├── streaming-proxy.spec.ts # Streaming tests
├── error-handling.spec.ts  # Error scenarios
├── security.spec.ts        # Security validation
└── performance.spec.ts     # Performance tests
```

## Coverage Requirements

- **Unit tests**: 70% minimum coverage
- **Integration tests**: Functional coverage of all endpoints
- **Combined**: Focus on critical paths and error scenarios

## Best Practices

### Development Workflow
1. Write failing unit test
2. Implement functionality
3. Verify unit test passes
4. Run integration tests
5. Check performance targets

### Test Naming Convention
- Unit tests: `should <expected behavior>`
- Integration tests: `should <business outcome>`

### Error Testing
- Test both valid and invalid inputs
- Verify proper error codes and messages
- Ensure consistent error response format

### Performance Testing
- Use performance monitoring for CI/CD
- Set realistic but aggressive targets
- Monitor trends over time

## Integration with CI/CD

```bash
# Recommended CI pipeline commands
pnpm verify:all                        # Lint + typecheck + all tests
pnpm test:edge:perf                    # Performance validation
```

The infrastructure automatically handles service lifecycle in CI environments.

## Common Issues

### Port Already in Use
Services fail to start due to port conflicts. Use the automated service management scripts which handle cleanup.

### Timeouts in Integration Tests
Usually indicates services aren't fully started. The service management script includes proper health checks.

### Performance Targets Missed
Check system load and ensure no other resource-intensive processes are running during tests.

### Intermittent Test Failures
Often related to timing issues. Integration tests include proper wait conditions and retries.