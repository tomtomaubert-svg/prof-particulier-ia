import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { StudentProfile } from "./types";

const COOKIE_NAME = "profileId";

export async function getCurrentProfileId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentProfile(): Promise<StudentProfile | null> {
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
}

export const PROFILE_COOKIE_NAME = COOKIE_NAME;
