// Catalogue de thèmes de quiz (section 28 du cahier des charges) : couvre
// TOUS les niveaux scolaires et TOUTES les matières possibles, pas seulement
// les mathématiques ni le niveau/les spécialités du profil qui consulte —
// n'importe qui peut réviser n'importe quel programme. La recherche filtre
// sur ce catalogue ; un thème absent de la liste peut quand même être généré
// à la demande via la recherche libre (voir CustomThemeCard côté UI).

export interface QuizThemeDef {
  id: string;
  subject: string;
  levelLabel: string; // ex: "6e", "Terminale", "Bac +1", "Général"
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
  // ============================== PRIMAIRE ==================================
  ...themes("Mathématiques", "CP", "Primaire", [
    "Nombres jusqu'à 100", "Additions posées", "Soustractions simples", "Se repérer dans l'espace", "Les formes géométriques de base", "La monnaie (euros)",
  ]),
  ...themes("Mathématiques", "CE1", "Primaire", [
    "Tables de multiplication (2, 5, 10)", "Lecture de l'heure", "Nombres jusqu'à 1000", "Les longueurs (mètre, centimètre)", "La symétrie", "Résoudre des problèmes simples",
  ]),
  ...themes("Mathématiques", "CE2", "Primaire", [
    "Les 4 opérations posées", "Les fractions simples", "Les tables de multiplication complètes", "Mesurer des périmètres", "Lire un tableau ou un graphique simple",
  ]),
  ...themes("Mathématiques", "CM1", "Primaire", [
    "Fractions et décimaux", "Périmètre et aire", "La proportionnalité (intro)", "Les grands nombres", "Les angles",
  ]),
  ...themes("Mathématiques", "CM2", "Primaire", [
    "Proportionnalité", "Nombres décimaux", "Volumes et unités de mesure", "Les fractions (opérations)", "Préparation à la 6e : bilan général",
  ]),
  ...themes("Français", "CP", "Primaire", ["Sons et syllabes", "Lecture de mots simples", "Le féminin et le masculin", "Les majuscules et la ponctuation"]),
  ...themes("Français", "CE1", "Primaire", ["Conjugaison au présent", "Nature des mots (nom, verbe, adjectif)", "Le pluriel des noms", "Les homophones simples (a/à, et/est)"]),
  ...themes("Français", "CE2", "Primaire", ["Le passé composé", "Les compléments du verbe", "Le dictionnaire et l'ordre alphabétique", "Les accords sujet-verbe"]),
  ...themes("Français", "CM1", "Primaire", ["Passé composé et imparfait", "Les fonctions dans la phrase", "Le futur simple", "Les synonymes et antonymes"]),
  ...themes("Français", "CM2", "Primaire", ["Les compléments circonstanciels", "Le passé simple", "L'accord du participe passé (intro)", "Rédiger un texte narratif"]),
  ...themes("Sciences", "CM1-CM2", "Primaire", ["Le corps humain", "Les états de la matière", "Le cycle de l'eau", "L'énergie et ses sources", "La classification des êtres vivants (intro)"]),
  ...themes("Histoire-Géographie", "CM1-CM2", "Primaire", ["La Préhistoire", "L'Antiquité", "Le Moyen Âge", "Les paysages de France", "La Révolution française (intro)"]),
  ...themes("Anglais", "CM1-CM2", "Primaire", ["Se présenter en anglais", "Les couleurs et les nombres", "Les animaux", "La famille en anglais"]),

