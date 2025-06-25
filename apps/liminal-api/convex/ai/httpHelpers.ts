"use node";

import { ProviderName } from "./providers";
import { model } from "./modelBuilder";

// Helper to create model for HTTP endpoints
export async function createModelForHttp(
  provider: ProviderName,
  modelId?: string,
  providerOptions?: Record<string, any>
) {
  const builder = model(provider);
  if (modelId) builder.withModel(modelId);
  if (providerOptions) builder.withProviderOptions(providerOptions);
  
  return builder.build();
}

// Get headers for Vercel AI SDK streaming
export function getStreamingHeaders() {
  const headers = new Headers();
  headers.set("X-Vercel-AI-Data-Stream", "v1");
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return headers;
}