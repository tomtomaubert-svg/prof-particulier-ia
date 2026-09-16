"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import clsx from "clsx";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALL_SUBJECTS } from "@/lib/quiz/catalog";
import { LEVEL_GROUPS, SCHOOL_LEVELS } from "@/lib/student/levels";
import { safeJson } from "@/lib/client/safe-json";

type Step = "subject" | "level" | "chapters";

// Explorateur "par matière et niveau" : au lieu d'une liste de thèmes tapée à
// la main (forcément incomplète), l'IA génère la liste RÉELLE et complète
// des chapitres pour la matière + le niveau choisis (section 4 : la liste de
// matières "n'est PAS exhaustive", ne jamais bloquer dessus).
export function ChapterExplorer() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("subject");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [levelLabel, setLevelLabel] = useState<string | null>(null);
  const [chapters, setChapters] = useState<string[] | null>(null);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [generatingChapter, setGeneratingChapter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredSubjects = useMemo(() => {
    const q = subjectQuery.trim().toLowerCase();
    if (!q) return ALL_SUBJECTS;
    return ALL_SUBJECTS.filter((s) => s.toLowerCase().includes(q));
  }, [subjectQuery]);

  async function loadChapters(chosenSubject: string, chosenLevel: string) {
    setLoadingChapters(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: chosenSubject, levelLabel: chosenLevel }),
      });
      const { data, readError } = await safeJson(res);
      if (readError) throw new Error(readError);
      const body = data as { chapters?: string[]; error?: string };
      if (!body?.chapters) throw new Error(body?.error || "Échec du chargement des chapitres");
      setChapters(body.chapters);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoadingChapters(false);
    }
  }

  async function startQuiz(chapter: string) {
    if (!subject || !levelLabel) return;
    setGeneratingChapter(chapter);
    setError(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, theme: chapter, levelLabel }),
      });
      const { data, readError } = await safeJson(res);
      if (readError) throw new Error(readError);
      const body = data as { id?: string; error?: string };
      if (body?.id) {
        router.push(`/reviser/${body.id}`);
        return;
      }
      throw new Error(body?.error || "Échec de la génération du quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setGeneratingChapter(null);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Explorer par matière et niveau</p>
          {step !== "subject" && (
            <button
              onClick={() => {
                if (step === "chapters") {
                  setStep("level");
                  setChapters(null);
                } else {
                  setStep("subject");
                  setLevelLabel(null);
                }
                setError(null);
              }}
              className="text-xs text-primary flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Retour
            </button>
          )}
        </div>

        {step === "subject" && (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={subjectQuery}
                onChange={(e) => setSubjectQuery(e.target.value)}
                placeholder="Toutes les matières…"
                className="w-full h-11 pl-9 pr-3 rounded-[var(--radius-md)] border border-border bg-background outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {filteredSubjects.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSubject(s);
                    setStep("level");
                  }}
                  className="px-3 py-1.5 rounded-[var(--radius-full)] border border-border hover:border-primary text-sm transition-colors flex items-center gap-1"
                >
                  {s} <ChevronRight size={12} />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "level" && subject && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Matière : <strong className="text-text-primary">{subject}</strong>
            </p>
            {LEVEL_GROUPS.map((g) => (
              <div key={g.group}>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">{g.label}</p>
                <div className="flex flex-wrap gap-2">
                  {SCHOOL_LEVELS.filter((l) => l.group === g.group).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLevelLabel(l.label);
                        setStep("chapters");
                        loadChapters(subject, l.label);
                      }}
                      className="px-3 py-1.5 rounded-[var(--radius-full)] border border-border hover:border-primary text-sm transition-colors"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setLevelLabel("Général");
                setStep("chapters");
                loadChapters(subject, "Général");
              }}
              className="px-3 py-1.5 rounded-[var(--radius-full)] border border-border hover:border-primary text-sm transition-colors"
            >
              Général / tous niveaux
            </button>
          </div>
        )}

        {step === "chapters" && subject && levelLabel && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">{subject}</strong> · {levelLabel}
            </p>
            {loadingChapters ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary py-6 justify-center">
                <Loader2 size={16} className="animate-spin" /> Recherche de tous les chapitres…
              </div>
            ) : error && !chapters ? (
              <div className="space-y-2">
                <p className="text-error text-sm">{error}</p>
                <Button size="sm" onClick={() => loadChapters(subject, levelLabel)}>
                  Réessayer
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {error && <p className="text-error text-sm">{error}</p>}
                {chapters?.map((c) => (
                  <button
                    key={c}
                    onClick={() => startQuiz(c)}
                    disabled={generatingChapter !== null}
                    className={clsx(
                      "w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] border border-border hover:border-primary transition-colors flex items-center justify-between disabled:opacity-50"
                    )}
                  >
                    <span className="text-sm">{c}</span>
                    {generatingChapter === c && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
