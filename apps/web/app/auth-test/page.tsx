'use client';

import { useState } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
// @ts-expect-error - Monorepo import
import { api } from '../../../liminal-api/convex/_generated/api';

/**
 * Displays the current Convex authentication status and user details.
 *
 * Shows a loading message while the authentication status is being fetched. Once loaded, indicates whether the user is authenticated with Convex and, if so, displays user ID, email, and name.
 */
function ConvexAuthTestInline() {
  const authTest = useQuery(api.users.testAuth);
  
  if (authTest === undefined) {
    return <div>Loading Convex auth status...</div>;
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
            </>
          )}
        </div>
      ) : (
        <p style={{ color: '#dc2626' }}>❌ Not authenticated with Convex</p>
      )}
    </div>
  );
}

/**
 * Renders an authentication test page that allows users to sign in or sign up, view their authentication details, verify Convex backend authentication, and generate a test JWT token for use in integration tests.
 *
 * The page conditionally displays sign-in/sign-up options or authenticated user information based on the user's authentication state. Authenticated users can generate a test token from a Clerk JWT template and copy it for use in testing environments.
 */
export default function AuthTestPage() {
  const { isLoaded, userId, getToken } = useAuth();
  const { user } = useUser();
  const [token, setToken] = useState<string>('');
  const [isLoadingToken, setIsLoadingToken] = useState(false);

  const generateTestToken = async () => {
    if (!isLoaded || !userId) {
      alert('Please sign in first');
      return;
    }

    setIsLoadingToken(true);
    try {
      const token = await getToken({ template: 'testing-template' });
      if (token) {
        setToken(`Bearer ${token}`);
      } else {
        alert('Failed to generate token. Make sure the testing-template exists in Clerk.');
      }
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Error generating token. Check console for details.');
    } finally {
      setIsLoadingToken(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copied to clipboard!');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Liminal Chat - Authentication Test</h1>
      
      <SignedOut>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '30px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px' }}>Sign In or Sign Up</h2>
          <p style={{ marginBottom: '20px' }}>Choose how you&apos;d like to authenticate:</p>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <SignInButton mode="modal">
              <button style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Sign In
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#00a86b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Sign Up
              </button>
            </SignUpButton>
          </div>
          
          <p style={{ fontSize: '14px', color: '#666' }}>
            OAuth providers (Google, GitHub, etc.) will be available in the sign-in/up modal.
          </p>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div>
              <h2>Welcome, {user?.firstName || 'User'}!</h2>
              <p style={{ color: '#666' }}>
                Email: {user?.primaryEmailAddress?.emailAddress}
              </p>
              <p style={{ fontSize: '14px', color: '#888' }}>
                User ID: {userId}
              </p>
            </div>
            <UserButton afterSignOutUrl="/auth-test" />
          </div>
        </div>

        <ConvexAuthTestInline />

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '30px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Generate Test Token</h3>
          <button
            onClick={generateTestToken}
            disabled={isLoadingToken}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoadingToken ? 'not-allowed' : 'pointer',
              opacity: isLoadingToken ? 0.7 : 1
            }}
          >
            {isLoadingToken ? 'Generating...' : 'Generate Token from JWT Template'}
          </button>
          
          {token && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Generated Token:</p>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all',
                marginBottom: '10px'
              }}>
                {token}
              </div>
              <button
                onClick={copyToken}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Copy Token
              </button>
              
              <div style={{ 
                marginTop: '20px', 
                backgroundColor: '#e0f2fe', 
                padding: '15px', 
                borderRadius: '6px' 
              }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>For use in tests:</p>
                <code style={{ 
                  fontSize: '12px', 
                  backgroundColor: '#cbd5e1', 
                  padding: '8px', 
                  borderRadius: '4px',
                  display: 'block',
                  marginTop: '5px'
                }}>
                  export CLERK_TEST_TOKEN=&quot;{token}&quot;
                </code>
              </div>
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  );
}