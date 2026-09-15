# Prof Particulier IA

Professeur particulier universel IA : l'élève photographie un exercice, l'application l'adapte automatiquement à son niveau scolaire (section entière du cahier des charges d'origine).

Ce dépôt contient le **MVP réel** convenu pour cette première itération : onboarding, profil scolaire qui pilote toute l'IA, et le module **Résoudre un exercice** de bout en bout (photo → analyse → résolution → double vérification → contrôle qualité → correction Premium++). Les modules "Créer une fiche", "Explique-moi", quiz et flashcards sont visibles dans l'interface mais marqués "Bientôt disponible" : ce sont les prochaines itérations, pas des placeholders cachés.

## Pourquoi Gemini, et pourquoi c'est gratuit

L'IA doit rester **sans coût récurrent**. Gemini (Google AI Studio) est le seul fournisseur avec un vrai tier gratuit sans carte bancaire, et il est nativement multimodal : une seule requête lit la photo ET raisonne dessus (pas besoin d'un service OCR séparé et payant). L'abstraction `AIProvider` (`src/lib/ai/provider.ts`) permet d'ajouter un autre fournisseur plus tard sans rien changer au reste de l'app.

Limite du tier gratuit : quotas par minute assez bas (usage personnel/petite échelle). Chaque exercice déclenche 3 à 5 appels (analyse, résolution, vérification, éventuelle révision, contrôle qualité) — largement dans le quota pour un usage perso, mais pas pour beaucoup d'utilisateurs simultanés.

## Configuration

1. Récupère une clé gratuite sur https://aistudio.google.com/apikey (aucune carte bancaire requise).
2. Renseigne-la dans `.env` :
   ```
   GEMINI_API_KEY="ta-cle"
   ```
3. Installe les dépendances puis lance :
   ```bash
   npm install
   npm run dev
   ```
4. Ouvre http://localhost:3000 — le premier écran demande le niveau scolaire (onboarding obligatoire, section 1 du cahier des charges).

Sans clé configurée, l'application fonctionne normalement (onboarding, dashboard, bibliothèque) mais le module "Résoudre un exercice" affiche une erreur claire au lieu de planter silencieusement — c'est voulu (principe "ne jamais inventer").

## Ce qui est réellement implémenté

- **Profil scolaire pilote toute l'IA** (`src/lib/student/levels.ts`) : chaque niveau (CP → Doctorat, formation pro, autodidacte) porte un âge approximatif, les notions supposées acquises et le registre attendu, injectés dans **tous** les prompts.
- **Pipeline multi-agents** (`src/lib/ai/pipeline.ts`) : DocumentAnalyzer → ExerciseSolver → ExerciseVerifier (vérification indépendante, pas juste "es-tu sûr ?") → révision ciblée si besoin → QualityEvaluator (seuil 16/20) → révision si besoin.
- **Prompts spécialisés séparés** (`src/lib/ai/prompts/`), pas un prompt géant unique.
- **Sorties structurées validées par Zod** (`src/lib/ai/schemas.ts`), avec retry si le JSON renvoyé est invalide.
- **Règle "ne jamais inventer"** : chaque étape peut signaler des `unreadableParts`, affichées explicitement à l'élève.
- **Mode Apprendre vs Mode Correction**, indices progressifs, analyse du raisonnement de l'élève s'il en a écrit un sur la copie.
- **Changement de niveau depuis le profil** sans perte de l'historique.
- **Bibliothèque** avec recherche simple par matière/chapitre.
- **Light/Dark mode**, mobile-first avec navigation basse (Accueil / Scanner / Bibliothèque / Réviser / Profil).

## Ce qui reste à construire (hors scope de cette itération)

- Modules "Créer une fiche" et "Explique-moi".
- Quiz, flashcards, carte de connaissances, répétition espacée.
- Authentification multi-comptes (le MVP identifie l'élève via un cookie de profil, pas de mot de passe).
- Recherche internet / sources actualisées (KnowledgeProvider au-delà du LLM).
- Multi-fournisseurs IA réellement branchés (l'abstraction existe, un seul provider est actif).
- Export PDF.
- Autres systèmes scolaires que la France.

## Stack

Next.js (App Router) + TypeScript strict + Tailwind CSS v4 + Prisma/SQLite (zéro coût d'hébergement) + Gemini API (zéro coût, tier gratuit).
