import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeRevisionSheet } from "@/lib/fiche/serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const sheet = await prisma.revisionSheet.findUnique({ where: { id } });
  if (!sheet || sheet.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json(serializeRevisionSheet(sheet));
}
