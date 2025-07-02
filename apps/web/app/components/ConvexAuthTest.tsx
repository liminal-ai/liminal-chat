'use client';

import { useQuery } from 'convex/react';
// @ts-expect-error - Monorepo import path
import { api } from '../../../../liminal-api/convex/_generated/api';

export function ConvexAuthTest() {
  const authTest = useQuery(api.users.testAuth);
  
  if (authTest === undefined) {
    return <div>Loading auth status...</div>;
  }
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f9ff', 
      border: '1px solid #0284c7',
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h3 style={{ marginBottom: '10px' }}>Convex Auth Integration Test</h3>
      {authTest.authenticated ? (
        <div>
          <p style={{ color: '#059669' }}>✅ Successfully authenticated with Convex!</p>
          {authTest.user && (
            <>
              <p>User ID: {authTest.user._id}</p>
              <p>Email: {authTest.user.email}</p>
              <p>Name: {authTest.user.name || 'Not set'}</p>
              <p>Token Identifier: {authTest.user.tokenIdentifier}</p>
            </>
          )}
        </div>
      ) : (
        <p style={{ color: '#dc2626' }}>❌ Not authenticated with Convex</p>
      )}
    </div>
  );
}