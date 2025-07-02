'use client';

import { useState } from 'react';

/**
 * Renders a page that allows users to check the health status of a remote service and displays the result.
 *
 * Provides a button to trigger a health check, visual feedback for the current health status, and a link to an authentication test page.
 */
export default function HelloPage() {
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'healthy' | 'error'>('idle');

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const response = await fetch('https://modest-squirrel-498.convex.site/health');
      const data = await response.json();
      if (response.ok && data.status === 'healthy') {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('error');
      }
    } catch (error) {
      console.error('Health check error:', error);
      setHealthStatus('error');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Hello World</h1>
      <p>This is a simple test page.</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={checkHealth}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Check Health
        </button>
        
        {healthStatus === 'checking' && <span>Checking...</span>}
        {healthStatus === 'healthy' && <span style={{ color: 'green', fontSize: '24px' }}>✓</span>}
        {healthStatus === 'error' && <span style={{ color: 'red' }}>✗ Error</span>}
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <a 
          href="/auth-test" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block'
          }}
        >
          Go to Auth Test Page
        </a>
      </div>
    </div>
  );
}