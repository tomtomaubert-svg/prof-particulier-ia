"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Loader2 } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { compressImageFile } from "@/lib/client/compress-image";
import { safeJson } from "@/lib/client/safe-json";

const PIPELINE_STEPS = [
  "Lecture de la photo…",
  "Compréhension de l'exercice…",
  "Résolution selon ton niveau…",
  "Double vérification…",
  "Contrôle qualité de la correction…",
];

export function ImageUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<"apprendre" | "correction">("correction");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, PIPELINE_STEPS.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    try {
      const compressed = await compressImageFile(file);
      setPreview(compressed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de lire cette image.");
    }
  }

  async function submit() {
    if (!preview) return;
    setLoading(true);
    setStepIndex(0);
    setError(null);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: preview, mode }),
      });
      const { data, readError } = await safeJson(res);
      if (readError) throw new Error(readError);
      const body = data as { id?: string; error?: string };
      if (body?.id) {
        // Même en cas d'erreur pipeline (statut "error"), l'exercice existe :
        // on laisse la page de résultat afficher le message d'échec détaillé.
        router.push(`/resoudre/${body.id}`);
        return;
      }
      throw new Error(body?.error || "Échec de l'analyse");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center text-center gap-4 py-10">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="font-medium">{PIPELINE_STEPS[stepIndex]}</p>
          <p className="text-xs text-text-secondary">Ça peut prendre jusqu&apos;à une minute, on vérifie tout deux fois.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <Card>
          <CardBody className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Exercice à résoudre" className="w-full rounded-[var(--radius-md)] max-h-96 object-contain bg-surface-raised" />
            <div className="flex gap-2">
              <button
                onClick={() => setMode("correction")}
                className={clsx(
                  "flex-1 py-2 rounded-[var(--radius-md)] border text-sm transition-colors",
                  mode === "correction" ? "border-primary bg-primary-soft" : "border-border"
                )}
              >
                Correction directe
              </button>
              <button
                onClick={() => setMode("apprendre")}
                className={clsx(
                  "flex-1 py-2 rounded-[var(--radius-md)] border text-sm transition-colors",
                  mode === "apprendre" ? "border-primary bg-primary-soft" : "border-border"
                )}
              >
                Mode Apprendre
              </button>
            </div>
            {error && <p className="text-error text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPreview(null)}>
                Changer de photo
              </Button>
              <Button className="flex-1" onClick={submit}>
                Analyser
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="p-8 rounded-[var(--radius-lg)] border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center gap-3"
          >
            <Camera size={28} className="text-primary" />
            <span className="font-medium">Prendre une photo</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-[var(--radius-lg)] border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center gap-3"
          >
            <Upload size={28} className="text-primary" />
            <span className="font-medium">Importer une image</span>
          </button>
        </div>
      )}
    </div>
  );
}
