import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { StudentProfile } from "./types";

const COOKIE_NAME = "profileId";

export async function getCurrentProfileId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

// Le layout (app) ET chaque page appellent tous les deux getCurrentProfile()
// (le layout pour la redirection, la page pour ses propres données) : sans
// dédoublonnage, chaque navigation déclenchait deux allers-retours vers la
// base à distance. React.cache() fusionne les appels identiques au sein
// d'un même rendu serveur en une seule requête réelle.
export const getCurrentProfile = cache(async (): Promise<StudentProfile | null> => {
  const id = await getCurrentProfileId();
  if (!id) return null;
  const record = await prisma.studentProfile.findUnique({ where: { id } });
  if (!record) return null;
  return {
    id: record.id,
    displayName: record.displayName,
    country: record.country,
    schoolLevel: record.schoolLevel,
    track: record.track,
    specialities: record.specialities ? JSON.parse(record.specialities) : [],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
});

export const PROFILE_COOKIE_NAME = COOKIE_NAME;
