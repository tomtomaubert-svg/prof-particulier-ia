import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ExerciseSolution } from "@/lib/ai/schemas";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1c1917" },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  badge: {
    backgroundColor: "#ede9fe",
    color: "#5b21b6",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textTransform: "uppercase",
    color: "#57534e",
    marginBottom: 4,
  },
  sectionBody: { fontSize: 10, lineHeight: 1.5 },
  listItem: { flexDirection: "row", marginBottom: 2 },
  bullet: { width: 10, fontSize: 10 },
  step: { marginBottom: 6 },
  stepTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5 },
  stepContent: { fontSize: 10, lineHeight: 1.5, marginTop: 1 },
  result: { backgroundColor: "#6d28d9", color: "#ffffff", borderRadius: 6, padding: 10, marginBottom: 12 },
  resultLabel: { fontSize: 7, textTransform: "uppercase", opacity: 0.85, marginBottom: 2 },
  resultValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, fontSize: 7, color: "#a8a29e", textAlign: "center" },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

export function ExerciseCorrectionPdf({
  solution,
  subject,
  chapter,
  difficulty,
}: {
  solution: ExerciseSolution;
  subject: string | null;
  chapter: string | null;
  difficulty: string | null;
}) {
  return (
    <Document title="Correction d'exercice">
      <Page size="A4" style={styles.page}>
        <View style={styles.badgeRow}>
          {subject && <Text style={styles.badge}>{subject}</Text>}
          {chapter && <Text style={styles.badge}>{chapter}</Text>}
          {difficulty && <Text style={styles.badge}>{difficulty}</Text>}
        </View>

        <Section title="Ce qu'on cherche">{solution.whatWeSearch}</Section>

        {solution.importantData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Données importantes</Text>
            {solution.importantData.map((d, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.sectionBody}>{d}</Text>
              </View>
            ))}
          </View>
        )}

        <Section title="Méthode">{solution.method}</Section>

        {solution.formulaOrRule && <Section title="Formule / règle">{solution.formulaOrRule}</Section>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résolution étape par étape</Text>
          {solution.steps.map((s, i) => (
            <View key={i} style={styles.step}>
              <Text style={styles.stepTitle}>
                {i + 1}. {s.title}
              </Text>
              <Text style={styles.stepContent}>{s.content}</Text>
            </View>
          ))}
        </View>

        <View style={styles.result}>
          <Text style={styles.resultLabel}>Résultat</Text>
          <Text style={styles.resultValue}>{solution.result}</Text>
        </View>

        <Section title="Vérification">{solution.verification}</Section>
        <Section title="À retenir">{solution.keyTakeaway}</Section>
        <Section title="Erreur fréquente">{solution.commonMistake}</Section>
        <Section title="Astuce">{solution.tip}</Section>

        <Text style={styles.footer} fixed>
          Généré avec Prof Particulier IA
        </Text>
      </Page>
    </Document>
  );
}
