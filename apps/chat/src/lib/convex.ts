import { ConvexReactClient } from 'convex/react';

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    'Missing VITE_CONVEX_URL environment variable. ' +
      'Add VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud to your .env.local file',
  );
}

export const convex = new ConvexReactClient(convexUrl);
