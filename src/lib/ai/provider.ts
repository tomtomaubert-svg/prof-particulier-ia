import type { z } from "zod";

// Abstraction AIProvider (section 42) : le reste de l'application ne doit
// jamais dépendre directement d'un SDK IA précis. Pour ce MVP, un seul
// fournisseur réel est branché (GeminiProvider, quota gratuit) mais toute
// nouvelle implémentation (OpenAIProvider, AnthropicProvider...) n'a qu'à
// respecter cette interface pour être routée par le ModelRouter (section 43).

export interface AIImageInput {
  mimeType: string;
  dataBase64: string;
}

export interface StructuredGenerationParams<T> {
  systemPrompt: string;
  userPrompt: string;
  images?: AIImageInput[];
  schema: z.ZodType<T>;
  /** Nombre de tentatives PAR modèle en cas d'échec (défaut 1, soit 2 tentatives). */
  maxRetries?: number;
  /** Budget de temps total, tous modèles/tentatives confondus, en ms (défaut 40000). */
  deadlineMs?: number;
}

export interface AIProvider {
  readonly name: string;
  generateStructured<T>(params: StructuredGenerationParams<T>): Promise<T>;
}

export class AIProviderError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "AIProviderError";
  }
}
