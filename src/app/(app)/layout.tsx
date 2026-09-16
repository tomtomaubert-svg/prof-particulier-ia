import { redirect } from "next/navigation";
import { getCurrentProfileId } from "@/lib/student/current-profile";
import { BottomNav } from "@/components/nav/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Simple lecture de cookie (pas d'appel base de données) : la page elle-même
  // vérifie déjà le profil réel si elle en a besoin. Éviter ici un aller-retour
  // réseau supplémentaire sur CHAQUE navigation, pour une navigation rapide.
  const profileId = await getCurrentProfileId();
  if (!profileId) redirect("/onboarding");

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header
        className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-14">
          <span className="font-semibold text-primary">Prof Particulier IA</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 pb-32">{children}</main>
      <BottomNav />
    </div>
  );
}
