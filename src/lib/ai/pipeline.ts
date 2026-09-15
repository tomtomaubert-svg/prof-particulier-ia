import { routeModel } from "./model-router";
import { buildDocumentAnalysisPrompt } from "./prompts/document-analysis-prompt";
import { buildExerciseSolverPrompt } from "./prompts/exercise-solver-prompt";
import { buildExerciseVerifierPrompt } from "./prompts/exercise-verifier-prompt";
import { buildQualityReviewerPrompt } from "./prompts/quality-reviewer-prompt";
import { buildRevisionSheetPrompt } from "./prompts/revision-sheet-prompt";
import { buildLessonExplainerPrompt } from "./prompts/lesson-explainer-prompt";
import {
  DocumentAnalysisSchema,
  ExerciseSolutionSchema,
  VerificationResultSchema,
  QualityEvaluationSchema,
  RevisionSheetContentSchema,
  ExplanationRoundSchema,
  type DocumentAnalysis,
  type ExerciseSolution,
  type VerificationResult,
  type QualityEvaluation,
  type RevisionSheetContent,
  type ExplanationRound,
} from "./schemas";
import type { AIImageInput } from "./provider";

export interface SolvePipelineInput {
  imageMimeType: string;
  imageDataBase64: string;
  levelContext: string;
  mode: "apprendre" | "correction";
  onStatus?: (status: string) => void;
}

export interface SolvePipelineResult {
  analysis: DocumentAnalysis;
  solution: ExerciseSolution;
  verification: VerificationResult;
  quality: QualityEvaluation;
}

/**
 * Pipeline Solver -> Verifier -> (révision ciblée si besoin) -> QualityEvaluator
 * (sections 25/26). Le nombre d'appels IA est volontairement borné (1 révision
 * max à chaque étape) pour rester dans le quota gratuit de l'API tout en
 * respectant l'exigence de double vérification indépendante et de contrôle
 * qualité avant affichage (section 24).
 */
export async function runSolveExercisePipeline(input: SolvePipelineInput): Promise<SolvePipelineResult> {
  const image = { mimeType: input.imageMimeType, dataBase64: input.imageDataBase64 };

  input.onStatus?.("analyzing");
  const analysisPrompt = buildDocumentAnalysisPrompt(input.levelContext);
  const analysis = await routeModel("document-analysis").generateStructured({
    ...analysisPrompt,
    images: [image],
    schema: DocumentAnalysisSchema,
  });

  input.onStatus?.("solving");
  const solverPrompt = buildExerciseSolverPrompt(input.levelContext, analysis);
  let solution = await routeModel("exercise-solving").generateStructured({
    ...solverPrompt,
    schema: ExerciseSolutionSchema,
  });

  input.onStatus?.("verifying");
  const verifierPrompt = buildExerciseVerifierPrompt(input.levelContext, analysis, solution);
  let verification = await routeModel("exercise-verification").generateStructured({
    ...verifierPrompt,
    schema: VerificationResultSchema,
  });

  if (!verification.isValid) {
    // Révision ciblée : on redemande au solver de corriger avec le retour du vérificateur.
    const revisionPrompt = buildExerciseSolverPrompt(input.levelContext, analysis);
    solution = await routeModel("exercise-solving").generateStructured({
      systemPrompt: revisionPrompt.systemPrompt,
      userPrompt: `${revisionPrompt.userPrompt}\n\nATTENTION : une vérification indépendante a signalé ces problèmes dans une tentative précédente, corrige-les : ${verification.issues.join("; ")}${verification.correctedResult ? `\nRésultat correct attendu : ${verification.correctedResult}` : ""}`,
      schema: ExerciseSolutionSchema,
    });
    verification = await routeModel("exercise-verification").generateStructured({
      ...buildExerciseVerifierPrompt(input.levelContext, analysis, solution),
      schema: VerificationResultSchema,
    });
  }

  input.onStatus?.("evaluating-quality");
  const qualityPrompt = buildQualityReviewerPrompt(input.levelContext, solution);
  let quality = await routeModel("quality-review").generateStructured({
    ...qualityPrompt,
    schema: QualityEvaluationSchema,
  });

  if (!quality.passesThreshold) {
    const revisionPrompt = buildExerciseSolverPrompt(input.levelContext, analysis);
    solution = await routeModel("exercise-solving").generateStructured({
      systemPrompt: revisionPrompt.systemPrompt,
      userPrompt: `${revisionPrompt.userPrompt}\n\nATTENTION : une évaluation qualité a relevé ces défauts sur une version précédente, corrige-les avant de répondre : ${quality.defects.join("; ")}`,
      schema: ExerciseSolutionSchema,
    });
    quality = await routeModel("quality-review").generateStructured({
      ...buildQualityReviewerPrompt(input.levelContext, solution),
      schema: QualityEvaluationSchema,
    });
  }

  input.onStatus?.("done");
  return { analysis, solution, verification, quality };
}

