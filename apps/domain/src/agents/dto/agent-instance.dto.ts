import { z } from "zod";

export const AgentContextSchema = z.object({
  conversationHistory: z.array(z.record(z.any())).default([]),
  workingMemory: z.record(z.any()).default({}),
  currentTask: z.string().optional(),
});

export const AgentInstanceSchema = z.object({
  agentId: z.string(),
  agentName: z.string().min(1).max(200),
  typeName: z.string().min(1),
  prompt: z.string().optional(),
  context: AgentContextSchema.default({}),
  persistentData: z.record(z.any()).default({}),
  createdAt: z.preprocess((v) => {
    if (typeof v === "string") return new Date(v);
    return v;
  }, z.date()),
  updatedAt: z.preprocess((v) => {
    if (typeof v === "string") return new Date(v);
    return v;
  }, z.date()),
});

export type AgentInstance = z.infer<typeof AgentInstanceSchema>;
export type AgentContext = z.infer<typeof AgentContextSchema>;

export const CreateAgentInstanceDto = z.object({
  agentName: z.string().min(1).max(200),
  typeName: z.string().min(1),
  prompt: z.string().optional(),
  persistentData: z.record(z.any()).default({}),
});

export const UpdateAgentInstanceDto = z.object({
  agentName: z.string().min(1).max(200).optional(),
  typeName: z.string().min(1).optional(),
  prompt: z.string().optional(),
  context: AgentContextSchema.optional(),
  persistentData: z.record(z.any()).optional(),
});

export const ExecuteAgentDto = z.object({
  prompt: z.string().min(1),
  context: z.record(z.any()).optional(),
});

export type CreateAgentInstanceDto = z.infer<typeof CreateAgentInstanceDto>;
export type UpdateAgentInstanceDto = z.infer<typeof UpdateAgentInstanceDto>;
export type ExecuteAgentDto = z.infer<typeof ExecuteAgentDto>;
