"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { safeJson } from "@/lib/client/safe-json";
import { CorrectionView } from "@/components/exercise/correction-view";
import type { ExerciseAttemptDTO } from "@/lib/exercise/serialize";

const STEP_LABELS: Record<string, string> = {
  pending: "Lecture de la photo…",
  analyzed: "Résolution selon ton niveau…",
  solved: "Double vérification…",
  verified: "Contrôle qualité de la correction…",
};

const TERMINAL = new Set(["done", "error"]);

/**
 * Fait avancer le pipeline étape par étape (un appel réseau par étape, voir
 * /api/exercises/[id]/advance) plutôt qu'une seule requête monolithe qui
 * risquait de dépasser les 60s d'une fonction serverless Vercel Hobby sur
 * les photos denses. Reprend automatiquement là où c'est resté si la page
 * est rouverte plus tard sur un exercice pas encore terminé.
 */
export function ExerciseProgress({ initial }: { initial: ExerciseAttemptDTO }) {
  const [attempt, setAttempt] = useState(initial);
  const runningRef = useRef(false);

  useEffect(() => {
    if (TERMINAL.has(attempt.status) || runningRef.current) return;
    runningRef.current = true;

    let cancelled = false;

    async function advanceLoop() {
      let current = attempt;
      while (!cancelled && !TERMINAL.has(current.status)) {
        try {
          const res = await fetch(`/api/exercises/${current.id}/advance`, { method: "POST" });
          const { data, readError } = await safeJson(res);
          if (readError) {
            if (!cancelled) setAttempt((prev) => ({ ...prev, status: "error", errorMessage: readError }));
            return;
          }
          current = data as ExerciseAttemptDTO;
          if (!cancelled) setAttempt(current);
        } catch {
          if (!cancelled) {
            setAttempt((prev) => ({
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

  if (TERMINAL.has(attempt.status)) {
    return <CorrectionView attempt={attempt} />;
  }

  return (
    <Card>
      <CardBody className="flex flex-col items-center text-center gap-4 py-10">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="font-medium">{STEP_LABELS[attempt.status] ?? "Analyse en cours…"}</p>
        <p className="text-xs text-text-secondary">Ça peut prendre un moment, on vérifie tout deux fois.</p>
      </CardBody>
    </Card>
  );
}
