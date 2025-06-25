#!/bin/bash

# Test streaming endpoint with different providers

CONVEX_URL="https://modest-squirrel-498.convex.site"

echo "🌊 Testing Streaming Chat Endpoint"
echo "=================================="

# Function to test streaming
test_stream() {
    local provider=$1
    local prompt=$2
    
    echo -e "\n📡 Provider: $provider"
    echo "Prompt: $prompt"
    echo "Streaming response:"
    echo "---"
    
    curl -X POST "$CONVEX_URL/api/chat/stream" \
        -H "Content-Type: application/json" \
        -d "{\"prompt\": \"$prompt\", \"provider\": \"$provider\"}" \
        --no-buffer 2>/dev/null | \
        grep "^0:" | \
        sed 's/^0:"//' | \
        sed 's/"$//' | \
        tr -d '\n' | \
        sed 's/\\n/\n/g'
    
    echo -e "\n---"
}

# Test each provider
test_stream "openai" "Write 'Hello World' in 3 different programming languages"
test_stream "anthropic" "Explain streaming in exactly one sentence"
test_stream "google" "What is 2+2? Show your work step by step"
test_stream "perplexity" "What's the latest news about AI today?"
test_stream "openrouter" "Say goodbye in 5 different languages"

echo -e "\n✅ All streaming tests completed!"