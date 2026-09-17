import type { FlashcardDeck, FlashcardItem } from "@prisma/client";

export interface FlashcardItemDTO {
  id: string;
  question: string;
  answer: string;
  box: number;
  nextReviewAt: string;
  reviewCount: number;
}

export interface FlashcardDeckDTO {
  id: string;
  subject: string;
  theme: string;
  levelLabel: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  cards: FlashcardItemDTO[];
}

export function serializeFlashcardItem(item: FlashcardItem): FlashcardItemDTO {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
    box: item.box,
    nextReviewAt: item.nextReviewAt.toISOString(),
    reviewCount: item.reviewCount,
  };
}

export function serializeFlashcardDeck(deck: FlashcardDeck & { cards?: FlashcardItem[] }): FlashcardDeckDTO {
  return {
    id: deck.id,
    subject: deck.subject,
    theme: deck.theme,
    levelLabel: deck.levelLabel,
    status: deck.status,
    errorMessage: deck.errorMessage,
    createdAt: deck.createdAt.toISOString(),
    cards: (deck.cards ?? []).map(serializeFlashcardItem),
  };
}
