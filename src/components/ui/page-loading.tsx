import { Loader2 } from "lucide-react";

// Affiché instantanément par Next.js (fichier loading.tsx) pendant qu'une
// page serveur dynamique (auth par cookie -> jamais préchargeable/statique)
// termine son rendu. Rend la navigation perçue comme rapide même quand
// l'aller-retour réseau vers la base à distance prend quelques centaines de ms.
export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="animate-spin text-primary" size={28} />
    </div>
  );
}
