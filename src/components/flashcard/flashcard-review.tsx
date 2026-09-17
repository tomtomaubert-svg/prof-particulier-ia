"use client";

import { useState } from "react";
import clsx from "clsx";
import { Brain, Check, RotateCcw, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlashcardDeckDTO, FlashcardItemDTO } from "@/lib/flashcard/serialize";
import type { FlashcardReviewResult } from "@/lib/flashcard/leitner";

const RESULT_LABELS: Record<FlashcardReviewResult, { label: string; icon: typeof Check; className: string }> = {
  dontknow: { label: "Je ne sais pas", icon: X, className: "border-error text-error hover:bg-error/10" },
  review: { label: "À revoir", icon: RotateCcw, className: "border-warning text-warning hover:bg-warning/10" },
  know: { label: "Je connais", icon: Check, className: "border-success text-success hover:bg-success/10" },
};

// File de révision côté client (section 29) : les cartes "à revoir" / "je ne
// sais pas" repassent en fin de file DANS la session pour être renforcées
// tout de suite, tandis que la vraie répétition espacée (box/nextReviewAt)
// est persistée côté serveur pour les prochaines sessions.
function dueCardsFirst(cards: FlashcardItemDTO[]): FlashcardItemDTO[] {
  const now = Date.now();
  const due = cards.filter((c) => new Date(c.nextReviewAt).getTime() <= now);
  return due.length > 0 ? due : cards;
}

export function FlashcardReview({ deck }: { deck: FlashcardDeckDTO }) {
  const [queue, setQueue] = useState<FlashcardItemDTO[]>(() => dueCardsFirst(deck.cards));
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ know: 0, review: 0, dontknow: 0 });
  const totalCards = deck.cards.length;

  const current = queue[0];
  const reviewedCount = stats.know + stats.review + stats.dontknow;

  async function handleAnswer(result: FlashcardReviewResult) {
    if (!current || submitting) return;
    setSubmitting(true);
    setStats((prev) => ({ ...prev, [result]: prev[result] + 1 }));

    try {
      await fetch(`/api/flashcards/${deck.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: current.id, result }),
      });
    } catch {
      // pas bloquant : la carte reste dans la file locale de toute façon
    }

    setQueue((prev) => {
      const rest = prev.slice(1);
      if (result === "know") return rest;
      return [...rest, current];
    });
    setFlipped(false);
    setSubmitting(false);
  }

  if (totalCards === 0) {
    return (
      <Card>
        <CardBody className="text-sm text-text-secondary text-center py-8">Ce paquet ne contient aucune carte.</CardBody>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card className="bg-primary text-white">
        <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
          <Brain size={32} />
          <p className="text-lg font-semibold">Session terminée !</p>
          <p className="text-sm opacity-90">
            {stats.know} maîtrisées · {stats.review} à revoir · {stats.dontknow} à revoir de près
          </p>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => {
              setQueue(deck.cards);
              setStats({ know: 0, review: 0, dontknow: 0 });
              setFlipped(false);
            }}
          >
            Refaire une session
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary text-center">
        {reviewedCount} révisées · {queue.length} restantes
      </p>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="w-full text-left"
        aria-label="Retourner la carte"
      >
        <Card className={clsx("min-h-[220px] transition-colors", flipped ? "bg-primary-soft" : "bg-surface-raised")}>
          <CardBody className="flex items-center justify-center min-h-[220px] p-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-secondary mb-3">
                {flipped ? "Réponse" : "Question"}
              </p>
              <p className="text-lg font-medium whitespace-pre-wrap">{flipped ? current.answer : current.question}</p>
              {!flipped && <p className="text-xs text-text-secondary mt-4">Touche la carte pour voir la réponse</p>}
            </div>
          </CardBody>
        </Card>
      </button>

      {flipped && (
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(RESULT_LABELS) as FlashcardReviewResult[]).map((result) => {
            const { label, icon: Icon, className } = RESULT_LABELS[result];
            return (
              <button
                key={result}
                disabled={submitting}
                onClick={() => handleAnswer(result)}
                className={clsx(
                  "flex flex-col items-center gap-1 py-3 rounded-[var(--radius-md)] border text-xs font-medium transition-colors disabled:opacity-50",
                  className
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
