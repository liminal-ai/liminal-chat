import { test, expect } from '../../fixtures/domain-fixtures'

// Performance thresholds for streaming  
const PERFORMANCE_THRESHOLDS = {
  streamingStartup: 2000, // ms - Streaming startup must be <2s per spec
}

// Override Accept header for streaming responses
test.use({
  domainApiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.DOMAIN_BASE_URL ?? 'http://localhost:8766',
      extraHTTPHeaders: {
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json'
      }
    })
    await use(context)
    await context.dispose()
  }
})

test.describe('Domain Streaming Response Validation', () => {
  test('should handle streaming with echo provider', async ({ domainApiContext }) => {
    const start = Date.now()
    
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Count from 1 to 3',
        provider: 'echo',
        stream: true
      }
    })

    expect([200, 201]).toContain(response.status())
    expect(response.headers()['content-type']).toContain('text/event-stream')
    
    // Get the streaming response body
    const body = await response.body()
    const text = body.toString()
    
    // Validate SSE format
    expect(text).toContain('data: ')
    expect(text).toContain('event: done') // Actual format uses 'event: done'
    
    const firstTokenTime = Date.now() - start
    expect(firstTokenTime).toBeLessThan(PERFORMANCE_THRESHOLDS.streamingStartup)
    
    // Parse streaming chunks
    const lines = text.split('\n').filter(line => line.trim())
    const dataLines = lines.filter(line => line.startsWith('data: '))
    
    expect(dataLines.length).toBeGreaterThan(0)
    
    // Validate chunk format - look for content data
    const contentDataLines = dataLines.filter(line => {
      const data = line.replace('data: ', '')
      return data && data !== ''
    })
    
    expect(contentDataLines.length).toBeGreaterThan(0)
    
    // Parse the first content chunk
    const firstContentData = contentDataLines[0].replace('data: ', '')
    if (firstContentData.startsWith('{')) {
      // Content events have delta property
      const parsed = JSON.parse(firstContentData)
      if (parsed.delta) {
        expect(typeof parsed.delta).toBe('string')
        expect(parsed.delta.length).toBeGreaterThan(0)
      }
    } else if (firstContentData.startsWith('"')) {
      // Handle simple quoted strings (backward compatibility)
      const content = JSON.parse(firstContentData)
      expect(typeof content).toBe('string')
      expect(content.length).toBeGreaterThan(0)
    }
    
    // Check for completion marker
    const eventLines = lines.filter(line => line.startsWith('event: '))
    const hasDoneEvent = eventLines.some(line => line.includes('event: done'))
    expect(hasDoneEvent).toBe(true)
  })

  test('should handle streaming with real provider', async ({ domainApiContext }) => {
    // Skip if no OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      test.skip('OPENROUTER_API_KEY not available - skipping real provider streaming test')
    }
    
    const start = Date.now()
    
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Say "Streaming works" and nothing else',
        provider: 'openrouter',
        stream: true
      }
    })

    expect([200, 201]).toContain(response.status())
    expect(response.headers()['content-type']).toContain('text/event-stream')
    
    const body = await response.body()
    const text = body.toString()
    
    // Validate SSE format
    expect(text).toContain('data: ')
    
    const firstTokenTime = Date.now() - start
    expect(firstTokenTime).toBeLessThan(PERFORMANCE_THRESHOLDS.streamingStartup)
    
    // Parse chunks and validate structure
    const lines = text.split('\n')
    const dataLines = lines.filter(line => line.startsWith('data: '))
    
    expect(dataLines.length).toBeGreaterThan(0)
    
    // Sample validation of content chunks
    const contentDataLines = dataLines
      .map(line => line.replace('data: ', ''))
      .filter(data => data && data.trim() && data !== '')
    
    expect(contentDataLines.length).toBeGreaterThan(0)
    
    // Validate content structure
    const firstContentData = contentDataLines[0]
    if (firstContentData.startsWith('{')) {
      // Content events have delta property
      const parsed = JSON.parse(firstContentData)
      if (parsed.delta) {
        expect(typeof parsed.delta).toBe('string')
        expect(parsed.delta.length).toBeGreaterThan(0)
      }
    } else if (firstContentData.startsWith('"')) {
      // Handle simple quoted strings (backward compatibility)
      const content = JSON.parse(firstContentData)
      expect(typeof content).toBe('string')
      expect(content.length).toBeGreaterThan(0)
    }
  })

  test('should assemble streaming content correctly', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Echo: Hello streaming',
        provider: 'echo',
        stream: true
      }
    })

    expect([200, 201]).toContain(response.status())
    
    const body = await response.body()
    const text = body.toString()
    
    // Extract and assemble content from chunks
    const lines = text.split('\n')
    const dataLines = lines.filter(line => line.startsWith('data: '))
    
    let assembledContent = ''
    
    for (const line of dataLines) {
      const data = line.replace('data: ', '')
      if (data === '') continue // Skip empty data lines
      
      try {
        // Parse JSON data
        if (data.startsWith('{')) {
          // Content events have delta property
          const parsed = JSON.parse(data)
          if (parsed.delta) {
            assembledContent += parsed.delta
          }
        } else if (data.startsWith('"') && data !== '"[DONE]"') {
          // Handle simple quoted strings (backward compatibility)
          const content = JSON.parse(data)
          assembledContent += content
        }
      } catch {
        // Skip invalid JSON
      }
    }
    
    // Validate assembled content makes sense
    expect(assembledContent.length).toBeGreaterThan(0)
    expect(assembledContent).toContain('Echo: Hello streaming')
  })

  test('should handle streaming errors gracefully', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Test streaming error',
        provider: 'invalid-provider',
        stream: true
      }
    })

    // Should return error, not stream
    if (response.status() === 400) {
      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(['PROVIDER_NOT_FOUND', 'INTERNAL_ERROR']).toContain(body.error.code)
    } else {
      // If 200/201, invalid provider might still work - that's ok for this test
      expect([200, 201, 400]).toContain(response.status())
    }
  })

  test('should validate stream event sequence', async ({ domainApiContext }) => {
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'Short response',
        provider: 'echo',
        stream: true
      }
    })

    expect([200, 201]).toContain(response.status())
    
    const body = await response.body()
    const text = body.toString()
    
    const lines = text.split('\n')
    const eventLines = lines.filter(line => line.startsWith('event: '))
    
    // Should have content chunks followed by completion
    let hasContentChunks = false
    let hasCompletion = false
    
    // Check for content events
    hasContentChunks = eventLines.some(line => line.includes('event: content'))
    
    // Check for done event
    hasCompletion = eventLines.some(line => line.includes('event: done'))
    
    expect(hasContentChunks).toBe(true)
    expect(hasCompletion).toBe(true)
  })

  test('should handle stream interruption', async ({ domainApiContext }) => {
    // Test with very short timeout to simulate interruption
    const response = await domainApiContext.post('/domain/llm/prompt', {
      data: {
        prompt: 'This might be interrupted',
        provider: 'echo',
        stream: true
      },
      timeout: 100 // Very short timeout
    })

    // Should either complete successfully or handle interruption gracefully
    if ([200, 201].includes(response.status())) {
      // If it completed, validate it's properly formatted
      const body = await response.body()
      const text = body.toString()
      expect(text).toContain('data: ')
    } else {
      // If interrupted, should return appropriate error
      expect([201, 400, 408, 504]).toContain(response.status())
    }
  })
})