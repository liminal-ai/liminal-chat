import { ConvexReactClient } from 'convex/react';

// Try window override → Vercel env → fallback to staging Convex URL
const convexUrl =
  (typeof window !== 'undefined' && (window as any).__CONVEX_URL) ||
  import.meta.env.VITE_CONVEX_URL ||
  'https://peaceful-cassowary-494.convex.cloud';

export const convex = new ConvexReactClient(convexUrl);
