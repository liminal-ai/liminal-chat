# Product Requirements Document (PRD)
# Liminal Type Chat
### *Welcome to the Threshold*

**Version:** 1.0 - Draft  
**Last Updated:** January 2025  
**Author:** [Your Name]  
**Status:** In Review

## TODO: Document Review Needed
This PRD needs review and refinement in the following areas:
- [ ] **Tone down hyped ideals** - Some sections are overly aspirational
- [ ] **Refine use cases** - Remove or consolidate some of the more speculative use cases
- [ ] **Update success metrics** - Current metrics are too basic/generic KPIs
- [x] **Move technical details** - Technical implementation details moved to TECHNICAL_ARCHITECTURE.md
- [ ] **Fix timelines and milestones** - Current timeline doesn't align with actual development progress

## Implementation Insights

### From AI Analysis
Based on comprehensive project analysis, key recommendations include:
- **Phased Authentication**: Start simple, add complexity gradually
- **API Contracts First**: Consider OpenAPI integration before heavy UI work
- **Error Recovery**: Design patterns for streaming failures and partial responses
- **Developer Experience**: Include development mode with simplified flows

## Executive Summary

Liminal Type Chat is the flagship application of the Liminal Type Platform - an open-source foundation for transformative human-AI collaboration. At its core, it's a local-first chat application where users bring their own API keys. But its true innovation lies in enabling AI Roundtable conversations where multiple AI perspectives collaborate with humans to transform ideas into reality.

**Liminal** (adj.): *Occupying a position at, or on both sides of, a boundary or threshold*

We exist at the threshold between human creativity and AI capability, creating spaces where transformation happens.

## Product Vision

### Vision Statement
To build the foundational platform where human creativity and AI intelligence meet, collaborate, and transform ideas into reality. We're creating the infrastructure for a new kind of human-AI partnership - one based on collective intelligence, multiple perspectives, and the transformative power of dialogue at the threshold of possibility.

### Key Differentiators
1. **AI Roundtable Conversations**: The only platform where multiple AI perspectives collaborate in real dialogue, not just sequential responses
2. **Liminal Space Design**: Purpose-built for the threshold moments where ideas transform into reality
3. **Platform, Not Just Chat**: Extensible foundation for specialized AI-augmented workflows (music, writing, coding, decision-making)
4. **True Local-First**: Your ideas, your data, your API keys - no middleman, no surveillance, no platform lock-in
5. **Collective Intelligence**: Harness the wisdom of multiple AI perspectives working together, not just switching between them
6. **Open Source Foundation**: Join a community building the future of human-AI collaboration

## The Liminal Philosophy *(Needs Review: Tone Down)*

### Why "Liminal"?

In anthropology, liminal spaces are where transformation happens - the space between what was and what will be. The Liminal Type Platform creates that transformative space for:

- **Ideas**: Raw thoughts → Refined concepts through multi-perspective dialogue
- **Creativity**: Initial sparks → Fully realized works with AI collaboration
- **Decisions**: Uncertainty → Clarity through collective intelligence
- **Projects**: Conception → Completion with your AI roundtable

### The Roundtable Metaphor

Traditional AI interactions are linear: Human → AI → Response. The Liminal approach is circular, collaborative, and multi-dimensional. 

Imagine sitting at a roundtable where:
- **You** bring vision, creativity, and judgment
- **Multiple AI perspectives** bring different expertise and viewpoints  
- **The conversation** flows naturally between participants
- **Ideas evolve** through collective intelligence

This isn't about AI replacing human thought - it's about augmenting human creativity through structured dialogue with multiple specialized intelligences.

## Target Users

### Primary Personas

1. **Privacy-Conscious Professionals**
   - Concerned about data privacy with commercial chat platforms
   - Want full control over their AI interactions
   - Technical enough to obtain and manage API keys
   - Examples: Lawyers, doctors, financial advisors, researchers

2. **Developers and Technical Teams**
   - Need a customizable AI chat solution
   - Want to experiment with different LLM providers
   - Require API access and extensibility
   - Examples: Software engineers, data scientists, DevOps teams

3. **Small Business Owners**
   - Need AI assistance without enterprise pricing
   - Want to control costs through direct API usage
   - Require secure handling of business-sensitive conversations
   - Examples: Consultants, freelancers, startup founders

### Secondary Personas

1. **Academic Researchers**
   - Need reproducible AI interactions
   - Require data export and analysis capabilities
   - Want to compare different model outputs

