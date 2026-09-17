import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { ExerciseCorrectionPdf } from "@/lib/pdf/exercise-correction-pdf";
import { pdfFilename } from "@/lib/pdf/filename";
import type { ExerciseSolution } from "@/lib/ai/schemas";

export const maxDuration = 30;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const attempt = await prisma.exerciseAttempt.findUnique({ where: { id } });
  if (!attempt || attempt.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (!attempt.solutionJson) {
    return NextResponse.json({ error: "Correction pas encore prête" }, { status: 409 });
  }

  const solution = JSON.parse(attempt.solutionJson) as ExerciseSolution;
  const buffer = await renderToBuffer(
    ExerciseCorrectionPdf({ solution, subject: attempt.subject, chapter: attempt.chapter, difficulty: attempt.difficulty })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFilename("correction", attempt.subject)}"`,
    },
  });
}
