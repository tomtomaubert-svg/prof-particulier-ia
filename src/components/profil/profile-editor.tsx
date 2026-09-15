"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { LEVEL_GROUPS, SCHOOL_LEVELS, SPECIALITIES, TRACKS, getLevelDef, type LevelGroup } from "@/lib/student/levels";
import type { StudentProfile } from "@/lib/student/types";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProfileEditor({ profile }: { profile: StudentProfile }) {
  const router = useRouter();
  const initialDef = getLevelDef(profile.schoolLevel);
  const [group, setGroup] = useState<LevelGroup>(initialDef.group);
  const [schoolLevel, setSchoolLevel] = useState(profile.schoolLevel);
  const [track, setTrack] = useState<string | null>(profile.track ?? null);
  const [specialities, setSpecialities] = useState<string[]>(profile.specialities);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const levelDef = getLevelDef(schoolLevel);
  const needsTrack = levelDef.hasTrackAndSpecialities;

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolLevel,
        track: needsTrack ? track : null,
        specialities: needsTrack ? specialities : [],
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-1">
          <p className="text-sm text-text-secondary">Nom</p>
          <p className="font-medium">{profile.displayName}</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <p className="font-medium">Niveau scolaire</p>
          <div className="flex flex-wrap gap-2">
            {LEVEL_GROUPS.map((g) => (
              <button
                key={g.group}
                onClick={() => setGroup(g.group)}
                className={clsx(
                  "px-3 py-1.5 rounded-[var(--radius-full)] border text-sm transition-colors",
                  group === g.group ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SCHOOL_LEVELS.filter((l) => l.group === group).map((l) => (
              <button
                key={l.code}
                onClick={() => setSchoolLevel(l.code)}
                className={clsx(
                  "p-3 rounded-[var(--radius-md)] border text-sm text-left transition-colors",
                  schoolLevel === l.code ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          {needsTrack && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <p className="text-sm text-text-secondary mb-2">Voie</p>
                <div className="flex flex-wrap gap-2">
                  {TRACKS.map((t) => (
                    <button
                      key={t.code}
                      onClick={() => setTrack(t.code)}
                      className={clsx(
                        "px-3 py-1.5 rounded-[var(--radius-full)] border text-sm transition-colors",
                        track === t.code ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Spécialités</p>
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
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {saved && <p className="text-sm text-success">Profil mis à jour.</p>}
      </div>
      <p className="text-xs text-text-secondary">
        Changer de niveau ne supprime pas ton historique de fiches et d&apos;exercices.
      </p>
    </div>
  );
}
