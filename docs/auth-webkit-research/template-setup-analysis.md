# WorkOS B2B Starter Template - Setup Analysis

## Template Overview

**Repository**: https://github.com/workos/next-b2b-starter-kit  
**Demo**: https://next-b2b-starter-kit.vercel.app/  
**Stack**: Next.js + AuthKit + Convex + Stripe + Radix UI

## Required Services

### Prerequisites
1. **Convex Account** - Database and backend functions
2. **Stripe Account** - Payment processing and billing  
3. **WorkOS Account** - Authentication and user management

## Setup Process (No Customization)

### Step 1: Clone and Install
```bash
cd workos-pivot-poc
git clone https://github.com/workos/next-b2b-starter-kit.git template-vanilla
cd template-vanilla
pnpm install
```

### Step 2: Run Setup Script
```bash
pnpm run setup
```

The setup script performs these operations:

#### 2.1 Stripe Configuration
- **Input Required**: Stripe Test Secret Key (`sk_test_...`)
- **Location**: https://dashboard.stripe.com/test/apikeys
- **Action**: Creates test products and prices:
  - Basic: $5/month
  - Standard: $10/month  
  - Enterprise: $100/month (with audit logs feature)

#### 2.2 WorkOS Configuration
- **Input Required**: 
  - WorkOS Test API Key (`sk_test_...`)
  - WorkOS Client ID
- **Location**: https://dashboard.workos.com/get-started
- **Actions**:
  - Creates audit log schemas for login/logout events
  - Prompts to set redirect URI: `http://localhost:3000/callback`
  - Prompts to create "Admin" role in WorkOS dashboard

#### 2.3 Environment Variables
Creates `.env.local` with:
```bash
STRIPE_API_KEY=sk_test_...
WORKOS_API_KEY=sk_test_...  
WORKOS_CLIENT_ID=client_...
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
WORKOS_COOKIE_PASSWORD=<generated-64-char-hex>
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### 2.4 Convex Setup
- **Input Required**: Convex project name
- **Prerequisites**: Must run `npx convex login` in separate terminal first
- **Action**: Creates new Convex project and deploys schema
- **Adds to .env.local**: `NEXT_PUBLIC_CONVEX_URL`

#### 2.5 Webhook Configuration
- **Stripe Webhook**: Automatically created for `checkout.session.completed`
- **WorkOS Webhook**: Manual setup required in WorkOS dashboard
  - Events: `user.created`, `user.updated`, `user.deleted`, `organization.created`, `organization.deleted`, `organization.updated`
  - URL: `<convex-url>/workos-webhook`

### Step 3: Start Development
```bash
pnpm run dev
```

Runs both:
- `next dev` (frontend on :3000)
- `npx convex dev` (backend functions)

## Schema Analysis

### Simple B2B Foundation
```typescript
// Current template schema
users: defineTable({
  email: v.string(),
  workos_id: v.string(),
})

organizations: defineTable({
  workos_id: v.string(),
  name: v.string(),
})
```

**Note**: Very minimal schema - just user/org mapping from WorkOS

## Application Flow

### User Journey
1. **Landing Page** (`/`) - Marketing splash
2. **Pricing Page** (`/pricing`) - Plan selection
3. **Sign Up** - WorkOS AuthKit flow
4. **Role-Based Redirect**:
   - **Admin users** → Dashboard (`/dashboard`)
   - **Regular users** → Product page (`/product`)

### Dashboard Features (Admin Only)
- User management (CRUD)
- Organization settings
- Billing configuration  
- Audit logs (Enterprise plan only)
- SSO configuration

### Authentication Features
- **OAuth Providers**: Google, Microsoft, GitHub, etc.
- **SSO/SAML**: Enterprise authentication
- **Role-Based Access Control**: Admin vs user roles
- **Audit Logging**: User actions tracked
- **Team Management**: Organization-based access

## Dependencies Analysis

### Core Dependencies
```json
{
  "@workos-inc/authkit-nextjs": "^0.16.1",    // Auth integration
  "@workos-inc/node": "^7.33.0",              // Server-side WorkOS
  "@workos-inc/widgets": "1.0.0",             // UI components
  "convex": "^1.15.0",                        // Database/backend
  "stripe": "^16.12.0",                       // Payments
  "@radix-ui/themes": "^3.1.3",               // UI framework
  "next": "15.2.3"                            // Frontend framework
}
```

### Version Compatibility
- **Convex**: 1.15.0 (vs our 1.25.2 - significant gap)
- **Next.js**: 15.2.3 (modern)
- **React**: 18.3.1 (current)
- **TypeScript**: 5.x (current)

## Time Estimate for No-Customization Setup

### Prerequisites Setup (30-45 minutes)
- Create WorkOS account and configure (15 min)
- Create Stripe account and get keys (10 min)  
- Create Convex account and login (5 min)
- Manual WorkOS dashboard configuration (15 min)

### Automated Setup (10-15 minutes)
- Clone and install dependencies (5 min)
- Run setup script and follow prompts (10 min)

### Manual Configuration (15-20 minutes)
- WorkOS redirect URI setup
- WorkOS role creation
- WorkOS webhook configuration

**Total Time**: 55-80 minutes for complete vanilla setup

## Testing Strategy

### Test Users
- **Admin User**: Create in WorkOS with "Admin" role
- **Regular User**: Create in WorkOS without "Admin" role

### Test Stripe Flow
- Card: 4242 4242 4242 4242
- CVC: Any 3 digits
- Expiration: Any future date
- ZIP: Any 5 digits

### Validation Checklist
- [ ] Landing page loads
- [ ] Pricing page shows plans
- [ ] Sign up flow works
- [ ] Admin redirected to dashboard
- [ ] Regular user redirected to product page
- [ ] Billing flow completes
- [ ] Audit logs appear (Enterprise plan)

## Key Insights for Integration

### What We Can Keep Unchanged
- **Authentication flow** - WorkOS AuthKit patterns
- **UI components** - Radix UI themes
- **Billing integration** - Stripe patterns
- **Webhook handling** - WorkOS/Stripe event processing

### What Needs Our Custom Integration
- **Database schema** - Add our conversation/message tables
- **API endpoints** - Add our AI provider integrations
- **Business logic** - Add our chat functionality
- **Environment variables** - Add our 6 AI provider keys

### Migration Complexity Assessment
- **Low complexity**: UI patterns, auth flow, billing
- **Medium complexity**: Schema extension, webhook integration
- **High complexity**: Convex version reconciliation, AI feature integration

## Next Steps

1. **Set up vanilla template** to understand baseline functionality
2. **Document exact environment requirements** for our use case
3. **Test authentication flow** to understand WorkOS integration
4. **Plan schema merge strategy** for our AI features
5. **Assess Convex version compatibility** issues