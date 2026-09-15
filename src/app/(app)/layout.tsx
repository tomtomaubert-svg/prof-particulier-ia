import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/student/current-profile";
import { BottomNav } from "@/components/nav/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/onboarding");

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-14">
          <span className="font-semibold text-primary">Prof Particulier IA</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
