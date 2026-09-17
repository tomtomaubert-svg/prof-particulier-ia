"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, Camera, BookOpen, Lightbulb, Brain, Trash2, Check, Loader2 } from "lucide-react";
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

const KIND_META: Record<Kind, { icon: React.ElementType; label: string; plural: string; apiBase: string }> = {
  exercice: { icon: Camera, label: "Exercice", plural: "Exercices", apiBase: "/api/exercises" },
  fiche: { icon: BookOpen, label: "Fiche", plural: "Fiches", apiBase: "/api/fiches" },
  explication: { icon: Lightbulb, label: "Explication", plural: "Explications", apiBase: "/api/explications" },
  quiz: { icon: Brain, label: "Quiz", plural: "Quiz", apiBase: "/api/quiz" },
};

const CONFIRM_TIMEOUT_MS = 4000;

export function LibraryList({ items: initialItems }: { items: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<Kind | "tous">("tous");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (kindFilter !== "tous" && i.kind !== kindFilter) return false;
      if (!q) return true;
      return `${i.subject ?? ""} ${i.chapter ?? ""}`.toLowerCase().includes(q);
    });
  }, [items, query, kindFilter]);

  async function performDelete(item: Item, key: string) {
    setDeletingKey(key);
    try {
      const res = await fetch(`${KIND_META[item.kind].apiBase}/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => !(i.kind === item.kind && i.id === item.id)));
      }
    } finally {
      setDeletingKey(null);
    }
  }

  // Pas de window.confirm() natif (peu fiable/cohérent sur mobile) : un
  // premier tap arme une confirmation dans l'interface elle-même, un second
  // tap dans les 4s déclenche vraiment la suppression.
  function handleTrashClick(item: Item, key: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);

    if (confirmingKey === key) {
      setConfirmingKey(null);
      performDelete(item, key);
      return;
    }

    setConfirmingKey(key);
    confirmTimerRef.current = setTimeout(() => setConfirmingKey(null), CONFIRM_TIMEOUT_MS);
  }

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
            const key = `${item.kind}-${item.id}`;
            const isDeleting = deletingKey === key;
            const isConfirming = confirmingKey === key;
            return (
              <Link key={key} href={item.href}>
                <Card className="hover:border-primary transition-colors">
                  <CardBody className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-[var(--radius-md)] bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.subject ?? "Sans titre"}</p>
                        <p className="text-xs text-text-secondary truncate">
                          {item.chapter ?? "—"} · {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isConfirming ? (
                        <span className="text-xs text-error font-medium">Supprimer ?</span>
                      ) : item.qualityScore != null ? (
                        <Badge tone={item.qualityScore >= 16 ? "success" : "warning"}>{item.qualityScore}/20</Badge>
                      ) : (
                        <Badge tone={item.status === "done" ? "success" : item.status === "error" ? "error" : "primary"}>
                          {item.status}
                        </Badge>
                      )}
                      <button
                        onClick={(e) => handleTrashClick(item, key, e)}
                        disabled={isDeleting}
                        aria-label={isConfirming ? "Confirmer la suppression" : "Supprimer"}
                        className={`h-8 w-8 flex items-center justify-center rounded-[var(--radius-md)] transition-colors disabled:opacity-50 ${
                          isConfirming
                            ? "bg-error text-white"
                            : "text-text-secondary hover:text-error hover:bg-error-soft"
                        }`}
                      >
                        {isDeleting ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : isConfirming ? (
                          <Check size={15} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
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
