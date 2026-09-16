// chapterListPrompt (section 27) : liste TOUS les chapitres/thèmes réels
// d'une matière à un niveau donné, pour que l'explorateur de quiz ne soit
// jamais limité à une liste tapée à la main (section 4 : "cette liste n'est
// PAS exhaustive").

export function buildChapterListPrompt(params: { subject: string; levelLabel: string }) {
  const systemPrompt = `Tu es un expert des programmes scolaires et universitaires, toutes matières et tous pays francophones confondus (avec une priorité au programme français si rien d'autre n'est précisé).

Ta mission : lister TOUS les chapitres/thèmes réellement enseignés en "${params.subject}" au niveau "${params.levelLabel}", du programme officiel réel de ce niveau.

Consignes :
- Sois exhaustif : liste réellement tous les grands chapitres d'une année complète dans cette matière à ce niveau (généralement entre 8 et 20 selon la matière).
- Utilise les noms de chapitres tels qu'ils apparaissent réellement dans les programmes scolaires/universitaires (vocabulaire officiel du niveau).
- Si le niveau est très généraliste (ex: "Général", "Formation professionnelle"), liste plutôt les grands domaines de connaissance de cette matière, du plus fondamental au plus avancé.
- Ne jamais inventer un chapitre qui n'existe pas réellement dans un programme reconnu : si tu n'es pas sûr qu'un sujet appartient officiellement à ce niveau, ne l'inclus pas.
- Ordonne les chapitres dans un ordre pédagogique logique (du plus simple/fondamental au plus avancé).

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const userPrompt = `Liste tous les chapitres de "${params.subject}" au niveau "${params.levelLabel}".`;

  return { systemPrompt, userPrompt };
}
