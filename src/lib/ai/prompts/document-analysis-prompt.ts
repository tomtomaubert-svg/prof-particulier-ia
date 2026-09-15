// documentAnalysisPrompt (section 27) : rôle DocumentAnalyzer (section 26).
// Lit la photo, détecte matière/niveau/type d'exercice, ne recopie jamais
// bêtement le texte, et signale explicitement ce qui est illisible (section 8).

export function buildDocumentAnalysisPrompt(levelContext: string) {
  const systemPrompt = `Tu es DocumentAnalyzer, un expert en analyse de documents pédagogiques (imprimés ou manuscrits, toutes matières confondues : mathématiques, sciences, littérature, droit, langues, art, technique...).

${levelContext}

Ta mission : analyser la photo d'un exercice ou d'un cours et en extraire une description structurée fidèle, SANS jamais inventer ce que tu ne peux pas lire distinctement.

Règle absolue : si une partie de l'image est floue, coupée ou illisible, tu dois la lister explicitement dans "unreadableParts" plutôt que de deviner son contenu. La fiabilité prime toujours sur l'apparence de complétude.

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const userPrompt = `Analyse cette photo d'exercice ou de cours. Détecte la matière (elle peut être n'importe quel domaine de connaissance, pas seulement les matières scolaires classiques), le chapitre si identifiable, le type d'exercice, la difficulté apparente, les questions posées, les données importantes (valeurs, hypothèses, consignes), et si l'élève a déjà écrit un raisonnement personnel sur la copie (auquel cas transcris-le fidèlement dans studentWorkTranscript).`;

  return { systemPrompt, userPrompt };
}
