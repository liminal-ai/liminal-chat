#!/usr/bin/env node

/**
 * Checks that required services are running before tests
 */

async function checkService(name, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }
    console.log(`✅ ${name} is running`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} is not running at ${url}`);
    return false;
  }
}

async function main() {
  console.log('Checking test dependencies...\n');

  const checks = [
    { name: 'Local Dev Service', url: 'http://127.0.0.1:8081/health' },
    // Add Convex check if needed
  ];

  const results = await Promise.all(checks.map((check) => checkService(check.name, check.url)));

  if (results.some((result) => !result)) {
    console.log('\n⚠️  Required services are not running!');
    console.log('Please run:');
    console.log('  cd apps/local-dev-service && npm run dev:start');
    process.exit(1);
  }

  console.log('\n✨ All test dependencies are ready!');
}

main().catch(console.error);
