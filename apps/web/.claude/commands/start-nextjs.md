# /start-nextjs

Restarts Next.js development server and verifies it's working.

## Command Sequence
1. `npm run dev:restart` - Stop any existing server, start fresh
2. `npm run dev:logverify` - Wait 2s, show last 10 log lines  
3. `npm run dev:curlverify` - Check if server responds on port 3000
4. Report success or suggest using `npm run dev:logs` for debugging

## Usage
```
/start-nextjs
```

## Expected Output
- Server startup logs
- "✅ Ready on port 3000" or error message
- Clear indication if manual debugging needed