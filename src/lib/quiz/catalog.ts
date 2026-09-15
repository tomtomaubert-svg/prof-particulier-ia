// Catalogue de thèmes de quiz (section 28 du cahier des charges) : couvre
// TOUS les niveaux scolaires et TOUTES les matières, pas seulement le niveau
// ou les spécialités du profil de l'élève qui consulte — n'importe qui peut
// réviser n'importe quel programme. La recherche (barre de recherche) filtre
// sur ce catalogue ; un thème absent de la liste peut quand même être généré
// à la demande via la recherche libre (voir CustomThemeCard côté UI).

export interface QuizThemeDef {
  id: string;
  subject: string;
  levelLabel: string; // ex: "6e", "Terminale", "Bac +1", "Tous niveaux"
  levelGroup: "Primaire" | "Collège" | "Lycée" | "Supérieur" | "Général";
  theme: string;
}

function themes(
  subject: string,
  levelLabel: string,
  levelGroup: QuizThemeDef["levelGroup"],
  list: string[]
): QuizThemeDef[] {
  return list.map((theme, i) => ({
    id: `${subject}-${levelLabel}-${i}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    subject,
    levelLabel,
    levelGroup,
    theme,
  }));
}

export const QUIZ_CATALOG: QuizThemeDef[] = [
  // --- Mathématiques ---
  ...themes("Mathématiques", "CP", "Primaire", ["Nombres jusqu'à 100", "Additions et soustractions simples"]),
  ...themes("Mathématiques", "CE1", "Primaire", ["Tables de multiplication (2, 5, 10)", "Lecture de l'heure"]),
  ...themes("Mathématiques", "CE2", "Primaire", ["Les 4 opérations posées", "Les fractions simples"]),
  ...themes("Mathématiques", "CM1", "Primaire", ["Fractions et décimaux", "Périmètre et aire"]),
  ...themes("Mathématiques", "CM2", "Primaire", ["Proportionnalité", "Nombres décimaux"]),
  ...themes("Mathématiques", "6e", "Collège", ["Nombres décimaux", "Fractions", "Symétrie axiale", "Aires et périmètres"]),
  ...themes("Mathématiques", "5e", "Collège", ["Nombres relatifs", "Proportionnalité", "Théorème de Pythagore (intro)"]),
  ...themes("Mathématiques", "4e", "Collège", ["Puissances", "Théorème de Pythagore", "Équations du premier degré"]),
  ...themes("Mathématiques", "3e", "Collège", ["Théorème de Thalès", "Fonctions linéaires et affines", "Équations et inéquations"]),
  ...themes("Mathématiques", "Seconde", "Lycée", ["Second degré (intro)", "Vecteurs", "Fonctions de référence"]),
  ...themes("Mathématiques", "Première", "Lycée", ["Dérivation", "Suites numériques", "Second degré", "Probabilités conditionnelles"]),
  ...themes("Mathématiques", "Terminale", "Lycée", ["Limites de fonctions", "Intégrales", "Probabilités conditionnelles", "Nombres complexes", "Logarithme népérien"]),
  ...themes("Mathématiques", "Bac +1/+2", "Supérieur", ["Algèbre linéaire", "Suites et séries", "Analyse (limites, dérivées)"]),

  // --- Français / Littérature ---
  ...themes("Français", "CP", "Primaire", ["Sons et syllabes", "Lecture de mots simples"]),
  ...themes("Français", "CE1-CE2", "Primaire", ["Conjugaison au présent", "Nature des mots"]),
  ...themes("Français", "CM1-CM2", "Primaire", ["Passé composé et imparfait", "Les compléments du verbe"]),
  ...themes("Français", "6e", "Collège", ["Le récit d'aventures", "Nature et fonction des mots"]),
  ...themes("Français", "5e", "Collège", ["Le roman de chevalerie", "Les temps du récit"]),
  ...themes("Français", "4e", "Collège", ["Le fantastique", "La lettre et l'argumentation"]),
  ...themes("Français", "3e", "Collège", ["Poésie engagée", "Le discours argumentatif", "Brevet : grammaire et réécriture"]),
  ...themes("Français", "Lycée", "Lycée", ["Les figures de style", "L'argumentation", "Le théâtre classique", "La poésie du XIXe siècle"]),
  ...themes("Littérature", "Terminale", "Lycée", ["Parcours au programme (spécialité LLCE/HLP)"]),

  // --- Histoire ---
  ...themes("Histoire", "CM1-CM2", "Primaire", ["La Préhistoire", "L'Antiquité", "Le Moyen Âge"]),
  ...themes("Histoire", "6e", "Collège", ["La Préhistoire", "Les premiers États", "La Méditerranée antique"]),
  ...themes("Histoire", "5e", "Collège", ["Chrétientés et Islam", "Société féodale"]),
  ...themes("Histoire", "4e", "Collège", ["Le XVIIIe siècle et la Révolution", "L'Europe et le monde au XIXe siècle"]),
  ...themes("Histoire", "3e", "Collège", ["Première Guerre mondiale", "Seconde Guerre mondiale", "La Ve République"]),
  ...themes("Histoire", "Seconde", "Lycée", ["Renaissance et Humanisme", "Les Lumières"]),
  ...themes("Histoire", "Première", "Lycée", ["La Première Guerre mondiale", "Le monde de 1930 à 1945"]),
  ...themes("Histoire", "Terminale", "Lycée", ["La guerre froide", "La décolonisation", "La Ve République"]),

  // --- Géographie / Géopolitique ---
  ...themes("Géographie", "6e-3e", "Collège", ["Habiter une métropole", "Les espaces productifs", "Mondialisation (intro)"]),
  ...themes("Géographie", "Lycée", "Lycée", ["Les territoires ultramarins", "La France et l'Union Européenne", "Mers et océans"]),
  ...themes("Géopolitique", "Terminale (HGGSP)", "Lycée", ["Frontières", "Puissance et influence", "Environnement, enjeu géopolitique"]),

  // --- SES / Économie / Gestion ---
  ...themes("SES", "Seconde", "Lycée", ["Comment un marché fonctionne-t-il ?", "Comment se forment les prix ?"]),
  ...themes("SES", "Première", "Lycée", ["La monnaie et le financement", "Structure sociale et inégalités"]),
  ...themes("SES", "Terminale", "Lycée", ["Croissance économique", "Justice sociale", "Intégration européenne"]),
  ...themes("Économie", "Supérieur", "Supérieur", ["Microéconomie : offre et demande", "Macroéconomie : PIB et inflation"]),
  ...themes("Gestion", "Supérieur", "Supérieur", ["Comptabilité générale", "Analyse financière", "Marketing (le mix marketing)"]),

  // --- Sciences (Physique-Chimie, SVT, Biologie) ---
  ...themes("Physique-Chimie", "6e-3e", "Collège", ["États de la matière", "Électricité (circuits simples)", "Optique (la lumière)"]),
  ...themes("Physique-Chimie", "Seconde", "Lycée", ["Mouvement et interactions", "Constitution de la matière"]),
  ...themes("Physique-Chimie", "Première", "Lycée", ["Ondes et signaux", "Réactions acide-base"]),
  ...themes("Physique-Chimie", "Terminale", "Lycée", ["Mécanique de Newton", "Évolution des systèmes chimiques", "Ondes et particules"]),
  ...themes("SVT", "6e-3e", "Collège", ["Le corps humain", "La reproduction", "La génétique (intro)"]),
  ...themes("SVT", "Lycée", "Lycée", ["Génétique et évolution", "Le système immunitaire", "La tectonique des plaques"]),
  ...themes("Biologie", "Supérieur", "Supérieur", ["Biologie cellulaire", "Génétique moléculaire"]),
  ...themes("Anatomie", "Supérieur", "Supérieur", ["Le système cardiovasculaire", "Le système nerveux"]),

  // --- Informatique / Numérique ---
  ...themes("Informatique", "Collège-Lycée", "Lycée", ["Bases de la programmation (Python)", "Algorithmique (tri, recherche)"]),
  ...themes("NSI", "Première/Terminale", "Lycée", ["Structures de données", "Bases de données SQL", "Réseaux et protocoles"]),
  ...themes("Cybersécurité", "Supérieur", "Supérieur", ["Principes de la cryptographie", "Sécurité des réseaux"]),
  ...themes("Intelligence artificielle", "Supérieur", "Supérieur", ["Apprentissage supervisé", "Réseaux de neurones (bases)"]),

  // --- Philosophie ---
  ...themes("Philosophie", "Terminale", "Lycée", ["La conscience", "La liberté", "Le bonheur", "La vérité", "L'État et la justice"]),

  // --- Droit ---
  ...themes("Droit", "Supérieur", "Supérieur", ["Introduction au droit civil", "Le droit des contrats", "Droit du travail (bases)", "Droit fiscal (bases)"]),
  ...themes("Sciences politiques", "Supérieur", "Supérieur", ["Les institutions de la Ve République", "Les régimes politiques"]),
  ...themes("Sociologie", "Supérieur", "Supérieur", ["La socialisation", "Les classes sociales"]),
  ...themes("Psychologie", "Supérieur", "Supérieur", ["Psychologie cognitive (bases)", "Psychologie du développement"]),

  // --- Langues ---
  ...themes("Anglais", "Collège-Lycée", "Lycée", ["Present perfect vs. past simple", "Vocabulaire du quotidien", "Modaux (can, must, should)"]),
  ...themes("Espagnol", "Collège-Lycée", "Lycée", ["Le subjonctif", "Passé simple vs. imparfait"]),
  ...themes("Allemand", "Collège-Lycée", "Lycée", ["Les déclinaisons", "L'ordre des mots"]),

  // --- Arts / Culture ---
  ...themes("Histoire de l'art", "Général", "Général", ["La Renaissance italienne", "L'impressionnisme", "L'art contemporain"]),
  ...themes("Musique", "Général", "Général", ["Les familles d'instruments", "Les grands courants musicaux"]),

  // --- Culture générale (autodidactes, formation pro) ---
  ...themes("Culture générale", "Général", "Général", ["Actualité et institutions", "Grandes dates de l'Histoire de France"]),
];

export const QUIZ_SUBJECTS = Array.from(new Set(QUIZ_CATALOG.map((t) => t.subject))).sort();
