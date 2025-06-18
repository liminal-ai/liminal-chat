#!/bin/bash
# Test service orchestration script

set -e

DOMAIN_PID=""
EDGE_PID=""

cleanup() {
    echo "Cleaning up test services..."
    if [ ! -z "$DOMAIN_PID" ]; then
        kill $DOMAIN_PID 2>/dev/null || true
    fi
    if [ ! -z "$EDGE_PID" ]; then
        kill $EDGE_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup EXIT

start_domain() {
    echo "Starting Domain service..."
    cd apps/domain
    npm run start:dev &
    DOMAIN_PID=$!
    cd ../..
    
    # Wait for Domain health check
    for i in {1..30}; do
        if curl -s http://localhost:8766/health > /dev/null 2>&1; then
            echo "Domain service ready"
            return 0
        fi
        echo "Waiting for Domain service... ($i/30)"
        sleep 2
    done
    
    echo "Domain service failed to start"
    exit 1
}

start_edge() {
    echo "Starting Edge service..."
    cd apps/edge
    wrangler dev --port 8787 &
    EDGE_PID=$!
    cd ../..
    
    # Wait for Edge health check
    for i in {1..30}; do
        if curl -s http://localhost:8787/health > /dev/null 2>&1; then
            echo "Edge service ready"
            return 0
        fi
        echo "Waiting for Edge service... ($i/30)"
        sleep 2
    done
    
    echo "Edge service failed to start"
    exit 1
}

run_tests() {
    echo "Running test suite..."
    case "$1" in
        "unit")
            pnpm edge:test:unit
            ;;
        "integration")
            pnpm edge:test:integration
            ;;
        "all")
            pnpm edge:test:all
            ;;
        *)
            echo "Usage: $0 {unit|integration|all}"
            exit 1
            ;;
    esac
}

# Main execution
case "$1" in
    "unit")
        echo "Running unit tests (no services required)"
        pnpm edge:test:unit
        ;;
    "integration")
        start_domain
        start_edge
        pnpm edge:test:integration
        ;;
    "all")
        start_domain
        start_edge
        pnpm edge:test:all
        ;;
    *)
        echo "Usage: $0 {unit|integration|all}"
        exit 1
        ;;
esac