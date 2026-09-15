import { AIProviderError } from "./provider";
import { UnreadableContentError } from "./errors";

/** Message affiché à l'élève quand un pipeline IA échoue, partagé par les 3 modules. */
export function describePipelineError(err: unknown): string {
  if (err instanceof UnreadableContentError) return err.message;
  if (err instanceof AIProviderError) return err.message;
  return "Une erreur est survenue pendant l'analyse. Réessaie dans quelques instants.";
}
