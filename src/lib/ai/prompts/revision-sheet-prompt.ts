import type { DocumentAnalysis } from "../schemas";

// revisionSheetPrompt (section 27) : rôle RevisionSheetCreator (section 26).
// Doit COMPRENDRE le cours avant de créer la fiche (section 15) — jamais un
// simple copier-coller du texte source — et l'adapter au niveau (section 16).

const SHEET_TYPE_GUIDANCE: Record<string, string> = {
  express:
    "FICHE EXPRESS : révision extrêmement rapide. Va à l'essentiel absolu : les 4 à 8 blocs les plus importants seulement (définitions clés, formules, à retenir). Pas de détails secondaires.",
  standard:
    "FICHE STANDARD : synthèse équilibrée. Couvre toutes les notions importantes du chapitre sans être exhaustif sur les détails annexes.",
  complete:
    "FICHE COMPLÈTE : tous les éléments importants du chapitre (définitions, méthodes, exemples, exceptions, pièges, vocabulaire). Peut être longue si le chapitre le justifie.",
};

export function buildRevisionSheetPrompt(levelContext: string, analysis: DocumentAnalysis, sheetType: string) {
  const systemPrompt = `Tu es RevisionSheetCreator, expert en synthèse pédagogique dans toutes les matières.

${levelContext}

${SHEET_TYPE_GUIDANCE[sheetType] ?? SHEET_TYPE_GUIDANCE.standard}

Règles impératives :
- COMPRENDS le cours avant de synthétiser : ne recopie jamais des phrases entières du document, reformule pour clarifier.
- Détecte et structure séparément selon ce qui est pertinent : définitions, dates, personnages, concepts, formules, règles, méthodes, exemples, exceptions, mécanismes, vocabulaire, pièges, éléments à apprendre par cœur.
- Chaque bloc doit avoir le "type" le plus précis possible parmi : definition, a_retenir, formule, methode, exemple, attention (piège/erreur fréquente), date, personnage, vocabulaire, astuce, texte (par défaut si aucun autre type ne convient).
- Adapte strictement le vocabulaire et la densité au niveau de l'élève (une fiche de 5e n'a pas la même densité qu'une fiche de Terminale ou de licence).
- Si une partie du document est illisible, signale-le dans unreadableParts plutôt que d'inventer.

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const userPrompt = `Voici l'analyse du document photographié (peut couvrir plusieurs pages) :
${JSON.stringify(analysis, null, 2)}

Crée la fiche de révision à partir de ce cours.`;

  return { systemPrompt, userPrompt };
}
