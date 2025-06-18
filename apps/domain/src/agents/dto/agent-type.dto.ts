import { z } from "zod";

export const AgentTypeSchema = z.object({
  typeName: z.string().min(1).max(100),
  systemPrompt: z.string().min(1),
  toolAccess: z.array(z.string()).default([]),
  persistenceSchema: z.record(z.any()).optional(),
});

export type AgentType = z.infer<typeof AgentTypeSchema>;

export const CreateAgentTypeDto = AgentTypeSchema;
export const UpdateAgentTypeDto = AgentTypeSchema.partial();

export type CreateAgentTypeDto = z.infer<typeof CreateAgentTypeDto>;
export type UpdateAgentTypeDto = z.infer<typeof UpdateAgentTypeDto>;
