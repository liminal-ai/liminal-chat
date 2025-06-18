# **Story 4 Resilience & Error Handling - Comprehensive Implementation Workplan**

## **Context Integration Summary**

### **Architectural Decisions Impact**
- **Edge/Domain Separation**: Error handling must respect tier boundaries - Edge handles client concerns (timeouts, user messages), Domain handles business logic (retry decisions, error mapping)
- **Timeout Escalation Pattern**: CLI: 35s → Edge: 32s → Domain: 30s ensures proper cascading timeouts
- **Error Code System**: Leverage established 6000-6999 range for external service errors with specific OpenRouter mappings
- **TDD Discipline**: All error scenarios must be test-driven with cross-tier validation

### **Engineering Practices Integration** 
- **Error Handling Standards**: Use AppError hierarchy with specific error codes, preserve context for debugging
- **Testing Requirements**: Domain 75%+ coverage, Edge 70%+, comprehensive error path testing
- **Security Patterns**: Never expose internal error details to clients, sanitized user-friendly messages

### **Current System Integration Points**
- **Existing Provider Pattern**: OpenRouter provider from Stories 1-3 provides foundation for error enhancement
- **Established Error Codes**: Leverage existing INVALID_API_KEY, RATE_LIMITED, PROVIDER_TIMEOUT codes
- **Cross-Tier Communication**: Domain error responses must propagate cleanly through Edge to CLI with proper formatting

### **Testing Strategy Context**
- **Vitest Framework**: All testing uses Vitest with established patterns
- **Cross-Tier Validation**: Each error scenario tested from CLI → Edge → Domain → OpenRouter
- **Mock Strategy**: MSW for OpenRouter API mocking, structured test data factories

## **Slice-Based Implementation Structure**

### **Slice 1: Core Retry Infrastructure (Domain Foundation)**
**Milestone**: Exponential backoff retry logic working in Domain tier with comprehensive unit tests

**Agent Tasks (2-3 agents):**
- **Agent A**: Implement RetryHandler utility class with exponential backoff
- **Agent B**: Enhance OpenRouter provider with retry integration
- **Agent C**: Create comprehensive unit test suite for retry scenarios

**Human Validation**: Retry logic passes all unit tests, no integration dependencies

### **Slice 2: Timeout & Error Enhancement (Cross-Tier Integration)**  
**Milestone**: Proper timeout handling and error mapping across all tiers

**Agent Tasks (3-4 agents):**
- **Agent A**: Implement Domain timeout configuration and error mapping
- **Agent B**: Enhance Edge error propagation and client timeout handling
- **Agent C**: Update CLI error display with user-friendly messages
- **Agent D**: Create integration tests for cross-tier error propagation

**Human Validation**: Full error propagation works CLI → Edge → Domain with proper timeouts

### **Slice 3: User Experience & E2E Validation (Complete Error Journey)**
**Milestone**: Production-ready error handling with polished user experience

**Agent Tasks (2-3 agents):**
- **Agent A**: Implement user-friendly error messages and retry progress indicators
- **Agent B**: Create comprehensive E2E test suite covering all error scenarios
- **Agent C**: Performance validation and error handling documentation

**Human Validation**: Complete user experience tested with clear error messages and proper recovery

## **Ready-to-Execute Slice Prompts**

### **Slice 1 Execution Prompt**

**Agent Spawn Strategy:** 3 agents working in parallel with clear boundaries
- **Agent A (Retry Infrastructure)**: Core retry utility implementation
- **Agent B (Provider Integration)**: OpenRouter provider retry enhancement  
- **Agent C (Unit Testing)**: Comprehensive test coverage for retry logic

**Agent Thinking Framework:** Each agent uses 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

**Agent A - Retry Infrastructure Implementation:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Implement RetryHandler utility class for exponential backoff retry logic

DOMAIN UNDERSTANDING (25%):
- Review existing error handling patterns in Domain tier
- Understand timeout escalation pattern (Domain: 30s base timeout)
- Study existing provider patterns and error code structure
- Analyze current OpenRouter provider implementation from previous stories

