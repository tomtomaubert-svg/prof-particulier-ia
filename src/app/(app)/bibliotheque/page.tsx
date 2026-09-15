import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { LibraryList } from "@/components/library/library-list";

export default async function BibliothequePage() {
  const profileId = await getCurrentProfileId();
  if (!profileId) return null;

  const [exercises, sheets, explanations, quizzes] = await Promise.all([
    prisma.exerciseAttempt.findMany({ where: { profileId }, orderBy: { createdAt: "desc" } }),
    prisma.revisionSheet.findMany({ where: { profileId }, orderBy: { createdAt: "desc" } }),
    prisma.explanation.findMany({ where: { profileId }, orderBy: { createdAt: "desc" } }),
    prisma.quiz.findMany({ where: { profileId }, orderBy: { createdAt: "desc" } }),
  ]);

  const items = [
    ...exercises.map((e) => ({
      id: e.id,
      href: `/resoudre/${e.id}`,
      kind: "exercice" as const,
      subject: e.subject,
      chapter: e.chapter,
      status: e.status,
      qualityScore: e.qualityScore,
      createdAt: e.createdAt.toISOString(),
    })),
    ...sheets.map((s) => ({
      id: s.id,
      href: `/fiche/${s.id}`,
      kind: "fiche" as const,
      subject: s.subject,
      chapter: s.chapter,
      status: s.status,
      qualityScore: s.qualityScore,
      createdAt: s.createdAt.toISOString(),
    })),
    ...explanations.map((ex) => ({
      id: ex.id,
      href: `/explique-moi/${ex.id}`,
      kind: "explication" as const,
      subject: ex.subject,
      chapter: ex.chapter,
      status: ex.status,
      qualityScore: null,
      createdAt: ex.createdAt.toISOString(),
    })),
    ...quizzes.map((q) => ({
      id: q.id,
      href: `/reviser/${q.id}`,
      kind: "quiz" as const,
      subject: q.subject,
      chapter: q.theme,
      status: q.status,
      qualityScore: null,
      createdAt: q.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Bibliothèque</h1>
      <LibraryList items={items} />
    </div>
  );
}
