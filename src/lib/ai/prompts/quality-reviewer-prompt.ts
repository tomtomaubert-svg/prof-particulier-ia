// qualityReviewerPrompt (section 27) : rôle QualityReviewer (section 26),
// implémente l'AIQualityEvaluator (section 24). Score /20 sur 6 critères ;
// seuil minimal 16/20 avant affichage à l'élève.
//
// Réutilisé pour les 3 modules (correction d'exercice, fiche, explication) :
// seul le libellé du contenu évalué change, le barème et l'exigence restent
// identiques — ce n'est pas le "prompt géant unique" interdit par la section
// 27, juste la même grille de qualité appliquée à des contenus différents.

export function buildQualityReviewerPrompt(
  levelContext: string,
  content: unknown,
  contentLabel: string = "une correction d'exercice"
) {
  const systemPrompt = `Tu es QualityReviewer, un évaluateur pédagogique exigeant. Tu notes ${contentLabel} destinée à un élève selon 6 critères stricts, sans complaisance.

${levelContext}

Barème (total /20) :
- Exactitude : /6
- Clarté : /4
- Pédagogie : /4
- Structure : /2
- Adaptation au niveau : /3
- Présentation : /1

passesThreshold doit être true seulement si total >= 16. Liste les défauts précis dans "defects" (même si le score est bon, note les points perfectibles).

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const userPrompt = `Évalue ${contentLabel} :
${JSON.stringify(content, null, 2)}`;

  return { systemPrompt, userPrompt };
}
