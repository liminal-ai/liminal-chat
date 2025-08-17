import { useQuery } from 'convex/react';
import { api } from '@liminal/api/convex/_generated/api';

export function HealthCheck() {
  // Test authenticated Convex connection with a simple query
  const conversations = useQuery(api.db.conversations.list, {
    archived: false,
    paginationOpts: { numItems: 1 },
  });

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginTop: '1rem',
      }}
    >
      <h3>🔬 Authenticated Health Check</h3>
      <p>Testing authenticated connection to Convex backend</p>

      <div style={{ marginTop: '1rem' }}>
        <strong>Convex Query Status:</strong>
        {conversations === undefined ? (
          <div style={{ color: '#f59e0b' }}>🔄 Loading authenticated query...</div>
        ) : (
          <div style={{ color: '#10b981' }}>
            ✅ Authenticated connection successful!
            <div
              style={{
                fontSize: '0.875rem',
                marginTop: '0.5rem',
                color: '#6b7280',
              }}
            >
              Query returned {conversations.page.length} conversation(s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