  // ============================== COLLÈGE ===================================
  ...themes("Mathématiques", "6e", "Collège", [
    "Nombres décimaux", "Fractions", "Symétrie axiale", "Aires et périmètres", "Les nombres entiers", "Proportionnalité (intro)", "Le cercle et le disque",
  ]),
  ...themes("Mathématiques", "5e", "Collège", [
    "Nombres relatifs", "Proportionnalité", "Théorème de Pythagore (intro)", "Les priorités opératoires", "Symétrie centrale", "Calcul littéral (intro)",
  ]),
  ...themes("Mathématiques", "4e", "Collège", [
    "Puissances", "Théorème de Pythagore", "Équations du premier degré", "Le théorème de Thalès (intro)", "Les statistiques (moyenne, médiane)", "Racines carrées",
  ]),
  ...themes("Mathématiques", "3e", "Collège", [
    "Théorème de Thalès", "Fonctions linéaires et affines", "Équations et inéquations", "Les probabilités", "Le théorème de Pythagore et sa réciproque", "Trigonométrie (intro)", "Brevet : révisions générales",
  ]),
  ...themes("Français", "6e", "Collège", ["Le récit d'aventures", "Nature et fonction des mots", "Les contes merveilleux", "La ponctuation et les types de phrases"]),
  ...themes("Français", "5e", "Collège", ["Le roman de chevalerie", "Les temps du récit", "La poésie et ses formes", "Le théâtre comique"]),
  ...themes("Français", "4e", "Collège", ["Le fantastique", "La lettre et l'argumentation", "Le récit au XIXe siècle", "Les figures de style (intro)"]),
  ...themes("Français", "3e", "Collège", ["Poésie engagée", "Le discours argumentatif", "Brevet : grammaire et réécriture", "Le rapport à autrui dans le roman"]),
  ...themes("Histoire", "6e", "Collège", ["La Préhistoire", "Les premiers États", "La Méditerranée antique", "Rome et son empire"]),
  ...themes("Histoire", "5e", "Collège", ["Chrétientés et Islam", "Société féodale", "L'Occident féodal", "Les grandes découvertes"]),
  ...themes("Histoire", "4e", "Collège", ["Le XVIIIe siècle et la Révolution", "L'Europe et le monde au XIXe siècle", "La Révolution industrielle", "Napoléon et l'Empire"]),
  ...themes("Histoire", "3e", "Collège", ["Première Guerre mondiale", "Seconde Guerre mondiale", "La Ve République", "La guerre froide (intro)"]),
  ...themes("Géographie", "6e-5e", "Collège", ["Habiter une métropole", "Habiter les littoraux", "Les milieux à fortes contraintes"]),
  ...themes("Géographie", "4e-3e", "Collège", ["Les espaces productifs", "Mondialisation (intro)", "Les espaces urbains en France", "Aménager le territoire"]),
  ...themes("EMC", "Collège", "Collège", ["La laïcité", "Les valeurs de la République", "Le harcèlement scolaire", "La citoyenneté et le vote"]),
  ...themes("SVT", "6e", "Collège", ["Le peuplement d'un milieu", "Les besoins des plantes", "Origine de la matière des êtres vivants"]),
  ...themes("SVT", "5e", "Collège", ["La respiration des êtres vivants", "Le fonctionnement du corps humain", "Les risques géologiques"]),
  ...themes("SVT", "4e", "Collège", ["La reproduction humaine", "La transmission de la vie chez l'Homme", "Le système nerveux (intro)"]),
  ...themes("SVT", "3e", "Collège", ["La génétique (ADN, gènes)", "Immunité et vaccination", "Évolution et parenté des espèces", "Responsabilité en matière de sexualité"]),
  ...themes("Physique-Chimie", "5e-4e", "Collège", ["États de la matière", "Électricité (circuits simples)", "Optique (la lumière)", "Mélanges et corps purs"]),
  ...themes("Physique-Chimie", "3e", "Collège", ["Les atomes et les molécules", "Énergie électrique", "Mouvement et vitesse", "Les ions et les tests chimiques"]),
  ...themes("Anglais", "Collège", "Collège", ["Present simple vs. present continuous", "Les modaux (can, must, should)", "Le prétérit", "Vocabulaire du quotidien", "Les comparatifs et superlatifs"]),
  ...themes("Espagnol", "Collège", "Collège", ["Se présenter en espagnol", "Le présent de l'indicatif", "Les articles définis/indéfinis"]),
  ...themes("Allemand", "Collège", "Collège", ["Se présenter en allemand", "Les articles (der/die/das)", "Le présent des verbes"]),
  ...themes("Technologie", "Collège", "Collège", ["Les objets techniques", "La programmation par blocs (Scratch)", "Les matériaux et leurs propriétés"]),
  ...themes("Arts plastiques", "Collège", "Collège", ["La couleur et la lumière", "La représentation du corps dans l'art"]),
  ...themes("Musique", "Collège", "Collège", ["Les familles d'instruments", "Le rythme et la mélodie"]),

