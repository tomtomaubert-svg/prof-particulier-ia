"use client";

// Certaines réponses (413 Vercel, erreurs plateforme) ne sont pas du JSON —
// appeler res.json() dessus fait planter avec un message navigateur cryptique
// ("The string did not match the expected pattern.", etc.). On isole ça pour
// toujours retomber sur un message clair en français.
export async function safeJson(res: Response): Promise<{ ok: boolean; data: unknown; readError?: string }> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (res.status === 413) {
      return { ok: false, data: null, readError: "Cette photo est trop volumineuse. Réessaie avec une nouvelle photo." };
    }
    return { ok: false, data: null, readError: "Le serveur n'a pas répondu correctement. Réessaie dans quelques instants." };
  }
  try {
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, data: null, readError: "Réponse du serveur illisible. Réessaie dans quelques instants." };
  }
}