2. **Content Creators**
   - Need AI assistance for writing and ideation
   - Want to maintain ownership of their conversations
   - Require flexibility in prompt management

## Core Features

### MVP Features (Currently Implemented)

1. **Secure Authentication**
   - Login with GitHub account
   - Secure session management
   - User profile management

2. **Conversation Management**
   - Create and organize chat conversations
   - Full conversation history
   - Search and filter conversations

3. **AI Chat Integration**
   - Chat with Claude (Anthropic)
   - Real-time streaming responses
   - Secure API key management

4. **System Monitoring**
   - Application health dashboard
   - Connection status indicators
   - Error reporting

### Phase 2 Features (In Development)

1. **Enhanced Chat Interface**
   - Real-time streaming responses
   - Message formatting and syntax highlighting
   - File upload and attachment support
   - Conversation search and filtering

2. **Multi-LLM Support**
   - OpenAI GPT models
   - Google Gemini
   - Open-source model integration
   - Provider comparison tools

3. **Advanced Security**
   - API key rotation reminders
   - Usage tracking and cost monitoring
   - Activity audit logs
   - Enhanced data protection

### Future Features (Planned)

1. **AI Roundtable Conversations** (Key Differentiator)
   - Assemble a roundtable of AI experts with distinct perspectives and expertise
   - Create named "panelists" with specific roles, prompts, and models
   - Direct conversation flow using intuitive @mention system
   - Synthesize multiple viewpoints to develop stronger, more nuanced solutions
   - Build collective intelligence through structured multi-perspective dialogue
   
   **Core Use Cases:**
   - **Design Reviews**: Architect proposes, Security Expert evaluates, Performance Optimizer refines
   - **Decision Support**: Gather diverse perspectives to make informed choices
   - **Knowledge Synthesis**: Combine different domains of expertise
   
   **Implementation Approach** (From AI Analysis):
   - Start simple: 1-3 panelists per conversation
   - Each panelist = Name + Expertise Prompt + Model Selection
   - Context management strategy for mid-conversation joins
   - Pre-built panel templates for common scenarios

2. **Prompt Management**
   - Prompt templates and libraries
   - Variable substitution
   - Version control for prompts
   - Sharing and collaboration

3. **Advanced Orchestration**
   - Multi-step LLM workflows
   - Conditional logic and branching
   - Output transformation and chaining
   - Visual workflow builder

4. **Enterprise Features**
   - Multi-user support
   - Team collaboration
   - Administrative controls
   - SSO integration

5. **Model Control Protocol (MCP)**
   - Tool-based AI interactions
   - External service integration
   - Custom function calling

## Technical Requirements *(Needs Review: Move Details to TECHNICAL_ARCHITECTURE.md)*

### Performance
- Sub-second response time for UI interactions
- Support for streaming LLM responses
- Handle conversations with 1000+ messages

### Security
- Encrypted storage for sensitive data
- Industry-standard authentication
- No telemetry or data collection by default

### Deployment
- Single-binary installation option
- Cross-platform support (Windows, Mac, Linux)
- Minimal system requirements (2GB RAM, 1GB storage)

## Success Metrics *(Needs Review: Update to Specific KPIs)*

### User Adoption
- Number of active installations
- GitHub stars and forks
- Community contributions

### Product Quality
- Application reliability (99.9% uptime)
- Response time (< 1 second for UI actions)
- Bug resolution time (< 48 hours for critical)

### User Satisfaction
- Feature request volume
- Bug report resolution time
- User retention rates

## Constraints and Assumptions

### Technical Constraints
- Must run on commodity hardware
- Initial focus on SQLite for simplicity
- Client-side rendering for privacy

### Business Constraints
- Open-source licensing (MIT)
- No vendor lock-in
- Community-driven development

### Assumptions
- Users can obtain their own API keys
- Basic technical competence for installation
- Privacy is a primary concern for target users

## Risks and Mitigation

### Technical Risks
1. **LLM API Changes**
   - Mitigation: Abstraction layer for providers
   - Regular compatibility testing

2. **Security Vulnerabilities**
   - Mitigation: Regular security audits
   - Responsible disclosure program

### Market Risks
1. **Competition from Commercial Platforms**
   - Mitigation: Focus on privacy and control
   - Unique features for power users

2. **API Key Management Complexity**
   - Mitigation: Clear documentation
   - Setup wizards and guides

## Timeline and Milestones

