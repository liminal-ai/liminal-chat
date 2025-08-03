import { ConvexProvider } from 'convex/react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthStatus } from './components/auth/AuthStatus';
import { HealthCheck } from './components/health/HealthCheck';
import { ConvexQueryTest } from './components/health/ConvexQueryTest';
import RoundtableDemo from './pages/roundtable-demo';
import { convex } from './lib/convex';

function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Liminal Chat</h1>
      <p>✅ Vite + React is running on port 5173</p>
      <p>✅ Convex client connected to: {import.meta.env.VITE_CONVEX_URL}</p>

      <div style={{ margin: '2rem 0' }}>
        <Link
          to="/roundtable-demo"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          🎭 Open Roundtable Demo
        </Link>
      </div>

      <AuthStatus />
      <HealthCheck />
      <ConvexQueryTest />
    </div>
  );
}

export function App() {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/roundtable-demo" element={<RoundtableDemo />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConvexProvider>
  );
}
