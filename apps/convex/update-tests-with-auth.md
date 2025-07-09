# Authentication Setup for Integration Tests

## 1. Generate a Test Token

1. Open `test-token-generator.html` in a browser:

   ```bash
   open test-token-generator.html
   ```

2. Sign in with your Clerk account

3. Click "Generate Test Token"

4. Copy the generated token (starts with `Bearer `)

## 2. Update Your Tests

Add the Authorization header to all test requests:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_GENERATED_TOKEN',
},
```

## 3. Environment Variable Option

For CI/CD, set the token as an environment variable:

```bash
export CLERK_TEST_TOKEN="Bearer YOUR_GENERATED_TOKEN"
```

Then update tests to use:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': process.env.CLERK_TEST_TOKEN || '',
},
```

## 4. Run Tests

```bash
cd apps/liminal-api
npm test
```
