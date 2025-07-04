# setup next front end

# 1. Create Next.js project with TypeScript, Tailwind, ESLint, App Router, src/ directory
npx create-next-app@latest liminal-frontend --typescript --tailwind --eslint --app --src-dir
cd liminal-frontend

# 2. Pin exact versions for stability (downgrades Tailwind from v4 to v3)
npm install next@15.3.4 react@18.3.1 react-dom@18.3.1
npm install tailwindcss@3.4.16 @tailwindcss/typography@0.5.15

# 3. Install Convex client library to connect to your existing backend
npm install convex@1.25.2

# 4. Install UI utilities and icons for shadcn/ui
npm install clsx@2.1.1 tailwind-merge@2.5.4 lucide-react@0.456.0

# 5. Initialize shadcn/ui (choose: TypeScript=Yes, Tailwind=Yes, src/=Yes, App Router=Yes, @/*=Yes, RSC=No)
npx shadcn@latest init

# 6. Install basic shadcn components
npx shadcn@latest add button card input form dialog

# 7. Create .env.local file with your existing Convex backend URL
echo "NEXT_PUBLIC_CONVEX_URL=https://your-existing-convex-url.convex.cloud" > .env.local

# 8. Create Convex provider component
mkdir -p src/lib
cat > src/lib/convex.tsx << 'EOF'
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
EOF

# 9. Update root layout to include Convex provider
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { ConvexClientProvider } from "@/lib/convex";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liminal Frontend",
  description: "AI-powered collaboration platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
EOF

# 10. Test everything works
npm run dev

# Your frontend is now ready at http://localhost:3000
# Next steps: Replace the URL in .env.local with your actual Convex backend URL
# Then you can use useQuery/useMutation hooks to connect to your existing liminal-api backend


After running this, you'll have:

✅ Next.js 15.3.4 + React 18.3.1 + Tailwind v3
✅ shadcn/ui components ready
✅ Convex client configured to connect to your existing backend
✅ Perfect v0 compatibility for component generation
✅ Clean project structure with TypeScript

Just update the CONVEX_URL in .env.local with your actual backend URL and you're ready to build.