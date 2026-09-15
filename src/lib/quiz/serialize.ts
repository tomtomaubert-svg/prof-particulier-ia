import type { Quiz as QuizRow } from "@prisma/client";
import type { QuizContent } from "@/lib/ai/schemas";

export interface QuizDTO {
  id: string;
  subject: string;
  theme: string;
  levelLabel: string;
  status: string;
  errorMessage: string | null;
  content: QuizContent | null;
  createdAt: string;
}

export function serializeQuiz(row: QuizRow): QuizDTO {
  return {
    id: row.id,
    subject: row.subject,
    theme: row.theme,
    levelLabel: row.levelLabel,
    status: row.status,
    errorMessage: row.errorMessage,
    content: row.contentJson ? JSON.parse(row.contentJson) : null,
    createdAt: row.createdAt.toISOString(),
  };
}