IMPLEMENTATION FOCUS (35%):
Create apps/domain/src/providers/llm/utils/retry-handler.ts with:
- RetryHandler class with configurable options (maxRetries, initialDelay, maxDelay)
- Exponential backoff calculation with jitter
- Retryable error detection (RATE_LIMITED, TIMEOUT, 503 errors)
- Integration with existing AppError hierarchy
- TypeScript interfaces for retry configuration

INTEGRATION POINTS (30%):
- Must work with existing ILLMProvider interface
- Error types must align with shared-types error codes
- Should integrate cleanly with OpenRouter provider
- Must support both sync and async operations
- Consider future provider types (streaming in Story 2)

DELIVERABLES:
- RetryHandler class implementation
- TypeScript interfaces for configuration
- Error detection utility functions
- Example usage pattern for providers

SUCCESS CRITERIA:
- Class compiles without errors
- Follows existing code patterns and naming conventions
- Ready for unit testing by Agent C
- No external dependencies introduced
```

**Agent B - Provider Integration:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Enhance OpenRouter provider with retry functionality

DOMAIN UNDERSTANDING (25%):
- Study existing OpenRouter provider implementation
- Understand current error handling in generate() method
- Review ILLMProvider interface requirements
- Analyze existing timeout and error mapping patterns

IMPLEMENTATION FOCUS (35%):
Enhance apps/domain/src/providers/llm/providers/openrouter.provider.ts:
- Integrate RetryHandler from Agent A
- Configure retry options for OpenRouter-specific errors
- Maintain existing generate() method signature
- Add retry progress logging for debugging
- Preserve all existing functionality

INTEGRATION POINTS (30%):
- Must maintain compatibility with provider factory
- Coordinate with Agent A on RetryHandler interface
- Error codes must remain consistent with existing patterns
- Should not impact non-retryable operations
- Must work with existing test mocks

DELIVERABLES:
- Enhanced OpenRouter provider with retry support
- Configuration for OpenRouter-specific retry behavior
- Preserved backward compatibility
- Debug logging for retry attempts

SUCCESS CRITERIA:
- Provider compiles and maintains existing interface
- Retry logic integrated without breaking changes
- Ready for testing by Agent C
- No impact on existing provider functionality
```

**Agent C - Unit Testing Suite:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Create comprehensive unit test suite for retry functionality

DOMAIN UNDERSTANDING (25%):
- Study existing test patterns in providers directory
- Understand mock strategies for HTTP calls
- Review test coverage requirements (75%+ for Domain)
- Analyze existing error testing approaches

IMPLEMENTATION FOCUS (35%):
Create test files:
- apps/domain/src/providers/llm/utils/retry-handler.spec.ts
- Enhanced apps/domain/src/providers/llm/providers/openrouter.provider.spec.ts
- Test all retry scenarios: success after retry, max retries exceeded, non-retryable errors
- Mock time and HTTP calls appropriately
- Test exponential backoff timing

INTEGRATION POINTS (30%):
- Coordinate with Agent A on RetryHandler testing approach
- Validate Agent B's provider integration through tests
- Ensure tests align with existing testing patterns
- Mock strategy must support retry timing verification
- Tests must validate error code preservation

DELIVERABLES:
- Comprehensive unit tests for RetryHandler
- Enhanced unit tests for OpenRouter provider retry behavior
- Mock strategies for time-based testing
- Test coverage report validation

