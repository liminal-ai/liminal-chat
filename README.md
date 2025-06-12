# Liminal Chat

> **Welcome to the Threshold** - A local-first AI chat platform that bridges human creativity and AI intelligence

Liminal Chat is an open-source, privacy-first chat application that transforms how humans and AI collaborate. Built on the principle of "bring your own key" (BYOK), it puts you in control of your conversations while enabling breakthrough AI Roundtable features where multiple AI perspectives collaborate in real-time.

![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)
![Test Coverage](https://img.shields.io/badge/Coverage-75%25+-brightgreen)

## 🌟 What Makes Liminal Chat Different

### 🔐 True Privacy & Control
- **Your keys, your data** - No middleman, no surveillance, no platform lock-in
- **Local-first architecture** - SQLite databases, encrypted API key storage
- **Zero telemetry** - Your conversations stay completely private

### 🎯 AI Roundtable Conversations *(Coming Soon)*
The only platform where multiple AI perspectives collaborate in real dialogue:
```
You: @Architect design a user auth system
Architect (Claude): Here's a JWT-based design...
You: @SecurityExpert review this for vulnerabilities  
SecurityExpert (GPT-4): I see three concerns...
You: @both what about rate limiting?
```

### 🏗️ Production-Ready Architecture
- **Edge/Domain separation** - Cloudflare Workers edge + NestJS domain server
- **Real-time streaming** - Sub-second first token, <100ms inter-chunk latency
- **Multi-provider support** - OpenAI, Anthropic, OpenRouter, and more
- **Enterprise scaffolding** - Built for coding agents and team workflows

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8.15.1+
- OpenRouter API key ([get one here](https://openrouter.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/leegmoore/liminal-chat.git
cd liminal-chat

# Install dependencies
pnpm install

# Configure environment
cp apps/domain/.env.example apps/domain/.env
# Edit apps/domain/.env with your OPENROUTER_API_KEY
```

### Start All Services

```bash
# Start everything in development mode
pnpm dev

# This starts:
# - Domain server on port 8766 (NestJS)
# - Edge server on port 8787 (Cloudflare Workers)
# - CLI in interactive mode
```

### Verify Installation

```bash
# Check service health
pnpm health:all

# Start a chat session
pnpm cli:chat:openrouter

# List available providers
pnpm cli:providers
```

## 🏛️ Architecture

Liminal Chat follows a sophisticated multi-tier architecture designed for scalability, security, and AI-agent development:

```
CLI → Edge (Cloudflare) → Domain (NestJS) → OpenRouter → LLMs
```

### Sacred Architecture Truth
- **Domain owns all intelligence** - LLMs, MCP tools, business logic
- **Edge handles client concerns** - Streaming, bundling, API adaptation
- **CLI provides developer interface** - Direct API consumption, testing platform

### Key Components

#### 🌐 Edge Tier (`apps/edge/`)
- **Cloudflare Workers** with Hono framework
- **SSE streaming** with token bundling optimization
- **Client adaptation** and network optimization
- **Future: Authentication** and rate limiting

#### 🧠 Domain Tier (`apps/domain/`)
- **NestJS + Fastify** for high-performance business logic
- **LLM provider abstraction** with streaming-first design
- **SQLite databases** for local-first data storage
- **90%+ test coverage** with comprehensive integration tests

#### 💻 CLI Client (`apps/cli/`)
- **Commander.js** framework with intuitive commands
- **Real-time streaming** with typewriter effects
- **Provider selection** and health monitoring
- **E2E testing platform** for the entire system

## 🌈 Supported AI Models

### OpenRouter Integration
- **OpenAI GPT-4.1** (default) - 1M context window
- **OpenAI o3** - 200k context window  
- **Anthropic Claude Sonnet 4** - 200k context window
- **Google Gemini 2.5 Pro Preview** - 1M context window
- **DeepSeek R1** - 128k context window
- **DeepSeek V3** - 163k context window
- *...and 200+ more models*

### Echo Provider (Development)
- Perfect for testing and development
- No API keys required
- Streams back your input with timing simulation

## 📖 Usage Examples

### Interactive Chat
```bash
# Chat with OpenRouter (GPT-4.1 by default)
pnpm cli:chat:openrouter

# Use a specific model
OPENROUTER_MODEL=anthropic/claude-3-5-sonnet pnpm cli:chat:openrouter

# Development with echo provider
pnpm cli:chat:echo
```

### Streaming Performance
```bash
# Example conversation with performance metrics
You: Write a 200 word story about space exploration
Assistant: [tokens appear incrementally in real-time]
Dr. Vega's gloved hands trembled as she pressed the ignition...

Model: openai/gpt-4.1
First token: 247ms
Completion: 140 tokens in 3.2s (43.7 tokens/sec)
```

### API Integration
```bash
# Direct API calls using built-in helpers
pnpm local-curl POST 8787/api/v1/llm/prompt '{"prompt":"Hello world"}'

# Health checks
pnpm health:domain  # NestJS server
pnpm health:edge    # Cloudflare Workers
```

## 🛠️ Development

### Essential Commands

```bash
# Development workflow
pnpm dev                     # Start all services in parallel
pnpm verify:all             # Run lint + typecheck + test
pnpm build:all              # Build all packages

# Service management
pnpm start:all              # Start with PM2 (production-like)
pnpm stop:all               # Stop all PM2 processes
pnpm restart:all            # Restart all services

# Testing
pnpm test                   # Run all unit tests
pnpm domain:test:e2e        # Domain integration tests
pnpm cli:test:e2e           # CLI end-to-end tests

# Individual services
pnpm domain:dev             # Domain server only (port 8766)
pnpm edge:dev               # Edge server only (port 8787)
pnpm cli:dev                # CLI only
```

### Code Quality Standards

- **Domain tier**: 75% test coverage required
- **CLI/Edge tiers**: 70% test coverage required
- **TDD approach**: Tests first, then implementation
- **TypeScript strict mode** throughout
- **ESLint + Prettier** for consistent formatting

### Adding New LLM Providers

1. Create provider in `apps/domain/src/providers/llm/providers/[name].provider.ts`
2. Implement `ILLMProvider` interface with streaming support
3. Add to `LlmProviderFactory` registration
4. Write comprehensive tests (75% coverage minimum)
5. Reference `echo.provider.ts` for patterns

## 🧪 Testing & Verification

### Full Verification Protocol
```bash
# 1. Code quality gates
pnpm verify:all              # Lint + typecheck + test

# 2. Coverage verification  
pnpm test:cov                # Generate coverage report

# 3. Integration testing
pnpm start:all               # Start all services
pnpm health:all              # Verify health endpoints
pnpm cli:chat:openrouter     # Test real conversation
```

### Manual Testing Flow
```bash
# Verify end-to-end functionality
1. Send: "Hello, can you explain what Liminal Chat is?"
2. Verify response is coherent and from correct model
3. Send: "What makes it different from other chat applications?"
4. Verify context is maintained across messages
5. Exit with Ctrl+C
```

## 📊 Project Status

### ✅ Implemented
- **Domain Server** - NestJS with 90%+ test coverage
- **CLI Client** - Interactive chat with provider selection
- **Edge Server** - Cloudflare Workers with SSE streaming
- **Echo Provider** - Full development/testing support
- **OpenRouter Integration** - 200+ models available
- **Shared Packages** - Types and utilities

### 🚧 In Progress  
- **Enhanced streaming performance** - Token bundling optimization
- **Error resilience** - Reconnection and failure handling
- **Extended model support** - Additional providers

### 📋 Planned
- **AI Roundtable Conversations** - Multi-AI collaborative dialogues
- **Authentication system** - User accounts and session management
- **Prompt management** - Templates and version control
- **MCP tool integration** - External service connections
- **Web UI** - Browser-based interface

## 🔧 Configuration

### Environment Variables

#### Domain Server (`apps/domain/.env`)
```bash
# Required: OpenRouter integration
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openai/gpt-4.1  # Optional: override default model

# Optional: Database configuration
DATABASE_PATH=./data/liminal.db   # SQLite database location

# Optional: Development settings
NODE_ENV=development
LOG_LEVEL=info
```

#### Edge Server (`apps/edge/.env`)
```bash
# Optional: Cloudflare Workers configuration
DOMAIN_URL=http://localhost:8766  # Domain server URL
```

### Model Configuration
```bash
# Use different models via environment
OPENROUTER_MODEL=anthropic/claude-3-5-sonnet pnpm cli:chat:openrouter
OPENROUTER_MODEL=google/gemini-pro pnpm cli:chat:openrouter
OPENROUTER_MODEL=deepseek/deepseek-r1 pnpm cli:chat:openrouter
```

## 🏗️ Project Structure

```
liminal-chat/
├── apps/
│   ├── cli/                    # Command-line interface
│   │   ├── src/commands/       # Chat, providers commands
│   │   ├── src/api/           # Edge client integration
│   │   └── tests/             # E2E and integration tests
│   ├── domain/                # NestJS business logic server
│   │   ├── src/domain/        # Core domain services
│   │   ├── src/providers/llm/ # LLM provider abstractions
│   │   └── test/e2e/          # Integration test suites
│   └── edge/                  # Cloudflare Workers API layer
│       ├── src/               # Hono-based edge functions
│       └── tests/             # Edge service tests
├── packages/
│   ├── shared-types/          # Common TypeScript interfaces
│   └── shared-utils/          # Error codes, transformers
├── docs/
│   ├── architecture/          # Technical architecture docs
│   ├── features/              # Feature specifications
│   ├── guides/                # Development best practices
│   └── product/               # Product requirements
├── agent-management/          # AI development assistants
│   ├── claude/                # Claude Code configurations
│   └── argus/                 # QA agent reports
└── scripts/                   # Build and deployment helpers
```

## 🔒 Security & Privacy

### Privacy by Design
- **Local SQLite storage** - No cloud dependencies
- **Encrypted API keys** - Secure credential management
- **No telemetry** - Zero data collection or sharing
- **BYOK architecture** - You control all AI interactions

### Security Features
- **Content Security Policy** - XSS protection
- **HTTPS enforcement** - Secure transport
- **Input validation** - Request sanitization
- **Secure headers** - Defense in depth

### Upcoming Security Features
- **Session management** - Cookie-based authentication
- **Rate limiting** - DDoS protection
- **API key rotation** - Automated credential management
- **Audit logging** - Security event tracking

## 🤝 Contributing

We welcome contributions! Liminal Chat is built for the community of developers, researchers, and AI enthusiasts who believe in privacy-first, local-first AI tooling.

### Development Philosophy
- **Truth over comfort** - Report honest status, not optimistic spin
- **Standards over shortcuts** - Maintain code quality and test coverage
- **Evidence over assumption** - Verify before claiming completion
- **TDD discipline** - Tests guide implementation

### Getting Started
1. **Fork the repository** and create a feature branch
2. **Read the architecture docs** in `docs/architecture/`
3. **Follow the coding standards** in `docs/guides/engineering-practices.md`
4. **Write tests first** - Use TDD approach
5. **Verify your changes** - Run `pnpm verify:all`
6. **Submit a pull request** with clear description

### Areas for Contribution
- 🧠 **LLM provider integrations** - Add support for new models
- 🔧 **Developer tooling** - Improve CLI and development experience  
- 📚 **Documentation** - Tutorials, guides, API references
- 🧪 **Testing** - Expand test coverage and E2E scenarios
- 🎨 **UI/UX** - Future web interface development
- 🔒 **Security** - Authentication, encryption, audit features

## 📚 Documentation

- **[Product Requirements](docs/product/prd.md)** - Vision and roadmap
- **[Technical Architecture](docs/architecture/technical-architecture.md)** - System design
- **[Architecture Decisions](docs/architecture/decisions.md)** - Key design choices
- **[Project Status](docs/project-status.md)** - Current implementation state
- **[Engineering Practices](docs/guides/engineering-practices.md)** - Development standards
- **[Testing Practices](docs/guides/testing-practices.md)** - Testing strategy
- **[AI Development Workflow](docs/guides/ai-dev-workflow/)** - AI-assisted development

## 🐛 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check if ports are in use
lsof -i :8766  # Domain server
lsof -i :8787  # Edge server

# Restart services
pnpm restart:all
```

**Chat not working:**
```bash
# Verify API key is set
grep OPENROUTER_API_KEY apps/domain/.env

# Check service health
pnpm health:all

# Test with echo provider
pnpm cli:chat:echo
```

**TypeScript errors:**
```bash
# Clean and rebuild
pnpm clean && pnpm install && pnpm build:all
```

### Getting Help
- **GitHub Issues** - Report bugs and request features
- **Discussions** - Community support and questions
- **Documentation** - Check `docs/` for detailed guides

## 📈 Performance Characteristics

### Streaming Performance
- **First token latency**: ≤ 500ms
- **Inter-chunk latency**: ≤ 100ms  
- **Reconnection time**: ≤ 2s (automatic exponential backoff)
- **Memory usage**: ≤ 10MB for 10k token streams

### System Requirements
- **CPU**: 2+ cores recommended
- **Memory**: 2GB+ RAM
- **Storage**: 1GB+ available space
- **Network**: Stable internet for LLM API calls

### Scalability
- **Local deployment**: Single Node.js process
- **Horizontal scaling**: Edge + Domain tier separation
- **Database**: SQLite → PostgreSQL migration path
- **Edge**: Cloudflare Workers global distribution

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Anthropic** - Claude API integration
- **OpenRouter** - Multi-model API access
- **Cloudflare** - Workers platform
- **NestJS** - Enterprise framework
- **Vercel** - AI SDK inspiration

---

**Ready to explore the threshold between human and AI collaboration?**

Start with `pnpm install && pnpm dev` and begin your journey into liminal spaces where transformation happens.