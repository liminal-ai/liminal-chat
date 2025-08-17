# PostHog Integration Plan

## Integration Strategy

PostHog will be added after CI/CD infrastructure is stable to provide immediate analytics for our innovative multi-agent chat interface and roundtable features.

## Why PostHog

- **Developer-first**: Engineering-led culture, transparent pricing, open source
- **All-in-one platform**: Analytics, session replay, feature flags, experiments, surveys
- **Generous free tier**: 1M events/month, 5K recordings, 1M feature flag requests
- **90%+ companies use for free**: Very low financial risk
- **Next.js optimized**: First-class React/Next.js support

## Implementation Steps

### 1. Environment Variables
Add to existing CI/CD environment variable management:

```bash
# Development
VITE_POSTHOG_KEY_DEV=<dev_project_key>
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Staging  
VITE_POSTHOG_KEY_STAGING=<staging_project_key>
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Production
VITE_POSTHOG_KEY_PRODUCTION=<production_project_key>
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

### 2. React Integration
Minimal provider setup in main layout:

```typescript
// apps/web/src/providers/posthog.tsx
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: process.env.VITE_POSTHOG_HOST,
  defaults: '2025-05-24',
}

export function PostHogAnalyticsProvider({ children }) {
  return (
    <PostHogProvider 
      apiKey={process.env.VITE_POSTHOG_KEY} 
      options={options}
    >
      {children}
    </PostHogProvider>
  )
}
```

### 3. Environment-Specific Projects
Create separate PostHog projects for proper isolation:
- `liminal-chat-dev` (development)
- `liminal-chat-staging` (staging)  
- `liminal-chat-production` (production)

### 4. Key Tracking Areas

**Multi-Agent Interactions**:
- Single agent → roundtable transitions
- Agent mention patterns (@alice, @bob)
- Swimlane vs group chat mode usage

**Innovation Features**:
- Thread navigation usage (right panel)
- Folder organization interactions (left panel)
- Artifact materialization from chat
- @mention cross-references

**User Journey Analytics**:
- Conversation creation patterns
- Feature discovery paths
- Error states and recovery

### 5. Session Replay Configuration
Enable for debugging complex UX flows:
- Multi-agent conversation flows
- Thread navigation behavior
- Folder/artifact interactions
- Authentication edge cases

## Integration with Existing Architecture

### CI/CD Pipeline
PostHog environment variables integrate with existing variable management:
- GitHub Secrets for API keys
- Vercel environment-specific configuration
- Convex backend analytics (server-side events)

### Multi-Environment Strategy
Aligns with WorkOS multi-environment pattern:
- Separate projects per environment
- Environment-specific configuration
- Isolated user data

### Progressive Enhancement
Fits "web-first with desktop readiness" architecture:
- Analytics work across web and future desktop
- Component-based tracking transfers to Tauri
- Performance insights for optimization

## Key Benefits for Liminal Chat

1. **Innovation Measurement**: Track how users interact with unique UI patterns (thread navigation, folder organization, multi-agent workflows)

2. **UX Validation**: Session replays show actual user behavior with complex roundtable interactions

3. **Feature Optimization**: Data-driven decisions about agent routing, UI layout, conversation flows

4. **Technical Debugging**: Visual debugging of multi-agent state management and UI transitions

5. **User Journey Insights**: Understand progression from simple chat to advanced roundtable usage

## Risk Mitigation

- **Zero financial risk**: Free tier covers expected usage
- **Minimal complexity**: Simple provider wrapper, auto-capture by default
- **Non-blocking**: Won't interfere with core functionality
- **Reversible**: Easy to remove if not valuable

## Success Metrics

- User engagement with multi-agent features
- Thread navigation effectiveness
- Folder organization adoption
- Conversation complexity growth
- Feature flag effectiveness for UI experiments

This integration provides immediate value for understanding user interaction with our innovative chat interface while maintaining the simplicity and reliability of our CI/CD infrastructure.