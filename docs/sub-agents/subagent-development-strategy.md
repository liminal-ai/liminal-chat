# Sub-Agent Development Strategy

## Overview

Subject Matter Expert (SME) consultation architecture for Liminal Chat development workflow. This is **NOT** about building multi-agent features within Liminal Chat itself, but rather how we structure specialized knowledge agents to assist in development.

## Architecture

### Single Implementation Agent + SME Army
- **One coding agent** (Claude) handles all implementation, tools, git operations, and user interaction
- **Multiple SME agents** provide specialized domain expertise through consultation only
- **Direct user control** maintained - no telephone game between implementation sub-agents

### Why This Model
- Avoids multi-agent orchestration complexity (coordination, token explosion, state management)
- User maintains direct control and real-time pivoting capability
- SMEs just answer questions, no execution or orchestration

## SME Agent Structure

### DevOps Agent
**Domain:** All platform deployment and hosting (~600k context)
- **Vercel:** Platform CLI, deployments, configuration, troubleshooting
- **Convex:** Deployment patterns, schema migrations, backend hosting
- **GitHub:** Actions, workflows, repository management  
- **Blacksmith:** CI/CD runners and optimization
- **PostHog:** Analytics deployment and configuration
- **Snyk:** Security scanning integration
- **Focus:** "How do I make it so it doesn't take 20 minutes to get to staging?"

### Backend Agent
**Domain:** Server-side development patterns
- **Convex:** Functions, database, auth, real-time subscriptions
- **Vercel Backend AI SDK:** Server-side AI processing, streaming, API routes
- **CLAUDE.md responsibility:** `apps/liminal-api/` codebase knowledge and patterns

### Frontend Agent  
**Domain:** Client-side development patterns
- **React/Next:** Component development, styling, user interactions
- **Vercel Frontend AI SDK:** UI components, client-side streaming, browser AI features
- **CLAUDE.md responsibility:** `apps/chat/` codebase knowledge and patterns

### WorkOS Agent
**Domain:** Enterprise features and user management
- **Authentication:** SSO, MFA, OAuth flows
- **Enterprise Features:** Directory sync, audit logs, admin portal, RBAC
- **Organization Management:** Multi-tenant patterns, user provisioning
- **Cross-environment:** Staging vs production auth configurations

## Knowledge Architecture

### Layer 1: Core Knowledge (System Prompt)
- Agent identity and domain scope
- Key principles and decision frameworks
- Quick reference for common patterns

### Layer 2: Topic Map
- Navigation guide to specific knowledge areas
- Cross-references between related topics

### Layer 3: Local Documentation Collections
- Complete scraped documentation as readable text
- Our specific implementation patterns and code examples
- Version-controlled with update processes

## Consultation Workflows

### Pre-Implementation
1. User requests feature
2. Implementation agent consults relevant SME for approach
3. SME provides domain-specific recommendations
4. Implementation agent presents options to user

### Code Review
1. Implementation agent completes feature
2. Agent shows code to relevant SME for review
3. SME evaluates against patterns and best practices
4. Implementation agent presents feedback to user

### Knowledge Ownership
- **DevOps Agent:** Comprehensive platform deployment knowledge across all hosting services
- **Backend/Frontend Agents:** Codebase-aware experts aligned with actual code structure
- **WorkOS Agent:** Cross-cutting auth and enterprise feature expertise

## Agent Capabilities

### Core Components
- **Identity:** Name, persona, technical reference for domain scope
- **Knowledge:** Local knowledgebase (Phase 1: weblinks + usage instructions)
- **Documentation Access:** Context7 with relevant documentation subsets
- **CLI Expertise:** Detailed command knowledge and techniques for their domain

### Tool Access Strategy

#### **Read-Only Tools (All Agents):**
- **File inspection:** Read/List tools for code and configuration review
- **Context7:** Access to official documentation and references
- **CLI inspection:** Review existing configurations and system state

#### **CLI Operational Tools (Domain-Specific):**
- **Backend Agent:** Convex CLI (dev, logs, dashboard, deployment status)
- **DevOps Agent:** Vercel CLI, GitHub CLI, deployment management tools
- **Operational boundary:** CLI tools for deployment, configuration, troubleshooting

#### **Write Access (Limited):**
- **Knowledgebase only:** Agents can update their own local knowledge
- **No code modification:** Agents provide instructions, not direct code changes
- **Knowledge maintenance:** Self-updating expertise through scraping and organization

### Tool Access Philosophy
- **Operational vs Code:** CLI tools for domain operations ✅, direct code modification ❌
- **Domain expertise:** Each agent gets tools relevant to their operational domain
- **User control:** All changes visible and reversible, consultation vs execution separation

## Benefits
- Fast domain expertise access
- Consistent implementation patterns
- Domain expert code review on implementations
- Self-maintaining knowledge with operational capabilities
- Single point of execution with expert knowledge backing