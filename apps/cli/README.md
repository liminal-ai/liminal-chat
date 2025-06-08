# Liminal Type Chat CLI

A command-line interface for interacting with the Liminal Type Chat platform.

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

# Install globally
npm install -g .
```

### Using npm (when published)

```bash
npm install -g @liminal/cli
```

## Configuration

The CLI can be configured through multiple sources (in order of priority):

1. **Environment Variables**
   ```bash
   export LIMINAL_API_URL=http://localhost:8787
   export LIMINAL_API_KEY=your-api-key
   export LIMINAL_TIMEOUT=30000
   ```

2. **Configuration File**
   Create a `.liminal.json` file in your current directory or home directory:
   ```json
   {
     "baseUrl": "http://localhost:8787",
     "apiKey": "your-api-key",
     "timeout": 30000
   }
   ```

3. **Default Values**
   - Base URL: `http://localhost:8787`
   - Timeout: 30 seconds

## Usage

### Prerequisites

Make sure the Edge Server is running:
```bash
cd ../edge-server
npm run dev
```

### Basic Chat Session

Start a new interactive chat session:
```bash
liminal chat
```

### Continue an Existing Conversation

Resume a previous conversation by ID:
```bash
liminal chat -c <conversation-id>
```

### Force New Conversation

Start a new conversation even when specifying an ID:
```bash
liminal chat -c <conversation-id> --new
```

### Chat Session Features

- **Real-time Streaming**: Responses are displayed character by character as they arrive
- **Colored Output**: User messages in blue, assistant responses in green
- **Loading Indicators**: Spinner shows when the system is processing
- **Conversation History**: When continuing a conversation, recent messages are displayed
- **Graceful Exit**: Type "exit" or press Ctrl+C to quit

### Example Session

```bash
$ liminal chat
✓ Connected to server
✓ New conversation created: New Conversation

Type your message and press Enter to send.
Type "exit" or press Ctrl+C to quit.

You: Hello, how are you today?
Assistant: Echo: Hello, how are you today?

You: What's the weather like?
Assistant: Echo: What's the weather like?

You: exit

Goodbye!
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (no watch)
npm run test:run

# Type checking
npm run lint
```

### Building

```bash
npm run build
```

### Development Mode

For development with hot reloading:
```bash
npm run dev
```

## Troubleshooting

### Connection Refused

If you see "Cannot connect to server", ensure the Edge Server is running:
```bash
cd ../edge-server
npm run dev
```

### Configuration Not Loading

Check the configuration file locations:
- Current directory: `./.liminal.json`
- Home directory: `~/.liminal.json`

Verify environment variables:
```bash
echo $LIMINAL_API_URL
echo $LIMINAL_API_KEY
```

### TypeScript Errors

If you encounter TypeScript compilation errors:
```bash
# Clean build
rm -rf dist/
npm run build
```

## API Endpoints Used

The CLI interacts with the following Edge Server endpoints:

- `GET /api/v1/health` - Health check
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations/:id` - Get conversation details
- `POST /api/v1/conversations/:id/messages` - Add message
- `POST /api/v1/chat/stream` - Stream chat responses

## Architecture

The CLI is built with:
- **Commander.js** - Command-line interface framework
- **Inquirer.js** - Interactive prompts
- **Chalk** - Terminal string styling
- **Ora** - Elegant terminal spinners
- **Node-fetch** - HTTP client
- **TypeScript** - Type safety
- **Vitest** - Testing framework

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT