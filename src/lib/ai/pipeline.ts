import { routeModel } from "./model-router";
import { buildDocumentAnalysisPrompt } from "./prompts/document-analysis-prompt";
import { buildExerciseSolverPrompt } from "./prompts/exercise-solver-prompt";
import { buildExerciseVerifierPrompt } from "./prompts/exercise-verifier-prompt";
import { buildQualityReviewerPrompt } from "./prompts/quality-reviewer-prompt";
import { buildRevisionSheetPrompt } from "./prompts/revision-sheet-prompt";
import { buildLessonExplainerPrompt } from "./prompts/lesson-explainer-prompt";
import { buildQuizGeneratorPrompt } from "./prompts/quiz-generator-prompt";
import { buildChapterListPrompt } from "./prompts/chapter-list-prompt";
import {
  DocumentAnalysisSchema,
  ExerciseSolutionSchema,
  VerificationResultSchema,
  QualityEvaluationSchema,
  RevisionSheetContentSchema,
  ExplanationRoundSchema,
  QuizContentSchema,
  ChapterListSchema,
  type DocumentAnalysis,
  type ExerciseSolution,
  type VerificationResult,
  type QualityEvaluation,
  type RevisionSheetContent,
  type ExplanationRound,
  type QuizContent,
} from "./schemas";
import type { AIImageInput } from "./provider";
import { UnreadableContentError } from "./errors";

const MIN_USABLE_CONFIDENCE = 0.25;

/**
 * Garde-fou anti-invention (section 8) : si le DocumentAnalyzer signale une
 * confiance trop basse (photo vide/illisible), on arrête le pipeline ici au
 * lieu de laisser Solver/RevisionSheetCreator/LessonExplainer fabriquer un
 * contenu plausible à partir de rien.
 */
function assertAnalysisIsUsable(analysis: DocumentAnalysis): void {
  if (analysis.confidence < MIN_USABLE_CONFIDENCE) {
    throw new UnreadableContentError();
  }
}

// Budget de temps PARTAGÉ sur tout un pipeline (plusieurs appels IA
// séquentiels), pas par appel individuel : les fonctions serverless (Vercel
// Hobby) sont tuées net à 60s, sans possibilité d'enregistrer proprement un
// échec en base ni de répondre au client. On se réserve une marge (10s) pour
// le reste du traitement de la requête (parsing, écritures DB).
const PIPELINE_TIME_BUDGET_MS = 50_000;

function createDeadline(totalMs: number = PIPELINE_TIME_BUDGET_MS) {
  const startedAt = Date.now();
  return () => Math.max(totalMs - (Date.now() - startedAt), 3000);
}

// Le pipeline d'exercice est découpé en étapes séparées, chacune appelée
// dans sa PROPRE requête HTTP par le client (voir /api/exercises/[id]/advance),
// au lieu d'un seul appel monolithe. Raison concrète : sur une photo dense
// (beaucoup de texte, travail d'élève long), analyse + résolution +
// vérification + qualité mises bout à bout dépassent régulièrement les 60s
// que Vercel Hobby autorise pour UNE requête — la fonction est alors tuée
// net, sans possibilité d'enregistrer un échec propre. Chaque étape a
// maintenant son propre budget de temps complet (50s), pas une fraction
// partagée entre 4 appels IA séquentiels.

/** Étape 1 : DocumentAnalyzer seul. */
export async function runAnalyzeStep(image: AIImageInput, levelContext: string): Promise<DocumentAnalysis> {
  const timeLeft = createDeadline();
  const analysisPrompt = buildDocumentAnalysisPrompt(levelContext);
  const analysis = await routeModel("document-analysis").generateStructured({
    ...analysisPrompt,
    images: [image],
    schema: DocumentAnalysisSchema,
    deadlineMs: timeLeft(),
  });
  assertAnalysisIsUsable(analysis);
  return analysis;
}

/** Étape 2 : ExerciseSolver seul. */
export async function runSolveStep(levelContext: string, analysis: DocumentAnalysis): Promise<ExerciseSolution> {
  const timeLeft = createDeadline();
  const solverPrompt = buildExerciseSolverPrompt(levelContext, analysis);
  return routeModel("exercise-solving").generateStructured({
    ...solverPrompt,
    schema: ExerciseSolutionSchema,
    deadlineMs: timeLeft(),
  });
}

