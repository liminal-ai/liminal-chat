#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { chromium, Browser, Page } from 'playwright';

/**
 * Minimal Playwright MCP server
 * Tools:
 * - open_url(url): opens a page to the given URL
 * - screenshot(path?): captures a PNG screenshot; returns base64; optionally writes to path
 * - get_title(): returns current page title
 */

let browser: Browser | null = null;
let page: Page | null = null;

async function ensurePage(): Promise<Page> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  if (!page) {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
  }
  return page;
}

async function dispose(): Promise<void> {
  try {
    await page?.context().close();
  } catch {}
  try {
    await browser?.close();
  } catch {}
  page = null;
  browser = null;
}

const server = new Server({
  name: 'mcp-playwright',
  version: '0.1.0',
});

server.tool(
  {
    name: 'open_url',
    description: 'Open a URL in a headless browser (Chromium)',
    inputSchema: z.object({ url: z.string().url() }),
  },
  async ({ url }) => {
    const p = await ensurePage();
    await p.goto(url, { waitUntil: 'domcontentloaded' });
    return { ok: true };
  },
);

server.tool(
  {
    name: 'screenshot',
    description:
      'Take a full-page PNG screenshot of the current page; returns base64; optionally writes to {path}',
    inputSchema: z.object({ path: z.string().optional() }),
  },
  async ({ path }) => {
    const p = await ensurePage();
    const buffer = await p.screenshot({ fullPage: true, type: 'png' });
    if (path) {
      await p.screenshot({ fullPage: true, path, type: 'png' });
    }
    return { base64: buffer.toString('base64') };
  },
);

server.tool(
  {
    name: 'get_title',
    description: 'Get the current page title',
    inputSchema: z.object({}),
  },
  async () => {
    const p = await ensurePage();
    const title = await p.title();
    return { title };
  },
);

// Optional: graceful shutdown if parent closes stdio
process.on('SIGINT', async () => {
  await dispose();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await dispose();
  process.exit(0);
});

const transport = new StdioServerTransport();
await server.connect(transport);
