import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/student/current-profile";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  redirect(profile ? "/dashboard" : "/onboarding");
}