/** Étape 3 : ExerciseVerifier + révision ciblée si besoin (son propre budget). */
export async function runVerifyStep(
  levelContext: string,
  analysis: DocumentAnalysis,
  solution: ExerciseSolution
): Promise<{ solution: ExerciseSolution; verification: VerificationResult }> {
  const timeLeft = createDeadline();
  let verification = await routeModel("exercise-verification").generateStructured({
    ...buildExerciseVerifierPrompt(levelContext, analysis, solution),
    schema: VerificationResultSchema,
    deadlineMs: timeLeft(),
  });

  if (!verification.isValid) {
    const revisionPrompt = buildExerciseSolverPrompt(levelContext, analysis);
    solution = await routeModel("exercise-solving").generateStructured({
      systemPrompt: revisionPrompt.systemPrompt,
      userPrompt: `${revisionPrompt.userPrompt}\n\nATTENTION : une vérification indépendante a signalé ces problèmes dans une tentative précédente, corrige-les : ${verification.issues.join("; ")}${verification.correctedResult ? `\nRésultat correct attendu : ${verification.correctedResult}` : ""}`,
      schema: ExerciseSolutionSchema,
      deadlineMs: timeLeft(),
    });
    verification = await routeModel("exercise-verification").generateStructured({
      ...buildExerciseVerifierPrompt(levelContext, analysis, solution),
      schema: VerificationResultSchema,
      deadlineMs: timeLeft(),
    });
  }

  return { solution, verification };
}

/** Étape 4 : QualityEvaluator + révision ciblée si besoin (son propre budget). */
export async function runQualityStep(
  levelContext: string,
  analysis: DocumentAnalysis,
  solution: ExerciseSolution
): Promise<{ solution: ExerciseSolution; quality: QualityEvaluation }> {
  const timeLeft = createDeadline();
  let quality = await routeModel("quality-review").generateStructured({
    ...buildQualityReviewerPrompt(levelContext, solution),
    schema: QualityEvaluationSchema,
    deadlineMs: timeLeft(),
  });

  if (!quality.passesThreshold) {
    const revisionPrompt = buildExerciseSolverPrompt(levelContext, analysis);
    solution = await routeModel("exercise-solving").generateStructured({
      systemPrompt: revisionPrompt.systemPrompt,
      userPrompt: `${revisionPrompt.userPrompt}\n\nATTENTION : une évaluation qualité a relevé ces défauts sur une version précédente, corrige-les avant de répondre : ${quality.defects.join("; ")}`,
      schema: ExerciseSolutionSchema,
      deadlineMs: timeLeft(),
    });
    quality = await routeModel("quality-review").generateStructured({
      ...buildQualityReviewerPrompt(levelContext, solution),
      schema: QualityEvaluationSchema,
      deadlineMs: timeLeft(),
    });
  }

  return { solution, quality };
}

// --- Module "Créer une fiche" ----------------------------------------------
//
// Comme pour les exercices : chaque étape est appelée dans sa PROPRE requête
// (voir /api/fiches/[id]/advance) avec son propre budget de temps complet,
// au lieu d'un seul appel monolithe qui dépassait les 60s sur les fiches
// multi-pages ou denses.

/** Étape 1 : DocumentAnalyzer sur une ou plusieurs pages. */
export async function runSheetAnalyzeStep(images: AIImageInput[], levelContext: string): Promise<DocumentAnalysis> {
  const timeLeft = createDeadline();
  const analysis = await routeModel("document-analysis").generateStructured({
    ...buildDocumentAnalysisPrompt(levelContext),
    images,
    schema: DocumentAnalysisSchema,
    deadlineMs: timeLeft(),
  });
  assertAnalysisIsUsable(analysis);
  return analysis;
}

/** Étape 2 : RevisionSheetCreator seul. */
export async function runSheetCreateStep(
  levelContext: string,
  analysis: DocumentAnalysis,
  sheetType: string
): Promise<RevisionSheetContent> {
  const timeLeft = createDeadline();
  return routeModel("revision-sheet-creation").generateStructured({
    ...buildRevisionSheetPrompt(levelContext, analysis, sheetType),
    schema: RevisionSheetContentSchema,
    deadlineMs: timeLeft(),
  });
}

