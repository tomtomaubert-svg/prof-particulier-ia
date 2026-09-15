import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runExplainRetry } from "@/lib/ai/pipeline";
import { AIProviderError } from "@/lib/ai/provider";
import { serializeExplanation } from "@/lib/explication/serialize";
import type { DocumentAnalysis, ExplanationRound } from "@/lib/ai/schemas";

export const maxDuration = 60;

// "Je n'ai toujours pas compris" (section 22) : jamais répéter la même
// explication, on réutilise l'analyse déjà faite et on force un changement
// de méthode pédagogique.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const explanation = await prisma.explanation.findUnique({ where: { id } });
  if (!explanation || explanation.profileId !== profile.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (!explanation.analysisJson) {
    return NextResponse.json({ error: "Cette explication n'a pas encore d'analyse disponible" }, { status: 409 });
  }

  const analysis = JSON.parse(explanation.analysisJson) as DocumentAnalysis;
  const previousRounds = explanation.roundsJson ? (JSON.parse(explanation.roundsJson) as ExplanationRound[]) : [];
  const previousMethods = previousRounds.map((r) => r.methodUsed);

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    const newRound = await runExplainRetry({
      analysis,
      levelContext,
      depth: explanation.depth as "simple" | "normal" | "approfondi",
      previousMethods,
    });

    const updated = await prisma.explanation.update({
      where: { id },
      data: { roundsJson: JSON.stringify([...previousRounds, newRound]), status: "done" },
    });

    return NextResponse.json(serializeExplanation(updated));
  } catch (err) {
    const message =
      err instanceof AIProviderError
        ? err.message
        : "Une erreur est survenue pendant la relance. Réessaie dans quelques instants.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
