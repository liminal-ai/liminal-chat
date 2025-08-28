export type Role = 'user' | 'assistant' | 'system';

export type Capability = 'fast' | 'smart' | 'deep' | 'deep-thinking';

export interface MessageProvenance {
  capability: Capability;
  brandHint?: string; // e.g., "Claude Sonnet 4"
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
  whyChosen?: string; // one-line reason
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: Role;
  text: string;
  ts: number;
  pending?: boolean;
  stopped?: boolean;
  metadata?: {
    provenance?: MessageProvenance;
    artifactIds?: string[];
  };
}

export type StreamStatus = 'idle' | 'sending' | 'streaming' | 'error';

export interface Artifact {
  id: string;
  name: string;
  type: 'doc' | 'code' | 'img' | 'data';
}
