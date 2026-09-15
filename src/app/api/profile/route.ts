import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile, getCurrentProfileId, PROFILE_COOKIE_NAME } from "@/lib/student/current-profile";

const CreateProfileSchema = z.object({
  displayName: z.string().min(1).max(60),
  schoolLevel: z.string().min(1),
  track: z.string().optional().nullable(),
  specialities: z.array(z.string()).optional(),
  country: z.string().default("FR"),
});

export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const created = await prisma.studentProfile.create({
    data: {
      displayName: data.displayName,
      country: data.country,
      schoolLevel: data.schoolLevel,
      track: data.track ?? null,
      specialities: data.specialities ? JSON.stringify(data.specialities) : null,
    },
  });

  const res = NextResponse.json({ id: created.id });
  res.cookies.set(PROFILE_COOKIE_NAME, created.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  schoolLevel: z.string().min(1).optional(),
  track: z.string().optional().nullable(),
  specialities: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest) {
  const id = await getCurrentProfileId();
  if (!id) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Changer de classe met à jour le contexte pédagogique des futures
  // générations SANS supprimer l'historique existant (section 35).
  await prisma.studentProfile.update({
    where: { id },
    data: {
      ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
      ...(data.schoolLevel !== undefined ? { schoolLevel: data.schoolLevel } : {}),
      ...(data.track !== undefined ? { track: data.track } : {}),
      ...(data.specialities !== undefined ? { specialities: JSON.stringify(data.specialities) } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
