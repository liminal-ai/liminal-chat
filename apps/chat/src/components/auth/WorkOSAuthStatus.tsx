import { useAuth } from '@workos-inc/authkit-react';

export function WorkOSAuthStatus() {
  const { user, signIn, signOut } = useAuth();
  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        marginTop: '1rem',
      }}
    >
      <h3>WorkOS Authentication</h3>
      <div style={{ marginTop: '0.5rem' }}>
        <button
          onClick={() => (user ? signOut() : void signIn())}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {user ? 'Sign out' : 'Sign in'}
        </button>
        {user ? <span style={{ marginLeft: '0.5rem' }}>Logged in as {user.email}</span> : null}
      </div>
    </div>
  );
}
