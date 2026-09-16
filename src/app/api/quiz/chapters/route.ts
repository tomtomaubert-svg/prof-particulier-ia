import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { runListChaptersPipeline } from "@/lib/ai/pipeline";
import { describePipelineError } from "@/lib/ai/describe-pipeline-error";

export const maxDuration = 60;

const BodySchema = z.object({
  subject: z.string().min(1).max(80),
  levelLabel: z.string().min(1).max(60),
});

export async function POST(req: NextRequest) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const chapters = await runListChaptersPipeline(parsed.data);
    return NextResponse.json({ chapters });
  } catch (err) {
    return NextResponse.json({ error: describePipelineError(err) }, { status: 502 });
  }
}
