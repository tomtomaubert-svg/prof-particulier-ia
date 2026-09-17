import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { serializeExerciseAttempt } from "@/lib/exercise/serialize";

// Crée seulement la ligne (aucun appel IA ici) : le pipeline avance ensuite
// étape par étape via /api/exercises/[id]/advance, chaque étape avec son
// propre budget de temps complet plutôt qu'un seul appel monolithe risquant
// de dépasser les 60s d'une fonction serverless Vercel Hobby.
const BodySchema = z.object({
  imageDataUrl: z.string().startsWith("data:image/"),
  mode: z.enum(["apprendre", "correction"]).default("correction"),
});

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { imageDataUrl, mode } = parsed.data;

  if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,.+$/.test(imageDataUrl)) {
    return NextResponse.json({ error: "Image invalide" }, { status: 400 });
  }

  const attempt = await prisma.exerciseAttempt.create({
    data: { profileId: profile.id, imageDataUrl, mode, status: "pending" },
  });

  return NextResponse.json(serializeExerciseAttempt(attempt));
}
