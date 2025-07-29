# Authentication Architecture Design

## Overview

This document details the authentication architecture for Liminal Chat, built on WorkOS for identity management and JWT-based authorization. The system supports production OAuth flows, automated testing, and local development with consistent security guarantees across all environments.

## Core Security: Convex JWT Validation

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Incoming       │────▶│  Convex Edge    │────▶│  WorkOS JWKS    │
│  Request        │     │  Runtime        │     │  Endpoint       │
│  + JWT Header  │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                         │
                               │ 1. Extract JWT          │
                               │ 2. Fetch JWKS          │
                               │    (cached)            │
                               │ 3. Validate with JOSE  │
                               ▼                         │
                        ┌─────────────────┐              │
                        │  Validation     │◀─────────────┘
                        │  Result         │    Public Keys
                        └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  User Context   │
                        │  or 401         │
                        └─────────────────┘
```

### Sequence Diagram

```
Client          Convex Function     JOSE Library      WorkOS JWKS
  │                   │                  │                 │
  │─Request + JWT────▶│                  │                 │
  │                   │                  │                 │
  │                   │─Extract Bearer──▶│                 │
  │                   │                  │                 │
  │                   │─Validate────────▶│                 │
  │                   │                  │─Get Keys───────▶│
  │                   │                  │ (if not cached) │
  │                   │                  │◀────JWKS────────│
  │                   │                  │                 │
  │                   │                  │─Verify Sig─────▶│
  │                   │                  │─Check Claims───▶│
  │                   │                  │─Check Expiry───▶│
  │                   │                  │                 │
  │                   │◀─Token Claims────│                 │
  │                   │  or Error        │                 │
  │                   │                  │                 │
  │◀─Response/401─────│                  │                 │
```

### Functional Description

Every Convex function enforces JWT validation at the edge runtime layer. The validation process:

1. **Token Extraction**: Bearer tokens extracted from Authorization headers
2. **JWKS Resolution**: Public keys fetched from WorkOS JWKS endpoint using the configured client ID
3. **Signature Verification**: JOSE library validates JWT signature against WorkOS public keys
4. **Claims Validation**: Ensures required claims (sub, email, exp) are present and valid
5. **Expiry Check**: Rejects expired tokens based on exp claim
6. **Context Creation**: Valid tokens produce user context with tokenIdentifier and email

The JWKS keys are cached with a TTL to minimize external calls while maintaining security. Invalid tokens immediately return 401 Unauthorized without executing function logic.

## Test Infrastructure: Playwright Token Generation

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Playwright     │────▶│  SystemAuth     │────▶│  WorkOS SDK     │
│  Test Suite     │     │  Utility        │     │  (Node.js)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                         │
        │                       │ 1. Load credentials    │
        │                       │ 2. Authenticate        │
        │                       │ 3. Cache tokens        │
        │                       ▼                         │
        │               ┌─────────────────┐              │
        │               │  Token Cache    │◀─────────────┘
        │               │  + Refresh      │    JWT + Refresh
        │               └─────────────────┘
        │                       │
        │◀──────────────────────┘
        │    Headers with JWT
        ▼
┌─────────────────┐
│  API Request    │
│  with Auth      │
└─────────────────┘
```

### Sequence Diagram

```
Test            SystemAuth       WorkOS SDK      Token Cache
 │                  │                 │               │
 │─Get Headers─────▶│                 │               │
 │                  │                 │               │
 │                  │─Check Cache────▶│               │
 │                  │                 │               │
 │                  │◀─Expired────────│               │
 │                  │                 │               │
 │                  │─Authenticate───▶│               │
 │                  │ (password)      │               │
 │                  │                 │               │
 │                  │◀─JWT + Refresh──│               │
 │                  │                 │               │
 │                  │─Store──────────▶│               │
 │                  │                 │───────────────▶│
 │                  │                 │               │
 │◀─Auth Headers────│                 │               │
 │                  │                 │               │
 │─API Call────────▶│                 │               │
 │ (with headers)   │                 │               │
```

### Functional Description

The Playwright test infrastructure uses a dedicated system user with password authentication to generate real WorkOS JWTs:

1. **Credential Management**: System user credentials stored in environment variables
2. **Token Generation**: WorkOS SDK authenticates using password flow
3. **Token Caching**: JWTs cached per test worker with 50-minute lifetime
4. **Automatic Refresh**: Refresh tokens used before expiry to maintain session
5. **Header Injection**: Proxy pattern adds Authorization headers to all test requests

