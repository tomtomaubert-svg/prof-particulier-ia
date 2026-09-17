import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runAnalyzeStep, runSolveStep, runVerifyStep, runQualityStep } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";
import { serializeExerciseAttempt } from "@/lib/exercise/serialize";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";
import type { DocumentAnalysis, ExerciseSolution } from "@/lib/ai/schemas";

export const maxDuration = 60;

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Format d'image invalide");
  return { mimeType: match[1], base64: match[2] };
}

// Fait avancer le pipeline exactement d'une étape par appel (analyse ->
// résolution -> vérification -> qualité), chaque étape ayant son propre
// budget de temps complet. Le client rappelle cette route en boucle jusqu'à
// un statut "done" ou "error".
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const attempt = await prisma.exerciseAttempt.findUnique({ where: { id } });
  if (!attempt || attempt.profileId !== profile.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (attempt.status === "done" || attempt.status === "error") {
    return NextResponse.json(serializeExerciseAttempt(attempt));
  }

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    if (!attempt.analysisJson) {
      const image = parseDataUrl(attempt.imageDataUrl);
      const analysis = await runAnalyzeStep({ mimeType: image.mimeType, dataBase64: image.base64 }, levelContext);
      const updated = await prisma.exerciseAttempt.update({
        where: { id },
        data: {
          status: "analyzed",
          subject: analysis.subject,
          chapter: analysis.chapter,
          detectedLevel: analysis.detectedLevel,
          difficulty: analysis.difficulty,
          exerciseType: analysis.exerciseType,
          analysisJson: JSON.stringify(analysis),
        },
      });
      return NextResponse.json(serializeExerciseAttempt(updated));
    }

    const analysis = JSON.parse(attempt.analysisJson) as DocumentAnalysis;

    if (!attempt.solutionJson) {
      const solution = await runSolveStep(levelContext, analysis);
      const updated = await prisma.exerciseAttempt.update({
        where: { id },
        data: { status: "solved", solutionJson: JSON.stringify(solution) },
      });
      return NextResponse.json(serializeExerciseAttempt(updated));
    }

    const solutionSoFar = JSON.parse(attempt.solutionJson) as ExerciseSolution;

    if (attempt.status !== "verified") {
      const { solution, verification } = await runVerifyStep(levelContext, analysis, solutionSoFar);
      void verification;
      const updated = await prisma.exerciseAttempt.update({
        where: { id },
        data: { status: "verified", solutionJson: JSON.stringify(solution) },
      });
      return NextResponse.json(serializeExerciseAttempt(updated));
    }

    const { solution, quality } = await runQualityStep(levelContext, analysis, solutionSoFar);
    const updated = await prisma.exerciseAttempt.update({
      where: { id },
      data: {
        status: "done",
        solutionJson: JSON.stringify(solution),
        qualityJson: JSON.stringify(quality),
        qualityScore: quality.total,
      },
    });

    await bumpSkillMastery(profile.id, analysis.subject, analysis.chapter);

    return NextResponse.json(serializeExerciseAttempt(updated));
  } catch (err) {
    const message = describePipelineError(err);
    const updated = await prisma.exerciseAttempt.update({
      where: { id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeExerciseAttempt(updated), { status: 502 });
  }
}
