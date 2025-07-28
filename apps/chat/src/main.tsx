import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Liminal Chat</h1>
      <p>✅ Vite + React is running on port 5173</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
