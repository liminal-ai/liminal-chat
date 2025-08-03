import { useAuth } from '../../lib/auth';

export function AuthStatus() {
  const { isAuthenticated, isLoading, user, error, authMode, login, logout } = useAuth();

  if (isLoading) {
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
        <h3>🔄 Authentication Loading...</h3>
        <p>
          Auth mode: <strong>{authMode}</strong>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          marginTop: '1rem',
        }}
      >
        <h3>❌ Authentication Error</h3>
        <p>
          <strong>Error:</strong> {error}
        </p>
        <p>
          Auth mode: <strong>{authMode}</strong>
        </p>
        {authMode === 'dev' && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            <p>Make sure the local dev service is running:</p>
            <code>cd apps/local-dev-service && npm run dev:start</code>
          </div>
        )}
        <button
          onClick={login}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Retry Login
        </button>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '8px',
          marginTop: '1rem',
        }}
      >
        <h3>✅ Authenticated</h3>
        <p>
          <strong>User:</strong> {user.email}
        </p>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Auth mode:</strong> {authMode}
        </p>
        <button
          onClick={logout}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        marginTop: '1rem',
      }}
    >
      <h3>🔐 Not Authenticated</h3>
      <p>
        Auth mode: <strong>{authMode}</strong>
      </p>
      <button
        onClick={login}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Login
      </button>
    </div>
  );
}
