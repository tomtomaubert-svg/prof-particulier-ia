import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIProviderError, StructuredGenerationParams } from "../provider";

// GeminiProvider : seule implémentation réellement branchée dans ce MVP.
// Choix motivé par la contrainte "gratuit" du produit : l'API Gemini (via
// Google AI Studio) propose un tier gratuit sans carte bancaire, et son
// modèle est nativement multimodal (une seule requête lit l'image ET
// raisonne dessus, pas besoin d'un service OCR séparé et payant).
//
// Respecte l'interface AIProvider : n'importe quel autre fournisseur
// (OpenAIProvider, AnthropicProvider...) peut être ajouté plus tard sans
// changer le reste de l'application (section 42/43 du cahier des charges).
//
// IMPORTANT : les alias "-latest" (ex: gemini-flash-latest) peuvent pointer
// vers un modèle tout juste sorti avec un quota gratuit encore très restreint
// (observé : 20 requêtes/jour sur gemini-3.8-flash). Les anciens modèles
// "2.5" ne sont eux plus accessibles aux nouvelles clés API (retirés par
// Google). On priorise donc les variantes "flash-lite" les plus établies de
// la génération actuelle (quota gratuit généralement plus généreux que les
// modèles "flash" complets tout juste sortis), avec repli automatique sur le
// modèle suivant si le quota est dépassé (429) plutôt que de marteler le
// même modèle.
const DEFAULT_MODEL_CHAIN = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenerativeAI;
  private models: string[];

  constructor(apiKey: string, models: string[] = getConfiguredModelChain()) {
    if (!apiKey) {
      throw new AIProviderError("GEMINI_API_KEY manquante. Obtiens une clé gratuite sur https://aistudio.google.com/apikey");
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.models = models;
  }

  async generateStructured<T>(params: StructuredGenerationParams<T>): Promise<T> {
    // maxRetries volontairement bas (1 = 2 tentatives par modèle) : mieux
    // vaut essayer plus de modèles différents dans le budget de temps
    // disponible que retenter longuement le même modèle en difficulté.
    const { systemPrompt, userPrompt, images = [], schema, maxRetries = 1 } = params;

    const baseParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
      { text: userPrompt },
      ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.dataBase64 } })),
    ];

    // Budget de temps global : les fonctions serverless (Vercel Hobby) sont
    // tuées net à 60s sans que le code n'ait la main pour répondre proprement
    // ni enregistrer l'échec en base. On s'arrête nous-mêmes bien avant pour
    // toujours pouvoir répondre avec un message clair.
    const startedAt = Date.now();
    const deadlineMs = params.deadlineMs ?? 40_000;
    const timeLeft = () => deadlineMs - (Date.now() - startedAt);

    let lastError: unknown;
    for (const modelName of this.models) {
      if (timeLeft() <= 0) break;

      const model = this.client.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      const parts = [...baseParts];

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (timeLeft() <= 0) break;
        try {
          const result = await model.generateContent(parts);
          const text = result.response.text();
          const parsed = safeJsonParse(text);
          const validated = schema.safeParse(parsed);
          if (validated.success) return validated.data;
          lastError = validated.error;
          parts.push({
            text: `Ta précédente réponse JSON était invalide par rapport au schéma attendu : ${validated.error.message}. Renvoie UNIQUEMENT un JSON valide et complet, sans texte autour.`,
          });
        } catch (err) {
          lastError = err;
          console.error(`[GeminiProvider] ${modelName} tentative ${attempt + 1}/${maxRetries + 1} échouée:`, err);

          if (isQuotaExceeded(err)) {
            // Quota épuisé : retenter le même modèle ne servira à rien,
            // on passe directement au modèle de repli suivant.
            break;
          }
          if (attempt < maxRetries && isOverloaded(err) && timeLeft() > 2000) {
            // Surcharge temporaire (503) : on laisse passer un peu de
            // temps avant de retenter, plutôt que de marteler l'API —
            // mais seulement s'il reste assez de budget pour le faire.
            await sleep(Math.min(1500 * (attempt + 1), Math.max(timeLeft() - 1000, 0)));
          }
        }
      }
    }

    throw new AIProviderError(
      `Échec de génération structurée Gemini (tous modèles épuisés : ${this.models.join(", ")}) : ${describeError(lastError)}`,
      lastError
    );
  }
}

function getConfiguredModelChain(): string[] {
  const configured = process.env.GEMINI_MODEL;
  if (!configured) return DEFAULT_MODEL_CHAIN;
  // GEMINI_MODEL peut lister plusieurs modèles séparés par des virgules pour
  // personnaliser la chaîne de repli sans toucher au code.
  return configured
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

function isQuotaExceeded(err: unknown): boolean {
  const message = describeError(err);
  return /429|quota exceeded|resource_exhausted/i.test(message);
}

function isOverloaded(err: unknown): boolean {
  const message = describeError(err);
  return /503|overloaded|high demand/i.test(message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return String(err);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // tombe dans le throw ci-dessous
      }
    }
    throw new Error("Réponse IA non JSON");
  }
}

let cachedProvider: GeminiProvider | null = null;

export function getGeminiProvider(): GeminiProvider {
  if (!cachedProvider) {
    cachedProvider = new GeminiProvider(process.env.GEMINI_API_KEY || "");
  }
  return cachedProvider;
}
