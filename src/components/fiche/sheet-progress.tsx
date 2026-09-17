"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { safeJson } from "@/lib/client/safe-json";
import { SheetView } from "@/components/fiche/sheet-view";
import { CreateFlashcardsButton } from "@/components/flashcard/create-flashcards-button";
import { PdfDownloadLink } from "@/components/ui/pdf-download-link";
import type { RevisionSheetDTO } from "@/lib/fiche/serialize";

const STEP_LABELS: Record<string, string> = {
  pending: "Lecture des pages…",
  analyzed: "Construction de la fiche…",
  created: "Contrôle qualité…",
};

const TERMINAL = new Set(["done", "error"]);

/** Même logique que ExerciseProgress : une requête par étape, reprise automatique. */
export function SheetProgress({ initial }: { initial: RevisionSheetDTO }) {
  const [sheet, setSheet] = useState(initial);
  const runningRef = useRef(false);

  useEffect(() => {
    if (TERMINAL.has(sheet.status) || runningRef.current) return;
    runningRef.current = true;

    let cancelled = false;

    async function advanceLoop() {
      let current = sheet;
      while (!cancelled && !TERMINAL.has(current.status)) {
        try {
          const res = await fetch(`/api/fiches/${current.id}/advance`, { method: "POST" });
          const { data, readError } = await safeJson(res);
          if (readError) {
            if (!cancelled) setSheet((prev) => ({ ...prev, status: "error", errorMessage: readError }));
            return;
          }
          current = data as RevisionSheetDTO;
          if (!cancelled) setSheet(current);
        } catch {
          if (!cancelled) {
            setSheet((prev) => ({
              ...prev,
              status: "error",
              errorMessage: "Connexion perdue pendant la création. Réessaie.",
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

  if (TERMINAL.has(sheet.status)) {
    return (
      <div className="space-y-4">
        <SheetView sheet={sheet} />
        {sheet.status === "done" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <PdfDownloadLink href={`/api/fiches/${sheet.id}/pdf`} className="w-full" />
            <CreateFlashcardsButton sheetId={sheet.id} />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardBody className="flex flex-col items-center text-center gap-4 py-10">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="font-medium">{STEP_LABELS[sheet.status] ?? "Création en cours…"}</p>
        <p className="text-xs text-text-secondary">Ça peut prendre un moment.</p>
      </CardBody>
    </Card>
  );
}
