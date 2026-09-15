import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeExerciseAttempt } from "@/lib/exercise/serialize";
import { CorrectionView } from "@/components/exercise/correction-view";

export default async function ExerciseResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getCurrentProfileId();
  if (!profileId) notFound();

  const attempt = await prisma.exerciseAttempt.findUnique({ where: { id } });
  if (!attempt || attempt.profileId !== profileId) notFound();

  const dto = serializeExerciseAttempt(attempt);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Correction</h1>
      <CorrectionView attempt={dto} />
    </div>
  );
}
