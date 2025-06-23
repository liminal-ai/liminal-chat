#!/bin/bash

# Test script for Liminal API HTTP endpoints
# Replace CONVEX_URL with your actual Convex deployment URL

CONVEX_URL="${CONVEX_URL:-https://modest-squirrel-498.convex.site}"

echo "Testing Liminal API endpoints at: $CONVEX_URL"
echo "================================================"

# Test health endpoint
echo -e "\n1. Testing /health endpoint..."
echo "Command: curl -s $CONVEX_URL/health | jq"
curl -s "$CONVEX_URL/health" | jq . || echo "Failed to connect to health endpoint"

# Test the test endpoint
echo -e "\n2. Testing /test endpoint (without auth)..."
echo "Command: curl -s $CONVEX_URL/test | jq"
curl -s "$CONVEX_URL/test" | jq . || echo "Failed to connect to test endpoint"

# Test with auth header (placeholder - replace with actual JWT)
echo -e "\n3. Testing /test endpoint (with auth header)..."
echo "Command: curl -s -H 'Authorization: Bearer YOUR_JWT_HERE' $CONVEX_URL/test"
echo "Note: Replace YOUR_JWT_HERE with an actual Clerk JWT token to test authenticated requests"

echo -e "\n================================================"
echo "To test authenticated endpoints:"
echo "1. Get a JWT token from your Clerk application"
echo "2. Run: curl -H 'Authorization: Bearer YOUR_JWT' $CONVEX_URL/test"
echo ""
echo "For database queries, use the Convex CLI:"
echo "  npx convex run users:getUserCount"
echo "  npx convex run users:testAuth"