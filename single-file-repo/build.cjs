/**
 * Single-file repo builder (JS runtime)
 * Mirrors build.ts to avoid requiring a TS runner in restricted environments.
 */
const fs = require('fs/promises');
const path = require('path');

const DEFAULTS = {
  root: path.join(process.cwd(), 'apps/chat'),
  outFile: path.join(process.cwd(), 'single-file-repo', 'single-file-repo.txt'),
};

const INCLUDE_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.scss',
  '.md',
  '.json',
  '.yml',
  '.yaml',
  '.html',
  '.cjs',
  '.mjs',
  '.sh',
]);

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.turbo',
  '.cache',
  'coverage',
  '.output',
  '.vercel',
  '.expo',
  '.pnpm-store',
  '.idea',
  '.vscode',
  '.DS_Store',
  'demos',
]);

const EXCLUDE_FILES = new Set([
  '.DS_Store',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
]);

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root' && argv[i + 1]) {
      opts.root = path.resolve(argv[++i]);
    } else if ((a === '--out' || a === '--outfile') && argv[i + 1]) {
      opts.outFile = path.resolve(argv[++i]);
    }
  }
  return opts;
}

function shouldInclude(filePath, stats) {
  const base = path.basename(filePath);
  if (EXCLUDE_FILES.has(base)) return false;
  const ext = path.extname(base).toLowerCase();
  if (!INCLUDE_EXT.has(ext)) return false;
  const MAX_SIZE = 1.5 * 1024 * 1024; // ~1.5MB guard
  if (stats.size > MAX_SIZE) return false;
  return true;
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function headerFor(relPath) {
  return `===== FILE: ${relPath} =====`;
}

async function build(opts) {
  const { root, outFile } = opts;
  const repoRoot = process.cwd();
  const outDir = path.dirname(outFile);
  await fs.mkdir(outDir, { recursive: true });

  const parts = [];
  const seen = new Set();
  let count = 0;

  for await (const full of walk(root)) {
    const rel = path.relative(repoRoot, full);
    if (seen.has(rel)) continue;
    seen.add(rel);
    const stat = await fs.stat(full);
    if (!shouldInclude(full, stat)) continue;
    const content = await fs.readFile(full, 'utf8');
    parts.push(headerFor(rel));
    parts.push(content);
    count++;
  }

  const banner = [
    '===== SINGLE FILE REPO START =====',
    `Root: ${path.relative(process.cwd(), root) || '.'}`,
    `Generated: ${new Date().toISOString()}`,
    `Files: ${count}`,
    '',
  ].join('\n');

  const footer = ['', '===== SINGLE FILE REPO END =====', ''].join('\n');
  const final = [banner, parts.join('\n\n'), footer].join('\n');
  await fs.writeFile(outFile, final, 'utf8');
  console.log(`Wrote ${count} files to ${path.relative(process.cwd(), outFile)}`);
}

if (require.main === module) {
  const opts = parseArgs(process.argv.slice(2));
  build(opts).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
