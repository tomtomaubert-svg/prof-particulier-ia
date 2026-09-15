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
export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = process.env.GEMINI_MODEL || "gemini-flash-latest") {
    if (!apiKey) {
      throw new AIProviderError("GEMINI_API_KEY manquante. Obtiens une clé gratuite sur https://aistudio.google.com/apikey");
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateStructured<T>(params: StructuredGenerationParams<T>): Promise<T> {
    const { systemPrompt, userPrompt, images = [], schema, maxRetries = 2 } = params;

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
      { text: userPrompt },
      ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.dataBase64 } })),
    ];

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
      }
    }
    throw new AIProviderError(`Échec de génération structurée Gemini après ${maxRetries + 1} tentatives`, lastError);
  }
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