This approach ensures integration tests use the same authentication path as production, validating the entire auth stack. The system user has specific JWT template claims for test identification.

## Production Flow: OAuth PKCE with WorkOS

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React App      │────▶│  WorkOS         │────▶│  OAuth Provider │
│  (Browser)      │     │  Authorization  │     │  (Google, etc)  │
└─────────────────┘     │  Server         │     └─────────────────┘
        │               └─────────────────┘              │
        │                       │                        │
        │               ┌─────────────────┐              │
        │◀──────────────│  Callback       │◀─────────────┘
        │  httpOnly     │  + Cookie       │   Auth Code
        │  Cookie       └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  AuthKit        │────▶│  Convex         │
│  Provider       │     │  Backend        │
│  (manages JWT)  │     │  (validates)    │
└─────────────────┘     └─────────────────┘
```

### Sequence Diagram

```
User        React App      WorkOS Auth      OAuth Provider     Convex
 │              │               │                 │               │
 │─Visit────────▶              │                 │               │
 │              │               │                 │               │
 │              │─Check Auth───▶│                 │               │
 │              │               │                 │               │
 │              │◀─Redirect─────│                 │               │
 │              │  to OAuth     │                 │               │
 │              │               │                 │               │
 │◀─OAuth Page──┼───────────────┼─────────────────▶              │
 │              │               │                 │               │
 │─Login────────┼───────────────┼─────────────────▶              │
 │              │               │                 │               │
 │◀─Redirect────┼───────────────│◀────Code────────│               │
 │  /callback   │               │                 │               │
 │              │               │                 │               │
 │──────────────▶─Exchange─────▶│                 │               │
 │              │  Code         │─Token Exchange─▶│               │
 │              │               │◀─JWT────────────│               │
 │              │               │                 │               │
 │              │◀─Set Cookie───│                 │               │
 │              │  (httpOnly)   │                 │               │
 │              │               │                 │               │
 │              │─API Call─────┼─────────────────┼───────────────▶│
 │              │              │                 │   (JWT in      │
 │              │              │                 │    header)     │
 │              │◀─────────────┼─────────────────┼────────────────│
```

### Functional Description

Production authentication uses OAuth 2.0 with PKCE for secure browser-based authentication:

1. **Initial Check**: AuthKit provider checks for valid session cookie
2. **OAuth Redirect**: Unauthenticated users redirected to WorkOS authorization URL
3. **Provider Authentication**: Users authenticate with chosen OAuth provider
4. **Code Exchange**: Authorization code exchanged for JWT via backchannel
5. **Cookie Storage**: JWT stored in httpOnly, secure, sameSite cookie
6. **Automatic Inclusion**: AuthKit provider adds JWT to all Convex requests
7. **Session Management**: Automatic refresh before token expiry

The PKCE flow ensures security without client secrets, while httpOnly cookies prevent XSS token theft.

## Local Development: Service-Based Authentication

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React App      │────▶│  Local Dev      │────▶│  WorkOS API     │
│  (Browser)      │     │  Service        │     │  (Password)     │
│                 │     │  localhost:8081 │     └─────────────────┘
└─────────────────┘     └─────────────────┘              │
        │                       │                        │
        │                       │◀───────────────────────┘
        │◀──────────────────────┘         Real JWT
        │    JWT Response
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  localStorage   │────▶│  Convex         │
│  (JWT Storage)  │     │  Backend        │
└─────────────────┘     └─────────────────┘
```

### Sequence Diagram

```
Developer    React App    localStorage    Dev Service    WorkOS API
    │            │             │              │              │
    │─Open App──▶│             │              │              │
    │            │             │              │              │
    │            │─Check────────▶             │              │
    │            │             │              │              │
    │            │◀─Not Found───│              │              │
    │            │             │              │              │
    │            │─POST────────┼──────────────▶              │
    │            │ /auth/token │              │              │
    │            │             │              │              │
    │            │             │              │─Password─────▶│
    │            │             │              │ Auth         │
    │            │             │              │              │
    │            │             │              │◀─JWT─────────│
    │            │             │              │              │
    │            │◀─────────────┼──────────────│              │
    │            │  {token,    │              │              │
    │            │   expiresAt}│              │              │
    │            │             │              │              │
    │            │─Store────────▶              │              │
    │            │             │              │              │
    │            │─Use JWT─────┼──────────────┼──────────────▶
    │            │             │              │    Convex API
```

### Functional Description

