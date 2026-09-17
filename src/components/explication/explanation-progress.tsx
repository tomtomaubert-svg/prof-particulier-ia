"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { safeJson } from "@/lib/client/safe-json";
import { ExplanationView } from "@/components/explication/explanation-view";
import type { ExplanationDTO } from "@/lib/explication/serialize";

const STEP_LABELS: Record<string, string> = {
  pending: "Lecture de la photo…",
  analyzed: "Préparation de l'explication…",
};

const TERMINAL = new Set(["done", "error"]);

/** Même logique que ExerciseProgress : une requête par étape, reprise automatique. */
export function ExplanationProgress({ initial }: { initial: ExplanationDTO }) {
  const [explanation, setExplanation] = useState(initial);
  const runningRef = useRef(false);

  useEffect(() => {
    if (TERMINAL.has(explanation.status) || runningRef.current) return;
    runningRef.current = true;

    let cancelled = false;

    async function advanceLoop() {
      let current = explanation;
      while (!cancelled && !TERMINAL.has(current.status)) {
        try {
          const res = await fetch(`/api/explications/${current.id}/advance`, { method: "POST" });
          const { data, readError } = await safeJson(res);
          if (readError) {
            if (!cancelled) setExplanation((prev) => ({ ...prev, status: "error", errorMessage: readError }));
            return;
          }
          current = data as ExplanationDTO;
          if (!cancelled) setExplanation(current);
        } catch {
          if (!cancelled) {
            setExplanation((prev) => ({
              ...prev,
              status: "error",
              errorMessage: "Connexion perdue pendant l'analyse. Réessaie.",
            }));
          }
          return;
        }
      }
      runningRef.current = false;
    }

    advanceLoop();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ne doit démarrer qu'une fois par montage
  }, []);

  if (TERMINAL.has(explanation.status)) {
    return <ExplanationView initial={explanation} />;
  }

  return (
    <Card>
      <CardBody className="flex flex-col items-center text-center gap-4 py-10">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="font-medium">{STEP_LABELS[explanation.status] ?? "Analyse en cours…"}</p>
      </CardBody>
    </Card>
  );
}
