import type { RevisionSheet as RevisionSheetRow } from "@prisma/client";
import type { DocumentAnalysis, RevisionSheetContent, QualityEvaluation } from "@/lib/ai/schemas";

export interface RevisionSheetDTO {
  id: string;
  sheetType: string;
  status: string;
  errorMessage: string | null;
  subject: string | null;
  chapter: string | null;
  detectedLevel: string | null;
  images: string[];
  analysis: DocumentAnalysis | null;
  content: RevisionSheetContent | null;
  quality: QualityEvaluation | null;
  createdAt: string;
}

export function serializeRevisionSheet(row: RevisionSheetRow): RevisionSheetDTO {
  return {
    id: row.id,
    sheetType: row.sheetType,
    status: row.status,
    errorMessage: row.errorMessage,
    subject: row.subject,
    chapter: row.chapter,
    detectedLevel: row.detectedLevel,
    images: JSON.parse(row.imagesJson) as string[],
    analysis: row.analysisJson ? JSON.parse(row.analysisJson) : null,
    content: row.contentJson ? JSON.parse(row.contentJson) : null,
    quality: row.qualityJson ? JSON.parse(row.qualityJson) : null,
    createdAt: row.createdAt.toISOString(),
  };
}
