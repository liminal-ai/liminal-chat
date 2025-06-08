# Example: Feature 002, Story 2 Requirements

## Story 2: Edge API Messages Support

### Overview
Extend the Edge API to support the new messages format introduced in Story 1, maintaining backward compatibility with prompt-only requests.

### Acceptance Criteria
1. Edge API accepts both prompt and messages formats
2. Request validation handles oneOf constraint properly  
3. All existing prompt-only clients continue to work
4. Error responses follow established patterns
5. OpenAPI documentation updated

### Test Conditions
1. **Prompt Mode (Backward Compatibility)**
   - Accepts: `{ "prompt": "Hello" }`
   - Rejects: `{ "prompt": "" }` (empty string)
   - Rejects: `{ "prompt": "x".repeat(4001) }` (too long)

2. **Messages Mode**
   - Accepts: `{ "messages": [{ "role": "user", "content": "Hello" }] }`
   - Accepts: Multiple messages with system prompt
   - Rejects: `{ "messages": [] }` (empty array)
   - Rejects: Invalid role values

3. **OneOf Validation**
   - Rejects: `{}` (neither prompt nor messages)
   - Rejects: `{ "prompt": "Hi", "messages": [...] }` (both provided)

4. **Provider Selection**
   - Uses default provider when not specified
   - Accepts valid provider names
   - Rejects invalid provider names

5. **Error Responses**
   - 400 for validation errors with details
   - 404 for unknown provider
   - 502 for provider API errors

### Technical Requirements
- Update edge-server request validation
- Transform Edge format to Domain format
- Maintain type safety throughout
- No breaking changes to existing API

### Out of Scope
- Streaming support
- Authentication changes
- New providers