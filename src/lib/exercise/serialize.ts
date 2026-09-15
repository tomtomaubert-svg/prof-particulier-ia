import type { ExerciseAttempt as ExerciseAttemptRow } from "@prisma/client";
import type { DocumentAnalysis, ExerciseSolution, QualityEvaluation } from "@/lib/ai/schemas";

export interface ExerciseAttemptDTO {
  id: string;
  mode: string;
  status: string;
  errorMessage: string | null;
  subject: string | null;
  chapter: string | null;
  detectedLevel: string | null;
  difficulty: string | null;
  exerciseType: string | null;
  imageDataUrl: string;
  analysis: DocumentAnalysis | null;
  solution: ExerciseSolution | null;
  quality: QualityEvaluation | null;
  createdAt: string;
}

export function serializeExerciseAttempt(row: ExerciseAttemptRow): ExerciseAttemptDTO {
  return {
    id: row.id,
    mode: row.mode,
    status: row.status,
    errorMessage: row.errorMessage,
    subject: row.subject,
    chapter: row.chapter,
    detectedLevel: row.detectedLevel,
    difficulty: row.difficulty,
    exerciseType: row.exerciseType,
    imageDataUrl: row.imageDataUrl,
    analysis: row.analysisJson ? JSON.parse(row.analysisJson) : null,
    solution: row.solutionJson ? JSON.parse(row.solutionJson) : null,
    quality: row.qualityJson ? JSON.parse(row.qualityJson) : null,
    createdAt: row.createdAt.toISOString(),
  };
}
