# Feature 010: Service Authentication

## Overview
Implement secure service-to-service authentication between Edge and Domain tiers using JWT tokens, completing the authentication architecture and enabling production deployment.

## Goals
- Secure Edge→Domain API communication with JWT tokens
- API key management for external integrations
- Request authorization and rate limiting
- Security headers and production hardening
- Complete the authentication architecture from decisions.md

## Architecture Approach
Based on [Architecture Decisions](../../../architecture/decisions.md) section 10:
- **Service Tokens**: JWT signed by Edge, verified by Domain
- **Key Management**: Separate keys for Edge signing and Domain verification
- **User Context**: Forward user ID from Edge auth to Domain
- **API Keys**: Support for programmatic access (CLI, integrations)

## Stories

### Story 1: JWT Service Token Implementation
**Goal**: Implement JWT-based service authentication between Edge and Domain  
**Scope**:
- JWT signing in Edge using private key
- JWT verification in Domain using public key
- Service token payload with user context
- Token expiration and rotation

**Effort**: 2-3 days

### Story 2: API Key Management System
**Goal**: Implement API key generation and management for programmatic access  
**Scope**:
- API key generation and storage
- API key validation middleware
- Key scoping and permissions
- CLI integration with API keys

**Effort**: 2-3 days

### Story 3: Security Headers & Hardening
**Goal**: Production security hardening with proper headers and policies  
**Scope**:
- Security headers (HSTS, CSP, X-Frame-Options)
- CORS configuration for frontend
- Rate limiting and request throttling
- Input validation and sanitization

**Effort**: 1-2 days

### Story 4: Production Security Audit
**Goal**: Comprehensive security review and penetration testing  
**Scope**:
- Security vulnerability scanning
- Authentication flow testing
- Authorization bypass testing
- Production deployment security checklist

**Effort**: 2-3 days

## Technical Implementation

### Service-to-Service JWT
```typescript
// Edge: Create service token
import { SignJWT } from 'jose';

async function createServiceToken(user: User): Promise<string> {
  const payload = {
    sub: 'edge-service',
    aud: 'domain-service',
    userId: user.id,
    email: user.email,
    scopes: ['read:conversations', 'write:messages', 'manage:agents'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (5 * 60) // 5 minutes
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .sign(EDGE_PRIVATE_KEY);

  return token;
}

// Domain: Verify service token
import { jwtVerify } from 'jose';

async function verifyServiceToken(token: string): Promise<ServiceTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, EDGE_PUBLIC_KEY, {
      issuer: 'edge-service',
      audience: 'domain-service'
    });

    return payload as ServiceTokenPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid service token');
  }
}
```

### API Key Management
```typescript
interface APIKey {
  id: string;
  userId: string;
  name: string;           // "CLI Access", "Integration Bot"
  keyHash: string;        // bcrypt hash of actual key
  scopes: string[];       // ["read:conversations", "write:messages"]
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

// API Key generation
async function generateAPIKey(userId: string, name: string, scopes: string[]): Promise<{apiKey: APIKey, rawKey: string}> {
  const rawKey = `lt_sk_${generateSecureRandomString(32)}`;
  const keyHash = await bcrypt.hash(rawKey, 12);
  
  const apiKey: APIKey = {
    id: generateId(),
    userId,
    name,
    keyHash,
    scopes,
    createdAt: new Date()
  };
  
  await saveAPIKey(apiKey);
  return { apiKey, rawKey };
}

// API Key validation middleware
async function validateAPIKey(keyString: string): Promise<APIKey> {
  if (!keyString.startsWith('lt_sk_')) {
    throw new UnauthorizedError('Invalid API key format');
  }
  
  const apiKeys = await loadAPIKeys();
  for (const apiKey of apiKeys) {
    if (await bcrypt.compare(keyString, apiKey.keyHash)) {
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        throw new UnauthorizedError('API key expired');
      }
      
      // Update last used
      await updateAPIKeyLastUsed(apiKey.id);
      return apiKey;
    }
  }
  
  throw new UnauthorizedError('Invalid API key');
}
```

