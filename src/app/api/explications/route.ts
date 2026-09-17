import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { serializeExplanation } from "@/lib/explication/serialize";

// Crée seulement la ligne (aucun appel IA ici) : le pipeline avance ensuite
// étape par étape via /api/explications/[id]/advance — voir le commentaire
// sur /api/exercises pour la raison (limite de 60s des fonctions Vercel Hobby).
const BodySchema = z.object({
  imageDataUrl: z.string().startsWith("data:image/"),
  depth: z.enum(["simple", "normal", "approfondi"]).default("normal"),
});

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { imageDataUrl, depth } = parsed.data;

  if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,.+$/.test(imageDataUrl)) {
    return NextResponse.json({ error: "Image invalide" }, { status: 400 });
  }

  const explanation = await prisma.explanation.create({
    data: { profileId: profile.id, imageDataUrl, depth, status: "pending" },
  });

  return NextResponse.json(serializeExplanation(explanation));
}
