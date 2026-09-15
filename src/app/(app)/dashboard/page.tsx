import { Camera, BookOpen, Lightbulb } from "lucide-react";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { getLevelDef } from "@/lib/student/levels";
import { prisma } from "@/lib/prisma";
import { ModuleCard } from "@/components/dashboard/module-card";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const levelDef = getLevelDef(profile.schoolLevel);

  const [recentExercises, recentSheets, recentExplanations, recentQuizzes] = await Promise.all([
    prisma.exerciseAttempt.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.revisionSheet.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.explanation.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.quiz.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const recentActivity = [
    ...recentExercises.map((e) => ({
      id: e.id,
      href: `/resoudre/${e.id}`,
      title: e.subject ?? "Analyse en cours…",
      subtitle: e.chapter ?? "Exercice",
      status: e.status,
      createdAt: e.createdAt,
    })),
    ...recentSheets.map((s) => ({
      id: s.id,
      href: `/fiche/${s.id}`,
      title: s.subject ?? "Analyse en cours…",
      subtitle: s.chapter ?? "Fiche",
      status: s.status,
      createdAt: s.createdAt,
    })),
    ...recentExplanations.map((ex) => ({
      id: ex.id,
      href: `/explique-moi/${ex.id}`,
      title: ex.subject ?? "Analyse en cours…",
      subtitle: ex.chapter ?? "Explication",
      status: ex.status,
      createdAt: ex.createdAt,
    })),
    ...recentQuizzes.map((q) => ({
      id: q.id,
      href: `/reviser/${q.id}`,
      title: q.subject,
      subtitle: q.theme,
      status: q.status,
      createdAt: q.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-text-secondary">Bonjour {profile.displayName}</p>
        <h1 className="text-2xl font-semibold">{levelDef.label}</h1>
        <p className="text-text-secondary mt-1">Qu&apos;est-ce qu&apos;on travaille aujourd&apos;hui ?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ModuleCard
          href="/resoudre"
          icon={Camera}
          title="Résoudre un exercice"
          description="Photographie un exercice, obtiens une correction adaptée à ton niveau."
        />
        <ModuleCard
          href="/fiche"
          icon={BookOpen}
          title="Créer une fiche"
          description="Transforme ton cours en fiche de révision claire."
        />
        <ModuleCard
          href="/explique-moi"
          icon={Lightbulb}
          title="Explique-moi"
          description="Une notion pas comprise ? On la reprend pas à pas."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Activité récente</h2>
          <Link href="/bibliotheque" className="text-sm text-primary">
            Tout voir
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <Card>
            <CardBody className="text-sm text-text-secondary">
              Rien pour l&apos;instant. Lance ton premier scan depuis l&apos;onglet Scanner.
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((item) => (
              <Link key={item.id} href={item.href}>
                <Card className="hover:border-primary transition-colors">
                  <CardBody className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-text-secondary">{item.subtitle}</p>
                    </div>
                    <Badge tone={item.status === "done" ? "success" : item.status === "error" ? "error" : "primary"}>
                      {item.status}
                    </Badge>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
