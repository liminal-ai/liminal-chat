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
      id: 'step-1',
      title: 'User submits code for review',
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
      id: 'step-2',
      title: 'User asks about security priority',
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
      id: 'step-3',
      title: 'Cross-agent discussion on solutions',
      userInput:
        '@performance @practices how would you implement the security fixes without hurting performance or code quality?',
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
  ],
};

/**
 * Creative Brainstorming Demo - Story Development Scenario
 * Shows open-ended creative collaboration between agents
 */
export const brainstormingScript: DemoScript = {
  id: 'creative-brainstorming',
  title: 'Story Ending Brainstorm',
  description: 'Writers collaborate to find the perfect ending for a sci-fi mystery',
  agents: [
    {
      id: 'plot',
      name: 'Plot Architect',
      systemPrompt:
        'You focus on story structure, plot coherence, and narrative satisfaction. You ensure all plot threads resolve meaningfully.',
      color: '#7c3aed', // violet
    },
    {
      id: 'emotion',
      name: 'Emotional Storyteller',
      systemPrompt:
        'You prioritize character development and emotional impact. You ensure the story resonates with readers on a personal level.',
      color: '#e11d48', // rose
    },
    {
      id: 'wild',
      name: 'Wild Card',
      systemPrompt:
        'You suggest unexpected twists and unconventional approaches. You push creative boundaries and challenge assumptions.',
      color: '#f97316', // orange
    },
  ],
  steps: [
    {
      id: 'step-1',
      title: 'User describes the story dilemma',
      userInput:
        "@plot @emotion @wild I'm stuck on the ending. My protagonist discovers that saving Earth means sacrificing their home planet. How should this resolve?",
      expectedAgentResponses: [
        {
          agentId: 'plot',
          content:
            "This is a classic moral dilemma with rich dramatic potential. The key is ensuring the choice feels inevitable based on character development. Has the protagonist's journey prepared them for this sacrifice? Consider: what would choosing their home planet cost Earth, and vice versa? The weight of either choice should feel earned.",
          isComplete: true,
        },
        {
          agentId: 'emotion',
          content:
            "Focus on the emotional core - what does \"home\" mean to your protagonist? Is it the planet itself, or the people and memories there? Maybe the real conflict isn't between two planets, but between duty and belonging. The ending should honor both what they're saving and what they're losing.",
          isComplete: true,
        },
        {
          agentId: 'wild',
          content:
            'What if it\'s a false choice? Maybe the "sacrifice" is actually a transformation - saving Earth requires merging it with the home planet somehow. Or the protagonist discovers they\'re not actually from either planet, making the choice both easier and more complex. Challenge the premise itself!',
          isComplete: true,
        },
      ],
      state: 'agents-complete',
    },
    {
      id: 'step-2',
      title: 'User explores the transformation idea',
      userInput:
        '@wild @plot how would a planet merger work narratively? Would that feel like a cop-out?',
      expectedAgentResponses: [
        {
          agentId: 'wild',
          content:
            'Not if it\'s foreshadowed! What if earlier "alien technology" was actually Earth-tech from the future? The merger could be revealing a deeper connection - maybe the protagonist\'s home planet IS Earth, just from a different timeline. The choice becomes: preserve the past or create a new future.',
          isComplete: true,
        },
        {
          agentId: 'plot',
          content:
            "A merger works if it requires genuine sacrifice from the protagonist. Maybe they must give up their individual existence to become the bridge between worlds. It's not a cop-out if it's the hardest choice possible - losing yourself to save everyone. The resolution feels earned if the cost is personal.",
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
  'creative-brainstorming': brainstormingScript,
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
