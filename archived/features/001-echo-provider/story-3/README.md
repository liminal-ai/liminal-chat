# Liminal Type Chat CLI - Basic Version

This is the basic CLI for Liminal Type Chat that provides a simple interface for sending prompts to the Edge API and receiving echo responses.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Edge service running on port 8765
- Domain service running on port 8766 (required by Edge)

## Installation

### From Source

```bash
# Clone the repository
git clone <repository-url>
cd liminal-type-chat/cli-client

# Install dependencies
npm install

# Build the project
npm run build

# Link for global usage
npm link
```

### Development Mode

```bash
# Run directly without building
npm run dev
```

## Usage

### Basic Usage

```bash
# Run the CLI
liminal

# Output:
# ✓ Connected to Liminal Type Chat
# 
# Enter prompt: Hello, world!
# 
# Echo: Hello, world!
# 
# Tokens: 3 in, 5 out
```

### Exit Codes

- `0` - Success: Prompt was processed and response displayed
- `1` - Error: Connection failed, invalid input, or server error

## Features

### Health Check
The CLI automatically checks the Edge service health on startup. If the service is unavailable, it will display an error and exit.

### Colored Output
- ✓ Success messages in green
- ✗ Error messages in red
- Prompts in yellow
- Responses in blue
- Token usage in gray

### Token Usage
After each response, the CLI displays the token count:
- Prompt tokens (input)
- Completion tokens (output)

## Error Handling

### Connection Errors
```bash
# If the Edge service is not running:
✗ Cannot connect to server at http://localhost:8765
```

### Empty Prompt
```bash
# If you press Enter without typing:
✗ Prompt cannot be empty
```

### Server Errors
The CLI will display any error messages returned by the server.

## Configuration

Currently, the CLI is configured to connect to:
- Edge API: `http://localhost:8765`

Future versions will support configuration via:
- Environment variables
- Configuration file
- Command-line arguments

## Development

### Running Tests
```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
```

### Linting
```bash
npm run lint      # Check TypeScript types
```

### Project Structure
```
cli-client/
├── src/
│   ├── index.ts           # Main entry point
│   ├── api/
│   │   └── edge-client.ts # API client
│   └── utils/
│       ├── display.ts     # Output formatting
│       └── input.ts       # User input handling
├── dist/                  # Compiled JavaScript
└── bin/
    └── liminal           # Executable script
```

## Troubleshooting

### "Command not found" after npm link
Make sure your npm global bin directory is in your PATH:
```bash
echo $PATH
npm config get prefix
```

### Permission Denied
```bash
chmod +x cli-client/bin/liminal
```

### Module Not Found Errors
```bash
# Rebuild the project
npm run build

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Connection Refused
1. Check that the Edge service is running on port 8765
2. Check that the Domain service is running on port 8766
3. Verify no firewall is blocking the ports

## Limitations

This basic version:
- Only accepts a single prompt then exits
- No configuration options
- No authentication
- No conversation history
- No advanced formatting

These features will be added in future stories.

## Next Steps

Story 4 will add:
- Interactive prompt loop
- `/exit` command to quit
- Better formatting
- Session management
- Command history