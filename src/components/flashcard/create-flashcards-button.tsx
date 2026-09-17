"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeJson } from "@/lib/client/safe-json";

export function CreateFlashcardsButton({ sheetId }: { sheetId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId }),
      });
      const { data, readError } = await safeJson(res);
      if (readError) throw new Error(readError);
      const body = data as { id?: string; error?: string };
      if (body?.id) {
        router.push(`/flashcards/${body.id}`);
        return;
      }
      throw new Error(body?.error || "Échec de la génération des flashcards");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button variant="secondary" onClick={handleClick} disabled={loading} className="w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
        {loading ? "Génération des flashcards…" : "Créer des flashcards"}
      </Button>
      {error && <p className="text-xs text-error text-center">{error}</p>}
    </div>
  );
}
