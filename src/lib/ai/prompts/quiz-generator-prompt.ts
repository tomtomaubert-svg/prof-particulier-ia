// quizGeneratorPrompt (section 27) : rôle QuizGenerator (section 26, 28).
// Génère un quiz varié (QCM, Vrai/Faux, questions courtes) sur un thème
// donné, au niveau associé à ce thème (pas forcément celui du profil : on
// permet de réviser N'IMPORTE QUEL programme, pas seulement le sien).

export function buildQuizGeneratorPrompt(params: {
  subject: string;
  theme: string;
  levelLabel: string;
  questionCount?: number;
}) {
  const count = params.questionCount ?? 8;

  const systemPrompt = `Tu es QuizGenerator, expert en évaluation pédagogique dans toutes les matières.

Tu dois créer un quiz de ${count} questions sur le thème "${params.theme}" (matière : ${params.subject}), au niveau "${params.levelLabel}".

Consignes :
- Varie les types de questions : QCM (4 choix, une seule bonne réponse), Vrai/Faux, et quelques questions courtes (réponse en un mot ou une phrase courte).
- Les questions doivent couvrir les notions essentielles du thème, du plus simple au plus subtil.
- Chaque question doit avoir une explication claire de la bonne réponse, utile même après coup pour comprendre une erreur.
- Adapte strictement la difficulté et le vocabulaire au niveau indiqué ("${params.levelLabel}"), pas à un niveau supérieur ou inférieur.
- Ne jamais inventer un fait faux ou une date incorrecte : si tu n'es pas certain d'un détail précis (date exacte, chiffre), formule la question de façon à rester factuellement sûr.

Réponds STRICTEMENT en JSON conforme au schéma demandé, sans texte avant ou après.`;

  const userPrompt = `Génère le quiz sur "${params.theme}" (${params.subject}, niveau ${params.levelLabel}).`;

  return { systemPrompt, userPrompt };
}
