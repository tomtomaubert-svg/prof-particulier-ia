import { getCurrentProfile } from "@/lib/student/current-profile";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <OnboardingFlow />
      </div>
    </main>
  );
}
