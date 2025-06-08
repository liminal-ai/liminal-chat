# Build Scripts

## Error Usage Checker

The `check-error-usage.js` script enforces proper error handling patterns by detecting generic `Error` usage at build time.

### How it works

1. **Build Integration**: Runs automatically during `pnpm build`
2. **Detection**: Finds instances of `throw new Error()` in TypeScript/JavaScript files
3. **Guidance**: Points developers to documentation and provides quick fixes

### When you see an error

```
❌ Found 1 generic Error usage(s):

apps/domain/src/services/chat.ts:45
  throw new Error('Room is full');

📚 How to fix:
  1. Use AppError with a specific error code
  2. See error handling documentation: docs/guides/engineering-practices.md#error-handling
  
💡 Quick fix for work in progress:
     throw new AppError(ERROR_CODES.TODO.NEEDS_SPECIFIC_CODE, 'Room is full');
```

### Quick fixes

#### For work in progress
```typescript
import { AppError, ERROR_CODES } from '@liminal-chat/shared-utils';

// Temporary - replace with specific code later
throw new AppError(ERROR_CODES.TODO.NEEDS_SPECIFIC_CODE, 'Your error message');
```

#### For production code
```typescript
// Add to your feature's errors
export const CHAT_ERRORS = {
  ROOM_FULL: 'CHAT_ROOM_FULL',
  // ... other errors
};

// Use in code
throw new AppError(CHAT_ERRORS.ROOM_FULL, 'Room has reached maximum capacity');
```

### Bypassing the check

In rare cases where generic Error is needed (e.g., test files), the check automatically ignores:
- Test files (`*.test.ts`, `*.spec.ts`)
- Scripts directory
- Node modules
- Build output

### Running manually

```bash
# Check for errors
pnpm check:errors

# Or run directly
node scripts/check-error-usage.js
```