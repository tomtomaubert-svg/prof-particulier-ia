import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { serializeRevisionSheet } from "@/lib/fiche/serialize";

// Crée seulement la ligne (aucun appel IA ici) : le pipeline avance ensuite
// étape par étape via /api/fiches/[id]/advance — voir le commentaire sur
// /api/exercises pour la raison (limite de 60s des fonctions Vercel Hobby).
const BodySchema = z.object({
  images: z.array(z.string().startsWith("data:image/")).min(1).max(10),
  sheetType: z.enum(["express", "standard", "complete"]).default("standard"),
});

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { images, sheetType } = parsed.data;

  if (!images.every((img) => /^data:image\/[a-zA-Z0-9.+-]+;base64,.+$/.test(img))) {
    return NextResponse.json({ error: "Image invalide" }, { status: 400 });
  }

  const sheet = await prisma.revisionSheet.create({
    data: { profileId: profile.id, imagesJson: JSON.stringify(images), sheetType, status: "pending" },
  });

  return NextResponse.json(serializeRevisionSheet(sheet));
}
