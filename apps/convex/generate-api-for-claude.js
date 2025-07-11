const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Function to extract TSDoc and function info from a file
function extractFunctionInfo(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.Latest, true);

  const functions = [];

  function visit(node) {
    // Look for exported const declarations with query/mutation/action
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isVariableDeclaration(declaration)) {
        const name = declaration.name.getText();

        // Get the JSDoc comment
        const jsDoc = ts.getJSDocCommentsAndTags(node);
        let description = '';
        let params = [];
        let returns = '';
        let example = '';

        if (jsDoc.length > 0) {
          const comment = jsDoc[0];
          if (comment.comment) {
            description =
              typeof comment.comment === 'string'
                ? comment.comment.split('\n')[0]
                : comment.comment
                    .map((part) => part.text)
                    .join('')
                    .split('\n')[0];
          }

          // Extract @param, @returns, @example tags
          if (comment.tags) {
            comment.tags.forEach((tag) => {
              if (tag.tagName.text === 'param' && tag.comment) {
                const paramText =
                  typeof tag.comment === 'string'
                    ? tag.comment
                    : tag.comment.map((part) => part.text).join('');
                params.push(paramText);
              } else if (tag.tagName.text === 'returns' && tag.comment) {
                returns =
                  typeof tag.comment === 'string'
                    ? tag.comment
                    : tag.comment.map((part) => part.text).join('');
              } else if (tag.tagName.text === 'example' && tag.comment) {
                example =
                  typeof tag.comment === 'string'
                    ? tag.comment
                    : tag.comment.map((part) => part.text).join('');
              }
            });
          }
        }

        // Get line number
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

        // Determine type (query/mutation/action)
        let type = 'function';
        const initText = declaration.initializer?.getText() || '';
        if (initText.includes('query(')) type = 'query';
        else if (initText.includes('mutation(')) type = 'mutation';
        else if (initText.includes('action(')) type = 'action';
        else if (initText.includes('httpAction(')) type = 'httpAction';

        functions.push({
          name,
          type,
          description,
          params,
          returns,
          example,
          line: line + 1,
          file: fileName,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}

// Main generation function
function generateApiForClaude() {
  const convexDir = path.join(__dirname, 'convex');
  const outputPath = path.join(__dirname, '../../docs/tsdocs/api-for-claude.md');

  // Files to process
  const files = [
    'users.ts',
    'conversations.ts',
    'messages.ts',
    'chat.ts',
    'lib/auth.ts',
    'lib/env.ts',
    'lib/errors.ts',
    'ai/service.ts',
  ];

  let content = `# Liminal Chat API Reference for Claude

This is a concise reference designed for AI agents to quickly understand and work with the Liminal Chat API.

## Quick Setup

\`\`\`bash
# From project root
pnpm --filter liminal-api dev              # Start Convex backend
pnpm --filter web dev                      # Start Next.js frontend
pnpm --filter @liminal/cli dev             # Run CLI
\`\`\`

## Environment Variables

### Required for Production
- \`CLERK_ISSUER_URL\` - From Clerk JWT Templates
- \`CLERK_WEBHOOK_SECRET\` - For user sync webhooks
- \`OPENAI_API_KEY\`, \`ANTHROPIC_API_KEY\`, etc. - For AI providers

### Development Mode
\`\`\`bash
npx convex env set DEV_AUTH_DEFAULT true
npx convex env set DEV_USER_ID "user_2zINPyhtT9Wem9OeVW4eZDs21KI"  
npx convex env set DEV_USER_EMAIL "dev@liminal.chat"
npx convex env set DEV_USER_NAME "Dev User"
\`\`\`

## Common Patterns

### Authentication in Queries/Mutations
\`\`\`typescript
const identity = await requireAuth(ctx);  // Throws if not authenticated
// or
const identity = await getAuth(ctx);      // Returns null if not authenticated
\`\`\`

### Error Handling
\`\`\`typescript
import { createApiKeyError, createAuthError } from './lib/errors';
throw createApiKeyError('openai', 'OPENAI_API_KEY');
\`\`\`

## API Functions

`;

  // Process each file
  files.forEach((file) => {
    const filePath = path.join(convexDir, file);
    if (!fs.existsSync(filePath)) return;

    const functions = extractFunctionInfo(filePath, file);
    if (functions.length === 0) return;

    content += `### ${file}\n\n`;

    functions.forEach((fn) => {
      // Function signature with type
      content += `#### \`${fn.name}\` (${fn.type})`;
      content += ` - ${fn.file}:${fn.line}\n`;

      // Description
      if (fn.description) {
        content += `${fn.description}\n\n`;
      }

      // Parameters
      if (fn.params.length > 0) {
        content += `**Params:**\n`;
        fn.params.forEach((param) => {
          content += `- ${param}\n`;
        });
        content += '\n';
      }

      // Returns
      if (fn.returns) {
        content += `**Returns:** ${fn.returns}\n\n`;
      }

      // Example (truncated for conciseness)
      if (fn.example) {
        const lines = fn.example.split('\n');
        const firstExample = lines.slice(0, 5).join('\n');
        content += `**Example:**\n\`\`\`typescript\n${firstExample}\n\`\`\`\n\n`;
      }

      content += '\n';
    });
  });

  // Add quick reference sections
  content += `## Quick Function Lookup

### User Management
- \`users.getCurrentUser\` - Get authenticated user
- \`users.syncUser\` - Create/update user from Clerk
- \`users.testAuth\` - Check auth status
- \`users.initializeDevUser\` - Set up dev user (dev only)

### Conversations
- \`conversations.create\` - Create new conversation
- \`conversations.list\` - List user's conversations (paginated)
- \`conversations.get\` - Get single conversation
- \`conversations.update\` - Update title/metadata
- \`conversations.archive\` - Soft delete

### Messages
- \`messages.create\` - Add single message
- \`messages.createBatch\` - Add multiple messages
- \`messages.list\` - List with pagination
- \`messages.getAll\` - Get all with cursor pagination
- \`messages.getLatest\` - Get recent messages for context

### Chat Actions
- \`chat.simpleChatAction\` - Non-streaming chat completion
- \`chat.streamingChatAction\` - Prepare streaming context

### HTTP Endpoints
- \`GET /health\` - Health check with DB status
- \`GET /test\` - Comprehensive test endpoint
- \`POST /clerk-webhook\` - User sync webhook
- \`POST /api/chat-text\` - Non-streaming chat
- \`POST /api/chat-stream\` - Streaming chat

## Key Types

\`\`\`typescript
// User
{ tokenIdentifier: string, email: string, name?: string, imageUrl?: string }

// Conversation  
{ 
  userId: string,
  title: string,
  type: "standard" | "roundtable" | "pipeline",
  metadata?: { provider?: string, model?: string, tags?: string[], archived?: boolean }
}

// Message
{
  conversationId: Id<"conversations">,
  authorType: "user" | "agent" | "system", 
  authorId: string,
  type: "text" | "tool_call" | "tool_output" | "chain_of_thought" | "error",
  content: any,
  metadata?: { provider?: string, model?: string, totalTokens?: number }
}
\`\`\`

## Testing Commands

\`\`\`bash
# From project root
pnpm --filter liminal-api test              # Run all tests
pnpm --filter liminal-api lint              # Lint check
pnpm --filter liminal-api typecheck         # TypeScript check

# Convex specific
npx convex logs                             # View logs
npx convex run users:testAuth              # Test auth
\`\`\`
`;

  // Write the file
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ Generated api-for-claude.md in ${path.dirname(outputPath)}`);
}

// Check if TypeScript is available
try {
  require('typescript');
  generateApiForClaude();
} catch (error) {
  console.error('❌ TypeScript is required. Install it first.');
  process.exit(1);
}