### Edge Authentication Middleware
```typescript
// Unified auth middleware supporting both Clerk and API keys
async function authenticateRequest(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new UnauthorizedError('Authorization header required');
  }
  
  if (authHeader.startsWith('Bearer sk_')) {
    // Clerk user token
    const user = await validateClerkToken(authHeader.replace('Bearer ', ''));
    return { type: 'user', user };
  }
  
  if (authHeader.startsWith('Bearer lt_sk_')) {
    // API key
    const apiKey = await validateAPIKey(authHeader.replace('Bearer ', ''));
    const user = await getUserById(apiKey.userId);
    return { type: 'apikey', user, apiKey };
  }
  
  throw new UnauthorizedError('Invalid authorization format');
}

// Edge to Domain request with service token
async function callDomain(endpoint: string, authContext: AuthContext, data?: any): Promise<Response> {
  const serviceToken = await createServiceToken(authContext.user);
  
  return fetch(`${DOMAIN_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceToken}`,
      'X-User-ID': authContext.user.id,
      'X-Auth-Type': authContext.type,
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  });
}
```

### Security Headers Configuration
```typescript
// Edge security headers
function addSecurityHeaders(response: Response): Response {
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP for frontend
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://clerk.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https://api.clerk.com https://clerk.com wss:;"
  );
  
  return response;
}

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://liminal-chat.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With']
};
```

### Rate Limiting
```typescript
// Simple rate limiting implementation
class RateLimiter {
  private requests = new Map<string, number[]>();
  
  isAllowed(identifier: string, windowMs: number = 60000, maxRequests: number = 100): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
}

// Rate limiting middleware
async function rateLimitMiddleware(req: Request, authContext: AuthContext): Promise<void> {
  const identifier = authContext.type === 'apikey' 
    ? `apikey:${authContext.apiKey.id}`
    : `user:${authContext.user.id}`;
    
  const limits = authContext.type === 'apikey' 
    ? { windowMs: 60000, maxRequests: 1000 } // Higher limits for API keys
    : { windowMs: 60000, maxRequests: 100 };  // User limits
    
  if (!rateLimiter.isAllowed(identifier, limits.windowMs, limits.maxRequests)) {
    throw new TooManyRequestsError('Rate limit exceeded');
  }
}
```

## CLI Integration

### API Key Setup
```bash
# Generate API key for CLI
liminal auth generate-key --name "CLI Access" --scopes "read:conversations,write:messages"

# Configure CLI with API key
liminal config set api-key lt_sk_abc123...

# Test API key
liminal auth verify
```

### CLI Authentication Flow
```typescript
// CLI uses API key instead of user tokens
class EdgeClient {
  constructor(private apiKey: string) {}
  
  private async makeRequest(endpoint: string, options?: RequestInit): Promise<Response> {
    return fetch(`${EDGE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }
}
```

## Security Considerations

### Key Management
- **Private Keys**: Secure storage with proper file permissions
- **Key Rotation**: Regular rotation schedule for service keys
- **API Key Storage**: Hashed storage, never store raw keys
- **Environment Variables**: Secure handling in production

### Token Security
- **Short Expiration**: Service tokens expire in 5 minutes
- **Scope Limitation**: Minimal required scopes for each operation
- **Audience Validation**: Strict audience checking in Domain
- **Replay Protection**: Include timestamp and nonce in tokens

### Production Hardening
- **Input Validation**: Sanitize all inputs at Edge tier
- **Error Handling**: No sensitive information in error responses
- **Audit Logging**: Log all authentication attempts and failures
- **Monitoring**: Alert on unusual authentication patterns

## Testing Strategy

### Unit Tests
- JWT signing and verification
- API key generation and validation
- Rate limiting logic
- Security header application

### Integration Tests
- Complete Edge→Domain authentication flow
- API key authentication with CLI
- Rate limiting enforcement
- CORS and security header validation

### Security Tests
- JWT manipulation and validation bypass attempts
- API key brute force protection
- Rate limiting bypass attempts
- SQL injection and XSS prevention

## Dependencies
- **Requires**: Feature 009 (User Authentication) complete
- **Requires**: Production deployment environment
- **Completes**: Full authentication architecture
- **External**: SSL certificates for production HTTPS

## Success Criteria
- [ ] Edge→Domain communication is securely authenticated
- [ ] API keys work for CLI and programmatic access
- [ ] Rate limiting prevents abuse
- [ ] Security headers protect against common attacks
- [ ] No authentication bypass vulnerabilities found
- [ ] Performance impact of auth is minimal (<10ms overhead)
- [ ] Production security audit passes
- [ ] CLI integration works seamlessly with API keys