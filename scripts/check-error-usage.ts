#!/usr/bin/env ts-node

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const ERROR_DOC_URL = 'docs/guides/engineering-practices.md#error-handling';
const ERROR_CODES_SECTION = 'Error Code Categories';

interface ErrorUsage {
  file: string;
  line: number;
  column: number;
  text: string;
}

function checkSourceFile(sourceFile: ts.SourceFile): ErrorUsage[] {
  const errors: ErrorUsage[] = [];

  function visit(node: ts.Node) {
    // Check for: throw new Error(...)
    if (
      ts.isThrowStatement(node) &&
      node.expression &&
      ts.isNewExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'Error'
    ) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      errors.push({
        file: sourceFile.fileName,
        line: line + 1,
        column: character + 1,
        text: node.getText(),
      });
    }

    // Check for: Promise.reject(new Error(...))
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'reject' &&
      node.arguments.length > 0 &&
      ts.isNewExpression(node.arguments[0]) &&
      ts.isIdentifier(node.arguments[0].expression) &&
      node.arguments[0].expression.text === 'Error'
    ) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      errors.push({
        file: sourceFile.fileName,
        line: line + 1,
        column: character + 1,
        text: node.getText(),
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return errors;
}

async function main() {
  console.log('🔍 Checking for generic Error usage...\n');

  const files = await glob('**/*.ts', {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/scripts/**',
    ],
  });

  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    lib: ['es2020'],
  });

  let totalErrors = 0;
  const allErrors: ErrorUsage[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (files.includes(sourceFile.fileName)) {
      const errors = checkSourceFile(sourceFile);
      totalErrors += errors.length;
      allErrors.push(...errors);
    }
  }

  if (totalErrors > 0) {
    console.error(`❌ Found ${totalErrors} generic Error usage(s):\n`);

    allErrors.forEach(error => {
      console.error(`\x1b[36m${error.file}:${error.line}:${error.column}\x1b[0m`);
      console.error(`  \x1b[31m${error.text.substring(0, 80)}...\x1b[0m`);
      console.error('');
    });

    console.error(`📚 \x1b[33mHow to fix:\x1b[0m`);
    console.error(`  1. Use AppError with a specific error code`);
    console.error(`  2. See error handling documentation:`);
    console.error(`     \x1b[36mfile://${path.resolve(ERROR_DOC_URL)}\x1b[0m`);
    console.error(`     Section: "${ERROR_CODES_SECTION}"`);
    console.error('');
    console.error(`  3. Example fix:`);
    console.error(`     \x1b[31m❌ throw new Error('User not found');\x1b[0m`);
    console.error(`     \x1b[32m✅ throw new AppError(\x1b[0m`);
    console.error(`     \x1b[32m     ERROR_CODES.RESOURCE.USER_NOT_FOUND,\x1b[0m`);
    console.error(`     \x1b[32m     'User not found'\x1b[0m`);
    console.error(`     \x1b[32m   );\x1b[0m`);
    console.error('');
    console.error(`💡 \x1b[33mQuick fix for work in progress:\x1b[0m`);
    console.error(`   Import: \x1b[36mimport { AppError, TODO_ERRORS } from '@liminal-chat/shared-utils';\x1b[0m`);
    console.error(`   Use:    \x1b[36mthrow new AppError(TODO_ERRORS.NEEDS_SPECIFIC_CODE, 'Your message');\x1b[0m`);
    console.error('');
    console.error(`📝 \x1b[33mTo add a new error code:\x1b[0m`);
    console.error(`   1. Check existing codes: ${ERROR_DOC_URL}`);
    console.error(`   2. Add to appropriate category in your feature's errors.ts`);
    console.error(`   3. Or add to shared-utils/error-codes.ts for cross-cutting concerns`);
    console.error('');

    process.exit(1);
  }

  console.log('✅ No generic Error usage found!');
}

main().catch(console.error);