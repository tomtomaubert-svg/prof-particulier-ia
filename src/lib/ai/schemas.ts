import { z } from "zod";

// Sorties structurées IA (section 45 du cahier des charges) : chaque agent
// spécialisé (section 26) retourne un JSON validé par un schéma Zod dédié.
// Règle absolue (section 8) : ne jamais inventer -> tout schéma porte un champ
// `confidence` et une liste `unreadableParts` pour signaler l'incertitude.

// Gemini omet parfois un champ censé être obligatoire (undefined au lieu
// d'une chaîne/tableau vide) sur les réponses complexes, au lieu de renvoyer
// une vraie valeur manquante explicite. Plutôt que de faire échouer tout le
// pipeline pour un champ secondaire manquant, on tolère ces variantes et on
// retombe sur une valeur neutre — les champs réellement critiques
// (result, method, whatWeSearch...) restent des chaînes strictement requises.
const lenientString = () =>
  z
    .string()
    .optional()
    .transform((v) => v ?? "");

const lenientStringArray = () =>
  z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]));

export const DocumentAnalysisSchema = z.object({
  subject: z.string().describe("Matière détectée, ex: 'Mathématiques', 'Histoire', 'Droit fiscal'"),
  chapter: z.string().nullish().describe("Chapitre/thème si identifiable, sinon null"),
  detectedLevel: z.string().describe("Niveau scolaire apparent du document d'après son contenu"),
  exerciseType: z.string().describe("Type d'exercice: ex: 'problème', 'QCM', 'question de cours', 'dissertation'"),
  difficulty: z.enum(["facile", "moyen", "difficile"]),
  questions: lenientStringArray().describe("Liste des questions/consignes identifiées"),
  importantData: lenientStringArray().describe("Données, valeurs, hypothèses importantes du document"),
  hasStudentWork: z.boolean().describe("true si l'élève a déjà écrit un raisonnement/une tentative sur la copie"),
  studentWorkTranscript: z.string().nullish().describe("Transcription du raisonnement de l'élève si présent, sinon null"),
  unreadableParts: lenientStringArray().describe("Parties de l'image illisibles ou ambiguës (jamais inventées)"),
  confidence: z.number().min(0).max(1),
});
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

// Un "step" arrive parfois de Gemini comme une simple chaîne au lieu de
// {title, content} : on l'accepte et on le range dans `content`.
export const SolutionStepSchema = z.union([
  z.object({ title: lenientString(), content: z.string() }),
  z.string().transform((content) => ({ title: "", content })),
]);

export const HintsSchema = z.object({
  hint1: lenientString(),
  hint2: lenientString(),
  whichFormula: lenientString(),
  nextStep: lenientString(),
});

export const StudentWorkReviewSchema = z.object({
  whatWasDoneWell: lenientString(),
  firstError: z.string().nullish(),
  whyItsAnError: z.string().nullish(),
  howToFixIt: z.string().nullish(),
  restOfReasoning: z.string().nullish(),
});

export const ExerciseSolutionSchema = z.object({
  whatWeSearch: z.string(),
  importantData: lenientStringArray(),
  method: z.string().describe("Méthode adaptée au niveau de l'élève, jamais une méthode plus avancée que nécessaire"),
  formulaOrRule: z.string().nullish(),
  steps: z.array(SolutionStepSchema),
  result: z.string(),
  verification: lenientString(),
  keyTakeaway: lenientString(),
  commonMistake: lenientString(),
  tip: lenientString(),
  hints: HintsSchema,
  studentWorkReview: StudentWorkReviewSchema.nullish(),
  levelJustification: lenientString(),
  unreadableParts: lenientStringArray(),
  confidence: z.number().min(0).max(1),
});
export type ExerciseSolution = z.infer<typeof ExerciseSolutionSchema>;

export const VerificationResultSchema = z.object({
  isValid: z.boolean(),
  issues: z.array(z.string()).describe("Erreurs de calcul, de méthode ou de fait détectées, vide si aucune"),
  correctedResult: z.string().nullable().describe("Résultat corrigé si isValid=false, sinon null"),
  verifierNotes: z.string(),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;

// --- Module "Créer une fiche" (sections 15-19) -----------------------------

export const RevisionSheetBlockTypeSchema = z.enum([
  "definition",
  "a_retenir",
  "formule",
  "methode",
  "exemple",
  "attention",
  "date",
  "personnage",
  "vocabulaire",
  "astuce",
  "texte",
]);

export const RevisionSheetBlockSchema = z.object({
  type: RevisionSheetBlockTypeSchema,
  title: z.string().describe("Titre court du bloc, ex: nom de la notion, de la date, du personnage"),
  content: z.string(),
});
export type RevisionSheetBlock = z.infer<typeof RevisionSheetBlockSchema>;

export const RevisionSheetContentSchema = z.object({
  title: z.string().describe("Titre de la fiche, ex: 'Le second degré'"),
  summary: z.string().describe("Résumé en 1-2 phrases du chapitre"),
  blocks: z.array(RevisionSheetBlockSchema),
  keyVocabulary: z
    .array(z.object({ term: z.string(), definition: z.string() }))
    .optional()
    .transform((v) => v ?? []),
  unreadableParts: lenientStringArray(),
  confidence: z.number().min(0).max(1),
});
export type RevisionSheetContent = z.infer<typeof RevisionSheetContentSchema>;

// --- Module "Explique-moi" (sections 20-23) --------------------------------

export const ExplanationRoundSchema = z.object({
  methodUsed: z
    .string()
    .describe("Technique employée pour CETTE explication, ex: 'analogie du quotidien', 'décomposition numérique'"),
  inOneSentence: z.string(),
  toUnderstand: z.string(),
  example: z.string(),
  analogy: z.string().nullish(),
  keyTakeaway: z.string(),
  checkQuestion: z.string(),
  unreadableParts: lenientStringArray(),
  confidence: z.number().min(0).max(1),
});
export type ExplanationRound = z.infer<typeof ExplanationRoundSchema>;

// --- Module "Quiz" (section 28) ---------------------------------------------

export const QuizQuestionSchema = z.object({
  type: z.enum(["qcm", "vrai_faux", "question_courte"]),
  question: z.string(),
  choices: z.array(z.string()).nullish().describe("4 choix pour un QCM, sinon null"),
  correctAnswer: z.string().describe("Réponse correcte : le texte du choix pour un QCM, 'Vrai'/'Faux', ou la réponse attendue"),
  explanation: z.string().describe("Pourquoi c'est la bonne réponse, à afficher à la correction"),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizContentSchema = z.object({
  title: z.string(),
  questions: z.array(QuizQuestionSchema),
  confidence: z.number().min(0).max(1),
});
export type QuizContent = z.infer<typeof QuizContentSchema>;

// --- Exploration "tous les chapitres" d'une matière/niveau (section 28) ----

export const ChapterListSchema = z.object({
  chapters: z.array(z.string()).describe("Liste complète et réelle des chapitres/thèmes de cette matière à ce niveau"),
});
export type ChapterList = z.infer<typeof ChapterListSchema>;

export const QualityEvaluationSchema = z.object({
  accuracy: z.number().min(0).max(6),
  clarity: z.number().min(0).max(4),
  pedagogy: z.number().min(0).max(4),
  structure: z.number().min(0).max(2),
  levelAdaptation: z.number().min(0).max(3),
  presentation: z.number().min(0).max(1),
  total: z.number().min(0).max(20),
  defects: z.array(z.string()),
  passesThreshold: z.boolean().describe("true si total >= 16"),
});
export type QualityEvaluation = z.infer<typeof QualityEvaluationSchema>;
