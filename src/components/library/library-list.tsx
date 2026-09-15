"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Camera, BookOpen, Lightbulb, Brain } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Kind = "exercice" | "fiche" | "explication" | "quiz";

interface Item {
  id: string;
  href: string;
  kind: Kind;
  subject: string | null;
  chapter: string | null;
  status: string;
  qualityScore: number | null;
  createdAt: string;
}

const KIND_META: Record<Kind, { icon: React.ElementType; label: string; plural: string }> = {
  exercice: { icon: Camera, label: "Exercice", plural: "Exercices" },
  fiche: { icon: BookOpen, label: "Fiche", plural: "Fiches" },
  explication: { icon: Lightbulb, label: "Explication", plural: "Explications" },
  quiz: { icon: Brain, label: "Quiz", plural: "Quiz" },
};

export function LibraryList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<Kind | "tous">("tous");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (kindFilter !== "tous" && i.kind !== kindFilter) return false;
      if (!q) return true;
      return `${i.subject ?? ""} ${i.chapter ?? ""}`.toLowerCase().includes(q);
    });
  }, [items, query, kindFilter]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une matière, un chapitre…"
          className="w-full h-11 pl-9 pr-3 rounded-[var(--radius-md)] border border-border bg-background outline-none focus:border-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(["tous", "exercice", "fiche", "explication", "quiz"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKindFilter(k)}
            className={`shrink-0 px-3 py-1.5 rounded-[var(--radius-full)] border text-xs transition-colors ${
              kindFilter === k ? "border-primary bg-primary-soft" : "border-border"
            }`}
          >
            {k === "tous" ? "Tous" : KIND_META[k].plural}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardBody className="text-sm text-text-secondary">Aucun résultat.</CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const Icon = KIND_META[item.kind].icon;
            return (
              <Link key={`${item.kind}-${item.id}`} href={item.href}>
                <Card className="hover:border-primary transition-colors">
                  <CardBody className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[var(--radius-md)] bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.subject ?? "Sans titre"}</p>
                        <p className="text-xs text-text-secondary">
                          {item.chapter ?? "—"} · {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    {item.qualityScore != null ? (
                      <Badge tone={item.qualityScore >= 16 ? "success" : "warning"}>{item.qualityScore}/20</Badge>
                    ) : (
                      <Badge tone={item.status === "done" ? "success" : item.status === "error" ? "error" : "primary"}>
                        {item.status}
                      </Badge>
                    )}
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