// --- Module "Créer une fiche" ----------------------------------------------

export interface CreateSheetPipelineInput {
  images: AIImageInput[]; // une ou plusieurs pages photographiées
  levelContext: string;
  sheetType: "express" | "standard" | "complete";
  onStatus?: (status: string) => void;
}

export interface CreateSheetPipelineResult {
  analysis: DocumentAnalysis;
  content: RevisionSheetContent;
  quality: QualityEvaluation;
}

/**
 * DocumentAnalyzer -> RevisionSheetCreator -> QualityEvaluator (révision
 * ciblée si le score est insuffisant), sur le même modèle que le pipeline de
 * résolution d'exercice (sections 15-19, 24-26).
 */
export async function runCreateRevisionSheetPipeline(
  input: CreateSheetPipelineInput
): Promise<CreateSheetPipelineResult> {
  input.onStatus?.("analyzing");
  const analysisPrompt = buildDocumentAnalysisPrompt(input.levelContext);
  const analysis = await routeModel("document-analysis").generateStructured({
    ...analysisPrompt,
    images: input.images,
    schema: DocumentAnalysisSchema,
  });

  input.onStatus?.("creating");
  const sheetPrompt = buildRevisionSheetPrompt(input.levelContext, analysis, input.sheetType);
  let content = await routeModel("revision-sheet-creation").generateStructured({
    ...sheetPrompt,
    schema: RevisionSheetContentSchema,
  });

  input.onStatus?.("evaluating-quality");
  let quality = await routeModel("quality-review").generateStructured({
    ...buildQualityReviewerPrompt(input.levelContext, content, "une fiche de révision"),
    schema: QualityEvaluationSchema,
  });

  if (!quality.passesThreshold) {
    const revisionPrompt = buildRevisionSheetPrompt(input.levelContext, analysis, input.sheetType);
    content = await routeModel("revision-sheet-creation").generateStructured({
      systemPrompt: revisionPrompt.systemPrompt,
      userPrompt: `${revisionPrompt.userPrompt}\n\nATTENTION : une évaluation qualité a relevé ces défauts sur une version précédente, corrige-les avant de répondre : ${quality.defects.join("; ")}`,
      schema: RevisionSheetContentSchema,
    });
    quality = await routeModel("quality-review").generateStructured({
      ...buildQualityReviewerPrompt(input.levelContext, content, "une fiche de révision"),
      schema: QualityEvaluationSchema,
    });
  }

  input.onStatus?.("done");
  return { analysis, content, quality };
}

// --- Module "Explique-moi" --------------------------------------------------

export interface ExplainPipelineInput {
  image: AIImageInput;
  levelContext: string;
  depth: "simple" | "normal" | "approfondi";
  onStatus?: (status: string) => void;
}

export interface ExplainPipelineResult {
  analysis: DocumentAnalysis;
  round: ExplanationRound;
}

/** Premier round d'explication : DocumentAnalyzer -> LessonExplainer (sections 20-21). */
export async function runExplainPipeline(input: ExplainPipelineInput): Promise<ExplainPipelineResult> {
  input.onStatus?.("analyzing");
  const analysisPrompt = buildDocumentAnalysisPrompt(input.levelContext);
  const analysis = await routeModel("document-analysis").generateStructured({
    ...analysisPrompt,
    images: [input.image],
    schema: DocumentAnalysisSchema,
  });

  input.onStatus?.("explaining");
  const round = await routeModel("lesson-explanation").generateStructured({
    ...buildLessonExplainerPrompt(input.levelContext, analysis, input.depth),
    schema: ExplanationRoundSchema,
  });

  input.onStatus?.("done");
  return { analysis, round };
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
