# Technical Debt Registry

This document tracks identified technical debt and inconsistencies that need addressing.

## High Priority Issues

### TD-001: Error Event Structure Inconsistency

**Status**: Identified, Not Addressed  
**Priority**: High  
**Impact**: Client Error Handling, Code Consistency  
**Date Identified**: 2025-06-13  

#### Problem Description

There is a structural inconsistency in error event formats between:

1. **Domain Controller Errors** (`apps/domain/src/domain/domain.controller.ts:111-116`)
2. **Provider Stream Errors** (using `StreamErrorCode` from `shared-types`)

#### Current Implementation Analysis

**Domain Controller Error Structure** (Generic Format):
```typescript
// Line 111-116 in domain.controller.ts
const errorMessage = `event: error\ndata: ${JSON.stringify({
  message: error instanceof Error ? error.message : "Unknown error",
  code: "INTERNAL_ERROR",
  retryable: false,
})}\n\n`;
```

**Provider Stream Error Structure** (StreamErrorCode Format):
```typescript
// From openrouter.provider.ts lines 243-252, 358-366
yield {
  type: "error",
  data: {
    message: "Provider error message",
    code: StreamErrorCode.AUTHENTICATION_FAILED, // Structured enum
    retryable: false,
    details?: Record<string, unknown>, // Optional additional context
  },
  eventId: "provider-generated-id",
};
```

#### Key Differences

1. **Code Structure**:
   - Domain: Uses hardcoded string literals (`"INTERNAL_ERROR"`)
   - Providers: Uses structured `StreamErrorCode` enum constants

2. **Error Event Format**:
   - Domain: Manual SSE formatting (`event: error\ndata: ...`)
   - Providers: Structured `ProviderStreamEvent` objects

3. **Additional Fields**:
   - Domain: Basic message/code/retryable only
   - Providers: Includes `eventId`, optional `details`, full type safety

4. **Type Safety**:
   - Domain: No TypeScript validation on error structure
   - Providers: Full type safety via `StreamError` interface

#### Impact Assessment

**Client Error Handling**:
- Clients receive inconsistent error formats depending on error source
- Different parsing logic required for domain vs provider errors
- Reduces reliability of error recovery mechanisms

**Code Maintenance**:
- Duplicate error handling patterns
- Risk of introducing new inconsistencies
- Harder to add new error types consistently

**Type Safety**:
- Domain controller bypasses type system for errors
- Provider errors are fully type-safe
- Inconsistent developer experience

#### Proposed Solution

**Option 1: Unify on StreamError Interface (Recommended)**

1. **Update Domain Controller**:
   ```typescript
   // Replace manual SSE formatting with ProviderStreamEvent
   yield {
     type: "error",
     data: {
       message: error instanceof Error ? error.message : "Unknown error",
       code: StreamErrorCode.UNKNOWN, // or appropriate code
       retryable: false,
     },
     eventId: generateEventId(),
   };
   ```

2. **Add SSE Formatting Helper**:
   ```typescript
   // Utility function to convert ProviderStreamEvent to SSE format
   function formatAsSSE(event: ProviderStreamEvent): string {
     return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
   }
   ```

3. **Benefits**:
   - Single error structure across entire application
   - Full type safety for all errors
   - Consistent client parsing
   - Easier to extend with new error types

**Option 2: Extend StreamErrorCode**

Add domain-specific error codes:
```typescript
export const StreamErrorCode = {
  // ... existing codes
  DOMAIN_INTERNAL_ERROR: 'DOMAIN_INTERNAL_ERROR',
  DOMAIN_VALIDATION_ERROR: 'DOMAIN_VALIDATION_ERROR',
  // ... etc
} as const;
```

#### Implementation Complexity

**Low-Medium Complexity**:
- Single file changes in domain controller
- Add utility function for SSE formatting
- Update any tests that expect old error format
- Verify client compatibility

**Estimated Effort**: 2-4 hours

#### Action Items

- [ ] Create utility function for SSE event formatting
- [ ] Update domain controller error handling to use ProviderStreamEvent
- [ ] Add appropriate StreamErrorCode constants for domain errors
- [ ] Update tests expecting old error format
- [ ] Verify Edge proxy handles new format correctly
- [ ] Update documentation on error handling patterns

#### Notes

This inconsistency was identified during PR review for Story 3-5 and should be addressed before implementing additional error handling features.

---

## Medium Priority Issues

(None currently identified)

---

## Low Priority Issues

(None currently identified)

---

## Process Notes

**Adding New Technical Debt**:
1. Create entry with TD-XXX identifier
2. Include problem description, current implementation, and proposed solution
3. Assess impact and complexity
4. Add to project status "Known Issues" section
5. Link to relevant issues/PRs where applicable

**Resolving Technical Debt**:
1. Update status to "In Progress" when work begins
2. Document implementation approach and any deviations
3. Mark as "Resolved" with completion date
4. Keep resolved items for historical reference