SUCCESS CRITERIA:
- All tests pass with proper mocking
- Coverage meets 75%+ threshold
- Tests document expected retry behavior clearly
- Integration with Agent A and B implementations verified
```

**Slice 1 Completion Verification:**
- `pnpm verify:all` shows clean summary for Domain tier
- RetryHandler unit tests achieve 90%+ coverage
- OpenRouter provider tests include retry scenarios
- No breaking changes to existing provider interface
- Manual verification: retry logic triggers correctly in mocked scenarios

### **Slice 2 Execution Prompt**

**Agent Spawn Strategy:** 4 agents working on cross-tier integration
- **Agent A (Domain Enhancement)**: Timeout configuration and error mapping
- **Agent B (Edge Error Handling)**: Error propagation and client timeout
- **Agent C (CLI User Experience)**: Error display and user messaging
- **Agent D (Integration Testing)**: Cross-tier error validation

**Agent A - Domain Timeout & Error Enhancement:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Implement comprehensive timeout handling and error mapping in Domain tier

DOMAIN UNDERSTANDING (25%):
- Study timeout escalation pattern (Domain: 30s base)
- Review existing error mapping in OpenRouter provider
- Understand Domain's role in tier separation architecture
- Analyze current configuration management patterns

IMPLEMENTATION FOCUS (35%):
Enhance Domain error handling:
- Configurable timeout settings for OpenRouter calls
- Enhanced error mapping for all OpenRouter error types
- Proper error context preservation
- Integration with existing AppError hierarchy
- Timeout wrapper for fetch operations

INTEGRATION POINTS (30%):
- Must coordinate with Edge tier timeout expectations (32s)
- Error formats must be compatible with Edge propagation
- Configuration should support environment variable override
- Must maintain existing provider factory patterns
- Error codes must align with established 6000-6999 range

DELIVERABLES:
- Enhanced timeout configuration in OpenRouter provider
- Complete error mapping for all OpenRouter scenarios
- Timeout wrapper utility for HTTP operations
- Configuration interface for timeout settings

SUCCESS CRITERIA:
- Domain respects 30s timeout limit
- All OpenRouter error codes properly mapped
- Error context preserved for debugging
- Ready for Edge tier integration
```

**Agent B - Edge Error Propagation:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Enhance Edge tier error propagation and client timeout handling

DOMAIN UNDERSTANDING (25%):
- Study Edge → Domain communication patterns
- Understand Hono framework error handling
- Review existing Edge proxy implementation
- Analyze client timeout requirements (32s limit)

IMPLEMENTATION FOCUS (35%):
Enhance apps/edge/src routes:
- Client timeout handling (32s limit)
- Domain error response propagation
- User-friendly error transformation
- Proper HTTP status code mapping
- Error logging for debugging

INTEGRATION POINTS (30%):
- Must properly handle Domain timeout responses
- Coordinate with Agent A on error format expectations
- CLI-friendly error format required for Agent C
- Must maintain existing Edge API contracts
- Error propagation should preserve essential context

DELIVERABLES:
- Enhanced Edge error handling middleware
- Client timeout implementation
- Error transformation for user consumption
- Proper HTTP status mapping

SUCCESS CRITERIA:
- Edge respects 32s timeout (allows Domain retry)
- Domain errors propagate correctly to CLI
- User-friendly error messages maintained
- No breaking changes to Edge API
```

**Agent C - CLI Error Display Enhancement:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Implement user-friendly error display and retry progress indicators

DOMAIN UNDERSTANDING (25%):
- Study existing CLI error handling patterns
- Understand user experience requirements from story spec
- Review CLI timeout expectations (35s)
- Analyze current progress indication patterns

IMPLEMENTATION FOCUS (35%):
Enhance apps/cli/src:
- User-friendly error message display
- Retry progress indicators
- Timeout handling (35s limit)
- Error recovery suggestions
- Debug mode for detailed errors

INTEGRATION POINTS (30%):
- Must handle error formats from Agent B (Edge)
- Coordinate on error message formats
- Should provide actionable user guidance
- Must maintain existing CLI interaction patterns
- Error display should be accessible and clear

DELIVERABLES:
- Enhanced error display utilities
- Retry progress indication
- User-friendly error messages for all scenarios
- Debug mode for technical details

SUCCESS CRITERIA:
- Clear, actionable error messages for users
- Progress indication during retries
- Proper CLI timeout handling
- Professional error presentation
```

**Agent D - Cross-Tier Integration Testing:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Create comprehensive integration tests for cross-tier error handling

