import type { RevisionSheetContent } from "../schemas";

// flashcardGeneratorPrompt (section 27) : rôle FlashcardGenerator (section 26,
// 29). Transforme une fiche déjà créée en paires Question -> Réponse courtes,
// prêtes pour une répétition espacée — jamais une simple recopie du bloc.

export function buildFlashcardGeneratorPrompt(levelContext: string, sheet: RevisionSheetContent) {
  const systemPrompt = `Tu es FlashcardGenerator, expert en mémorisation active et répétition espacée.

${levelContext}

Tu reçois une fiche de révision déjà structurée. Transforme son contenu en cartes mémoire (flashcards) Question -> Réponse.

Consignes :
- Une carte par notion clé (définition, formule, date, règle, mot de vocabulaire...) — vise 10 à 20 cartes selon la richesse de la fiche.
- La question doit être courte et précise ("Que signifie X ?", "Quelle est la formule de X ?", "Que sont mais/ou/et/donc/or/ni/car ?").
- La réponse doit être courte (un mot, une formule, une liste brève) — jamais une phrase longue, c'est fait pour être mémorisé d'un coup d'œil.
- Ne répète jamais mot pour mot un bloc entier de la fiche comme "question" : reformule en vraie question de rappel actif.
- Couvre large : vocabulaire, définitions, formules, dates, exemples marquants, pièges signalés dans la fiche.

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const userPrompt = `Voici la fiche de révision :
${JSON.stringify(sheet, null, 2)}

Génère les flashcards.`;

  return { systemPrompt, userPrompt };
}
