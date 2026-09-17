import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runExplainAnalyzeStep, runExplainGenerateStep } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";
import { serializeExplanation } from "@/lib/explication/serialize";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";
import type { DocumentAnalysis } from "@/lib/ai/schemas";

export const maxDuration = 60;

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Format d'image invalide");
  return { mimeType: match[1], base64: match[2] };
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const explanation = await prisma.explanation.findUnique({ where: { id } });
  if (!explanation || explanation.profileId !== profile.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (explanation.status === "done" || explanation.status === "error") {
    return NextResponse.json(serializeExplanation(explanation));
  }

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    if (!explanation.analysisJson) {
      const image = parseDataUrl(explanation.imageDataUrl);
      const analysis = await runExplainAnalyzeStep({ mimeType: image.mimeType, dataBase64: image.base64 }, levelContext);
      const updated = await prisma.explanation.update({
        where: { id },
        data: {
          status: "analyzed",
          subject: analysis.subject,
          chapter: analysis.chapter,
          detectedLevel: analysis.detectedLevel,
          analysisJson: JSON.stringify(analysis),
        },
      });
      return NextResponse.json(serializeExplanation(updated));
    }

    const analysis = JSON.parse(explanation.analysisJson) as DocumentAnalysis;
    const round = await runExplainGenerateStep(levelContext, analysis, explanation.depth as "simple" | "normal" | "approfondi");
    const updated = await prisma.explanation.update({
      where: { id },
      data: { status: "done", roundsJson: JSON.stringify([round]) },
    });

    await bumpSkillMastery(profile.id, analysis.subject, analysis.chapter);

    return NextResponse.json(serializeExplanation(updated));
  } catch (err) {
    const message = describePipelineError(err);
    const updated = await prisma.explanation.update({
      where: { id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeExplanation(updated), { status: 502 });
  }
}
