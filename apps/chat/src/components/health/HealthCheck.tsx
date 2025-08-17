import { useQuery } from 'convex/react';
// Avoid hard build-time dependency on @liminal/api codegen; load at runtime if present
let api: any = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  api = require('@liminal/api/convex/_generated/api');
} catch {}

export function HealthCheck() {
  // Test authenticated Convex connection with a simple query
  const conversations = useQuery((api as any)?.api?.db?.conversations?.list as any, {
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
              Query returned {(conversations as any)?.page?.length ?? 0} conversation(s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
