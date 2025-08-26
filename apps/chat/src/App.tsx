import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Authenticated, useConvexAuth } from 'convex/react';
import { useAuth } from './lib/auth';
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
import { RootProviders } from './components/auth/RootProviders';
import { WorkOSAuthStatus } from './components/auth/WorkOSAuthStatus';
import { onReconnectVisible } from './lib/authSync';
import { useEffect, useState } from 'react';
import ChatPage from './pages/ChatPage';

/**
 * Handles the OAuth callback redirect from WorkOS AuthKit.
 * Shows a loading state while auth token is processed, then redirects to home page.
 *
 * @returns Loading component with redirect functionality
 */
function AuthCallback() {
  useEffect(() => {
    // Brief delay to let WorkOS auth settle, then redirect to home page
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h2>Signing you in...</h2>
      <p>Redirecting you back to the dashboard...</p>
      <div
        style={{
          margin: '1rem auto',
          width: '32px',
          height: '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      ></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const MODE = (import.meta.env.VITE_AUTH_MODE || 'dev') as 'dev' | 'workos';

function ModeBanner() {
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        backgroundColor: MODE === 'dev' ? '#e5e7eb' : '#dbeafe',
        color: '#111827',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        fontSize: '0.75rem',
      }}
    >
      Mode: {MODE}
    </div>
  );
}

function ReconnectBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => onReconnectVisible(setVisible), []);
  if (!visible) return null;
  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: '#fff7ed',
        border: '1px solid #fdba74',
        color: '#9a3412',
        borderRadius: 6,
        fontSize: '0.875rem',
      }}
    >
      Reconnecting authentication…
    </div>
  );
}

function HomePage() {
  // Call the correct auth hook **only** for the active mode. This avoids
  // runtime errors such as "Could not find ConvexProviderWithAuth as an ancestor component"
  // when a hook is executed outside its expected provider hierarchy.

  let isLoading: boolean;
  let isAuthenticated: boolean;

  if (MODE === 'workos') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const convexAuth = useConvexAuth();
    isLoading = convexAuth.isLoading;
    isAuthenticated = convexAuth.isAuthenticated;
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const devAuth = useAuth();
    isLoading = devAuth.isLoading;
    isAuthenticated = devAuth.isAuthenticated;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Liminal Chat</h1>
      <ModeBanner />
      <ReconnectBanner />
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

      {MODE === 'dev' ? <AuthStatus /> : <WorkOSAuthStatus />}

      {MODE === 'workos' ? (
        <Authenticated>
          <HealthCheck />
          <ConvexQueryTest />
        </Authenticated>
      ) : isAuthenticated ? (
        <>
          <HealthCheck />
          <ConvexQueryTest />
        </>
      ) : isLoading ? (
        <div style={{ marginTop: '1rem', color: '#f59e0b' }}>🔄 Initializing authentication...</div>
      ) : (
        <div style={{ marginTop: '1rem', color: '#ef4444' }}>
          ❌ Authentication failed. Check AuthStatus above.
        </div>
      )}
    </div>
  );
}

function _AuthGated({ children, ready }: { children: React.ReactNode; ready: boolean }) {
  // In case we later add fade-in or metrics.
  if (!ready) return null;
  return <>{children}</>;
}

export function App() {
  return (
    <RootProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app/chat" replace />} />
          <Route path="/app/chat" element={<ChatPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/callback" element={<AuthCallback />} />
          <Route path="/roundtable-demo" element={<RoundtableDemo />} />
          <Route path="/roundtable-demo-2" element={<RoundtableDemo2 />} />
          <Route path="/roundtable-demo-3" element={<RoundtableDemo3 />} />
          <Route path="/roundtable-demo-4" element={<RoundtableDemo4 />} />
          <Route path="/roundtable-demo-pro" element={<RoundtableDemoPro />} />
          <Route path="/roundtable-demo-studio" element={<RoundtableDemoStudio />} />
          <Route path="/roundtable-demo-studio-chat" element={<RoundtableDemoStudioChat />} />
        </Routes>
      </BrowserRouter>
    </RootProviders>
  );
}
