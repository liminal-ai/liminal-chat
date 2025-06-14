# Domain API Integration Tests - Implementation Notes & Future Tasks

## Performance Threshold Decisions

### Current Thresholds (Conservative Starting Point)
```typescript
const PERFORMANCE_THRESHOLDS = {
  health: 200,           // ms - Health endpoint response time
  llmPrompt: 10000,      // ms - Non-streaming LLM prompt response
  streamingStartup: 5000, // ms - Time to first token in streaming
  providerDiscovery: 1000, // ms - Provider listing endpoint
  testSuite: 60000       // ms - Complete integration test suite
};
```

### Rationale for Conservative Approach
- **Real API Variability**: Provider APIs have inherent latency variation
- **CI Environment Factors**: GitHub Actions runners often have higher latency
- **False Positive Avoidance**: Overly aggressive thresholds create flaky tests
- **Regression Detection**: These thresholds catch meaningful degradation while allowing normal variation
- **Data-Driven Optimization**: Starting point to establish baseline performance data

### Original Story 3 Suggestions vs Chosen Values
| Metric | Story 3 Suggestion | Chosen Value | Reason |
|--------|-------------------|--------------|---------|
| Health | <100ms | <200ms | 2x buffer for CI environments |
| LLM Prompt | <5s | <10s | Real provider API variability |
| Streaming Startup | <2s | <5s | Provider-dependent complexity |
| Test Suite | <30s | <60s | Real API calls inherently slower |

## Architecture Decisions Summary

### 1. Real Provider Testing Strategy
**Decision**: Real API calls with test keys (Option A)
- **Benefits**: Highest quality validation, catches provider API changes
- **Trade-offs**: External dependencies, API costs, potential CI complexity
- **Future**: Monitor costs and speed; can add mocking layer if needed

### 2. Streaming Test Validation
**Decision**: Sampling approach (Option C)
- **Validation Points**: Stream start, mid-stream, completion, content assembly
- **Benefits**: High confidence without brittleness of token-by-token verification
- **Trade-offs**: Less granular than full verification but more resilient

### 3. Error Scenario Coverage
**Decision**: Integration tests focus on external boundaries
- **Integration Level**: Provider integration errors (B), Network/Infrastructure errors (C)
- **Unit Level**: Request validation errors (A), Business logic errors (D)
- **Rationale**: Test external boundaries at integration level, internal logic at unit level

### 4. Test Data Strategy
**Decision**: Hybrid approach (Option C)
- **Fixed Prompts**: Core functionality validation with predictable responses
- **Generated Data**: Edge cases and realistic usage simulation
- **Provider-Specific**: Tailored prompts for different provider characteristics
- **Re-evaluation**: Monitor effectiveness and adjust strategy at feature completion

## Future Tasks & Improvements

### High Priority
- [ ] **Configuration-Driven Thresholds**
  ```typescript
  // Environment-specific performance configuration
  const thresholds = {
    development: { health: 100, llmPrompt: 5000, ... },
    ci: { health: 200, llmPrompt: 10000, ... },
    production: { health: 50, llmPrompt: 3000, ... }
  };
  ```

- [ ] **Performance Data Collection**
  - Log actual response times during test runs
  - Generate performance reports for trend analysis
  - Establish baseline performance metrics per environment

- [ ] **Threshold Optimization**
  - Analyze collected performance data after 2-4 weeks
  - Tighten thresholds based on actual 95th percentile performance
  - Document optimal thresholds per provider

- [ ] **Test Data Strategy Evaluation**
  - Monitor fixed vs generated prompt effectiveness at feature completion
  - Analyze test reliability and failure patterns
  - Assess provider-specific prompt optimization needs
  - Re-evaluate hybrid approach based on actual usage patterns

### Medium Priority
- [ ] **Cost Monitoring for Real API Testing**
  - Track API usage costs from integration tests
  - Implement cost alerts if usage exceeds thresholds
  - Consider provider-specific test quotas

- [ ] **Test Resilience Improvements**
  - Implement retry logic for transient provider failures
  - Add conditional test execution based on provider availability
  - Enhanced error reporting for integration test failures

- [ ] **Performance Regression Detection**
  - Automated performance trend monitoring
  - CI pipeline alerts for performance degradation
  - Separate performance tests from functional integration tests

### Low Priority
- [ ] **Hybrid Testing Strategy**
  - Add mocked fallback for when real providers are unavailable
  - Provider-specific test configuration (real vs mocked)
  - A/B testing of mock vs real API accuracy

- [ ] **Advanced Streaming Validation**
  - Content coherence validation across streaming chunks
  - Stream interruption and recovery testing
  - Concurrent streaming request validation

## Configuration Structure (Future)

### Proposed Test Configuration
```typescript
interface IntegrationTestConfig {
  performance: {
    thresholds: Record<Environment, PerformanceThresholds>;
    monitoring: boolean;
    reporting: boolean;
  };
  providers: {
    testMode: 'real' | 'mock' | 'hybrid';
    apiKeys: Record<ProviderName, string>;
    retryConfig: RetryOptions;
  };
  streaming: {
    validationLevel: 'format' | 'sampling' | 'full';
    samplingPoints: string[];
    timeouts: StreamingTimeouts;
  };
}
```

### Environment Variables
```bash
# Performance thresholds (optional, defaults to conservative values)
INTEGRATION_TEST_HEALTH_THRESHOLD_MS=200
INTEGRATION_TEST_LLM_THRESHOLD_MS=10000
INTEGRATION_TEST_STREAMING_THRESHOLD_MS=5000

# Provider testing mode
INTEGRATION_TEST_PROVIDER_MODE=real|mock|hybrid

# Performance monitoring
INTEGRATION_TEST_PERFORMANCE_LOGGING=true
INTEGRATION_TEST_PERFORMANCE_ALERTS=false
```

## Documentation Links
- **Main Feature**: [domain-api-integration-tests.md](./domain-api-integration-tests.md)
- **Architecture Decisions**: [/docs/architecture/decisions.md](../../architecture/decisions.md)
- **Testing Practices**: [/docs/guides/testing-practices.md](../../guides/testing-practices.md)

## Review & Updates
- **Last Updated**: 2025-01-13
- **Next Review**: After initial implementation completion
- **Performance Baseline**: TBD after first test runs