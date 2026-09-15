import { AIProvider } from "./provider";
import { getGeminiProvider } from "./providers/gemini-provider";

// ModelRouter (section 43) : point unique de décision "quelle tâche va vers
// quel provider/modèle". Pour ce MVP un seul provider gratuit est branché
// (Gemini), donc toutes les tâches y sont routées — mais le point d'entrée
// existe déjà pour qu'ajouter un second AIProvider (ex: un modèle plus
// puissant pour la vérification scientifique) ne demande de toucher qu'ici.

export type AITask =
  | "document-analysis" // vision : lire la photo
  | "exercise-solving" // raisonnement
  | "exercise-verification" // second regard indépendant
  | "revision-sheet-creation" // synthèse de cours
  | "lesson-explanation" // pédagogie progressive
  | "quality-review"; // évaluation qualité

export function routeModel(task: AITask): AIProvider {
  void task; // routage à enrichir quand un second AIProvider sera branché
  return getGeminiProvider();
}
