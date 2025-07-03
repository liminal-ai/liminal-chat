const generateLLMSFiles = require('llms-generator/src/index.js');
const path = require('path');

// Input config file
const inputPath = path.join(__dirname, 'llms-config.json');

// Output directory - docs/tsdocs
const outputPath = path.join(__dirname, '../../docs/tsdocs');

// Generate the files
try {
  generateLLMSFiles(inputPath, outputPath);
  console.log(`✅ Generated llms.txt and llms-full.txt in ${outputPath}`);
} catch (error) {
  console.error('❌ Error generating llms files:', error);
  process.exit(1);
}
