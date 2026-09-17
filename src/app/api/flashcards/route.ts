import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runGenerateFlashcardsPipeline } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";
import { serializeFlashcardDeck } from "@/lib/flashcard/serialize";
import type { RevisionSheetContent } from "@/lib/ai/schemas";

export const maxDuration = 60;

// Génère les flashcards à partir d'une fiche DÉJÀ créée (section 29) : un
// seul appel IA texte (pas de photo), donc synchrone comme pour le Quiz —
// pas besoin du découpage multi-étapes des modules photo.
const BodySchema = z.object({ sheetId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const sheet = await prisma.revisionSheet.findUnique({ where: { id: parsed.data.sheetId } });
  if (!sheet || sheet.profileId !== profile.id || !sheet.contentJson) {
    return NextResponse.json({ error: "Fiche introuvable ou incomplète" }, { status: 404 });
  }

  const deck = await prisma.flashcardDeck.create({
    data: {
      profileId: profile.id,
      sourceSheetId: sheet.id,
      subject: sheet.subject ?? "Général",
      theme: sheet.chapter ?? "Fiche",
      levelLabel: sheet.detectedLevel ?? "Général",
      status: "generating",
    },
  });

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    const sheetContent = JSON.parse(sheet.contentJson) as RevisionSheetContent;
    const { cards } = await runGenerateFlashcardsPipeline(levelContext, sheetContent);

    await prisma.flashcardItem.createMany({
      data: cards.map((c) => ({ deckId: deck.id, question: c.question, answer: c.answer })),
    });

    const updated = await prisma.flashcardDeck.update({
      where: { id: deck.id },
      data: { status: "done" },
      include: { cards: true },
    });

    return NextResponse.json(serializeFlashcardDeck(updated));
  } catch (err) {
    const message = describePipelineError(err);
    const updated = await prisma.flashcardDeck.update({
      where: { id: deck.id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeFlashcardDeck(updated), { status: 502 });
  }
}
