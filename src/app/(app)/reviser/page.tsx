import { getCurrentProfile } from "@/lib/student/current-profile";
import { getLevelDef } from "@/lib/student/levels";
import { QuizCatalogBrowser } from "@/components/quiz/quiz-catalog-browser";

export default async function ReviserPage() {
  const profile = await getCurrentProfile();
  const ownLevelLabel = profile ? getLevelDef(profile.schoolLevel).label : "Général";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Réviser</h1>
        <p className="text-text-secondary text-sm mt-1">
          Quiz sur n&apos;importe quel programme, pas seulement le tien — cherche un thème ou tape le tien.
        </p>
      </div>
      <QuizCatalogBrowser ownLevelLabel={ownLevelLabel} />
    </div>
  );
}
