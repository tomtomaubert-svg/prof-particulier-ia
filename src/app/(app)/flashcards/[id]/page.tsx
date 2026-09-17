import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeFlashcardDeck } from "@/lib/flashcard/serialize";
import { FlashcardReview } from "@/components/flashcard/flashcard-review";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function FlashcardDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getCurrentProfileId();
  if (!profileId) notFound();

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id },
    include: { cards: { orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }] } },
  });
  if (!deck || deck.profileId !== profileId) notFound();

  const dto = serializeFlashcardDeck(deck);

  if (dto.status === "error") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Flashcards</h1>
        <Card>
          <CardBody className="space-y-2">
            <p className="font-medium text-error">La génération a échoué</p>
            <p className="text-sm text-text-secondary">{dto.errorMessage}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (dto.cards.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Flashcards</h1>
        <Card>
          <CardBody className="text-sm text-text-secondary">Génération en cours…</CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge tone="primary">{dto.subject}</Badge>
          <Badge tone="neutral">{dto.levelLabel}</Badge>
        </div>
        <h1 className="text-2xl font-semibold">{dto.theme}</h1>
      </div>
      <FlashcardReview deck={dto} />
    </div>
  );
}
