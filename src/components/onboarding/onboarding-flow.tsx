"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEVEL_GROUPS, SCHOOL_LEVELS, SPECIALITIES, TRACKS, type LevelGroup } from "@/lib/student/levels";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import clsx from "clsx";

type Step = "name" | "group" | "level" | "track" | "confirm";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [displayName, setDisplayName] = useState("");
  const [group, setGroup] = useState<LevelGroup | null>(null);
  const [schoolLevel, setSchoolLevel] = useState<string | null>(null);
  const [track, setTrack] = useState<string | null>(null);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levelDef = schoolLevel ? SCHOOL_LEVELS.find((l) => l.code === schoolLevel) : null;
  const needsTrack = levelDef?.hasTrackAndSpecialities;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || "Élève",
          schoolLevel,
          track: needsTrack ? track : null,
          specialities: needsTrack ? specialities : [],
        }),
      });
      if (!res.ok) throw new Error("Impossible de créer le profil");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-6">
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-primary">Bienvenue</p>
          <h1 className="text-2xl font-semibold">
            {step === "name" && "Comment tu t'appelles ?"}
            {step === "group" && "Pour commencer, quel est ton niveau ?"}
            {step === "level" && "Précise ta classe"}
            {step === "track" && "Ta voie et tes spécialités"}
            {step === "confirm" && "C'est parti !"}
          </h1>
        </div>

        {step === "name" && (
          <div className="space-y-4">
            <input
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ton prénom"
              className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-border bg-background text-text-primary outline-none focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && setStep("group")}
            />
            <Button className="w-full" size="lg" onClick={() => setStep("group")}>
              Continuer
            </Button>
          </div>
        )}

        {step === "group" && (
          <div className="grid grid-cols-2 gap-3">
            {LEVEL_GROUPS.map((g) => (
              <button
                key={g.group}
                onClick={() => {
                  setGroup(g.group);
                  setStep("level");
                }}
                className="p-4 rounded-[var(--radius-md)] border border-border bg-background hover:border-primary hover:bg-primary-soft transition-colors text-left"
              >
                <p className="font-medium">{g.label}</p>
              </button>
            ))}
          </div>
        )}

        {step === "level" && group && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {SCHOOL_LEVELS.filter((l) => l.group === group).map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setSchoolLevel(l.code);
                    setStep(l.hasTrackAndSpecialities ? "track" : "confirm");
                  }}
                  className={clsx(
                    "p-4 rounded-[var(--radius-md)] border text-left transition-colors",
                    schoolLevel === l.code
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-background hover:border-primary"
                  )}
                >
                  <p className="font-medium">{l.label}</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep("group")}>
              ← Retour
            </Button>
          </div>
        )}

        {step === "track" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary mb-2">Voie</p>
              <div className="flex flex-wrap gap-2">
                {TRACKS.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => setTrack(t.code)}
                    className={clsx(
                      "px-3 py-2 rounded-[var(--radius-full)] border text-sm transition-colors",
                      track === t.code ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Spécialités suivies (optionnel)</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setSpecialities((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
                    }
                    className={clsx(
                      "px-3 py-1.5 rounded-[var(--radius-full)] border text-xs transition-colors",
                      specialities.includes(s) ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("level")}>
                ← Retour
              </Button>
              <Button className="flex-1" onClick={() => setStep("confirm")} disabled={!track}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-md)] bg-primary-soft p-4 text-sm">
              <p>
                <strong>{displayName || "Élève"}</strong> — {levelDef?.label}
                {track ? ` (${TRACKS.find((t) => t.code === track)?.label})` : ""}
              </p>
              {specialities.length > 0 && <p className="text-text-secondary mt-1">{specialities.join(", ")}</p>}
              <p className="text-text-secondary mt-2">
                Tu pourras changer ton niveau à tout moment depuis ton profil.
              </p>
            </div>
            {error && <p className="text-error text-sm">{error}</p>}
            <Button className="w-full" size="lg" onClick={submit} disabled={submitting}>
              {submitting ? "Création…" : "Accéder à mon espace"}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
