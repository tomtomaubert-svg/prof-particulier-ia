import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeFlashcardDeck } from "@/lib/flashcard/serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const deck = await prisma.flashcardDeck.findUnique({
    where: { id },
    include: { cards: { orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }] } },
  });
  if (!deck || deck.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json(serializeFlashcardDeck(deck));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const deck = await prisma.flashcardDeck.findUnique({ where: { id } });
  if (!deck || deck.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  await prisma.flashcardDeck.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