Local development uses a dedicated service to provide real WorkOS JWTs without OAuth flow:

1. **Service Binding**: Fastify server binds only to localhost:8081
2. **Token Check**: React app checks localStorage for valid token
3. **Token Generation**: Missing/expired tokens trigger call to local service
4. **Password Authentication**: Service uses WorkOS password flow with dev credentials
5. **Real JWTs**: Returns production-compatible tokens with dev user claims
6. **Local Storage**: Tokens stored in localStorage with expiry tracking
7. **Automatic Refresh**: Hook refreshes tokens 10 minutes before expiry

This approach maintains security by keeping auth endpoints local while providing the same JWT structure as production.

## Integrated System View

### Complete Architecture

```
┌────────────────────────────── Production Path ──────────────────────────────┐
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │ Browser │───▶│ WorkOS  │───▶│  OAuth  │───▶│ Cookie  │───▶│ Convex  │ │
│  │         │    │  Auth   │    │Provider │    │ Storage │    │         │ │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────── Development Path ───────────────────────────────┐
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │ Browser │───▶│  Local  │───▶│ WorkOS  │───▶│  Local  │───▶│ Convex  │ │
│  │         │    │ Service │    │   API   │    │ Storage │    │         │ │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────── Test Path ────────────────────────────────────┐
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │  Test   │───▶│ System  │───▶│ WorkOS  │───▶│ Header  │───▶│ Convex  │ │
│  │ Runner  │    │  Auth   │    │   SDK   │    │Injection│    │         │ │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

                                     │
                                     ▼
                            ┌─────────────────┐
                            │ Unified Convex  │
                            │ JWT Validation  │
                            │  (JOSE + JWKS)  │
                            └─────────────────┘
```

### Complete Sequence Flow

```
Environment     Entry Point        Auth Method         Storage         Backend
    │               │                   │                │               │
Production:         │                   │                │               │
    │─User─────────▶│                   │                │               │
    │               │─OAuth Flow───────▶│                │               │
    │               │                   │─httpOnly──────▶│               │
    │               │                   │                │─JWT Header───▶│
    │               │                   │                │               │
Development:        │                   │                │               │
    │─Developer────▶│                   │                │               │
    │               │─Local Service────▶│                │               │
    │               │                   │─localStorage──▶│               │
    │               │                   │                │─JWT Header───▶│
    │               │                   │                │               │
Testing:            │                   │                │               │
    │─Test Suite───▶│                   │                │               │
    │               │─System Auth──────▶│                │               │
    │               │                   │─Memory Cache──▶│               │
    │               │                   │                │─JWT Header───▶│
    │               │                   │                │               │
    │               │                   │                │               ▼
    │               │                   │                │      ┌─────────────┐
    │               │                   │                │      │ JOSE Valid. │
    │               │                   │                │      │ Same Logic  │
    │               │                   │                │      │ All Paths   │
    │               │                   │                │      └─────────────┘
```

## Security Considerations

### Token Security
- **Production**: httpOnly cookies prevent XSS attacks
- **Development**: localStorage acceptable for local-only tokens
- **Testing**: In-memory storage prevents token leakage
- **All Environments**: Real WorkOS JWTs with proper expiry

### Network Security
- **Production**: HTTPS required for all communication
- **Development**: Local service bound to 127.0.0.1 only
- **CORS**: Strict origin validation on all endpoints
- **JWKS**: Cached but refreshed regularly for key rotation

### Access Control
- **User Isolation**: Token identifies user, functions enforce access
- **Dev User Limits**: Development tokens have no special privileges
- **Test User Marking**: System users identified by JWT claims
- **Expiry Enforcement**: All tokens expire and require refresh

## Implementation Considerations

### Performance
- **JWKS Caching**: Reduces external calls while maintaining security
- **Token Refresh**: Proactive refresh prevents auth interruptions
- **Local Service**: Minimal latency for development tokens
- **Edge Validation**: JWT validation at edge for fastest rejection

### Reliability
- **Refresh Tokens**: Automatic refresh maintains long sessions
- **Error Handling**: Clear 401 responses for invalid tokens
- **Fallback**: Password auth fallback for refresh failures
- **Health Checks**: Service endpoints include auth validation

### Developer Experience
- **Unified Interface**: Same auth hooks across all environments
- **Automatic Management**: Token refresh handled transparently
- **Clear Errors**: Descriptive messages for auth failures
- **Fast Iteration**: No OAuth flow delays in development