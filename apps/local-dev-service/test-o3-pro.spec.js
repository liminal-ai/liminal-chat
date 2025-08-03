import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../'); // Navigate to liminal-chat root
const scratchpadDir = path.join(projectRoot, '.scratchpad');

test('o3-pro async: start request and get ID', async ({ request }) => {
  const outputFile = path.join(scratchpadDir, 'o3-pro-async-test.json');

  // Simple test prompt
  const prompt = `Analyze the async o3-pro pattern implementation for a local development service. Comment on the design approach of returning an immediate ID while processing in the background.`;

  console.log('Starting async o3-pro request...');

  try {
    const response = await request.post('http://127.0.0.1:8081/consult/o3-pro', {
      data: {
        prompt: prompt,
      },
    });

    const responseData = await response.json();

    // Save the initial response with ID
    const testData = {
      step: 'initial_request',
      timestamp: new Date().toISOString(),
      request_id: responseData.id,
      status: responseData.status,
      prompt: prompt.substring(0, 100) + '...',
    };

    fs.writeFileSync(outputFile, JSON.stringify(testData, null, 2));

    console.log(`✅ Async request started successfully`);
    console.log(`Request ID: ${responseData.id}`);
    console.log(`Status: ${responseData.status}`);
    console.log(`Test data saved to: ${outputFile}`);

    expect(response.status()).toBe(200);
    expect(responseData.id).toBeDefined();
    expect(responseData.status).toBe('processing');
  } catch (error) {
    console.error('❌ Test failed:', error.message);

    // Save error to file
    fs.writeFileSync(
      outputFile,
      JSON.stringify(
        {
          step: 'initial_request',
          error: 'Test failed',
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    throw error;
  }
});

test('o3-pro async: wait and get response', async ({ request }) => {
  test.setTimeout(600000); // 10 minutes timeout
  const outputFile = path.join(scratchpadDir, 'o3-pro-async-test.json');
  const responseFile = path.join(scratchpadDir, 'o3-pro-async-response.json');

  // Read the test data to get request ID
  let testData;
  try {
    testData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  } catch (error) {
    throw new Error('Cannot read test data file. Run the first test first.');
  }

  const requestId = testData.request_id;
  console.log(`Checking status for request ID: ${requestId}`);
  console.log('This may take up to 10 minutes...');

  let attempts = 0;
  const maxAttempts = 120; // 10 minutes with 5-second intervals

  while (attempts < maxAttempts) {
    try {
      const response = await request.get(`http://127.0.0.1:8081/o3-pro/response/${requestId}`);
      const statusData = await response.json();

      console.log(`Attempt ${attempts + 1}: Status = ${statusData.status}`);

      if (statusData.status === 'completed') {
        console.log('✅ Request completed successfully!');

        // Save the complete response
        const finalData = {
          step: 'completed',
          timestamp: new Date().toISOString(),
          request_id: requestId,
          status: statusData.status,
          response: statusData.response,
        };

        fs.writeFileSync(responseFile, JSON.stringify(finalData, null, 2));
        console.log(`Full response saved to: ${responseFile}`);

        expect(response.status()).toBe(200);
        expect(statusData.status).toBe('completed');
        expect(statusData.response).toBeDefined();
        return;
      } else if (statusData.status === 'error') {
        console.error('❌ Request failed with error:', statusData.error);

        // Save error response
        const errorData = {
          step: 'error',
          timestamp: new Date().toISOString(),
          request_id: requestId,
          status: statusData.status,
          error: statusData.error,
        };

        fs.writeFileSync(responseFile, JSON.stringify(errorData, null, 2));

        throw new Error(`o3-pro request failed: ${statusData.error}`);
      } else if (statusData.status === 'processing') {
        // Still processing, wait and try again
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;
      } else {
        throw new Error(`Unknown status: ${statusData.status}`);
      }
    } catch (error) {
      if (attempts >= maxAttempts - 1) {
        console.error('❌ Request timed out after 10 minutes');
        throw new Error('Request timed out');
      }

      console.log(`Error checking status: ${error.message}, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }
  }

  throw new Error('Request timed out after maximum attempts');
});
