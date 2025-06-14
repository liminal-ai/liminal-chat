#!/bin/bash
# Test service orchestration script

set -e

DOMAIN_PID=""
EDGE_PID=""

# Terminates the Domain and Edge service processes if running and exits the script.
#
# Globals:
#
# * DOMAIN_PID: Process ID of the Domain service.
# * EDGE_PID: Process ID of the Edge service.
#
# Outputs:
#
# * Prints a cleanup message to STDOUT.
#
# Returns:
#
# * Exits the script with status 0.
#
# Example:
#
# ```bash
# cleanup
# ```
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

# Starts the Domain service in development mode and waits for it to become healthy.
#
# Globals:
#
# * DOMAIN_PID: Set to the process ID of the started Domain service.
#
# Outputs:
#
# * Prints status messages to STDOUT regarding service startup and health check progress.
#
# Returns:
#
# * 0 if the Domain service becomes healthy within the timeout.
# * Exits with status 1 if the service fails to become healthy after 30 attempts.
#
# Example:
#
# ```bash
# start_domain
# ```
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

# Starts the Edge service in development mode and waits for it to become healthy.
#
# Globals:
#
# * EDGE_PID: Set to the process ID of the started Edge service.
#
# Outputs:
#
# * Prints status messages to STDOUT regarding service startup and health checks.
#
# Returns:
#
# * Returns 0 if the Edge service becomes healthy within the timeout.
# * Exits with status 1 if the service fails to become healthy after 30 attempts.
#
# Example:
#
# ```bash
# start_edge
# ```
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

# Runs the specified test suite for the Edge service.
#
# Arguments:
#
# * Test type to run: "unit", "integration", or "all".
#
# Returns:
#
# * Exits with status 1 if an invalid test type is provided.
#
# Example:
#
# ```bash
# run_tests unit
# run_tests integration
# run_tests all
# ```
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