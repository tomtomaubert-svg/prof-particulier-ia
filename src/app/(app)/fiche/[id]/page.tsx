import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { serializeRevisionSheet } from "@/lib/fiche/serialize";
import { SheetView } from "@/components/fiche/sheet-view";

export default async function SheetResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getCurrentProfileId();
  if (!profileId) notFound();

  const sheet = await prisma.revisionSheet.findUnique({ where: { id } });
  if (!sheet || sheet.profileId !== profileId) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Fiche de révision</h1>
      <SheetView sheet={serializeRevisionSheet(sheet)} />
    </div>
  );
}
