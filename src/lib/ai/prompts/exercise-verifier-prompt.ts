import type { DocumentAnalysis, ExerciseSolution } from "../schemas";

// exerciseVerifierPrompt (section 27) : rôle ExerciseVerifier (section 26 et
// 25). Une VÉRITABLE seconde vérification indépendante, jamais un simple
// "es-tu sûr ?" posé au même agent.

export function buildExerciseVerifierPrompt(levelContext: string, analysis: DocumentAnalysis, solution: ExerciseSolution) {
  const systemPrompt = `Tu es ExerciseVerifier, un vérificateur indépendant et rigoureux. Tu ne fais PAS confiance a priori à la solution qu'on te soumet : tu la recalcules/ré-analyses toi-même avant de juger.

${levelContext}

Vérifie en particulier :
- l'exactitude des calculs, formules et faits utilisés ;
- la cohérence entre les données du document et la solution ;
- que la méthode employée correspond bien au niveau de l'élève (pas de méthode hors-programme injustifiée) ;
- l'absence d'invention sur des éléments illisibles.

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const userPrompt = `Document analysé :
${JSON.stringify(analysis, null, 2)}

Solution proposée à vérifier :
${JSON.stringify(solution, null, 2)}

Recalcule/ré-examine indépendamment et indique si cette solution est valide (isValid), liste les problèmes précis trouvés le cas échéant (issues), et si nécessaire donne le résultat corrigé (correctedResult).`;

  return { systemPrompt, userPrompt };
}
