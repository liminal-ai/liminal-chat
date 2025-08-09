// Demo Scripts - Predefined conversation scenarios
// These showcase the roundtable primitive across different domains

import type { DemoScript } from '../types/roundtable';

/**
 * Character Development Demo - Creative Writing Scenario
 * Shows how multiple agents can collaborate on character development
 */
export const characterDevelopmentScript: DemoScript = {
  id: 'character-development',
  title: 'Character Development Session',
  description: 'Three agents collaborate to develop a detective character for a noir mystery',
  agents: [
    {
      id: 'supportive',
      name: 'Supportive Editor',
      systemPrompt:
        'You encourage ideas and build on them constructively. You find the strengths in concepts and help develop them further.',
      color: '#10b981', // emerald
    },
    {
      id: 'critical',
      name: 'Critical Reviewer',
      systemPrompt:
        'You identify potential problems and inconsistencies. You ask tough questions to strengthen the work.',
      color: '#f59e0b', // amber
    },
    {
      id: 'creative',
      name: 'Creative Brainstormer',
      systemPrompt:
        'You generate wild ideas and unexpected connections. You push creative boundaries and suggest alternatives.',
      color: '#8b5cf6', // violet
    },
  ],
  steps: [
    {
      id: 'step-1-composing',
      title: 'User introduces character concept',
      userInput:
        '@supportive @critical what do you think of Sarah as a detective who secretly uses magic in 1920s Chicago?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-1-sent',
      title: 'User message sent - agents responding',
      userInput:
        '@supportive @critical what do you think of Sarah as a detective who secretly uses magic in 1920s Chicago?',
      expectedAgentResponses: [
        {
          agentId: 'supportive',
          content:
            'I love the dual identity aspect! A detective who uses magic gives us rich internal conflict - she has to solve crimes while hiding her greatest asset. The 1920s setting is perfect for exploring themes of hidden power and social constraints.',
          isComplete: true,
        },
        {
          agentId: 'critical',
          content:
            'Interesting premise, but we need to be careful about the magic system. How does her magic work? Why is it secret? If magic exists, why isn\'t it more widespread? These questions will determine if the story feels grounded or falls into "magic solves everything" territory.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-1-complete',
      title: 'Agents finished responding',
      userInput:
        '@supportive @critical what do you think of Sarah as a detective who secretly uses magic in 1920s Chicago?',
      expectedAgentResponses: [
        {
          agentId: 'supportive',
          content:
            'I love the dual identity aspect! A detective who uses magic gives us rich internal conflict - she has to solve crimes while hiding her greatest asset. The 1920s setting is perfect for exploring themes of hidden power and social constraints.',
          isComplete: true,
        },
        {
          agentId: 'critical',
          content:
            'Interesting premise, but we need to be careful about the magic system. How does her magic work? Why is it secret? If magic exists, why isn\'t it more widespread? These questions will determine if the story feels grounded or falls into "magic solves everything" territory.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-2-composing',
      title: 'User asks for creative expansion',
      userInput:
        '@creative what kind of magic should Sarah have? Something that helps with detective work but creates complications?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-2-sent',
      title: 'User message sent - creative agent responding',
      userInput:
        '@creative what kind of magic should Sarah have? Something that helps with detective work but creates complications?',
      expectedAgentResponses: [
        {
          agentId: 'creative',
          content:
            "What if Sarah can see the \"emotional residue\" left on objects? She touches a murder weapon and feels the killer's rage, or examines a victim's belongings and experiences their final moments. Perfect for detective work, but imagine the psychological toll - she's constantly experiencing trauma secondhand. And what if she can't turn it off?",
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-2-complete',
      title: 'Creative agent finished responding',
      userInput:
        '@creative what kind of magic should Sarah have? Something that helps with detective work but creates complications?',
      expectedAgentResponses: [
        {
          agentId: 'creative',
          content:
            "What if Sarah can see the \"emotional residue\" left on objects? She touches a murder weapon and feels the killer's rage, or examines a victim's belongings and experiences their final moments. Perfect for detective work, but imagine the psychological toll - she's constantly experiencing trauma secondhand. And what if she can't turn it off?",
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-3-composing',
      title: 'Multi-agent discussion about the magic system',
      userInput:
        '@supportive @critical respond to what @creative suggested about emotional residue',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-3-sent',
      title: 'User message sent - agents responding',
      userInput:
        '@supportive @critical respond to what #creative suggested about emotional residue',
      expectedAgentResponses: [
        {
          agentId: 'supportive',
          content:
            "Brilliant! This creates natural character development - Sarah becomes more empathetic and emotionally scarred with each case. We could show her struggling with the boundary between her emotions and others'. Maybe she starts avoiding personal relationships because she can't trust her own feelings.",
          isComplete: true,
        },
        {
          agentId: 'critical',
          content:
            'The emotional residue concept works, but we need clear limitations. How long does residue last? Can she get false readings from strong emotions unrelated to the crime? What happens if she touches something with overwhelming trauma? We need rules to create meaningful obstacles.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-3-complete',
      title: 'Agents finished responding',
      userInput:
        '@supportive @critical respond to what @creative suggested about emotional residue',
      expectedAgentResponses: [
        {
          agentId: 'supportive',
          content:
            "Brilliant! This creates natural character development - Sarah becomes more empathetic and emotionally scarred with each case. We could show her struggling with the boundary between her emotions and others'. Maybe she starts avoiding personal relationships because she can't trust her own feelings.",
          isComplete: true,
        },
        {
          agentId: 'critical',
          content:
            'The emotional residue concept works, but we need clear limitations. How long does residue last? Can she get false readings from strong emotions unrelated to the crime? What happens if she touches something with overwhelming trauma? We need rules to create meaningful obstacles.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-4-composing',
      title: 'User explores character relationships',
      userInput:
        "@supportive how should Sarah's magic affect her relationships with other characters?",
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-4-sent',
      title: 'User message sent - supportive agent responding',
      userInput:
        "@supportive how should Sarah's magic affect her relationships with other characters?",
      expectedAgentResponses: [
        {
          agentId: 'supportive',
          content:
            'Her magic could create fascinating relationship dynamics! She might avoid touching people she cares about, afraid of what she\'ll feel. Or she could become the person everyone confides in because she truly understands their pain. Maybe she has a partner who doesn\'t know about her magic, creating tension when she solves cases with "impossible" insights.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-4-complete',
      title: 'Supportive agent finished responding',
      userInput:
        "@supportive how should Sarah's magic affect her relationships with other characters?",
      expectedAgentResponses: [
        {
          agentId: 'supportive',
          content:
            'Her magic could create fascinating relationship dynamics! She might avoid touching people she cares about, afraid of what she\'ll feel. Or she could become the person everyone confides in because she truly understands their pain. Maybe she has a partner who doesn\'t know about her magic, creating tension when she solves cases with "impossible" insights.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-5-composing',
      title: 'User requests creative complications',
      userInput:
        "@creative @critical what if Sarah's magic starts malfunctioning during the story?",
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-5-sent',
      title: 'User message sent - agents responding',
      userInput:
        "@creative @critical what if Sarah's magic starts malfunctioning during the story?",
      expectedAgentResponses: [
        {
          agentId: 'creative',
          content:
            "Oh! What if she starts experiencing emotions from the future instead of the past? She touches evidence and feels the killer's satisfaction about murders that haven't happened yet. Now she's in a race against time, but can't explain how she knows without revealing her secret.",
          isComplete: true,
        },
        {
          agentId: 'critical',
          content:
            "That's a compelling twist, but it changes the story's logic significantly. We'd need to establish why her magic is changing - is it connected to a larger magical threat? Is she being targeted? The malfunction needs to serve the plot, not just create arbitrary obstacles.",
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-5-complete',
      title: 'Agents finished responding',
      userInput:
        "@creative @critical what if Sarah's magic starts malfunctioning during the story?",
      expectedAgentResponses: [
        {
          agentId: 'creative',
          content:
            "Oh! What if she starts experiencing emotions from the future instead of the past? She touches evidence and feels the killer's satisfaction about murders that haven't happened yet. Now she's in a race against time, but can't explain how she knows without revealing her secret.",
          isComplete: true,
        },
        {
          agentId: 'critical',
          content:
            "That's a compelling twist, but it changes the story's logic significantly. We'd need to establish why her magic is changing - is it connected to a larger magical threat? Is she being targeted? The malfunction needs to serve the plot, not just create arbitrary obstacles.",
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
  ],
};

/**
 * Code Review Demo - Technical Collaboration Scenario
 * Shows how agents can review and improve code from different perspectives
 */
export const codeReviewScript: DemoScript = {
  id: 'code-review',
  title: 'Code Review Session',
  description:
    'Technical agents review a React component for security, performance, and best practices',
  agents: [
    {
      id: 'security',
      name: 'Security Auditor',
      systemPrompt:
        'You focus on security vulnerabilities, input validation, and potential attack vectors in code.',
      color: '#dc2626', // red
    },
    {
      id: 'performance',
      name: 'Performance Expert',
      systemPrompt:
        'You analyze code for performance bottlenecks, optimization opportunities, and scalability issues.',
      color: '#2563eb', // blue
    },
    {
      id: 'practices',
      name: 'Best Practices Reviewer',
      systemPrompt:
        'You evaluate code for maintainability, readability, and adherence to coding standards.',
      color: '#059669', // emerald
    },
  ],
  steps: [
    {
      id: 'step-1-composing',
      title: 'User submits code for review',
      userInput:
        '@security @performance @practices please review this user authentication component',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-1-sent',
      title: 'User message sent - agents analyzing code',
      userInput:
        '@security @performance @practices please review this user authentication component',
      expectedAgentResponses: [
        {
          agentId: 'security',
          content:
            '🔍 SECURITY ISSUES FOUND:\n• No input sanitization on email field\n• Password visibility toggle lacks rate limiting\n• JWT storage in localStorage vulnerable to XSS\n• Missing CSRF protection on login endpoint\n• Consider implementing 2FA support',
          isComplete: true,
        },
        {
          agentId: 'performance',
          content:
            '⚡ PERFORMANCE CONCERNS:\n• Re-rendering entire form on every keystroke\n• Missing debouncing on validation\n• Large bundle size from importing entire lodash\n• No lazy loading of validation schema\n• Consider using React.memo for form fields',
          isComplete: true,
        },
        {
          agentId: 'practices',
          content:
            '📋 CODE QUALITY NOTES:\n• Good TypeScript usage overall\n• Consider extracting validation logic to custom hook\n• Error handling could be more specific\n• Missing accessibility attributes (aria-labels)\n• Inconsistent naming convention (camelCase vs kebab-case)',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-1-complete',
      title: 'Agents finished initial review',
      userInput:
        '@security @performance @practices please review this user authentication component',
      expectedAgentResponses: [
        {
          agentId: 'security',
          content:
            '🔍 SECURITY ISSUES FOUND:\n• No input sanitization on email field\n• Password visibility toggle lacks rate limiting\n• JWT storage in localStorage vulnerable to XSS\n• Missing CSRF protection on login endpoint\n• Consider implementing 2FA support',
          isComplete: true,
        },
        {
          agentId: 'performance',
          content:
            '⚡ PERFORMANCE CONCERNS:\n• Re-rendering entire form on every keystroke\n• Missing debouncing on validation\n• Large bundle size from importing entire lodash\n• No lazy loading of validation schema\n• Consider using React.memo for form fields',
          isComplete: true,
        },
        {
          agentId: 'practices',
          content:
            '📋 CODE QUALITY NOTES:\n• Good TypeScript usage overall\n• Consider extracting validation logic to custom hook\n• Error handling could be more specific\n• Missing accessibility attributes (aria-labels)\n• Inconsistent naming convention (camelCase vs kebab-case)',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-2-composing',
      title: 'User asks about security priority',
      userInput: '@security which security issue should I fix first?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-2-sent',
      title: 'User message sent - security agent responding',
      userInput: '@security which security issue should I fix first?',
      expectedAgentResponses: [
        {
          agentId: 'security',
          content:
            'Priority 1: Move JWT from localStorage to httpOnly cookies immediately. This prevents XSS token theft. Priority 2: Add input sanitization - even with a trusted frontend, always validate server-side. The other issues are important but these two are critical vulnerabilities.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-2-complete',
      title: 'Security agent finished responding',
      userInput: '@security which security issue should I fix first?',
      expectedAgentResponses: [
        {
          agentId: 'security',
          content:
            'Priority 1: Move JWT from localStorage to httpOnly cookies immediately. This prevents XSS token theft. Priority 2: Add input sanitization - even with a trusted frontend, always validate server-side. The other issues are important but these two are critical vulnerabilities.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-3-composing',
      title: 'Multi-agent discussion on implementation',
      userInput:
        '@performance @practices how would you implement what #security suggested without hurting performance or code quality?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-3-sent',
      title: 'User message sent - agents discussing solutions',
      userInput:
        '@performance @practices how would you implement what #security suggested without hurting performance or code quality?',
      expectedAgentResponses: [
        {
          agentId: 'performance',
          content:
            "For JWT cookies: Use SameSite=Strict and Secure flags. For validation: implement schema-based validation with Zod - it's fast and tree-shakeable. Use React Hook Form's resolver for efficient re-renders. This actually improves performance by reducing unnecessary validations.",
          isComplete: true,
        },
        {
          agentId: 'practices',
          content:
            'Create a useSecureAuth hook that encapsulates token management. Use a validation utility that returns consistent error shapes. Consider a FormField component that handles validation, accessibility, and security concerns in one place. This makes security fixes reusable across forms.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-3-complete',
      title: 'Agents finished discussing solutions',
      userInput:
        '@performance @practices how would you implement what #security suggested without hurting performance or code quality?',
      expectedAgentResponses: [
        {
          agentId: 'performance',
          content:
            "For JWT cookies: Use SameSite=Strict and Secure flags. For validation: implement schema-based validation with Zod - it's fast and tree-shakeable. Use React Hook Form's resolver for efficient re-renders. This actually improves performance by reducing unnecessary validations.",
          isComplete: true,
        },
        {
          agentId: 'practices',
          content:
            'Create a useSecureAuth hook that encapsulates token management. Use a validation utility that returns consistent error shapes. Consider a FormField component that handles validation, accessibility, and security concerns in one place. This makes security fixes reusable across forms.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-4-composing',
      title: 'User explores performance trade-offs',
      userInput:
        '@performance what performance impacts should I expect from implementing these security changes?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-4-sent',
      title: 'User message sent - performance expert responding',
      userInput:
        '@performance what performance impacts should I expect from implementing these security changes?',
      expectedAgentResponses: [
        {
          agentId: 'performance',
          content:
            'Surprisingly, most security changes will improve performance. httpOnly cookies reduce client-side storage overhead. Zod validation is faster than manual checks. The main cost is the initial bundle size increase (~5KB for Zod), but you can tree-shake unused validators. Debounced validation actually reduces server calls. Overall: slight initial load increase, better runtime performance.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-4-complete',
      title: 'Performance expert finished responding',
      userInput:
        '@performance what performance impacts should I expect from implementing these security changes?',
      expectedAgentResponses: [
        {
          agentId: 'performance',
          content:
            'Surprisingly, most security changes will improve performance. httpOnly cookies reduce client-side storage overhead. Zod validation is faster than manual checks. The main cost is the initial bundle size increase (~5KB for Zod), but you can tree-shake unused validators. Debounced validation actually reduces server calls. Overall: slight initial load increase, better runtime performance.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-5-composing',
      title: 'User requests implementation guidance',
      userInput:
        '@practices @security can you walk me through the step-by-step refactoring process?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-5-sent',
      title: 'User message sent - agents providing implementation plan',
      userInput:
        '@practices @security can you walk me through the step-by-step refactoring process?',
      expectedAgentResponses: [
        {
          agentId: 'practices',
          content:
            '1. Extract validation schema first (no breaking changes). 2. Create useSecureAuth hook with current logic. 3. Replace localStorage with secure cookie handling. 4. Add input sanitization layer. 5. Update component to use new hook. 6. Add accessibility attributes. 7. Test each step incrementally. This prevents big-bang failures.',
          isComplete: true,
        },
        {
          agentId: 'security',
          content:
            'Critical: Test the cookie implementation in dev first - httpOnly cookies behave differently than localStorage. Set up CSRF tokens before removing localStorage completely. Use a feature flag to switch between old/new auth during transition. Have a rollback plan ready. Security changes should never be rushed.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-5-complete',
      title: 'Agents finished providing implementation plan',
      userInput:
        '@practices @security can you walk me through the step-by-step refactoring process?',
      expectedAgentResponses: [
        {
          agentId: 'practices',
          content:
            '1. Extract validation schema first (no breaking changes). 2. Create useSecureAuth hook with current logic. 3. Replace localStorage with secure cookie handling. 4. Add input sanitization layer. 5. Update component to use new hook. 6. Add accessibility attributes. 7. Test each step incrementally. This prevents big-bang failures.',
          isComplete: true,
        },
        {
          agentId: 'security',
          content:
            'Critical: Test the cookie implementation in dev first - httpOnly cookies behave differently than localStorage. Set up CSRF tokens before removing localStorage completely. Use a feature flag to switch between old/new auth during transition. Have a rollback plan ready. Security changes should never be rushed.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
  ],
};

/**
 * Economic Policy Debate Demo - Universal Basic Income Discussion
 * Shows ideological diversity and evidence-based policy analysis
 */
export const economicDebateDemo: DemoScript = {
  id: 'economic-debate',
  title: 'Economic Policy Debate',
  description:
    'Three economists with different perspectives debate Universal Basic Income implementation',
  agents: [
    {
      id: 'market',
      name: 'Free Market Advocate',
      systemPrompt:
        'You analyze policies through the lens of economic efficiency, fiscal responsibility, and market mechanisms.',
      color: '#dc2626', // red
    },
    {
      id: 'progressive',
      name: 'Progressive Economist',
      systemPrompt:
        'You focus on inequality reduction, social justice, and policies that support human dignity and opportunity.',
      color: '#2563eb', // blue
    },
    {
      id: 'data',
      name: 'Data Analyst',
      systemPrompt:
        'You provide empirical evidence, analyze pilot programs, and focus on measurable policy outcomes.',
      color: '#059669', // emerald
    },
  ],
  steps: [
    {
      id: 'step-1-composing',
      title: 'User asks for initial UBI positions',
      userInput:
        '@market @progressive @data What are your initial thoughts on implementing Universal Basic Income in the US?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-1-sent',
      title: 'User message sent - economists analyzing UBI',
      userInput:
        '@market @progressive @data What are your initial thoughts on implementing Universal Basic Income in the US?',
      expectedAgentResponses: [
        {
          agentId: 'market',
          content:
            '🏛️ FISCAL REALITY CHECK:\n• $4+ trillion annual cost for $1000/month to all adults\n• Creates massive work disincentives - why work if guaranteed income?\n• Crowds out private charity and voluntary cooperation\n• Government dependency undermines human agency\n• Better solution: reduce barriers to employment, lower taxes, expand opportunity',
          isComplete: true,
        },
        {
          agentId: 'progressive',
          content:
            '⚖️ SOCIAL JUSTICE IMPERATIVE:\n• 40 million Americans in poverty despite working multiple jobs\n• UBI provides dignity - no means testing, no bureaucratic humiliation\n• Enables entrepreneurship by providing safety net for risk-taking\n• Recognizes unpaid care work, community service, artistic creation\n• Economic security is a human right in the 21st century',
          isComplete: true,
        },
        {
          agentId: 'data',
          content:
            '📊 PILOT PROGRAM EVIDENCE:\n• Stockton, CA: 78% spent on basic needs, only 1% on "vices"\n• Finland: No significant work reduction, improved mental health\n• Kenya GiveDirectly: Local economic multiplier effects\n• Alaska Permanent Fund: Popular across political spectrum for 40+ years\n• Key question: Which design parameters optimize outcomes?',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-1-complete',
      title: 'Economists finished initial positions',
      userInput:
        '@market @progressive @data What are your initial thoughts on implementing Universal Basic Income in the US?',
      expectedAgentResponses: [
        {
          agentId: 'market',
          content:
            '🏛️ FISCAL REALITY CHECK:\n• $4+ trillion annual cost for $1000/month to all adults\n• Creates massive work disincentives - why work if guaranteed income?\n• Crowds out private charity and voluntary cooperation\n• Government dependency undermines human agency\n• Better solution: reduce barriers to employment, lower taxes, expand opportunity',
          isComplete: true,
        },
        {
          agentId: 'progressive',
          content:
            '⚖️ SOCIAL JUSTICE IMPERATIVE:\n• 40 million Americans in poverty despite working multiple jobs\n• UBI provides dignity - no means testing, no bureaucratic humiliation\n• Enables entrepreneurship by providing safety net for risk-taking\n• Recognizes unpaid care work, community service, artistic creation\n• Economic security is a human right in the 21st century',
          isComplete: true,
        },
        {
          agentId: 'data',
          content:
            '📊 PILOT PROGRAM EVIDENCE:\n• Stockton, CA: 78% spent on basic needs, only 1% on "vices"\n• Finland: No significant work reduction, improved mental health\n• Kenya GiveDirectly: Local economic multiplier effects\n• Alaska Permanent Fund: Popular across political spectrum for 40+ years\n• Key question: Which design parameters optimize outcomes?',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-2-composing',
      title: 'User challenges market advocate on work incentives',
      userInput:
        '@market what if the work disincentive concern is overblown? What evidence would change your mind?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-2-sent',
      title: 'User message sent - market advocate responding',
      userInput:
        '@market what if the work disincentive concern is overblown? What evidence would change your mind?',
      expectedAgentResponses: [
        {
          agentId: 'market',
          content:
            "Fair question. I would need to see: 1) Long-term studies (5+ years) showing sustained work participation rates. 2) Evidence that UBI recipients invest in human capital - education, skills, starting businesses. 3) Demonstration that it doesn't create inflation spiral as landlords/retailers raise prices knowing everyone has guaranteed income. 4) Proof it can be funded without destroying economic growth through massive tax increases. Show me those four things consistently across different demographics and regions, and I'll reconsider.",
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-2-complete',
      title: 'Market advocate finished responding',
      userInput:
        '@market what if the work disincentive concern is overblown? What evidence would change your mind?',
      expectedAgentResponses: [
        {
          agentId: 'market',
          content:
            "Fair question. I would need to see: 1) Long-term studies (5+ years) showing sustained work participation rates. 2) Evidence that UBI recipients invest in human capital - education, skills, starting businesses. 3) Demonstration that it doesn't create inflation spiral as landlords/retailers raise prices knowing everyone has guaranteed income. 4) Proof it can be funded without destroying economic growth through massive tax increases. Show me those four things consistently across different demographics and regions, and I'll reconsider.",
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-3-composing',
      title: 'Cross-examination of work incentive concerns',
      userInput:
        '@progressive @data how would you address what #market raised about work incentives and inflation risks?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-3-sent',
      title: 'User message sent - progressive and data analyst responding',
      userInput:
        '@progressive @data how would you address what #market raised about work incentives and inflation risks?',
      expectedAgentResponses: [
        {
          agentId: 'progressive',
          content:
            'The work incentive argument assumes people only work for survival. But humans work for purpose, social connection, status, self-actualization. UBI could unleash creativity by removing desperation. On inflation: housing costs are driven by supply constraints, not demand. Fix zoning laws. Healthcare costs are driven by monopolistic practices, not spending power. UBI lets people choose work that matters rather than any job that pays bills.',
          isComplete: true,
        },
        {
          agentId: 'data',
          content:
            "Addressing #market's specific criteria: 1) Kenya's 12-year GiveDirectly study shows sustained economic activity. 2) Stockton saw 37% increase in full-time employment during pilot. 3) Alaska's PFD hasn't caused systemic inflation over 40 years. 4) Carbon tax or land value capture could fund it progressively. The evidence exists, but you need to look at the right metrics and timeframes.",
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-3-complete',
      title: 'Progressive and data analyst finished responding',
      userInput:
        '@progressive @data how would you address what #market raised about work incentives and inflation risks?',
      expectedAgentResponses: [
        {
          agentId: 'progressive',
          content:
            'The work incentive argument assumes people only work for survival. But humans work for purpose, social connection, status, self-actualization. UBI could unleash creativity by removing desperation. On inflation: housing costs are driven by supply constraints, not demand. Fix zoning laws. Healthcare costs are driven by monopolistic practices, not spending power. UBI lets people choose work that matters rather than any job that pays bills.',
          isComplete: true,
        },
        {
          agentId: 'data',
          content:
            "Addressing #market's specific criteria: 1) Kenya's 12-year GiveDirectly study shows sustained economic activity. 2) Stockton saw 37% increase in full-time employment during pilot. 3) Alaska's PFD hasn't caused systemic inflation over 40 years. 4) Carbon tax or land value capture could fund it progressively. The evidence exists, but you need to look at the right metrics and timeframes.",
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-4-composing',
      title: 'Deep dive into pilot program data',
      userInput:
        '@data break down the pilot program results - what do they actually tell us about scalability?',
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-4-sent',
      title: 'User message sent - data analyst providing detailed analysis',
      userInput:
        '@data break down the pilot program results - what do they actually tell us about scalability?',
      expectedAgentResponses: [
        {
          agentId: 'data',
          content:
            'Critical limitations: Most pilots are small-scale (hundreds, not millions) and short-term (1-2 years, not decades). General equilibrium effects unknown - what happens when EVERYONE has UBI? However, promising signals: 1) No "laptop and drugs" stereotype - spending remarkably rational. 2) Mental health improvements reduce healthcare costs. 3) Administrative costs 90% lower than means-tested programs. 4) Economic multiplier effects in local communities. Key missing data: labor market responses at scale, political sustainability, interaction with existing programs.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-4-complete',
      title: 'Data analyst finished detailed analysis',
      userInput:
        '@data break down the pilot program results - what do they actually tell us about scalability?',
      expectedAgentResponses: [
        {
          agentId: 'data',
          content:
            'Critical limitations: Most pilots are small-scale (hundreds, not millions) and short-term (1-2 years, not decades). General equilibrium effects unknown - what happens when EVERYONE has UBI? However, promising signals: 1) No "laptop and drugs" stereotype - spending remarkably rational. 2) Mental health improvements reduce healthcare costs. 3) Administrative costs 90% lower than means-tested programs. 4) Economic multiplier effects in local communities. Key missing data: labor market responses at scale, political sustainability, interaction with existing programs.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-5-composing',
      title: 'Synthesis challenge - designing compromise system',
      userInput:
        "@market @progressive @data if you had to design a compromise UBI system that addresses everyone's concerns, what would it look like?",
      expectedAgentResponses: [],
      state: 'composing-message',
    },
    {
      id: 'step-5-sent',
      title: 'User message sent - all economists collaborating on compromise',
      userInput:
        "@market @progressive @data if you had to design a compromise UBI system that addresses everyone's concerns, what would it look like?",
      expectedAgentResponses: [
        {
          agentId: 'market',
          content:
            'Compromise position: Start with Earned Income Tax Credit expansion + Child Tax Credit universalization. Phase in gradually by age cohort (18-25 first). Cap at poverty line, not comfort level. Sunset clause requiring Congressional reauthorization every 10 years. Fund through carbon tax + land value capture, not income taxes. Eliminate overlapping programs to avoid bureaucratic bloat. Include work/education/community service incentives.',
          isComplete: true,
        },
        {
          agentId: 'progressive',
          content:
            "I can accept #market's phase-in approach if: 1) We start with those most vulnerable - caregivers, formerly incarcerated, rural communities hit by automation. 2) No means testing - dignity requires universality. 3) Amount provides genuine choice, not just survival. 4) Include housing vouchers/public options to prevent landlord capture. 5) Strong worker protections so UBI doesn't subsidize exploitative employers.",
          isComplete: true,
        },
        {
          agentId: 'data',
          content:
            'Evidence-based synthesis: Randomized controlled trial with 50,000 participants across urban/rural/diverse demographics. Control for spillover effects. Track for 5 years minimum. Measure: work participation, health outcomes, educational attainment, business creation, community engagement, political attitudes. Use findings to calibrate amount, eligibility, funding mechanism. Let data, not ideology, guide scaling decisions.',
          isComplete: true,
        },
      ],
      state: 'message-sent',
    },
    {
      id: 'step-5-complete',
      title: 'All economists finished collaboration',
      userInput:
        "@market @progressive @data if you had to design a compromise UBI system that addresses everyone's concerns, what would it look like?",
      expectedAgentResponses: [
        {
          agentId: 'market',
          content:
            'Compromise position: Start with Earned Income Tax Credit expansion + Child Tax Credit universalization. Phase in gradually by age cohort (18-25 first). Cap at poverty line, not comfort level. Sunset clause requiring Congressional reauthorization every 10 years. Fund through carbon tax + land value capture, not income taxes. Eliminate overlapping programs to avoid bureaucratic bloat. Include work/education/community service incentives.',
          isComplete: true,
        },
        {
          agentId: 'progressive',
          content:
            "I can accept #market's phase-in approach if: 1) We start with those most vulnerable - caregivers, formerly incarcerated, rural communities hit by automation. 2) No means testing - dignity requires universality. 3) Amount provides genuine choice, not just survival. 4) Include housing vouchers/public options to prevent landlord capture. 5) Strong worker protections so UBI doesn't subsidize exploitative employers.",
          isComplete: true,
        },
        {
          agentId: 'data',
          content:
            'Evidence-based synthesis: Randomized controlled trial with 50,000 participants across urban/rural/diverse demographics. Control for spillover effects. Track for 5 years minimum. Measure: work participation, health outcomes, educational attainment, business creation, community engagement, political attitudes. Use findings to calibrate amount, eligibility, funding mechanism. Let data, not ideology, guide scaling decisions.',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
  ],
};

/**
 * Registry of all available demo scripts
 */
export const demoScripts: Record<string, DemoScript> = {
  'character-development': characterDevelopmentScript,
  'code-review': codeReviewScript,
  'economic-debate': economicDebateDemo,
};

/**
 * Get a demo script by ID with fallback
 */
export function getDemoScript(scriptId: string): DemoScript {
  return demoScripts[scriptId] || characterDevelopmentScript;
}

/**
 * Get list of all available demo scripts
 */
export function getAvailableScripts(): Array<{ id: string; title: string; description: string }> {
  return Object.values(demoScripts).map((script) => ({
    id: script.id,
    title: script.title,
    description: script.description,
  }));
}
