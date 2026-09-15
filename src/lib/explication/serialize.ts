import type { Explanation as ExplanationRow } from "@prisma/client";
import type { DocumentAnalysis, ExplanationRound } from "@/lib/ai/schemas";

export interface ExplanationDTO {
  id: string;
  depth: string;
  status: string;
  errorMessage: string | null;
  subject: string | null;
  chapter: string | null;
  detectedLevel: string | null;
  imageDataUrl: string;
  analysis: DocumentAnalysis | null;
  rounds: ExplanationRound[];
  createdAt: string;
}

export function serializeExplanation(row: ExplanationRow): ExplanationDTO {
  return {
    id: row.id,
    depth: row.depth,
    status: row.status,
    errorMessage: row.errorMessage,
    subject: row.subject,
    chapter: row.chapter,
    detectedLevel: row.detectedLevel,
    imageDataUrl: row.imageDataUrl,
    analysis: row.analysisJson ? JSON.parse(row.analysisJson) : null,
    rounds: row.roundsJson ? (JSON.parse(row.roundsJson) as ExplanationRound[]) : [],
    createdAt: row.createdAt.toISOString(),
  };
}
