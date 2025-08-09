import { ConvexProvider } from 'convex/react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthStatus } from './components/auth/AuthStatus';
import { HealthCheck } from './components/health/HealthCheck';
import { ConvexQueryTest } from './components/health/ConvexQueryTest';
import RoundtableDemo from './pages/roundtable-demo';
import RoundtableDemo2 from './pages/roundtable-demo-2';
import RoundtableDemo3 from './pages/roundtable-demo-3';
import RoundtableDemo4 from './pages/roundtable-demo-4';
import RoundtableDemoPro from './pages/roundtable-demo-pro';
import RoundtableDemoStudio from './pages/roundtable-demo-studio';
import RoundtableDemoStudioChat from './pages/roundtable-demo-studio-chat';
import { convex } from './lib/convex';

function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Liminal Chat</h1>
      <p>✅ Vite + React is running on port 5173</p>
      <p>✅ Convex client connected to: {import.meta.env.VITE_CONVEX_URL}</p>

      <div style={{ margin: '2rem 0', display: 'flex', gap: '1rem' }}>
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
          🎭 Roundtable Demo v1
        </Link>
        <Link
          to="/roundtable-demo-2"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          🎯 Roundtable Demo v2
        </Link>
        <Link
          to="/roundtable-demo-3"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f59e0b',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          📊 Roundtable Demo v3 (Timeline)
        </Link>
        <Link
          to="/roundtable-demo-4"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          💬 Roundtable Demo v4 (Mockup)
        </Link>
        <Link
          to="/roundtable-demo-pro"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0ea5e9',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          🧭 Roundtable Pro (Swim-lane)
        </Link>
        <Link
          to="/roundtable-demo-studio"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0ea5e9',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          🎨 Roundtable Studio (New)
        </Link>
        <Link
          to="/roundtable-demo-studio-chat"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#22c55e',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          💬 Studio Group Chat (New)
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
            <Route path="/roundtable-demo-2" element={<RoundtableDemo2 />} />
            <Route path="/roundtable-demo-3" element={<RoundtableDemo3 />} />
            <Route path="/roundtable-demo-4" element={<RoundtableDemo4 />} />
            <Route path="/roundtable-demo-pro" element={<RoundtableDemoPro />} />
            <Route path="/roundtable-demo-studio" element={<RoundtableDemoStudio />} />
            <Route path="/roundtable-demo-studio-chat" element={<RoundtableDemoStudioChat />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConvexProvider>
  );
}
