import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeExplanation } from "@/lib/explication/serialize";
import { ExplanationView } from "@/components/explication/explanation-view";
import { isStaleInProgress, STALE_ERROR_MESSAGE } from "@/lib/stale-status";

export default async function ExplanationResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getCurrentProfileId();
  if (!profileId) notFound();

  let explanation = await prisma.explanation.findUnique({ where: { id } });
  if (!explanation || explanation.profileId !== profileId) notFound();

  if (isStaleInProgress(explanation.status, explanation.createdAt)) {
    explanation = await prisma.explanation.update({
      where: { id },
      data: { status: "error", errorMessage: STALE_ERROR_MESSAGE },
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Explique-moi</h1>
      <ExplanationView initial={serializeExplanation(explanation)} />
    </div>
  );
}
