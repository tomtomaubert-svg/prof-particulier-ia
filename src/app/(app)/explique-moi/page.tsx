import { ExplanationUploader } from "@/components/explication/explanation-uploader";

export default function ExpliqueMoiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Explique-moi</h1>
        <p className="text-text-secondary text-sm mt-1">
          Photographie une notion que tu n&apos;as pas comprise, on la reprend pas à pas.
        </p>
      </div>
      <ExplanationUploader />
    </div>
  );
}
