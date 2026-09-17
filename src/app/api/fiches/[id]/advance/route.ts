import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runSheetAnalyzeStep, runSheetCreateStep, runSheetQualityStep } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";
import { serializeRevisionSheet } from "@/lib/fiche/serialize";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";
import type { DocumentAnalysis } from "@/lib/ai/schemas";

export const maxDuration = 60;

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Format d'image invalide");
  return { mimeType: match[1], base64: match[2] };
}

// Fait avancer le pipeline d'une étape par appel (analyse -> création ->
// qualité). Le client rappelle cette route en boucle jusqu'à "done"/"error".
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const sheet = await prisma.revisionSheet.findUnique({ where: { id } });
  if (!sheet || sheet.profileId !== profile.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (sheet.status === "done" || sheet.status === "error") {
    return NextResponse.json(serializeRevisionSheet(sheet));
  }

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    if (!sheet.analysisJson) {
      const images = (JSON.parse(sheet.imagesJson) as string[]).map((dataUrl) => {
        const { mimeType, base64 } = parseDataUrl(dataUrl);
        return { mimeType, dataBase64: base64 };
      });
      const analysis = await runSheetAnalyzeStep(images, levelContext);
      const updated = await prisma.revisionSheet.update({
        where: { id },
        data: {
          status: "analyzed",
          subject: analysis.subject,
          chapter: analysis.chapter,
          detectedLevel: analysis.detectedLevel,
          analysisJson: JSON.stringify(analysis),
        },
      });
      return NextResponse.json(serializeRevisionSheet(updated));
    }

    const analysis = JSON.parse(sheet.analysisJson) as DocumentAnalysis;

    if (!sheet.contentJson) {
      const content = await runSheetCreateStep(levelContext, analysis, sheet.sheetType);
      const updated = await prisma.revisionSheet.update({
        where: { id },
        data: { status: "created", contentJson: JSON.stringify(content) },
      });
      return NextResponse.json(serializeRevisionSheet(updated));
    }

    const contentSoFar = JSON.parse(sheet.contentJson);
    const { content, quality } = await runSheetQualityStep(levelContext, analysis, sheet.sheetType, contentSoFar);
    const updated = await prisma.revisionSheet.update({
      where: { id },
      data: {
        status: "done",
        contentJson: JSON.stringify(content),
        qualityJson: JSON.stringify(quality),
        qualityScore: quality.total,
      },
    });

    await bumpSkillMastery(profile.id, analysis.subject, analysis.chapter, quality.total * 5);

    return NextResponse.json(serializeRevisionSheet(updated));
  } catch (err) {
    const message = describePipelineError(err);
    const updated = await prisma.revisionSheet.update({
      where: { id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeRevisionSheet(updated), { status: 502 });
  }
}