  // ============================== LYCÉE =====================================
  ...themes("Mathématiques", "Seconde", "Lycée", [
    "Second degré (intro)", "Vecteurs", "Fonctions de référence", "Statistiques et probabilités", "Trigonométrie", "Équations et inéquations",
  ]),
  ...themes("Mathématiques", "Première", "Lycée", [
    "Dérivation", "Suites numériques", "Second degré", "Probabilités conditionnelles", "Produit scalaire", "Trigonométrie (radians)", "Exponentielle",
  ]),
  ...themes("Mathématiques", "Terminale", "Lycée", [
    "Limites de fonctions", "Intégrales", "Probabilités conditionnelles", "Nombres complexes", "Logarithme népérien", "Suites et récurrence", "Géométrie dans l'espace", "Lois de probabilité continues",
  ]),
  ...themes("Physique-Chimie", "Seconde", "Lycée", ["Mouvement et interactions", "Constitution de la matière", "Ondes et signaux (intro)"]),
  ...themes("Physique-Chimie", "Première", "Lycée", ["Ondes et signaux", "Réactions acide-base", "Énergie mécanique", "Transformations chimiques"]),
  ...themes("Physique-Chimie", "Terminale", "Lycée", ["Mécanique de Newton", "Évolution des systèmes chimiques", "Ondes et particules", "Circuits électriques (dipôles RC/RL)", "Temps et relativité"]),
  ...themes("SVT", "Seconde", "Lycée", ["La Terre dans l'univers", "Enjeux planétaires (climat)", "Corps humain et santé"]),
  ...themes("SVT", "Première", "Lycée", ["Génétique et évolution", "Le fonctionnement du système immunitaire", "La géologie et la tectonique des plaques"]),
  ...themes("SVT", "Terminale", "Lycée", ["La complexification des génomes", "Comportements, mouvement et locomotion", "Climats du passé", "Bases moléculaires du vivant"]),
  ...themes("Français/Littérature", "Seconde-Première", "Lycée", ["Les figures de style", "L'argumentation", "Le théâtre classique", "La poésie du XIXe siècle", "Le roman du XVIIIe au XXIe siècle", "Épreuve anticipée de français (méthode)"]),
  ...themes("Philosophie", "Terminale", "Lycée", ["La conscience", "La liberté", "Le bonheur", "La vérité", "L'État et la justice", "Le désir", "La technique", "Le travail", "L'art", "La raison et le réel"]),
  ...themes("Histoire", "Seconde", "Lycée", ["Renaissance et Humanisme", "Les Lumières", "L'affirmation de l'État en France"]),
  ...themes("Histoire", "Première", "Lycée", ["La Première Guerre mondiale", "Le monde de 1930 à 1945", "L'affirmation des totalitarismes"]),
  ...themes("Histoire", "Terminale", "Lycée", ["La guerre froide", "La décolonisation", "La Ve République", "Le monde depuis 1991"]),
  ...themes("Géographie", "Lycée", "Lycée", ["Les territoires ultramarins", "La France et l'Union Européenne", "Mers et océans", "Aires urbaines et mobilités"]),
  ...themes("Géopolitique (HGGSP)", "Première-Terminale", "Lycée", ["Frontières", "Puissance et influence", "Environnement, enjeu géopolitique", "Faire la guerre, faire la paix", "S'informer, un regard critique"]),
  ...themes("SES", "Seconde", "Lycée", ["Comment un marché fonctionne-t-il ?", "Comment se forment les prix ?", "Qui produit des richesses ?"]),
  ...themes("SES", "Première", "Lycée", ["La monnaie et le financement", "Structure sociale et inégalités", "Comment se forme le prix sur un marché ?"]),
  ...themes("SES", "Terminale", "Lycée", ["Croissance économique", "Justice sociale", "Intégration européenne", "Conflits et mobilisation sociale"]),
  ...themes("NSI", "Première-Terminale", "Lycée", ["Structures de données", "Bases de données SQL", "Réseaux et protocoles", "Algorithmique (tri, recherche)", "Programmation Python (bases)", "Architectures matérielles"]),
  ...themes("SI (sciences de l'ingénieur)", "Lycée", "Lycée", ["Chaîne d'énergie", "Chaîne d'information", "Mécanique des systèmes"]),
  ...themes("Anglais", "Lycée", "Lycée", ["Present perfect vs. past simple", "Modaux avancés", "Le discours rapporté", "Vocabulaire de l'actualité"]),
  ...themes("Espagnol", "Lycée", "Lycée", ["Le subjonctif", "Passé simple vs. imparfait", "Le futur et le conditionnel"]),
  ...themes("Allemand", "Lycée", "Lycée", ["Les déclinaisons", "L'ordre des mots", "Le subjonctif II"]),
  ...themes("Arts", "Lycée", "Lycée", ["Histoire de l'art et pratique plastique", "L'art engagé"]),

