import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";

// Alimente la Knowledge Map (section 31) avec le VRAI score obtenu au quiz,
// pas seulement le fait d'avoir généré le quiz — appelé quand l'élève valide
// ses réponses (score connu seulement côté client à ce moment-là).
const BodySchema = z.object({
  score: z.number().min(0),
  total: z.number().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz || quiz.profileId !== profile.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const performanceScore100 = Math.round((parsed.data.score / parsed.data.total) * 100);
  await bumpSkillMastery(profile.id, quiz.subject, quiz.theme, performanceScore100);

  return NextResponse.json({ ok: true });
}
