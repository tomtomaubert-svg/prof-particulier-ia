import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runCreateRevisionSheetPipeline } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";
import { serializeRevisionSheet } from "@/lib/fiche/serialize";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";

export const maxDuration = 120;

const BodySchema = z.object({
  images: z.array(z.string().startsWith("data:image/")).min(1).max(10),
  sheetType: z.enum(["express", "standard", "complete"]).default("standard"),
});

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Format d'image invalide");
  return { mimeType: match[1], base64: match[2] };
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { images, sheetType } = parsed.data;

  let parsedImages: { mimeType: string; base64: string }[];
  try {
    parsedImages = images.map(parseDataUrl);
  } catch {
    return NextResponse.json({ error: "Image invalide" }, { status: 400 });
  }

  const sheet = await prisma.revisionSheet.create({
    data: { profileId: profile.id, imagesJson: JSON.stringify(images), sheetType, status: "analyzing" },
  });

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    const result = await runCreateRevisionSheetPipeline({
      images: parsedImages.map((img) => ({ mimeType: img.mimeType, dataBase64: img.base64 })),
      levelContext,
      sheetType,
      onStatus: (status) => {
        prisma.revisionSheet.update({ where: { id: sheet.id }, data: { status } }).catch(() => {});
      },
    });

    const updated = await prisma.revisionSheet.update({
      where: { id: sheet.id },
      data: {
        status: "done",
        subject: result.analysis.subject,
        chapter: result.analysis.chapter,
        detectedLevel: result.analysis.detectedLevel,
        analysisJson: JSON.stringify(result.analysis),
        contentJson: JSON.stringify(result.content),
        qualityJson: JSON.stringify(result.quality),
        qualityScore: result.quality.total,
      },
    });

    await bumpSkillMastery(profile.id, result.analysis.subject, result.analysis.chapter);

    return NextResponse.json(serializeRevisionSheet(updated));
  } catch (err) {
    const message = describePipelineError(err);
    const updated = await prisma.revisionSheet.update({
      where: { id: sheet.id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeRevisionSheet(updated), { status: 502 });
  }
}
