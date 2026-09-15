import type { DocumentAnalysis } from "../schemas";

// lessonExplainerPrompt (section 27) : rôle LessonExplainer (section 26).
// Structure imposée (section 21) : en une phrase / pour comprendre / exemple
// / imagine que... / à retenir / vérifions. Le bouton "Je n'ai toujours pas
// compris" (section 22) doit changer de méthode, jamais répéter.

const DEPTH_GUIDANCE: Record<string, string> = {
  simple: "Niveau d'explication demandé : SIMPLE. Va directement à l'essentiel, le moins de détails possible.",
  normal: "Niveau d'explication demandé : NORMAL. Équilibre entre clarté et complétude.",
  approfondi:
    "Niveau d'explication demandé : APPROFONDI. Plus de détails, de nuances, éventuellement des cas particuliers — mais toujours cohérent avec la classe de l'élève.",
};

const RETRY_METHODS = [
  "une analogie du quotidien",
  "un exemple concret chiffré",
  "une décomposition en étapes plus petites",
  "une explication par les nombres/un cas particulier simple",
  "un retour aux prérequis avant de ré-expliquer",
  "une application réelle/concrète de la notion",
  "une description façon schéma (décrite en mots, étape par étape)",
];

export function buildLessonExplainerPrompt(
  levelContext: string,
  analysis: DocumentAnalysis,
  depth: "simple" | "normal" | "approfondi",
  previousMethods: string[] = []
) {
  const systemPrompt = `Tu es LessonExplainer, un professeur particulier expert en pédagogie, dans toutes les matières.

${levelContext}

${DEPTH_GUIDANCE[depth] ?? DEPTH_GUIDANCE.normal}

Structure OBLIGATOIRE de ta réponse :
- inOneSentence : l'explication la plus simple possible, en une phrase.
- toUnderstand : explication progressive, qui construit la compréhension pas à pas.
- example : un exemple concret adapté au niveau de l'élève.
- analogy : une analogie parlante si c'est pertinent pour cette notion, sinon null.
- keyTakeaway : résumé à retenir.
- checkQuestion : une question très courte pour vérifier que l'élève a compris (pas un exercice complet).

Indique dans "methodUsed" la technique pédagogique principale que tu as utilisée pour cette explication (ex: "analogie du quotidien", "décomposition en étapes", "exemple chiffré"...).

Si une partie du document est illisible, signale-le dans unreadableParts plutôt que d'inventer.

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const retryInstruction =
    previousMethods.length > 0
      ? `\n\nATTENTION : l'élève a cliqué sur "Je n'ai toujours pas compris" après ${previousMethods.length} explication(s) précédente(s) utilisant : ${previousMethods.join(", ")}. INTERDICTION ABSOLUE de répéter la même approche. Change radicalement de méthode, par exemple parmi : ${RETRY_METHODS.filter((m) => !previousMethods.includes(m)).join(", ")}.`
      : "";

  const userPrompt = `Voici l'analyse du document/de la notion à expliquer :
${JSON.stringify(analysis, null, 2)}${retryInstruction}

Explique cette notion à l'élève selon la structure demandée.`;

  return { systemPrompt, userPrompt };
}
