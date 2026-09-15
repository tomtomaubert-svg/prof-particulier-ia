// Catalogue des niveaux scolaires (France par défaut, section 36 du cahier des
// charges : l'architecture reste ouverte à d'autres systèmes scolaires plus tard
// via le champ `country` de StudentProfile).
//
// Chaque niveau porte les informations qui pilotent réellement l'IA : âge
// approximatif, vocabulaire/notions supposées acquises, méthode attendue. Ce
// n'est pas un simple libellé : `buildLevelContext` ci-dessous l'injecte dans
// tous les prompts (section 2 et 3 du cahier des charges).

export type LevelGroup = "PRIMAIRE" | "COLLEGE" | "LYCEE" | "SUPERIEUR" | "AUTRE";

export type LevelTrack = "GENERALE" | "TECHNOLOGIQUE" | "PROFESSIONNELLE";

export interface SchoolLevelDef {
  code: string;
  group: LevelGroup;
  label: string;
  ageMin: number;
  ageMax: number;
  /** Notions et méthodes que l'élève est censé déjà maîtriser à ce stade. */
  expectedBaseline: string;
  /** Registre de langue / vocabulaire attendu dans les explications. */
  vocabularyGuidance: string;
  hasTrackAndSpecialities?: boolean;
}

export const SCHOOL_LEVELS: SchoolLevelDef[] = [
  { code: "CP", group: "PRIMAIRE", label: "CP", ageMin: 6, ageMax: 7,
    expectedBaseline: "lecture syllabique en cours d'acquisition, dénombrement jusqu'à 100, additions simples",
    vocabularyGuidance: "phrases très courtes, mots simples, aucun terme abstrait" },
  { code: "CE1", group: "PRIMAIRE", label: "CE1", ageMin: 7, ageMax: 8,
    expectedBaseline: "lecture courante en construction, additions/soustractions posées, tables de multiplication débutées",
    vocabularyGuidance: "phrases courtes, vocabulaire concret, exemples du quotidien" },
  { code: "CE2", group: "PRIMAIRE", label: "CE2", ageMin: 8, ageMax: 9,
    expectedBaseline: "lecture courante, les 4 opérations posées, tables de multiplication",
    vocabularyGuidance: "vocabulaire simple, phrases courtes, exemples concrets" },
  { code: "CM1", group: "PRIMAIRE", label: "CM1", ageMin: 9, ageMax: 10,
    expectedBaseline: "fractions simples, grands nombres, conjugaison au présent/passé composé",
    vocabularyGuidance: "vocabulaire simple mais un peu plus riche, premières notions abstraites illustrées par des exemples" },
  { code: "CM2", group: "PRIMAIRE", label: "CM2", ageMin: 10, ageMax: 11,
    expectedBaseline: "fractions, décimaux, proportionnalité simple, grammaire de base",
    vocabularyGuidance: "vocabulaire simple, notions abstraites toujours accompagnées d'exemples concrets" },
  { code: "6E", group: "COLLEGE", label: "6e", ageMin: 11, ageMax: 12,
    expectedBaseline: "nombres décimaux, fractions simples, géométrie de base (périmètre, aire), grammaire collège débutante",
    vocabularyGuidance: "vocabulaire accessible, pas de jargon non défini" },
  { code: "5E", group: "COLLEGE", label: "5e", ageMin: 12, ageMax: 13,
    expectedBaseline: "nombres relatifs, fractions, théorème de Pythagore non encore vu, proportionnalité",
    vocabularyGuidance: "vocabulaire accessible, définir tout terme technique nouveau" },
  { code: "4E", group: "COLLEGE", label: "4e", ageMin: 13, ageMax: 14,
    expectedBaseline: "puissances, théorème de Pythagore, équations du premier degré simples, physique-chimie débutée",
    vocabularyGuidance: "vocabulaire collège, formalisation progressive" },
  { code: "3E", group: "COLLEGE", label: "3e", ageMin: 14, ageMax: 15,
    expectedBaseline: "théorème de Thalès, fonctions linéaires/affines, équations et inéquations simples, préparation brevet",
    vocabularyGuidance: "vocabulaire collège avancé, notation mathématique standard du brevet" },
  { code: "SECONDE", group: "LYCEE", label: "Seconde", ageMin: 15, ageMax: 16,
    expectedBaseline: "second degré non encore approfondi, fonctions, vecteurs en géométrie, méthodes de lycée débutantes",
    vocabularyGuidance: "vocabulaire lycée, formalisation plus rigoureuse qu'au collège" },
  { code: "PREMIERE", group: "LYCEE", label: "Première", ageMin: 16, ageMax: 17,
    expectedBaseline: "selon spécialités suivies (ex: second degré, dérivation, suites en maths ; mécanique/chimie en physique)",
    vocabularyGuidance: "vocabulaire de spécialité, notation rigoureuse, raisonnement structuré",
    hasTrackAndSpecialities: true },
  { code: "TERMINALE", group: "LYCEE", label: "Terminale", ageMin: 17, ageMax: 18,
    expectedBaseline: "selon spécialités suivies (ex: limites, dérivation, intégrales, probabilités conditionnelles), niveau bac",
    vocabularyGuidance: "vocabulaire de spécialité niveau bac, notation rigoureuse, raisonnement complet attendu",
    hasTrackAndSpecialities: true },
  { code: "BAC1", group: "SUPERIEUR", label: "Bac +1", ageMin: 18, ageMax: 19,
    expectedBaseline: "bases du secondaire acquises, formalisation universitaire débutante",
    vocabularyGuidance: "vocabulaire académique, notations rigoureuses, démonstrations attendues" },
  { code: "BAC2", group: "SUPERIEUR", label: "Bac +2", ageMin: 19, ageMax: 20,
    expectedBaseline: "notions de L1/BTS/DUT acquises, autonomie méthodologique croissante",
    vocabularyGuidance: "vocabulaire académique, notations rigoureuses" },
  { code: "BAC3", group: "SUPERIEUR", label: "Bac +3", ageMin: 20, ageMax: 21,
    expectedBaseline: "notions de licence acquises, spécialisation disciplinaire",
    vocabularyGuidance: "vocabulaire académique spécialisé, terminologie du domaine" },
  { code: "BAC4", group: "SUPERIEUR", label: "Bac +4", ageMin: 21, ageMax: 22,
    expectedBaseline: "notions de master 1, spécialisation avancée",
    vocabularyGuidance: "vocabulaire académique avancé, concepts spécialisés sans reformulation simplifiée" },
  { code: "BAC5", group: "SUPERIEUR", label: "Bac +5", ageMin: 22, ageMax: 23,
    expectedBaseline: "notions de master 2 / grande école, expertise disciplinaire avancée",
    vocabularyGuidance: "vocabulaire expert, concepts avancés, notation scientifique complète" },
  { code: "DOCTORAT", group: "SUPERIEUR", label: "Doctorat", ageMin: 23, ageMax: 35,
    expectedBaseline: "expertise disciplinaire de recherche",
    vocabularyGuidance: "vocabulaire de recherche, précision scientifique maximale" },
  { code: "FORMATION_PRO", group: "AUTRE", label: "Formation professionnelle", ageMin: 18, ageMax: 60,
    expectedBaseline: "variable selon le métier, à déduire du contenu photographié",
    vocabularyGuidance: "vocabulaire professionnel concret, orienté application pratique" },
  { code: "AUTODIDACTE", group: "AUTRE", label: "Autodidacte", ageMin: 12, ageMax: 90,
    expectedBaseline: "inconnue a priori, à déduire du contenu et du niveau de langage employé par l'utilisateur",
    vocabularyGuidance: "vocabulaire clair par défaut, se recalibrer sur la complexité du document photographié" },
  { code: "AUTRE", group: "AUTRE", label: "Autre niveau", ageMin: 6, ageMax: 90,
    expectedBaseline: "inconnue, à déduire du contenu",
    vocabularyGuidance: "vocabulaire clair et neutre par défaut" },
];

