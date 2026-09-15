"use client";

import { useState } from "react";
import { MessageCircleQuestion, Lightbulb, HelpCircle, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExplanationDTO } from "@/lib/explication/serialize";

export function ExplanationView({ initial }: { initial: ExplanationDTO }) {
  const [explanation, setExplanation] = useState(initial);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (explanation.status === "error") {
    return (
      <Card>
        <CardBody className="space-y-2">
          <p className="font-medium text-error">L&apos;explication a échoué</p>
          <p className="text-sm text-text-secondary">{explanation.errorMessage}</p>
        </CardBody>
      </Card>
    );
  }

  const round = explanation.rounds[explanation.rounds.length - 1];
  if (!round) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-text-secondary">Analyse en cours ({explanation.status})…</p>
        </CardBody>
      </Card>
    );
  }

  async function retry() {
    setRetrying(true);
    setError(null);
    try {
      const res = await fetch(`/api/explications/${explanation.id}/relance`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec de la relance");
      setExplanation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="primary">{explanation.subject}</Badge>
        {explanation.chapter && <Badge tone="neutral">{explanation.chapter}</Badge>}
        {explanation.rounds.length > 1 && (
          <Badge tone="neutral">Tentative {explanation.rounds.length}</Badge>
        )}
      </div>

      {round.unreadableParts.length > 0 && (
        <Card className="border-warning">
          <CardBody className="flex gap-2 items-start text-sm">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Certains éléments ne sont pas assez lisibles</p>
              <ul className="list-disc pl-4 text-text-secondary mt-1 space-y-0.5">
                {round.unreadableParts.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="bg-primary text-white">
        <CardBody>
          <p className="text-xs uppercase tracking-wide opacity-80">En une phrase</p>
          <p className="text-lg font-medium mt-1">{round.inOneSentence}</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-2">
          <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Pour comprendre</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{round.toUnderstand}</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wide">
            <Lightbulb size={16} /> Exemple
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{round.example}</p>
        </CardBody>
      </Card>

      {round.analogy && (
        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wide">
              <MessageCircleQuestion size={16} /> Imagine que...
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{round.analogy}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="space-y-2">
          <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide">À retenir</p>
          <p className="text-sm leading-relaxed">{round.keyTakeaway}</p>
        </CardBody>
      </Card>

      <Card className="border-primary">
        <CardBody className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wide">
            <HelpCircle size={16} /> Vérifions
          </div>
          <p className="text-sm leading-relaxed">{round.checkQuestion}</p>
        </CardBody>
      </Card>

      {error && <p className="text-error text-sm">{error}</p>}

      <Button variant="secondary" className="w-full" onClick={retry} disabled={retrying}>
        {retrying ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Recherche d&apos;une autre approche…
          </>
        ) : (
          "Je n'ai toujours pas compris"
        )}
      </Button>
    </div>
  );
}
