import { SheetUploader } from "@/components/fiche/sheet-uploader";

export default function FichePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Créer une fiche</h1>
        <p className="text-text-secondary text-sm mt-1">
          Photographie une ou plusieurs pages de cours, on en fait une fiche adaptée à ton niveau.
        </p>
      </div>
      <SheetUploader />
    </div>
  );
}
