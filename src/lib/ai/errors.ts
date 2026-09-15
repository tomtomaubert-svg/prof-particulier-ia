// Erreur dédiée quand le DocumentAnalyzer signale une confiance trop basse
// (section 8 : "ne jamais inventer"). Plutôt que de laisser le pipeline
// continuer vers ExerciseSolver/RevisionSheetCreator/LessonExplainer sur la
// base d'une analyse quasi vide, on arrête tôt avec un message honnête.
export class UnreadableContentError extends Error {
  constructor(message = "Cette photo n'est pas assez lisible pour être analysée. Reprends une photo plus nette, bien cadrée et avec un bon éclairage.") {
    super(message);
    this.name = "UnreadableContentError";
  }
}
