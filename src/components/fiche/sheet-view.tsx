import { AlertTriangle, Languages } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RevisionSheetDTO } from "@/lib/fiche/serialize";
import type { RevisionSheetBlock } from "@/lib/ai/schemas";

// Palette façon surligneurs (fiche manuscrite de référence) : chaque bloc
// prend une couleur différente pour distinguer visuellement les notions,
// pas un code couleur sémantique par type — c'est le style demandé, proche
// d'une vraie fiche annotée à la main.
const HIGHLIGHT_COLORS = [
  { bg: "#fdba74", text: "#7c2d12" }, // orange
  { bg: "#7dd3fc", text: "#0c4a6e" }, // bleu ciel
  { bg: "#fde047", text: "#713f12" }, // jaune
  { bg: "#f9a8d4", text: "#831843" }, // rose
  { bg: "#86efac", text: "#14532d" }, // vert
  { bg: "#d8b4fe", text: "#581c87" }, // violet
  { bg: "#5eead4", text: "#134e4a" }, // turquoise
  { bg: "#fca5a5", text: "#7f1d1d" }, // rouge
];

const ATTENTION_COLOR = { bg: "#fca5a5", text: "#7f1d1d" };

function colorFor(block: RevisionSheetBlock, index: number) {
  if (block.type === "attention") return ATTENTION_COLOR;
  return HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length];
}

export function SheetView({ sheet }: { sheet: RevisionSheetDTO }) {
  const { content, quality } = sheet;

  if (sheet.status === "error") {
    return (
      <Card>
        <CardBody className="space-y-2">
          <p className="font-medium text-error">La création de la fiche a échoué</p>
          <p className="text-sm text-text-secondary">{sheet.errorMessage}</p>
        </CardBody>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-text-secondary">Création en cours ({sheet.status})…</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="primary">{sheet.subject}</Badge>
        {sheet.chapter && <Badge tone="neutral">{sheet.chapter}</Badge>}
        <Badge tone="neutral">{sheet.sheetType}</Badge>
        {quality && <Badge tone={quality.total >= 16 ? "success" : "warning"}>Qualité {quality.total}/20</Badge>}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-center">{content.title}</h2>
        <p className="text-text-secondary text-sm mt-1 text-center">{content.summary}</p>
      </div>

      {content.unreadableParts.length > 0 && (
        <Card className="border-warning">
          <CardBody className="flex gap-2 items-start text-sm">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Certains éléments ne sont pas assez lisibles</p>
              <ul className="list-disc pl-4 text-text-secondary mt-1 space-y-0.5">
                {content.unreadableParts.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {content.blocks.map((block, i) => {
              const color = colorFor(block, i);
              return (
                <div key={i} className="space-y-1.5 min-w-0">
                  <span
                    style={{ backgroundColor: color.bg, color: color.text }}
                    className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide"
                  >
                    {block.title}
                  </span>
                  <p className="text-xs leading-snug whitespace-pre-wrap break-words">{block.content}</p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {content.keyVocabulary.length > 0 && (
        <Card>
          <CardBody className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wide">
              <Languages size={16} /> Vocabulaire clé
            </div>
            <dl className="space-y-2">
              {content.keyVocabulary.map((v, i) => (
                <div key={i} className="text-sm">
                  <dt className="font-medium">{v.term}</dt>
                  <dd className="text-text-secondary">{v.definition}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
