import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { RevisionSheetContent, RevisionSheetBlock } from "@/lib/ai/schemas";

// Même esprit que le rendu web "façon surligneurs" (SheetView) mais avec les
// primitives PDF de react-pdf (pas de CSS/Tailwind ici) — export section 48.
const HIGHLIGHT_COLORS = [
  { bg: "#fdba74", text: "#7c2d12" },
  { bg: "#7dd3fc", text: "#0c4a6e" },
  { bg: "#fde047", text: "#713f12" },
  { bg: "#f9a8d4", text: "#831843" },
  { bg: "#86efac", text: "#14532d" },
  { bg: "#d8b4fe", text: "#581c87" },
  { bg: "#5eead4", text: "#134e4a" },
  { bg: "#fca5a5", text: "#7f1d1d" },
];
const ATTENTION_COLOR = { bg: "#fca5a5", text: "#7f1d1d" };

function colorFor(block: RevisionSheetBlock, index: number) {
  if (block.type === "attention") return ATTENTION_COLOR;
  return HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length];
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1c1917" },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  badge: {
    backgroundColor: "#ede9fe",
    color: "#5b21b6",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 7,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 4 },
  summary: { fontSize: 10, color: "#57534e", textAlign: "center", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  blockBox: { width: "47%", marginBottom: 12 },
  blockTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignSelf: "flex-start",
    marginBottom: 3,
  },
  blockContent: { fontSize: 9, lineHeight: 1.4 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
    color: "#57534e",
    marginBottom: 6,
    marginTop: 6,
  },
  vocabRow: { marginBottom: 5 },
  vocabTerm: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  vocabDef: { fontSize: 9, color: "#44403c" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, fontSize: 7, color: "#a8a29e", textAlign: "center" },
});

export function RevisionSheetPdf({
  content,
  subject,
  chapter,
  sheetType,
}: {
  content: RevisionSheetContent;
  subject: string | null;
  chapter: string | null;
  sheetType: string;
}) {
  return (
    <Document title={content.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.badgeRow}>
          {subject && <Text style={styles.badge}>{subject}</Text>}
          {chapter && <Text style={styles.badge}>{chapter}</Text>}
          <Text style={styles.badge}>{sheetType}</Text>
        </View>

        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.summary}>{content.summary}</Text>

        <View style={styles.grid}>
          {content.blocks.map((block, i) => {
            const color = colorFor(block, i);
            return (
              <View key={i} style={styles.blockBox}>
                <Text style={[styles.blockTitle, { backgroundColor: color.bg, color: color.text }]}>{block.title}</Text>
                <Text style={styles.blockContent}>{block.content}</Text>
              </View>
            );
          })}
        </View>

        {content.keyVocabulary.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Vocabulaire clé</Text>
            {content.keyVocabulary.map((v, i) => (
              <View key={i} style={styles.vocabRow}>
                <Text style={styles.vocabTerm}>{v.term}</Text>
                <Text style={styles.vocabDef}>{v.definition}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          Généré avec Prof Particulier IA
        </Text>
      </Page>
    </Document>
  );
}