DOMAIN UNDERSTANDING (25%):
- Study existing integration test patterns
- Understand cross-tier communication flow
- Review error propagation requirements
- Analyze timeout coordination between tiers

IMPLEMENTATION FOCUS (35%):
Create integration tests:
- Cross-tier error propagation tests
- Timeout coordination validation
- Error format consistency verification
- End-to-end error scenario testing
- Performance validation for error paths

INTEGRATION POINTS (30%):
- Validate Agent A Domain error handling
- Test Agent B Edge error propagation
- Verify Agent C CLI error display
- Ensure complete error flow works correctly
- Performance requirements must be met

DELIVERABLES:
- Cross-tier integration test suite
- Error propagation validation tests
- Timeout coordination tests
- Performance benchmarks for error handling

SUCCESS CRITERIA:
- All cross-tier error scenarios tested
- Timeout coordination verified
- Error format consistency validated
- Integration tests pass consistently
```

**Slice 2 Completion Verification:**
- `pnpm verify:all` passes for all tiers
- Cross-tier error propagation working correctly
- Timeout escalation properly implemented
- Manual testing: intentional errors show proper user messages
- Integration tests demonstrate complete error flow

### **Slice 3 Execution Prompt**

**Agent Spawn Strategy:** 3 agents focused on user experience and validation
- **Agent A (UX Polish)**: Error message refinement and retry indicators
- **Agent B (E2E Testing)**: Comprehensive end-to-end error scenario testing
- **Agent C (Performance & Documentation)**: Validation and documentation

**Agent A - User Experience Polish:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Polish user experience for error handling with production-ready messaging

DOMAIN UNDERSTANDING (25%):
- Review user experience requirements from story specification
- Study existing CLI user interaction patterns
- Understand error message examples from story spec
- Analyze accessibility and usability requirements

IMPLEMENTATION FOCUS (35%):
Enhance user experience:
- Implement specific error message templates from story
- Add retry progress with visual indicators
- Create error recovery guidance
- Add debug mode toggle
- Polish message formatting and colors

INTEGRATION POINTS (30%):
- Must work with existing CLI framework
- Should integrate with error codes from previous slices
- User messages must be consistent across all error types
- Should support both interactive and CI environments
- Must maintain professional CLI appearance

DELIVERABLES:
- Production-ready error message templates
- Visual retry progress indicators
- Error recovery guidance system
- Debug mode implementation

SUCCESS CRITERIA:
- Error messages match story specification examples
- Professional, accessible user experience
- Clear guidance for error resolution
- Debug mode available for troubleshooting
```

**Agent B - Comprehensive E2E Testing:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Create comprehensive E2E test suite covering all error scenarios

DOMAIN UNDERSTANDING (25%):
- Study story acceptance criteria for testing requirements
- Review existing E2E test patterns
- Understand complete user journey during errors
- Analyze error scenario coverage requirements

IMPLEMENTATION FOCUS (35%):
Create comprehensive E2E tests:
- All error scenarios from story specification
- Rate limit with retry and success
- Timeout handling with clear messages
- Authentication errors with guidance
- Network errors with recovery suggestions
- Performance validation for error paths

INTEGRATION POINTS (30%):
- Must test complete CLI → Edge → Domain → OpenRouter flow
- Validate all previous slice implementations
- Should use MSW for OpenRouter API mocking
- Must verify user experience from Agent A
- Performance requirements must be validated

DELIVERABLES:
- Complete E2E test suite for error scenarios
- Performance benchmarks for error handling
- User experience validation tests
- Error recovery testing

SUCCESS CRITERIA:
- All story acceptance criteria covered by tests
- E2E tests pass consistently
- Performance impact <5% as specified
- User experience properly validated
```

**Agent C - Performance Validation & Documentation:**
```
Think hard with 10k tokens allocated as: 25% domain understanding, 35% implementation, 30% integration, 10% progress tracking.

TASK: Validate performance requirements and create comprehensive documentation

