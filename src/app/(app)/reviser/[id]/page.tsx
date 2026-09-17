import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeQuiz } from "@/lib/quiz/serialize";
import { QuizTaker } from "@/components/quiz/quiz-taker";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isStaleInProgress, STALE_ERROR_MESSAGE } from "@/lib/stale-status";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getCurrentProfileId();
  if (!profileId) notFound();

  let quiz = await prisma.quiz.findUnique({ where: { id } });
  if (!quiz || quiz.profileId !== profileId) notFound();

  if (isStaleInProgress(quiz.status, quiz.createdAt)) {
    quiz = await prisma.quiz.update({
      where: { id },
      data: { status: "error", errorMessage: STALE_ERROR_MESSAGE },
    });
  }

  const dto = serializeQuiz(quiz);

  if (dto.status === "error") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Quiz</h1>
        <Card>
          <CardBody className="space-y-2">
            <p className="font-medium text-error">La génération a échoué</p>
            <p className="text-sm text-text-secondary">{dto.errorMessage}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!dto.content) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Quiz</h1>
        <Card>
          <CardBody className="text-sm text-text-secondary">Génération en cours…</CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge tone="primary">{dto.subject}</Badge>
          <Badge tone="neutral">{dto.levelLabel}</Badge>
        </div>
        <h1 className="text-2xl font-semibold">{dto.content.title}</h1>
      </div>
      <QuizTaker quizId={dto.id} content={dto.content} />
    </div>
  );
}
