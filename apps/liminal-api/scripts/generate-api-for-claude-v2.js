const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Configuration
const CONFIG = {
  // Directories to scan
  scanDirs: [
    'convex',
    'src', // If you add src/ later
    'lib', // If you add lib/ later
  ],

  // File patterns to exclude
  excludePatterns: ['_generated', 'node_modules', '.test.ts', '.spec.ts', 'd.ts', 'tsconfig.json'],

  // Function patterns to detect
  functionPatterns: {
    convex: [
      'query',
      'mutation',
      'action',
      'httpAction',
      'internalQuery',
      'internalMutation',
      'internalAction',
    ],
    classes: ['class', 'interface', 'type'],
    exports: ['export const', 'export function', 'export class'],
  },
};

// Recursively find all TypeScript files
function findTsFiles(dir, baseDir = dir) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // Skip excluded patterns
    if (CONFIG.excludePatterns.some((pattern) => fullPath.includes(pattern))) {
      continue;
    }

    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath, baseDir));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

// Extract all exports from a file
function extractExports(filePath, relativePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(relativePath, fileContent, ts.ScriptTarget.Latest, true);

  const exports = {
    functions: [],
    classes: [],
    types: [],
    interfaces: [],
  };

  function extractJsDoc(node) {
    const jsDocNodes = ts.getJSDocCommentsAndTags(node);
    const docs = {
      description: '',
      params: [],
      returns: '',
      example: '',
      throws: [],
    };

    if (jsDocNodes.length > 0) {
      const comment = jsDocNodes[0];
      if (comment.comment) {
        docs.description =
          typeof comment.comment === 'string'
            ? comment.comment.trim().split('\n')[0]
            : comment.comment
                .map((part) => part.text)
                .join('')
                .trim()
                .split('\n')[0];
      }

      if (comment.tags) {
        comment.tags.forEach((tag) => {
          const tagName = tag.tagName.text;
          const tagComment = tag.comment
            ? typeof tag.comment === 'string'
              ? tag.comment
              : tag.comment.map((p) => p.text).join('')
            : '';

          switch (tagName) {
            case 'param':
              docs.params.push(tagComment.trim());
              break;
            case 'returns':
            case 'return':
              docs.returns = tagComment.trim();
              break;
            case 'example':
              docs.example = tagComment.trim();
              break;
            case 'throws':
              docs.throws.push(tagComment.trim());
              break;
          }
        });
      }
    }

    return docs;
  }

  function getType(node) {
    // Detect Convex function type
    if (node.initializer) {
      const text = node.initializer.getText();
      for (const pattern of CONFIG.functionPatterns.convex) {
        if (text.includes(`${pattern}(`)) {
          return pattern;
        }
      }
    }
    return 'function';
  }

  function visit(node) {
    // Export const declarations (Convex functions)
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const declaration = node.declarationList.declarations[0];
      if (declaration && ts.isVariableDeclaration(declaration)) {
        const name = declaration.name.getText();
        const docs = extractJsDoc(node);
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const type = getType(declaration);

        exports.functions.push({
          name,
          type,
          line: line + 1,
          ...docs,
        });
      }
    }

    // Export function declarations
    if (
      ts.isFunctionDeclaration(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const name = node.name?.getText() || 'anonymous';
      const docs = extractJsDoc(node);
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

      exports.functions.push({
        name,
        type: 'function',
        line: line + 1,
        ...docs,
      });
    }

    // Export class declarations
    if (
      ts.isClassDeclaration(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const name = node.name?.getText() || 'anonymous';
      const docs = extractJsDoc(node);
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

      // Extract methods
      const methods = [];
      node.members.forEach((member) => {
        if (
          ts.isMethodDeclaration(member) &&
          member.modifiers?.some((m) => m.kind === ts.SyntaxKind.PublicKeyword)
        ) {
          const methodName = member.name?.getText();
          const methodDocs = extractJsDoc(member);
          methods.push({
            name: methodName,
            ...methodDocs,
          });
        }
      });

      exports.classes.push({
        name,
        line: line + 1,
        methods,
        ...docs,
      });
    }

    // Export type/interface declarations
    if (
      (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const name = node.name?.getText();
      const kind = ts.isTypeAliasDeclaration(node) ? 'type' : 'interface';
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

      const target = kind === 'type' ? exports.types : exports.interfaces;
      target.push({
        name,
        line: line + 1,
        description: extractJsDoc(node).description,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return exports;
}

// Group files by directory
function groupByDirectory(files) {
  const grouped = {};

  files.forEach(({ fullPath, relativePath }) => {
    const dir = path.dirname(relativePath);
    if (!grouped[dir]) {
      grouped[dir] = [];
    }

    const exports = extractExports(fullPath, relativePath);
    if (Object.values(exports).some((arr) => arr.length > 0)) {
      grouped[dir].push({
        file: path.basename(relativePath),
        path: relativePath,
        exports,
      });
    }
  });

  return grouped;
}

// Format function for markdown
function formatFunction(fn, filePath) {
  let output = `**\`${fn.name}\`** (${fn.type})`;
  if (filePath) output += ` - ${filePath}:${fn.line}`;
  output += '  \n';

  if (fn.description) {
    output += `${fn.description}  \n`;
  }

  if (fn.params.length > 0) {
    output += `Args: ${fn.params.join(', ')}  \n`;
  }

  if (fn.returns) {
    output += `Returns: ${fn.returns}  \n`;
  }

  if (fn.throws.length > 0) {
    output += `Throws: ${fn.throws.join(', ')}  \n`;
  }

  return output + '\n';
}

// Generate the markdown
function generateMarkdown() {
  const baseDir = path.join(__dirname, '..');
  const outputPath = path.join(__dirname, '../../docs/tsdocs/api-for-claude.md');

  // Find all TypeScript files
  const allFiles = [];
  CONFIG.scanDirs.forEach((dir) => {
    const dirPath = path.join(baseDir, dir);
    allFiles.push(...findTsFiles(dirPath, baseDir));
  });

  // Group by directory
  const grouped = groupByDirectory(allFiles);

  // Generate markdown
  let content = `# Liminal Chat API Reference for Claude

This is a comprehensive reference generated from the codebase, designed for AI agents.

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

## API Reference

`;

  // Sort directories
  const sortedDirs = Object.keys(grouped).sort();

  sortedDirs.forEach((dir) => {
    const files = grouped[dir];
    if (files.length === 0) return;

    content += `### ${dir}/\n\n`;

    files.forEach((fileInfo) => {
      if (fileInfo.exports.functions.length === 0 && fileInfo.exports.classes.length === 0) return;

      content += `#### ${fileInfo.file}\n\n`;

      // Functions
      fileInfo.exports.functions.forEach((fn) => {
        content += formatFunction(fn, fileInfo.path);
      });

      // Classes
      fileInfo.exports.classes.forEach((cls) => {
        content += `**\`${cls.name}\`** (class) - ${fileInfo.path}:${cls.line}  \n`;
        if (cls.description) {
          content += `${cls.description}  \n`;
        }

        if (cls.methods.length > 0) {
          content += `Methods: ${cls.methods.map((m) => `\`${m.name}\``).join(', ')}  \n`;
        }
        content += '\n';
      });

      // Types and Interfaces (brief listing)
      if (fileInfo.exports.types.length > 0) {
        content += `Types: ${fileInfo.exports.types.map((t) => `\`${t.name}\``).join(', ')}  \n\n`;
      }

      if (fileInfo.exports.interfaces.length > 0) {
        content += `Interfaces: ${fileInfo.exports.interfaces.map((i) => `\`${i.name}\``).join(', ')}  \n\n`;
      }
    });
  });

  // Add quick reference sections
  content += `
## Function Index by Type

### Convex Queries
`;
  sortedDirs.forEach((dir) => {
    grouped[dir].forEach((file) => {
      const queries = file.exports.functions.filter((f) => f.type === 'query');
      if (queries.length > 0) {
        content += `${file.file}: ${queries.map((q) => `\`${q.name}\``).join(', ')}  \n`;
      }
    });
  });

  content += `
### Convex Mutations
`;
  sortedDirs.forEach((dir) => {
    grouped[dir].forEach((file) => {
      const mutations = file.exports.functions.filter((f) => f.type === 'mutation');
      if (mutations.length > 0) {
        content += `${file.file}: ${mutations.map((m) => `\`${m.name}\``).join(', ')}  \n`;
      }
    });
  });

  content += `
### Convex Actions
`;
  sortedDirs.forEach((dir) => {
    grouped[dir].forEach((file) => {
      const actions = file.exports.functions.filter(
        (f) => f.type === 'action' || f.type === 'httpAction',
      );
      if (actions.length > 0) {
        content += `${file.file}: ${actions.map((a) => `\`${a.name}\``).join(', ')}  \n`;
      }
    });
  });

  // Write the file
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ Generated api-for-claude.md (${allFiles.length} files scanned)`);

  // Debug info
  const totalExports = sortedDirs.reduce((sum, dir) => {
    return (
      sum +
      grouped[dir].reduce((dirSum, file) => {
        return dirSum + file.exports.functions.length + file.exports.classes.length;
      }, 0)
    );
  }, 0);

  console.log(
    `   Found ${totalExports} exported functions/classes across ${sortedDirs.length} directories`,
  );
}

// Run it
try {
  generateMarkdown();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
