#!/bin/bash
# Example orchestration script for multi-agent workflow

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Multi-Agent Development Workflow${NC}"

# Function to run agent and capture result
run_agent() {
    local role=$1
    local task=$2
    local prompt_file=$3
    
    echo -e "${BLUE}Running $role: $task${NC}"
    
    # Run Claude Code in batch mode
    # Note: --yes flag assumes claude code supports non-interactive mode
    claude code --yes --prompt "ai-dev-workflow/prompts/$prompt_file"
    
    return $?
}

# Main workflow loop
main() {
    # 1. IL breaks down requirements
    echo -e "${GREEN}=== Phase 1: Requirements Breakdown ===${NC}"
    run_agent "Implementation Lead" "Breaking down requirements" "il-breakdown.md"
    
    # 2. QE writes tests
    echo -e "${GREEN}=== Phase 2: Test Writing ===${NC}"
    run_agent "Quality Engineer" "Writing tests from requirements" "qe-write-tests.md"
    
    # 3. Initial implementation
    echo -e "${GREEN}=== Phase 3: Initial Implementation ===${NC}"
    run_agent "Engineer" "Implementing to pass tests" "e-implement.md"
    
    # 4. Verification loop
    iteration=1
    max_iterations=5
    
    while [ $iteration -le $max_iterations ]; do
        echo -e "${GREEN}=== Phase 4: Verification (Iteration $iteration) ===${NC}"
        
        # QE verifies
        run_agent "Quality Engineer" "Verifying implementation" "qe-verify.md"
        
        # Check if QE passed the work
        if grep -q "PASSED - All quality gates met" "ai-dev-workflow/context/qe-work.md"; then
            echo -e "${GREEN}✓ All tests passing! Work complete.${NC}"
            break
        else
            echo -e "${RED}✗ Issues found, fixing...${NC}"
            run_agent "Engineer" "Fixing issues" "e-fix-issues.md"
        fi
        
        ((iteration++))
    done
    
    if [ $iteration -gt $max_iterations ]; then
        echo -e "${RED}Maximum iterations reached. Manual intervention needed.${NC}"
        exit 1
    fi
    
    # 5. Final status from IL
    echo -e "${GREEN}=== Phase 5: Final Status ===${NC}"
    run_agent "Implementation Lead" "Final status report" "il-status.md"
}

# Run the workflow
main