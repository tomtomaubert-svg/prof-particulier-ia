import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { buildLevelContext } from "@/lib/student/levels";
import { runExplainPipeline } from "@/lib/ai/pipeline";
import { AIProviderError } from "@/lib/ai/provider";
import { serializeExplanation } from "@/lib/explication/serialize";
import { bumpSkillMastery } from "@/lib/student/skill-mastery";

export const maxDuration = 120;

const BodySchema = z.object({
  imageDataUrl: z.string().startsWith("data:image/"),
  depth: z.enum(["simple", "normal", "approfondi"]).default("normal"),
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
  const { imageDataUrl, depth } = parsed.data;

  let image: { mimeType: string; base64: string };
  try {
    image = parseDataUrl(imageDataUrl);
  } catch {
    return NextResponse.json({ error: "Image invalide" }, { status: 400 });
  }

  const explanation = await prisma.explanation.create({
    data: { profileId: profile.id, imageDataUrl, depth, status: "analyzing" },
  });

  const levelContext = buildLevelContext({
    schoolLevel: profile.schoolLevel,
    track: profile.track,
    specialities: profile.specialities,
  });

  try {
    const result = await runExplainPipeline({
      image: { mimeType: image.mimeType, dataBase64: image.base64 },
      levelContext,
      depth,
      onStatus: (status) => {
        prisma.explanation.update({ where: { id: explanation.id }, data: { status } }).catch(() => {});
      },
    });

    const updated = await prisma.explanation.update({
      where: { id: explanation.id },
      data: {
        status: "done",
        subject: result.analysis.subject,
        chapter: result.analysis.chapter,
        detectedLevel: result.analysis.detectedLevel,
        analysisJson: JSON.stringify(result.analysis),
        roundsJson: JSON.stringify([result.round]),
      },
    });

    await bumpSkillMastery(profile.id, result.analysis.subject, result.analysis.chapter);

    return NextResponse.json(serializeExplanation(updated));
  } catch (err) {
    const message =
      err instanceof AIProviderError
        ? err.message
        : "Une erreur est survenue pendant l'explication. Réessaie dans quelques instants.";
    const updated = await prisma.explanation.update({
      where: { id: explanation.id },
      data: { status: "error", errorMessage: message },
    });
    return NextResponse.json(serializeExplanation(updated), { status: 502 });
  }
}
