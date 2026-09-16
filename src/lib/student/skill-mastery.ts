import { prisma } from "@/lib/prisma";

/**
 * Alimente la Knowledge Map de l'élève (section 31) à chaque activité
 * (exercice, fiche, explication). La progression réelle (masteryPct) sera
 * affinée plus tard par les quiz/flashcards ; pour l'instant on trace au
 * moins le volume d'activité par matière/chapitre.
 */
export async function bumpSkillMastery(profileId: string, subject: string, chapter: string | null | undefined) {
  const skill = chapter ?? "Général";
  try {
    await prisma.skillMastery.upsert({
      where: { profileId_subject_skill: { profileId, subject, skill } },
      update: { attempts: { increment: 1 } },
      create: { profileId, subject, skill, attempts: 1, masteryPct: 50 },
    });
  } catch {
    // La progression est un bonus, jamais bloquant pour l'activité elle-même.
  }
}
