# Security Implementation Guide

This document consolidates security patterns and implementation guidelines for Liminal Type Chat. It serves as the primary reference for security-related development and deployment.

## Table of Contents

1. [Security Architecture Overview](#security-architecture-overview)
2. [Authentication Patterns](#authentication-patterns)
3. [Environment Security](#environment-security)
4. [API Security Patterns](#api-security-patterns)
5. [Data Encryption and Storage](#data-encryption-and-storage)
6. [Security Testing Requirements](#security-testing-requirements)
7. [Security Deployment Checklist](#security-deployment-checklist)

## Security Architecture Overview

Liminal Type Chat implements defense-in-depth security with multiple layers:

```
┌─────────────────────────────────────────┐
│         Client Application              │
├─────────────────────────────────────────┤
│    Security Headers & CORS Policy       │
├─────────────────────────────────────────┤
│       Edge API Layer (Public)           │
│   - Rate Limiting                       │
│   - Input Validation                    │
│   - Authentication                      │
├─────────────────────────────────────────┤
│      Domain API Layer (Internal)        │
│   - Business Logic Validation           │
│   - Authorization                       │
├─────────────────────────────────────────┤
│        Data Encryption Layer            │
│   - AES-256-GCM for API Keys           │
│   - Secure Key Management               │
├─────────────────────────────────────────┤
│         SQLite Database                 │
└─────────────────────────────────────────┘
```

### Critical Security Considerations

**Development Bypasses**: The application contains several development bypasses (e.g., `BYPASS_AUTH` environment variable) that could be accidentally enabled in production. These must be strictly controlled through multiple validation layers:

```typescript
// CRITICAL: Add multiple checks to prevent development bypasses in production
export function isAuthBypassAllowed(): boolean {
  // Multiple validation layers to prevent accidental enablement
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.APP_ENV === 'production') return false;
  if (process.env.ENFORCE_PRODUCTION_SECURITY === 'true') return false;
  if (isProductionHostname()) return false;
  
  // Only allow in confirmed development environment
  return process.env.BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development';
}
```

**Edge-Domain Security Boundary**: When implementing cross-tier communication, ensure proper authentication token exchange between Edge and Domain layers. The Domain layer should never trust Edge layer tokens directly.

### Core Security Principles

1. **Local-First Architecture**: All sensitive data stays on the user's machine
2. **Zero Trust Between Layers**: Each layer validates and authorizes requests
3. **Principle of Least Privilege**: Minimal permissions at each layer
4. **Defense in Depth**: Multiple security controls at every level
5. **Secure by Default**: Security features enabled unless explicitly disabled

## Authentication Patterns

**Note**: Authentication was recently removed from the codebase to align with the local-first philosophy. This section documents patterns for future implementation.

### Future Authentication Design

When authentication is re-implemented, it should follow these patterns:

#### Simple Session-Based Auth
```typescript
// Preferred approach for local-first applications
export class SimpleAuthService {
  async createSession(email: string, password: string): Promise<Session> {
    // 1. Validate credentials
    const user = await this.validateUser(email, password);
    
    // 2. Create session with secure random ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // 3. Store session with expiration
    const session = {
      id: sessionId,
      userId: user.id,
      expiresAt: Date.now() + SESSION_DURATION,
      createdAt: Date.now()
    };
    
    await this.sessionStore.create(session);
    return session;
  }
}
```

#### Authentication Middleware Pattern
```typescript
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED' 
    });
  }
  
  const session = await sessionStore.validate(sessionId);
  if (!session) {
    return res.status(401).json({ 
      error: 'Invalid or expired session',
      code: 'SESSION_INVALID' 
    });
  }
  
  req.user = session.user;
  next();
}
```

### Authentication Best Practices

1. **Password Storage**: Use bcrypt with cost factor 12+
2. **Session Management**: HTTPOnly, Secure, SameSite cookies
3. **Token Lifetime**: Short-lived sessions (7 days max)
4. **Rate Limiting**: Aggressive limits on auth endpoints
5. **Audit Logging**: Log all authentication events

## Environment Security

### Environment Detection

The application uses multi-factor environment detection to apply appropriate security controls. This is critical to prevent development security bypasses from being accidentally enabled in production:

```typescript
export class EnvironmentService {
  determineEnvironment(): Environment {
    // Priority order for environment detection
    if (process.env.APP_ENV) return process.env.APP_ENV;
    if (process.env.NODE_ENV === 'production') return 'PRODUCTION';
    if (process.env.ENFORCE_PRODUCTION_SECURITY) return 'PRODUCTION';
    if (this.isProductionHostname()) return 'PRODUCTION';
    
    // Default to local for development safety
    return 'LOCAL';
  }
}
```

### Environment-Specific Security Profiles

| Feature | Local | Development | Staging | Production |
|---------|-------|-------------|---------|------------|
| HTTPS Required | No | No | Yes | Yes |
| Strict CORS | No | No | Yes | Yes |
| Security Headers | Relaxed | Standard | Strict | Strict |
| Rate Limiting | No | Yes | Yes | Yes |
| Debug Info in Errors | Yes | Yes | No | No |
| Mock Services Allowed | Yes | Yes | No | No |

### Secrets Management

#### Secret Scanning Prevention

To prevent accidental commit of API keys and secrets, the project uses **gitleaks** for pre-commit scanning:

```bash
# Install gitleaks (macOS)
brew install gitleaks

# Install gitleaks (Linux/WSL)
wget https://github.com/zricethezav/gitleaks/releases/latest/download/gitleaks-linux-amd64
chmod +x gitleaks-linux-amd64
sudo mv gitleaks-linux-amd64 /usr/local/bin/gitleaks

# Manual scan before committing
gitleaks protect --staged

# Scan entire repository
gitleaks detect
```

**Git Hook Setup** (without Husky):
```bash
# Create pre-commit hook
echo '#!/bin/sh
gitleaks protect --staged --no-banner || exit 1' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Why gitleaks over alternatives:**
- Fast (Go binary, not Node.js)
- Excellent default patterns for API keys
- No npm dependencies or version conflicts
- Can run standalone or as git hook

#### Development Environment
```bash
# Generate development secrets
npm run setup

# This creates .env.local with:
# - Random encryption key
# - Development-safe defaults
# - Clear security warnings
```

#### Production Environment
```bash
# Required environment variables
ENCRYPTION_KEY=<base64-encoded-32-byte-key>
NODE_ENV=production
APP_ENV=production

# Generate production encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Security Controls by Environment

```typescript
// Automatic security enforcement
if (env.isProduction()) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in production
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://api.anthropic.com', 'https://api.openai.com'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
      features: {
        geolocation: ["'none'"],
        microphone: ["'none'"],
        camera: ["'none'"]
      }
    }
  }));
}
```

#### Missing Security Headers Alert

**Critical**: Security headers are specified in documentation but may not be fully implemented. Verify implementation in `app.ts` and add missing headers:

```typescript
// Ensure these headers are set in production
app.use((req, res, next) => {
  if (env.isProduction()) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }
  next();
});
```

## API Security Patterns

### Security Headers

All responses include security headers to prevent common attacks:

```typescript
export const securityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Limit browser features
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  
  // Content Security Policy
  'Content-Security-Policy': generateCSP(environment),
  
  // HTTPS enforcement (production only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};
```

### Input Validation

All API endpoints validate input using JSON schemas:

```typescript
// Schema-based validation
const createConversationSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '^[^<>]*$' // Prevent basic XSS
    },
    metadata: {
      type: 'object',
      additionalProperties: false
    }
  }
};

// Validation middleware
export function validateRequest(schema: object) {
  return (req: Request, res: Response, next: NextFunction) => {
    const valid = ajv.validate(schema, req.body);
    if (!valid) {
      return res.status(400).json({
        error: 'Invalid request',
        code: 'VALIDATION_ERROR',
        details: ajv.errors
      });
    }
    next();
  };
}
```

### Rate Limiting

Progressive rate limiting based on endpoint sensitivity:

```typescript
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  skipSuccessfulRequests: true
});

// LLM endpoint limit (expensive operations)
const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  keyGenerator: (req) => req.user?.id || req.ip
});
```

### CORS Configuration

Environment-aware CORS policy:

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (env.isProduction()) {
      // Strict origin checking in production
      const allowed = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    } else {
      // Relaxed in development
      callback(null, true);
    }
  },
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

## Data Encryption and Storage

### API Key Encryption

All LLM API keys are encrypted using AES-256-GCM with authenticated encryption. However, the current implementation lacks key rotation mechanisms:

#### Encryption Key Rotation

**Critical Gap**: The application currently has no mechanism for encryption key rotation. Implement key versioning and rotation:

```typescript
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  
  async encryptApiKey(apiKey: string): Promise<EncryptedData> {
    // Generate random IV for each encryption
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      this.algorithm, 
      this.encryptionKey, 
      iv
    );
    
    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(apiKey, 'utf8'),
      cipher.final()
    ]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine components for storage
    return {
      encrypted: Buffer.concat([iv, authTag, encrypted]).toString('base64'),
      algorithm: this.algorithm,
      keyDerivation: 'static' // or 'pbkdf2' for password-derived
    };
  }
  
  async decryptApiKey(encryptedData: string): Promise<string> {
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const iv = buffer.subarray(0, 16);
    const authTag = buffer.subarray(16, 32);
    const encrypted = buffer.subarray(32);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      iv
    );
    
    // Set auth tag for verification
    decipher.setAuthTag(authTag);
    
    // Decrypt and verify
    try {
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error('Failed to decrypt: Invalid key or corrupted data');
    }
  }
}

// Key rotation implementation needed
export class EncryptionServiceWithRotation extends EncryptionService {
  private keyVersions: Map<number, Buffer> = new Map();
  private currentVersion: number = 1;
  
  async encryptWithVersion(data: string): Promise<EncryptedDataWithVersion> {
    const encrypted = await this.encryptApiKey(data);
    return {
      ...encrypted,
      keyVersion: this.currentVersion
    };
  }
  
  async decryptWithVersion(encryptedData: EncryptedDataWithVersion): Promise<string> {
    const key = this.keyVersions.get(encryptedData.keyVersion);
    if (!key) {
      throw new Error(`Unknown key version: ${encryptedData.keyVersion}`);
    }
    // Decrypt with appropriate key version
    return this.decryptWithKey(encryptedData.encrypted, key);
  }
  
  async rotateKey(newKey: Buffer): Promise<void> {
    this.currentVersion++;
    this.keyVersions.set(this.currentVersion, newKey);
    this.encryptionKey = newKey;
    
    // Re-encrypt all stored keys with new version
    await this.reencryptStoredKeys();
  }
}
```

### Secure Storage Patterns

```typescript
export class SecureStorage {
  // Never log sensitive data
  async storeApiKey(userId: string, provider: string, apiKey: string): Promise<void> {
    logger.info('Storing API key', { userId, provider }); // No apiKey!
    
    const encrypted = await this.encryption.encryptApiKey(apiKey);
    
    await this.db.run(
      `INSERT INTO api_keys (user_id, provider, encrypted_key, created_at)
       VALUES (?, ?, ?, ?)`,
      [userId, provider, encrypted, Date.now()]
    );
  }
  
  // Clear sensitive data from memory
  async useApiKey(userId: string, provider: string): Promise<void> {
    let apiKey: string | null = null;
    
    try {
      apiKey = await this.retrieveApiKey(userId, provider);
      await this.llmService.makeRequest(apiKey);
    } finally {
      // Overwrite sensitive data
      if (apiKey) {
        apiKey = crypto.randomBytes(apiKey.length).toString();
        apiKey = null;
      }
    }
  }
}
```

### Database Security

1. **Encryption at Rest**: Use SQLCipher for database encryption
2. **Access Control**: File permissions restrict database access
3. **SQL Injection Prevention**: Always use parameterized queries
4. **Backup Security**: Encrypted backups with secure storage

## Security Testing Requirements

### Unit Test Coverage

Security-critical components require enhanced coverage:

| Component | Required Coverage | Focus Areas |
|-----------|------------------|-------------|
| Encryption Service | 100% | Edge cases, error handling |
| Auth Middleware | 95% | All auth scenarios |
| Input Validation | 90% | Malicious inputs |
| Rate Limiting | 85% | Boundary conditions |

### Security Test Examples

```typescript
describe('EncryptionService', () => {
  it('should handle encryption key rotation', async () => {
    const oldKey = generateKey();
    const newKey = generateKey();
    const service = new EncryptionService(oldKey);
    
    // Encrypt with old key
    const encrypted = await service.encryptApiKey('secret-key');
    
    // Rotate to new key
    service.rotateKey(newKey);
    
    // Should still decrypt old data
    const decrypted = await service.decryptApiKey(encrypted);
    expect(decrypted).toBe('secret-key');
  });
  
  it('should detect tampering', async () => {
    const encrypted = await service.encryptApiKey('secret');
    
    // Tamper with encrypted data
    const tampered = Buffer.from(encrypted, 'base64');
    tampered[40] = tampered[40] ^ 0xFF; // Flip bits
    
    // Should throw on tampered data
    await expect(
      service.decryptApiKey(tampered.toString('base64'))
    ).rejects.toThrow('Failed to decrypt');
  });
});
```

### Integration Testing

```typescript
describe('API Security', () => {
  it('should enforce rate limits', async () => {
    const requests = Array(6).fill(null).map(() => 
      request(app).post('/api/v1/auth/login').send({ 
        email: 'test@example.com',
        password: 'wrong' 
      })
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });
  
  it('should set security headers', async () => {
    const response = await request(app).get('/api/v1/health');
    
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['content-security-policy']).toBeDefined();
  });
});
```

### Security Scanning

Regular security scanning requirements:

1. **Dependency Scanning**: `npm audit` must pass
2. **Static Analysis**: ESLint security plugin
3. **Dynamic Testing**: OWASP ZAP for API testing
4. **Penetration Testing**: Annual third-party assessment

## CI/CD Security Integration

### GitHub Actions Security Workflow

Implement continuous security checks in the CI/CD pipeline:

```yaml
name: Security Checks
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      # CodeQL Static Analysis
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
      
      # Dependency Scanning
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      # Secret Scanning
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

### Automated Security Measures

1. **Dependabot Configuration**:
   ```yaml
   # .github/dependabot.yml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
   ```

2. **Branch Protection Rules**:
   - Require security checks to pass
   - Dismiss stale reviews on new commits
   - Require up-to-date branches

3. **Security Alerts**:
   - Enable GitHub security alerts
   - Configure alert notifications
   - Review and remediate within SLA

## Security Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (100% of security tests)
- [ ] No vulnerable dependencies (`npm audit`)
- [ ] Environment variables validated
- [ ] Encryption keys rotated from development
- [ ] Rate limiting configured
- [ ] CORS origins updated
- [ ] Security headers verified
- [ ] Error messages sanitized
- [ ] Logging configured (no sensitive data)
- [ ] **CRITICAL**: Verify `BYPASS_AUTH` cannot be enabled
- [ ] **CRITICAL**: Ensure JWT signing keys are environment-specific
- [ ] **CRITICAL**: Validate all mock services are disabled
- [ ] **CRITICAL**: Check for any development-only code paths

### Deployment Configuration

```bash
# Production environment variables
NODE_ENV=production
APP_ENV=production
ENCRYPTION_KEY=<newly-generated-key>
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
SESSION_TIMEOUT=604800000
LOG_LEVEL=info
```

### Post-Deployment

- [ ] Verify HTTPS is enforced
- [ ] Test security headers in production
- [ ] Confirm rate limiting is active
- [ ] Check error handling (no stack traces)
- [ ] Validate CORS policy
- [ ] Monitor for security events
- [ ] Schedule security review

### Monitoring and Alerts

Set up monitoring for:

1. **Failed Authentication Attempts**: Alert on patterns
2. **Rate Limit Violations**: Track abusive IPs
3. **Encryption Failures**: Immediate investigation
4. **Invalid Input Patterns**: Potential attacks
5. **Unusual API Usage**: Anomaly detection

### Incident Response

1. **Detection**: Automated alerts and monitoring
2. **Assessment**: Determine scope and impact
3. **Containment**: Block malicious IPs/users
4. **Investigation**: Review logs and patterns
5. **Remediation**: Patch vulnerabilities
6. **Documentation**: Record incident details
7. **Review**: Update security measures

## Critical Security Issues and Mitigations

### High Priority Security Gaps

Based on security analysis, the following critical issues require immediate attention:

#### 1. PKCE Session Storage Scalability
**Issue**: Current PKCE implementation uses in-memory storage, which fails in multi-server deployments.
**Impact**: OAuth flows will fail when users are redirected to different servers.
**Mitigation**: Implement database-backed or Redis-backed PKCE storage with TTL functionality.

```typescript
// Replace in-memory storage with persistent solution
interface IPkceStorage {
  storeVerifier(id: string, verifier: string, ttlMs: number): Promise<void>;
  getVerifier(id: string): Promise<string | null>;
  deleteVerifier(id: string): Promise<void>;
  cleanup(): Promise<void>;
}
```

#### 2. JWT Token Security
**Issue**: Same JWT signing key used across all environments.
**Impact**: Compromised development keys could forge production tokens.
**Mitigation**: Implement environment-specific JWT keys with rotation capability.

#### 3. Missing Rate Limiting Implementation
**Issue**: Authentication endpoints lack rate limiting despite being documented.
**Impact**: Vulnerable to brute force attacks and credential stuffing.
**Mitigation**: Implement progressive rate limiting based on endpoint sensitivity.

#### 4. Incomplete Security Headers
**Issue**: Security headers specified in documentation but not fully implemented in code.
**Impact**: Increased vulnerability to XSS, clickjacking, and other attacks.
**Mitigation**: Verify and implement all security headers in app.ts.

#### 5. Development Bypasses in Production Risk
**Issue**: Multiple development bypasses controlled by environment variables.
**Impact**: Accidental enablement in production would create severe vulnerabilities.
**Mitigation**: Implement hardcoded production checks that cannot be overridden.

### Sensitive Data Patterns

Enhance detection of sensitive data beyond current regex patterns:

```typescript
const SENSITIVE_PATTERNS = [
  /sk[-_](?:test|live)[-_][0-9a-zA-Z]{24,}/gi,  // Stripe
  /AIza[0-9A-Za-z\\-_]{35}/gi,                   // Google API
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, // UUIDs
  /ghp_[0-9a-zA-Z]{36}/gi,                       // GitHub Personal Access Tokens
  /ghs_[0-9a-zA-Z]{36}/gi,                       // GitHub Server Tokens
  /sq0[a-z]{3}-[0-9A-Za-z\\-_]{22,43}/gi,       // Square
  /AC[a-z0-9]{32}/gi,                            // Twilio
  /key-[0-9a-zA-Z]{32}/gi,                       // Generic API keys
];
```

## Security Maintenance

### Regular Tasks

- **Weekly**: Review security logs
- **Monthly**: Update dependencies
- **Quarterly**: Security assessment
- **Annually**: Penetration testing
- **As Needed**: Key rotation

### Security Updates

Stay informed about:
- Node.js security updates
- NPM security advisories
- OWASP Top 10 changes
- New attack patterns
- Framework vulnerabilities

### Security Monitoring Requirements

Implement monitoring for these critical events:
1. **Failed Authentication Attempts**: Alert on patterns (>5 failures in 10 minutes)
2. **Rate Limit Violations**: Track and block abusive IPs
3. **Encryption Failures**: Immediate investigation required
4. **Development Bypass Attempts**: Alert if BYPASS_AUTH is set in non-dev environments
5. **Invalid JWT Signatures**: Potential token forgery attempts

---

This security guide consolidates best practices for implementing and maintaining security in Liminal Type Chat. Regular review and updates ensure the application remains secure as threats evolve.