// StudentProfile : donnée pédagogique centrale (section 3 du cahier des
// charges). Toute requête IA doit en recevoir une version dérivée
// (voir buildLevelContext dans ./levels.ts) — interdiction de générer une
// réponse sans ce contexte.

export interface StudentProfile {
  id: string;
  displayName: string;
  country: string;
  schoolLevel: string;
  track?: string | null;
  specialities: string[];
  createdAt: string;
  updatedAt: string;
}

export type ExplanationDepth = "SIMPLE" | "NORMAL" | "APPROFONDI";
