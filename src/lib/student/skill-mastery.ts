import { prisma } from "@/lib/prisma";

/**
 * Alimente la Knowledge Map de l'élève (section 31) à chaque activité
 * (exercice, fiche, explication, quiz). Quand une performance réelle est
 * disponible (note qualité /20 convertie en /100, ou score de quiz), la
 * maîtrise est mise à jour en moyenne pondérée par le nombre de tentatives
 * précédentes plutôt que de rester figée à 50 pour toujours.
 */
export async function bumpSkillMastery(
  profileId: string,
  subject: string,
  chapter: string | null | undefined,
  performanceScore100?: number
) {
  const skill = chapter ?? "Général";
  try {
    const existing = await prisma.skillMastery.findUnique({
      where: { profileId_subject_skill: { profileId, subject, skill } },
    });

    if (!existing) {
      await prisma.skillMastery.create({
        data: { profileId, subject, skill, attempts: 1, masteryPct: performanceScore100 ?? 50 },
      });
      return;
    }

    const newMasteryPct =
      performanceScore100 === undefined
        ? existing.masteryPct
        : Math.round((existing.masteryPct * existing.attempts + performanceScore100) / (existing.attempts + 1));

    await prisma.skillMastery.update({
      where: { profileId_subject_skill: { profileId, subject, skill } },
      data: { attempts: { increment: 1 }, masteryPct: newMasteryPct },
    });
  } catch {
    // La progression est un bonus, jamais bloquant pour l'activité elle-même.
  }
}
