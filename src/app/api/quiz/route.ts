import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { runGenerateQuizPipeline } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";
import { serializeQuiz } from "@/lib/quiz/serialize";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";

export const maxDuration = 60;

const BodySchema = z.object({
  subject: z.string().min(1).max(80),
  theme: z.string().min(1).max(160),
  levelLabel: z.string().min(1).max(60),
});

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { subject, theme, levelLabel } = parsed.data;

  const quiz = await prisma.quiz.create({
    data: { profileId: profile.id, subject, theme, levelLabel, status: "generating" },
  });

  try {
    const content = await runGenerateQuizPipeline({ subject, theme, levelLabel });

    const updated = await prisma.quiz.update({
      where: { id: quiz.id },
      data: { status: "done", contentJson: JSON.stringify(content) },
    });

    await bumpSkillMastery(profile.id, subject, theme);

    return NextResponse.json(serializeQuiz(updated));
  } catch (err) {
    const message = describePipelineError(err);
    const updated = await prisma.quiz.update({
      where: { id: quiz.id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeQuiz(updated), { status: 502 });
  }
}
