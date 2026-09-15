import { ImageUploader } from "@/components/exercise/image-uploader";

export default function ResoudrePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Résoudre un exercice</h1>
        <p className="text-text-secondary text-sm mt-1">
          Photographie ou importe ton exercice, on l&apos;adapte à ton niveau.
        </p>
      </div>
      <ImageUploader />
    </div>
  );
}
