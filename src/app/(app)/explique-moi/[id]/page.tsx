import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeExplanation } from "@/lib/explication/serialize";
import { ExplanationView } from "@/components/explication/explanation-view";

export default async function ExplanationResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getCurrentProfileId();
  if (!profileId) notFound();

  const explanation = await prisma.explanation.findUnique({ where: { id } });
  if (!explanation || explanation.profileId !== profileId) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Explique-moi</h1>
      <ExplanationView initial={serializeExplanation(explanation)} />
    </div>
  );
}
