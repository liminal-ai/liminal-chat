#!/bin/bash

# Claude-restricted shell for Liminal Chat development
# Prevents Claude from navigating outside the project root

# Create a temporary rcfile with the cd restriction
TEMP_RCFILE=$(mktemp)

cat > "$TEMP_RCFILE" << 'EOF'
# Source user's bashrc if it exists
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi

# Override cd command with project root restriction
cd() {
    if [[ "$1" != "/Users/leemoore/code/liminal-chat"* && "$PWD" == "/Users/leemoore/code/liminal-chat"* ]]; then
        echo "🚫 BLOCKED: Claude must stay in project root /Users/leemoore/code/liminal-chat"
        echo "Use pnpm scripts or relative paths from root instead"
        echo "If you need a script that doesn't exist, discuss with user"
        return 1
    fi
    command cd "$@"
}

# Set project-specific prompt to indicate restricted shell
export PS1="[CLAUDE-RESTRICTED] \u@\h:\w$ "

# Cleanup function
cleanup() {
    rm -f "$TEMP_RCFILE"
}
trap cleanup EXIT
EOF

# Start bash with the temporary rcfile and launch claude
exec bash --rcfile "$TEMP_RCFILE" -c "claude"