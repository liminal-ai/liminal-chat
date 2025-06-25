#!/bin/bash

# Test script for Convex chat endpoint

CONVEX_URL="https://modest-squirrel-498.convex.site"

echo "Testing Convex Chat Endpoint with 3 models..."
echo "=========================================="

# Test 1: Google Gemini 2.0 Flash
echo -e "\n1. Testing Google Gemini 2.0 Flash:"
curl -X POST "$CONVEX_URL/api/chat/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2? Answer in one sentence.",
    "model": "google/gemini-2.0-flash"
  }' | jq .

# Test 2: OpenAI GPT-4o
echo -e "\n2. Testing OpenAI GPT-4o:"
curl -X POST "$CONVEX_URL/api/chat/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the capital of France? Answer in one sentence.",
    "model": "openai/gpt-4o"
  }' | jq .

# Test 3: Anthropic Claude 3.5 Sonnet
echo -e "\n3. Testing Anthropic Claude 3.5 Sonnet:"
curl -X POST "$CONVEX_URL/api/chat/simple" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What color is the sky? Answer in one sentence.",
    "model": "anthropic/claude-3.5-sonnet"
  }' | jq .

echo -e "\nAll tests completed!"