  // ============================== SUPÉRIEUR =================================
  ...themes("Mathématiques", "Bac +1/+2", "Supérieur", ["Algèbre linéaire", "Suites et séries", "Analyse (limites, dérivées)", "Équations différentielles", "Probabilités et statistiques"]),
  ...themes("Économie", "Supérieur", "Supérieur", ["Microéconomie : offre et demande", "Macroéconomie : PIB et inflation", "Théorie des jeux (intro)", "Commerce international"]),
  ...themes("Gestion", "Supérieur", "Supérieur", ["Comptabilité générale", "Analyse financière", "Marketing (le mix marketing)", "Gestion de projet", "Ressources humaines (bases)"]),
  ...themes("Comptabilité", "Supérieur", "Supérieur", ["Le bilan comptable", "Le compte de résultat", "La TVA", "Les amortissements"]),
  ...themes("Finance", "Supérieur", "Supérieur", ["Valeur temps de l'argent", "Les marchés financiers", "L'évaluation d'entreprise (intro)"]),
  ...themes("Marketing", "Supérieur", "Supérieur", ["Étude de marché", "Le positionnement de marque", "Le marketing digital"]),
  ...themes("Droit", "Supérieur", "Supérieur", ["Introduction au droit civil", "Le droit des contrats", "Droit du travail (bases)", "Droit fiscal (bases)", "Droit des sociétés", "Droit constitutionnel"]),
  ...themes("Sciences politiques", "Supérieur", "Supérieur", ["Les institutions de la Ve République", "Les régimes politiques", "Relations internationales (bases)"]),
  ...themes("Sociologie", "Supérieur", "Supérieur", ["La socialisation", "Les classes sociales", "L'action collective"]),
  ...themes("Psychologie", "Supérieur", "Supérieur", ["Psychologie cognitive (bases)", "Psychologie du développement", "Psychologie sociale (bases)"]),
  ...themes("Informatique", "Supérieur", "Supérieur", ["Bases de la programmation (Python)", "Algorithmique (tri, recherche)", "Structures de données avancées", "Complexité algorithmique"]),
  ...themes("Cybersécurité", "Supérieur", "Supérieur", ["Principes de la cryptographie", "Sécurité des réseaux", "Failles web courantes (OWASP)"]),
  ...themes("Intelligence artificielle", "Supérieur", "Supérieur", ["Apprentissage supervisé", "Réseaux de neurones (bases)", "Traitement du langage naturel (bases)"]),
  ...themes("Électronique", "Supérieur", "Supérieur", ["Lois de base des circuits", "Composants électroniques", "Signaux analogiques vs. numériques"]),
  ...themes("Mécanique", "Supérieur", "Supérieur", ["Statique des solides", "Dynamique du point matériel", "Résistance des matériaux (bases)"]),
  ...themes("Sciences de l'ingénieur", "Supérieur", "Supérieur", ["Thermodynamique (bases)", "Automatique et régulation"]),
  ...themes("Architecture", "Supérieur", "Supérieur", ["Histoire de l'architecture", "Les grands courants architecturaux"]),
  ...themes("Biologie", "Supérieur", "Supérieur", ["Biologie cellulaire", "Génétique moléculaire", "Physiologie animale (bases)"]),
  ...themes("Anatomie", "Supérieur", "Supérieur", ["Le système cardiovasculaire", "Le système nerveux", "Le système musculo-squelettique"]),
  ...themes("Pharmacologie", "Supérieur", "Supérieur", ["Pharmacocinétique (bases)", "Les grandes classes de médicaments"]),
  ...themes("Astronomie", "Supérieur", "Supérieur", ["Le système solaire", "Les étoiles et leur cycle de vie", "La cosmologie (bases)"]),
  ...themes("Statistiques", "Supérieur", "Supérieur", ["Statistique descriptive", "Tests d'hypothèses (bases)", "Régression linéaire"]),
  ...themes("Probabilités", "Supérieur", "Supérieur", ["Variables aléatoires", "Lois usuelles (binomiale, normale)"]),

