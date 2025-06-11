export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateRandomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length)
}

export function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = async () => {
      try {
        const result = await condition()
        if (result) {
          resolve()
          return
        }
      } catch (error) {
        // Continue checking
      }
      
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Condition not met within ${timeoutMs}ms`))
        return
      }
      
      setTimeout(check, intervalMs)
    }
    
    check()
  })
}

export function parseStreamedResponse(streamData: string): string[] {
  return streamData
    .split('\n')
    .filter(line => line.startsWith('data: '))
    .map(line => line.substring(6))
    .filter(data => data !== '[DONE]')
    .map(data => {
      try {
        return JSON.parse(data)
      } catch {
        return data
      }
    })
} 