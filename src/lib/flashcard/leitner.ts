export type FlashcardReviewResult = "know" | "review" | "dontknow";

// Boîtes de Leitner (section 29) : l'intervalle avant la prochaine
// présentation grandit avec la boîte. Box 1 = à revoir presque tout de
// suite, box 5 = quasi maîtrisée.
const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

const MAX_BOX = 5;

export function applyFlashcardReview(
  currentBox: number,
  result: FlashcardReviewResult
): { box: number; nextReviewAt: Date } {
  const now = Date.now();

  if (result === "know") {
    const box = Math.min(MAX_BOX, currentBox + 1);
    const days = BOX_INTERVAL_DAYS[box] ?? 14;
    return { box, nextReviewAt: new Date(now + days * 24 * 60 * 60 * 1000) };
  }

  if (result === "review") {
    // Reste dans la même boîte mais revient vite, y compris dans la
    // session en cours.
    return { box: currentBox, nextReviewAt: new Date(now + 60 * 60 * 1000) };
  }

  // "dontknow" : retour à la case départ, dispo immédiatement (redemandée
  // dans la session en cours).
  return { box: 1, nextReviewAt: new Date(now) };
}