/** Étape 3 : QualityEvaluator + révision ciblée si besoin (son propre budget). */
export async function runSheetQualityStep(
  levelContext: string,
  analysis: DocumentAnalysis,
  sheetType: string,
  content: RevisionSheetContent
): Promise<{ content: RevisionSheetContent; quality: QualityEvaluation }> {
  const timeLeft = createDeadline();
  let quality = await routeModel("quality-review").generateStructured({
    ...buildQualityReviewerPrompt(levelContext, content, "une fiche de révision"),
    schema: QualityEvaluationSchema,
    deadlineMs: timeLeft(),
  });

  if (!quality.passesThreshold) {
    const revisionPrompt = buildRevisionSheetPrompt(levelContext, analysis, sheetType);
    content = await routeModel("revision-sheet-creation").generateStructured({
      systemPrompt: revisionPrompt.systemPrompt,
      userPrompt: `${revisionPrompt.userPrompt}\n\nATTENTION : une évaluation qualité a relevé ces défauts sur une version précédente, corrige-les avant de répondre : ${quality.defects.join("; ")}`,
      schema: RevisionSheetContentSchema,
      deadlineMs: timeLeft(),
    });
    quality = await routeModel("quality-review").generateStructured({
      ...buildQualityReviewerPrompt(levelContext, content, "une fiche de révision"),
      schema: QualityEvaluationSchema,
      deadlineMs: timeLeft(),
    });
  }

  return { content, quality };
}

// --- Module "Explique-moi" --------------------------------------------------

// Même découpage que les exercices/fiches : une requête par étape (voir
// /api/explications/[id]/advance), chacune avec son propre budget complet.

/** Étape 1 : DocumentAnalyzer seul. */
export async function runExplainAnalyzeStep(image: AIImageInput, levelContext: string): Promise<DocumentAnalysis> {
  const timeLeft = createDeadline();
  const analysis = await routeModel("document-analysis").generateStructured({
    ...buildDocumentAnalysisPrompt(levelContext),
    images: [image],
    schema: DocumentAnalysisSchema,
    deadlineMs: timeLeft(),
  });
  assertAnalysisIsUsable(analysis);
  return analysis;
}

/** Étape 2 : LessonExplainer seul (premier round). */
export async function runExplainGenerateStep(
  levelContext: string,
  analysis: DocumentAnalysis,
  depth: "simple" | "normal" | "approfondi"
): Promise<ExplanationRound> {
  const timeLeft = createDeadline();
  return routeModel("lesson-explanation").generateStructured({
    ...buildLessonExplainerPrompt(levelContext, analysis, depth),
    schema: ExplanationRoundSchema,
    deadlineMs: timeLeft(),
  });
}

/**
 * Relance "Je n'ai toujours pas compris" (section 22) : réutilise l'analyse
 * déjà faite, change obligatoirement de méthode pédagogique.
 */
export async function runExplainRetry(params: {
  analysis: DocumentAnalysis;
  levelContext: string;
  depth: "simple" | "normal" | "approfondi";
  previousMethods: string[];
}): Promise<ExplanationRound> {
  return routeModel("lesson-explanation").generateStructured({
    ...buildLessonExplainerPrompt(params.levelContext, params.analysis, params.depth, params.previousMethods),
    schema: ExplanationRoundSchema,
  });
}

// --- Module "Quiz" -----------------------------------------------------------

export interface GenerateQuizInput {
  subject: string;
  theme: string;
  levelLabel: string;
}

/**
 * QuizGenerator (section 28) : génère directement au niveau associé au
 * thème choisi, pas à celui du profil — n'importe quel programme peut être
 * révisé, pas seulement le niveau/les spécialités de l'élève.
 */
export async function runGenerateQuizPipeline(input: GenerateQuizInput): Promise<QuizContent> {
  return routeModel("quiz-generation").generateStructured({
    ...buildQuizGeneratorPrompt(input),
    schema: QuizContentSchema,
  });
}

/**
 * Liste tous les chapitres réels d'une matière à un niveau donné (section 4 :
 * jamais limité à une liste tapée à la main). Utilisé par l'explorateur
 * "par matière et niveau" du module Quiz.
 */
export async function runListChaptersPipeline(input: { subject: string; levelLabel: string }): Promise<string[]> {
  const result = await routeModel("chapter-listing").generateStructured({
    ...buildChapterListPrompt(input),
    schema: ChapterListSchema,
  });
  return result.chapters;
}
