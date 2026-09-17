import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { RevisionSheetPdf } from "@/lib/pdf/revision-sheet-pdf";
import { pdfFilename } from "@/lib/pdf/filename";
import type { RevisionSheetContent } from "@/lib/ai/schemas";

export const maxDuration = 30;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getCurrentProfileId();
  if (!profileId) return NextResponse.json({ error: "Aucun profil actif" }, { status: 401 });

  const { id } = await params;
  const sheet = await prisma.revisionSheet.findUnique({ where: { id } });
  if (!sheet || sheet.profileId !== profileId) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (!sheet.contentJson) {
    return NextResponse.json({ error: "Fiche pas encore prête" }, { status: 409 });
  }

  const content = JSON.parse(sheet.contentJson) as RevisionSheetContent;
  const buffer = await renderToBuffer(
    RevisionSheetPdf({ content, subject: sheet.subject, chapter: sheet.chapter, sheetType: sheet.sheetType })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFilename("fiche", sheet.subject)}"`,
    },
  });
}
