import { ConvexProvider } from 'convex/react';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthStatus } from './components/auth/AuthStatus';
import { HealthCheck } from './components/health/HealthCheck';
import { ConvexQueryTest } from './components/health/ConvexQueryTest';
import { convex } from './lib/convex';

export function App() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Liminal Chat</h1>
          <p>✅ Vite + React is running on port 5173</p>
          <p>✅ Convex client connected to: {import.meta.env.VITE_CONVEX_URL}</p>
          <AuthStatus />
          <HealthCheck />
          <ConvexQueryTest />
        </div>
      </AuthProvider>
    </ConvexProvider>
  );
}
