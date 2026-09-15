import { AIProviderError } from "./provider";
import { UnreadableContentError } from "./errors";

const OVERLOAD_MESSAGE =
  "Les serveurs Gemini (IA gratuite) sont temporairement surchargés. Ce n'est pas un problème avec ton compte ni ta photo — réessaie dans une minute ou deux.";
const QUOTA_MESSAGE =
  "Le quota gratuit de l'IA est momentanément atteint. Réessaie dans quelques minutes.";

/**
 * Message affiché à l'élève quand un pipeline IA échoue, partagé par les 3
 * modules. Simplifie les erreurs de surcharge/quota Gemini (attendues sur un
 * tier gratuit) en un message rassurant plutôt que la trace technique brute
 * — celle-ci reste dans les logs serveur (console.error côté GeminiProvider)
 * pour le diagnostic.
 */
export function describePipelineError(err: unknown): string {
  if (err instanceof UnreadableContentError) return err.message;
  if (err instanceof AIProviderError) {
    if (/503|overloaded|high demand/i.test(err.message)) return OVERLOAD_MESSAGE;
    if (/429|quota exceeded|resource_exhausted/i.test(err.message)) return QUOTA_MESSAGE;
    return err.message;
  }
  return "Une erreur est survenue pendant l'analyse. Réessaie dans quelques instants.";
}