export const LEVEL_GROUPS: { group: LevelGroup; label: string }[] = [
  { group: "PRIMAIRE", label: "Primaire" },
  { group: "COLLEGE", label: "Collège" },
  { group: "LYCEE", label: "Lycée" },
  { group: "SUPERIEUR", label: "Études supérieures" },
  { group: "AUTRE", label: "Autre" },
];

export const TRACKS: { code: LevelTrack; label: string }[] = [
  { code: "GENERALE", label: "Voie générale" },
  { code: "TECHNOLOGIQUE", label: "Voie technologique" },
  { code: "PROFESSIONNELLE", label: "Voie professionnelle" },
];

export const SPECIALITIES = [
  "Mathématiques", "Physique-Chimie", "SVT", "SES", "Histoire-Géo/Géopolitique/Sciences politiques",
  "Humanités, littérature et philosophie", "Langues, littératures et cultures étrangères", "Numérique et sciences informatiques",
  "SI (sciences de l'ingénieur)", "Arts", "Littérature et LCA", "Biologie-écologie",
];

export function getLevelDef(code: string): SchoolLevelDef {
  return SCHOOL_LEVELS.find((l) => l.code === code) ?? SCHOOL_LEVELS[SCHOOL_LEVELS.length - 1];
}

/**
 * Construit le bloc de contexte pédagogique injecté dans TOUS les prompts IA.
 * C'est le mécanisme qui fait que le niveau scolaire "pilote toute
 * l'application" plutôt que d'être une simple donnée de profil (section 2).
 */
export function buildLevelContext(params: {
  schoolLevel: string;
  track?: string | null;
  specialities?: string[] | null;
  explanationDepth?: "SIMPLE" | "NORMAL" | "APPROFONDI";
}): string {
  const def = getLevelDef(params.schoolLevel);
  const lines = [
    `Niveau scolaire de l'élève : ${def.label} (âge approximatif ${def.ageMin}-${def.ageMax} ans).`,
    `Notions/méthodes normalement déjà acquises à ce niveau : ${def.expectedBaseline}.`,
    `Registre attendu : ${def.vocabularyGuidance}.`,
  ];
  if (params.track) {
    const trackLabel = TRACKS.find((t) => t.code === params.track)?.label ?? params.track;
    lines.push(`Voie suivie : ${trackLabel}.`);
  }
  if (params.specialities && params.specialities.length > 0) {
    lines.push(`Spécialités suivies : ${params.specialities.join(", ")}.`);
  }
  if (params.explanationDepth) {
    const depthLabel = {
      SIMPLE: "Préférence de l'élève : explication SIMPLE, la plus directe possible.",
      NORMAL: "Préférence de l'élève : explication NORMALE, équilibrée.",
      APPROFONDI: "Préférence de l'élève : explication APPROFONDIE, avec davantage de détails et de nuances.",
    }[params.explanationDepth];
    lines.push(depthLabel);
  }
  lines.push(
    "RÈGLE ABSOLUE : utilise en priorité la méthode que cet élève est censé connaître à SON niveau. " +
    "N'utilise une méthode plus avancée que si le programme de son niveau ne permet vraiment pas de résoudre l'exercice. " +
    "N'utilise jamais une méthode plus simple qu'il aurait déjà dépassée sans le signaler explicitement."
  );
  return lines.join("\n");
}
