import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Fournisseur AI SDK connecté à la passerelle Lovable AI. */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
