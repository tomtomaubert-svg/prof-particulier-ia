import { getCurrentProfile } from "@/lib/student/current-profile";
import { getLevelDef } from "@/lib/student/levels";
import { QuizCatalogBrowser } from "@/components/quiz/quiz-catalog-browser";
import { ChapterExplorer } from "@/components/quiz/chapter-explorer";

export default async function ReviserPage() {
  const profile = await getCurrentProfile();
  const ownLevelLabel = profile ? getLevelDef(profile.schoolLevel).label : "Général";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Réviser</h1>
        <p className="text-text-secondary text-sm mt-1">
          Quiz sur n&apos;importe quel programme, pas seulement le tien — explore une matière ou cherche un thème.
        </p>
      </div>
      <ChapterExplorer />
      <div>
        <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">Thèmes populaires</p>
        <QuizCatalogBrowser ownLevelLabel={ownLevelLabel} />
      </div>
    </div>
  );
}