### Completed Milestones
- ✅ M0001-M0004: Foundation architecture and Edge-Domain pattern
- ✅ M0005: React TypeScript frontend
- ✅ M0006-M0007: ContextThread domain layer and Edge API
- ✅ M0008: LLM integration (Claude)
- ✅ M0009: Security hardening (simplified authentication)

### Current Focus (Q1 2025)
- 🔄 M0010: Streaming hardening and performance
- 📝 M0011: OpenAI provider implementation
- 📝 M0012: Multi-provider support architecture

### Next Phase - Distinguishing Features (Q2 2025)

**M0013: AI Roundtable MVP** - Our key differentiating feature
- Multi-model conversations with distinct AI perspectives
- Named "panelists" with specific expertise and roles
- @mention system for directing conversation flow
- Collective intelligence through structured dialogue

**Technical Prerequisites** (From AI Analysis):
- Complete multi-provider support (M0012)
- Stable streaming infrastructure (M0010)
- Consider OpenAPI integration for stable contracts

**Implementation Strategy**:
- Phase 1: Basic @mention routing with 2-3 panelists
- Phase 2: Context management and panel templates
- Phase 3: Advanced orchestration and synthesis

Example interaction:
```
You: @Architect design a user auth system
Architect (Claude): Here's a JWT-based design...
You: @SecurityExpert review this for vulnerabilities  
SecurityExpert (GPT-4): I see three concerns...
You: @both what about rate limiting?
```

### Future Roadmap (2025)
- Q3: Prompt management system
- Q3: Additional LLM providers (Gemini, open-source models)
- Q4: Advanced orchestration features
- Q4: Smart routing and pattern learning

## Open Questions

1. **AI Panel Implementation**: 
   - Should panelist responses appear in columns, threads, or sequential?
   - How do we handle context when some panelists join mid-conversation?
   - Should we offer pre-built panel templates (e.g., "Code Review Panel", "Decision Making Panel")?
   - How much conversation history does each panelist need to see?
   - **New**: How to handle token limit distribution across panelists?
   - **New**: Should panelists see each other's responses by default?

2. **Technical Architecture** (From AI Analysis):
   - Should we prioritize OpenAPI integration before UI work?
   - How to handle distributed PKCE storage for scaling?
   - What caching strategy for token validation?

3. **Deployment Strategy**: Should we prioritize Docker containers or native installers?
4. **Cloud Features**: What cloud-optional features would users value most?
5. **Community**: How do we best foster an active contributor community?

## Join the Liminal Community *(Needs Review: Tone Down)*

### For Developers

We're building something unprecedented - a platform for human-AI collaboration that respects privacy, encourages experimentation, and pushes the boundaries of what's possible. If you believe in:

- **Open Source**: Building in public, learning together
- **Privacy First**: Your thoughts are yours alone
- **Collective Intelligence**: The sum is greater than the parts
- **Transformative Technology**: AI as a partner, not a replacement

Then you belong here. Whether you contribute code, ideas, documentation, or just enthusiasm - you're part of shaping how humans and AI will work together.

### Platform Ecosystem

**Liminal Type Chat** is just the beginning. We envision an ecosystem of specialized tools:

- **Liminal-flow**: AI-augmented music creation (coming soon)
- **Liminal-write**: Multi-perspective writing assistance
- **Liminal-think**: Decision support through AI roundtables
- **Your Innovation Here**: What will you build on the platform?

### Getting Involved

1. **Star the repo**: Show your support
2. **Try the roundtable**: Experience multi-AI collaboration
3. **Share your use cases**: What transformations are you creating?
4. **Contribute**: Code, docs, ideas - all welcome
5. **Build on the platform**: Create your own Liminal tool

Welcome to the threshold. Let's transform what's possible together.

## Appendix

### Related Documents
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) - System design and implementation details
- [Project Status](./PROJECT-STATUS.md) - Current milestone progress and roadmap
- [Security Architecture](./wiki/security/architecture.md) - Security design principles
- [Development Standards](./wiki/engineering/standards/development-standards.md) - Coding standards
- [Error Codes](./wiki/engineering/reference/error-codes.md) - Standardized error handling

### Glossary
- **BYOK**: Bring Your Own Key - users provide their own API credentials
- **LLM**: Large Language Model - AI models like GPT-4, Claude, etc.
- **Liminal**: The transformative space between states
- **Roundtable**: Multi-AI collaborative conversation
- **MCP**: Model Control Protocol - protocol for tool-based AI interactions
- **Edge Tier**: API adaptation layer between UI and domain logic
- **Domain Tier**: Core business logic layer