DOMAIN UNDERSTANDING (25%):
- Review story definition of done requirements
- Study performance impact limitations (<5%)
- Understand documentation requirements for error handling
- Analyze operational requirements for production

IMPLEMENTATION FOCUS (35%):
Performance validation and documentation:
- Benchmark error handling performance impact
- Create troubleshooting documentation
- Document configuration options
- Create operational runbooks
- Validate coverage requirements

INTEGRATION POINTS (30%):
- Must validate all previous slice implementations
- Should coordinate with Agent B on performance testing
- Documentation must cover complete error handling system
- Must ensure production readiness
- Should validate story completion criteria

DELIVERABLES:
- Performance validation report
- Comprehensive error handling documentation
- Troubleshooting guides
- Configuration documentation

SUCCESS CRITERIA:
- Performance impact <5% validated
- Complete documentation for error handling
- Story definition of done requirements met
- Production readiness validated
```

**Slice 3 Completion Verification:**
- `pnpm verify:all` shows complete clean summary
- All story acceptance criteria met
- Performance impact <5% validated
- Manual testing: complete user experience polished
- Documentation complete and accurate

## **Quality Integration Strategy**

### **Test State Discipline**
**Slice 1**: Unit tests for retry logic, integration tests as .skip() for cross-tier dependencies
**Slice 2**: Enable integration tests, keep E2E as .skip() until complete integration ready  
**Slice 3**: Enable all tests including E2E when full user experience complete

### **Coverage Requirements**
- **Domain Tier**: 75%+ statements, branches, functions, lines
- **Edge Tier**: 70%+ with focus on error propagation paths
- **CLI Tier**: 70%+ including error display and user interaction

### **Anti-Completion-Pressure Safeguards**
- Never delete tests created for comprehensive error coverage
- Never skip essential error handling tests under time pressure
- Return to user early if blocked rather than compromise test integrity
- Document any deferred tests with clear TODO comments and rationale

### **Test Strategy Per Slice**
**Slice 1**: Focus on unit test coverage of retry logic with comprehensive error scenarios
**Slice 2**: Add integration tests validating cross-tier error flow with proper timeout coordination
**Slice 3**: Complete E2E tests demonstrating full user experience and error recovery

## **Risk Mitigation Strategy**

### **Technical Risks**
- **Timeout Coordination**: Use progressive timeouts with buffer between tiers
- **Error Code Consistency**: Leverage existing error code system with proper mapping
- **Performance Impact**: Benchmark retry logic to ensure <5% overhead requirement

### **Integration Risks**
- **Cross-Tier Dependencies**: Use proper mocking strategies for tier isolation during development
- **Provider Interface Changes**: Maintain backward compatibility throughout implementation
- **Existing Functionality**: Comprehensive regression testing at each slice

### **User Experience Risks**
- **Error Message Quality**: Reference story specification examples for consistency
- **Retry Behavior**: Balance user experience with system reliability
- **Debug Information**: Provide appropriate detail level based on user context

### **Recovery Strategies**
- **Agent Coordination Failure**: Clear handoff protocols with shared artifact validation
- **Test Strategy Conflicts**: Prioritize test integrity over speed, escalate to user early
- **Performance Issues**: Implement progressive enhancement with fallback to simpler error handling

## **Success Metrics**

### **Functional Validation**
- All story acceptance criteria met with test evidence
- Complete error scenario coverage: rate limits, timeouts, auth errors, network failures
- User-friendly error messages with actionable guidance
- Retry logic with exponential backoff working correctly

### **Technical Validation**
- 90% test coverage achieved across all error handling paths
- Performance impact <5% validated through benchmarking
- Cross-tier error propagation working with proper timeout coordination
- No regressions in existing provider functionality

### **User Experience Validation**
- Clear, actionable error messages matching story specification
- Retry progress visible to users with professional presentation
- Debug mode available for troubleshooting
- Error recovery guidance provided for common scenarios

This workplan provides a comprehensive, slice-based approach to implementing Story 4's resilience and error handling requirements while maintaining the high engineering standards and TDD discipline established in the Liminal Chat project.