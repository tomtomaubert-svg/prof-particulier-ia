import { getCurrentProfile } from "@/lib/student/current-profile";
import { ProfileEditor } from "@/components/profil/profile-editor";

export default async function ProfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <ProfileEditor profile={profile} />
    </div>
  );
}
