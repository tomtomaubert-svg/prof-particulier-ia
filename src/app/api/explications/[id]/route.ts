import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeExplanation } from "@/lib/explication/serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const explanation = await prisma.explanation.findUnique({ where: { id } });
  if (!explanation || explanation.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json(serializeExplanation(explanation));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const explanation = await prisma.explanation.findUnique({ where: { id } });
  if (!explanation || explanation.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  await prisma.explanation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
