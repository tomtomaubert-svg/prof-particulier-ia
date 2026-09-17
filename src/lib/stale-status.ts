// Filet de sécurité : si un traitement reste "en cours" plus longtemps que le
// budget de temps du pipeline pourrait raisonnablement le justifier, c'est
// qu'il a été interrompu (fonction serverless tuée par la plateforme,
// process redémarré...) et ne se terminera jamais. Sans ça, la page afficherait
// "Analyse en cours…" indéfiniment. Le seuil est volontairement large (au-delà
// du budget pipeline de 50s + marge réseau) pour ne jamais couper un
// traitement réellement en cours.
const STALE_AFTER_MS = 90_000;

const IN_PROGRESS_STATUSES = new Set([
  "pending",
  "analyzing",
  "solving",
  "verifying",
  "evaluating-quality",
  "creating",
  "explaining",
  "generating",
]);

export function isStaleInProgress(status: string, createdAt: Date): boolean {
  return IN_PROGRESS_STATUSES.has(status) && Date.now() - createdAt.getTime() > STALE_AFTER_MS;
}

export const STALE_ERROR_MESSAGE =
  "L'analyse a été interrompue (délai serveur dépassé). Relance l'analyse.";
