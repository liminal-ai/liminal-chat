import { useQuery } from 'convex/react';
let api: any = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  api = require('@liminal/api/convex/_generated/api');
} catch {}

export function ConvexQueryTest() {
  // Test real-time subscription with authenticated query
  const conversations = useQuery((api as any)?.api?.db?.conversations?.list as any, {
    archived: false,
    paginationOpts: { numItems: 5 },
  });

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
      <h3>⚡ Real-time Convex Query Test</h3>
      <p>Testing authenticated Convex subscriptions</p>

      <div style={{ marginTop: '1rem' }}>
        <strong>Conversations Query Status:</strong>
        {conversations === undefined ? (
          <div style={{ color: '#f59e0b' }}>🔄 Loading...</div>
        ) : (
          <div style={{ color: '#10b981' }}>
            ✅ Loaded {(conversations as any)?.page?.length ?? 0} conversations
            <pre
              style={{
                backgroundColor: '#f1f5f9',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                maxHeight: '200px',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(conversations, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
