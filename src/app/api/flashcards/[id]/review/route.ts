import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { applyFlashcardReview } from "@/lib/flashcard/leitner";
import { serializeFlashcardItem } from "@/lib/flashcard/serialize";

const BodySchema = z.object({
  cardId: z.string().min(1),
  result: z.enum(["know", "review", "dontknow"]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id: deckId } = await params;
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const card = await prisma.flashcardItem.findUnique({ where: { id: parsed.data.cardId } });
  if (!card || card.deckId !== deckId) {
    return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
  }

  const { box, nextReviewAt } = applyFlashcardReview(card.box, parsed.data.result);
  const updated = await prisma.flashcardItem.update({
    where: { id: card.id },
    data: { box, nextReviewAt, reviewCount: { increment: 1 } },
  });

  return NextResponse.json(serializeFlashcardItem(updated));
}
