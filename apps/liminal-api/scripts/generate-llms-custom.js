const fs = require('fs');
const path = require('path');

// Read config
const configPath = path.join(__dirname, 'llms-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Output directory
const outputDir = path.join(__dirname, '../../docs/tsdocs');

// Create llms.txt content
const llmsTxt = `# llms.txt - Liminal Chat API Documentation

project_name: ${config.project_name}
version: ${config.version}
description: ${config.description}
base_url: ${config.base_url}
docs_url: ${config.docs_url}

## API Endpoints

${config.endpoints.map((endpoint) => `- ${endpoint}`).join('\n')}

## Authentication

method: ${config.auth.method}
details: ${config.auth.details}

## Convex Functions

### Users
${config.convex_functions.users.map((fn) => `- ${fn}`).join('\n')}

### Conversations
${config.convex_functions.conversations.map((fn) => `- ${fn}`).join('\n')}

### Messages
${config.convex_functions.messages.map((fn) => `- ${fn}`).join('\n')}

### Chat
${config.convex_functions.chat.map((fn) => `- ${fn}`).join('\n')}

## Environment Variables

### Required for Production
${config.environment_variables.map((v) => `- ${v}`).join('\n')}

### Development Environment
${config.dev_environment.variables.map((v) => `- ${v}`).join('\n')}
${config.dev_environment.description}

## Support

contact: ${config.support.contact}
url: ${config.support.url}
`;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the file
fs.writeFileSync(path.join(outputDir, 'llms.txt'), llmsTxt, 'utf-8');
console.log(`✅ Generated llms.txt in ${outputDir}`);
