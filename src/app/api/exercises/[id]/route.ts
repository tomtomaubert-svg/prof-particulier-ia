import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeExerciseAttempt } from "@/lib/exercise/serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const attempt = await prisma.exerciseAttempt.findUnique({ where: { id } });
  if (!attempt || attempt.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json(serializeExerciseAttempt(attempt));
}
