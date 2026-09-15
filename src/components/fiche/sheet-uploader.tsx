"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Loader2, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const PIPELINE_STEPS = [
  "Lecture des pages…",
  "Compréhension du cours…",
  "Construction de la fiche…",
  "Contrôle qualité…",
];

const SHEET_TYPES = [
  { value: "express", label: "Express", description: "L'essentiel, ultra rapide" },
  { value: "standard", label: "Standard", description: "Synthèse équilibrée" },
  { value: "complete", label: "Complète", description: "Tous les détails du chapitre" },
] as const;

export function SheetUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [sheetType, setSheetType] = useState<"express" | "standard" | "complete">("standard");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setStepIndex((i) => Math.min(i + 1, PIPELINE_STEPS.length - 1)), 3000);
    return () => clearInterval(interval);
  }, [loading]);

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  async function submit() {
    if (images.length === 0) return;
    setLoading(true);
    setStepIndex(0);
    setError(null);
    try {
      const res = await fetch("/api/fiches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, sheetType }),
      });
      const data = await res.json();
      if (data?.id) {
        router.push(`/fiche/${data.id}`);
        return;
      }
      throw new Error(data?.error || "Échec de la création de la fiche");
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
          <p className="text-xs text-text-secondary">Ça peut prendre jusqu&apos;à une minute.</p>
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
        onChange={(e) => onFiles(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden bg-surface-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="p-6 rounded-[var(--radius-lg)] border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center gap-2"
        >
          <Camera size={24} className="text-primary" />
          <span className="font-medium text-sm">Photographier une page</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-[var(--radius-lg)] border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center gap-2"
        >
          <Upload size={24} className="text-primary" />
          <span className="font-medium text-sm">Importer des images</span>
        </button>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-medium">Type de fiche</p>
          <div className="grid grid-cols-3 gap-2">
            {SHEET_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSheetType(t.value)}
                className={clsx(
                  "p-3 rounded-[var(--radius-md)] border text-left transition-colors",
                  sheetType === t.value ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                )}
              >
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-text-secondary">{t.description}</p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {error && <p className="text-error text-sm">{error}</p>}
      <Button className="w-full" size="lg" disabled={images.length === 0} onClick={submit}>
        Créer la fiche{images.length > 1 ? ` (${images.length} pages)` : ""}
      </Button>
    </div>
  );
}