  // ============================== LANGUES ===================================
  ...themes("Anglais", "Général", "Général", ["Vocabulaire des affaires", "Expressions idiomatiques courantes"]),
  ...themes("Italien", "Général", "Général", ["Se présenter en italien", "Le présent de l'indicatif"]),
  ...themes("Portugais", "Général", "Général", ["Se présenter en portugais", "Le présent de l'indicatif"]),
  ...themes("Arabe", "Général", "Général", ["L'alphabet arabe", "Les salutations courantes"]),
  ...themes("Chinois", "Général", "Général", ["Les tons du mandarin", "Les caractères de base"]),
  ...themes("Japonais", "Général", "Général", ["Hiragana et katakana", "Les salutations courantes"]),
  ...themes("Latin", "Général", "Général", ["Les déclinaisons latines", "Vocabulaire de base"]),
  ...themes("Grec ancien", "Général", "Général", ["L'alphabet grec", "Les déclinaisons de base"]),

  // ============================== ARTS / CULTURE =============================
  ...themes("Histoire de l'art", "Général", "Général", ["La Renaissance italienne", "L'impressionnisme", "L'art contemporain", "L'Art nouveau", "Le classicisme", "L'art abstrait"]),
  ...themes("Musique", "Général", "Général", ["Les familles d'instruments", "Les grands courants musicaux", "Le jazz", "La musique classique (les grands compositeurs)"]),
  ...themes("Cinéma", "Général", "Général", ["Histoire du cinéma", "Les grands réalisateurs", "Les genres cinématographiques"]),

  // ============================== CULTURE GÉNÉRALE ===========================
  ...themes("Culture générale", "Général", "Général", [
    "Actualité et institutions", "Grandes dates de l'Histoire de France", "Géographie mondiale (capitales, drapeaux)", "Grands inventeurs et découvertes", "Mythologie grecque", "Mythologie nordique", "Prix Nobel célèbres", "Grands monuments du monde",
  ]),
];

export const QUIZ_SUBJECTS = Array.from(new Set(QUIZ_CATALOG.map((t) => t.subject))).sort();

// Liste volontairement large de matières explorables (section 4 du cahier
// des charges : "cette liste n'est PAS exhaustive"). Sert à l'explorateur
// "par matière et niveau" (voir ChapterExplorer) : l'IA génère ensuite la
// liste RÉELLE et complète des chapitres pour la matière + le niveau choisis,
// plutôt que de dépendre d'une liste de thèmes tapée à la main.
export const ALL_SUBJECTS = Array.from(
  new Set([
    ...QUIZ_SUBJECTS,
    "Grammaire", "Orthographe", "Littérature", "Chimie", "Physique", "Biologie", "Géologie",
    "Économie", "Gestion", "Comptabilité", "Finance", "Marketing", "Commerce", "Management", "Communication",
    "Droit", "Sciences politiques", "Sociologie", "Psychologie", "Sciences sociales", "Sciences humaines",
    "Programmation", "Algorithmique", "Électricité", "Construction", "Médecine", "Pharmacologie", "Astrophysique",
    "Culture générale",
  ])
).sort();
