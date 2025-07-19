#!/bin/bash

echo "Opening Clerk token generator..."
echo ""
echo "Instructions:"
echo "1. Sign in with your Clerk account"
echo "2. Click 'Generate Test Token'"
echo "3. Copy the generated token"
echo "4. Set it as environment variable:"
echo "   export CLERK_TEST_TOKEN='Bearer <your-token>'"
echo ""

# Open the HTML file in default browser
open test-token-generator.html

echo "Once you have the token, run tests with:"
echo "  npm test"