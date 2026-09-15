"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QUIZ_CATALOG, type QuizThemeDef } from "@/lib/quiz/catalog";

export function QuizCatalogBrowser({ ownLevelLabel }: { ownLevelLabel: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUIZ_CATALOG;
    return QUIZ_CATALOG.filter((t) =>
      `${t.subject} ${t.theme} ${t.levelLabel}`.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, QuizThemeDef[]>();
    for (const t of filtered) {
      if (!map.has(t.subject)) map.set(t.subject, []);
      map.get(t.subject)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  async function startQuiz(subject: string, theme: string, levelLabel: string) {
    const key = `${subject}-${theme}`;
    setGenerating(key);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, theme, levelLabel }),
      });
      const data = await res.json();
      if (data?.id) {
        router.push(`/reviser/${data.id}`);
        return;
      }
      throw new Error(data?.error || "Échec de la génération du quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setGenerating(null);
    }
  }

  const hasExactCustomMatch = filtered.some((t) => t.theme.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un thème, une matière, un niveau…"
          className="w-full h-11 pl-9 pr-3 rounded-[var(--radius-md)] border border-border bg-background outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      {query.trim().length > 1 && !hasExactCustomMatch && (
        <Card className="border-primary">
          <CardBody className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles size={16} className="text-primary shrink-0" />
              <span>
                Créer un quiz sur <strong>« {query.trim()} »</strong>
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => startQuiz("Personnalisé", query.trim(), ownLevelLabel)}
              disabled={generating !== null}
            >
              {generating === `Personnalisé-${query.trim()}` ? <Loader2 size={14} className="animate-spin" /> : "Créer"}
            </Button>
          </CardBody>
        </Card>
      )}

      {grouped.length === 0 ? (
        <Card>
          <CardBody className="text-sm text-text-secondary">Aucun thème trouvé dans le catalogue.</CardBody>
        </Card>
      ) : (
        <div className="space-y-5">
          {grouped.map(([subject, items]) => (
            <div key={subject}>
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">{subject}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((t) => {
                  const key = `${t.subject}-${t.theme}`;
                  const isGenerating = generating === key;
                  return (
                    <button
                      key={t.id}
                      onClick={() => startQuiz(t.subject, t.theme, t.levelLabel)}
                      disabled={generating !== null}
                      className="text-left p-3 rounded-[var(--radius-md)] border border-border hover:border-primary transition-colors disabled:opacity-50 bg-surface"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{t.theme}</p>
                        {isGenerating && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}
                      </div>
                      <Badge tone="neutral" className="mt-1">
                        {t.levelLabel}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
