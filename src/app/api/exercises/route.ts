import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runSolveExercisePipeline } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";
import { serializeExerciseAttempt } from "@/lib/exercise/serialize";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";

export const maxDuration = 60; // plafond réel du plan Vercel Hobby (même si on demandait plus)

const BodySchema = z.object({
  imageDataUrl: z.string().startsWith("data:image/"),
  mode: z.enum(["apprendre", "correction"]).default("correction"),
});

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Format d'image invalide");
  return { mimeType: match[1], base64: match[2] };
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { imageDataUrl, mode } = parsed.data;

  let image: { mimeType: string; base64: string };
  try {
    image = parseDataUrl(imageDataUrl);
  } catch {
    return NextResponse.json({ error: "Image invalide" }, { status: 400 });
  }

  const attempt = await prisma.exerciseAttempt.create({
    data: { profileId: profile.id, imageDataUrl, mode, status: "analyzing" },
  });

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    const result = await runSolveExercisePipeline({
      imageMimeType: image.mimeType,
      imageDataBase64: image.base64,
      levelContext,
      mode,
      onStatus: (status) => {
        prisma.exerciseAttempt.update({ where: { id: attempt.id }, data: { status } }).catch(() => {});
      },
    });

    const updated = await prisma.exerciseAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "done",
        subject: result.analysis.subject,
        chapter: result.analysis.chapter,
        detectedLevel: result.analysis.detectedLevel,
        difficulty: result.analysis.difficulty,
        exerciseType: result.analysis.exerciseType,
        analysisJson: JSON.stringify(result.analysis),
        solutionJson: JSON.stringify(result.solution),
        qualityJson: JSON.stringify(result.quality),
        qualityScore: result.quality.total,
      },
    });

    await bumpSkillMastery(profile.id, result.analysis.subject, result.analysis.chapter);

    return NextResponse.json(serializeExerciseAttempt(updated));
  } catch (err) {
    const message = describePipelineError(err);
    const updated = await prisma.exerciseAttempt.update({
      where: { id: attempt.id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeExerciseAttempt(updated), { status: 502 });
  }
}
