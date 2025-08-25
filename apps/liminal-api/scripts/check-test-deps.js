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

  // Skip local service checks in CI environment
  if (process.env.CI === 'true') {
    console.log('🤖 Running in CI environment - skipping local service checks');
    console.log('✨ All test dependencies are ready!');
    return;
  }

  const checks = [
    // Add service checks here if needed
  ];

  const results = await Promise.all(checks.map((check) => checkService(check.name, check.url)));

  if (results.some((result) => !result)) {
    console.log('\n⚠️  Required services are not running!');
    process.exit(1);
  }

  console.log('\n✨ All test dependencies are ready!');
}

main().catch(console.error);
