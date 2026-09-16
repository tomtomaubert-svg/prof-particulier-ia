import { z } from "zod";

// Sorties structurées IA (section 45 du cahier des charges) : chaque agent
// spécialisé (section 26) retourne un JSON validé par un schéma Zod dédié.
// Règle absolue (section 8) : ne jamais inventer -> tout schéma porte un champ
// `confidence` et une liste `unreadableParts` pour signaler l'incertitude.

export const DocumentAnalysisSchema = z.object({
  subject: z.string().describe("Matière détectée, ex: 'Mathématiques', 'Histoire', 'Droit fiscal'"),
  chapter: z.string().nullable().describe("Chapitre/thème si identifiable, sinon null"),
  detectedLevel: z.string().describe("Niveau scolaire apparent du document d'après son contenu"),
  exerciseType: z.string().describe("Type d'exercice: ex: 'problème', 'QCM', 'question de cours', 'dissertation'"),
  difficulty: z.enum(["facile", "moyen", "difficile"]),
  questions: z.array(z.string()).describe("Liste des questions/consignes identifiées"),
  importantData: z.array(z.string()).describe("Données, valeurs, hypothèses importantes du document"),
  hasStudentWork: z.boolean().describe("true si l'élève a déjà écrit un raisonnement/une tentative sur la copie"),
  studentWorkTranscript: z.string().nullable().describe("Transcription du raisonnement de l'élève si présent, sinon null"),
  unreadableParts: z.array(z.string()).describe("Parties de l'image illisibles ou ambiguës (jamais inventées)"),
  confidence: z.number().min(0).max(1),
});
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

export const SolutionStepSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const HintsSchema = z.object({
  hint1: z.string(),
  hint2: z.string(),
  whichFormula: z.string(),
  nextStep: z.string(),
});

export const StudentWorkReviewSchema = z.object({
  whatWasDoneWell: z.string(),
  firstError: z.string().nullable(),
  whyItsAnError: z.string().nullable(),
  howToFixIt: z.string().nullable(),
  restOfReasoning: z.string().nullable(),
});

export const ExerciseSolutionSchema = z.object({
  whatWeSearch: z.string(),
  importantData: z.array(z.string()),
  method: z.string().describe("Méthode adaptée au niveau de l'élève, jamais une méthode plus avancée que nécessaire"),
  formulaOrRule: z.string().nullable(),
  steps: z.array(SolutionStepSchema),
  result: z.string(),
  verification: z.string(),
  keyTakeaway: z.string(),
  commonMistake: z.string(),
  tip: z.string(),
  hints: HintsSchema,
  studentWorkReview: StudentWorkReviewSchema.nullable(),
  levelJustification: z.string().describe("Pourquoi cette méthode correspond au niveau de l'élève"),
  unreadableParts: z.array(z.string()),
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
  keyVocabulary: z.array(z.object({ term: z.string(), definition: z.string() })),
  unreadableParts: z.array(z.string()),
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
  analogy: z.string().nullable(),
  keyTakeaway: z.string(),
  checkQuestion: z.string(),
  unreadableParts: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
export type ExplanationRound = z.infer<typeof ExplanationRoundSchema>;

// --- Module "Quiz" (section 28) ---------------------------------------------

export const QuizQuestionSchema = z.object({
  type: z.enum(["qcm", "vrai_faux", "question_courte"]),
  question: z.string(),
  choices: z.array(z.string()).nullable().describe("4 choix pour un QCM, sinon null"),
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
