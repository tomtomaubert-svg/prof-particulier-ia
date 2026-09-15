import {
  BookOpen,
  Star,
  Sigma,
  ListChecks,
  Lightbulb,
  AlertTriangle,
  Calendar,
  User,
  Languages,
  Sparkles,
  FileText,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RevisionSheetDTO } from "@/lib/fiche/serialize";
import type { RevisionSheetBlock } from "@/lib/ai/schemas";

const BLOCK_STYLE: Record<
  RevisionSheetBlock["type"],
  { icon: React.ElementType; label: string; tone: "primary" | "success" | "warning" | "error" | "neutral" }
> = {
  definition: { icon: BookOpen, label: "Définition", tone: "primary" },
  a_retenir: { icon: Star, label: "À retenir", tone: "success" },
  formule: { icon: Sigma, label: "Formule", tone: "primary" },
  methode: { icon: ListChecks, label: "Méthode", tone: "primary" },
  exemple: { icon: Lightbulb, label: "Exemple", tone: "neutral" },
  attention: { icon: AlertTriangle, label: "Attention", tone: "warning" },
  date: { icon: Calendar, label: "Date", tone: "neutral" },
  personnage: { icon: User, label: "Personnage", tone: "neutral" },
  vocabulaire: { icon: Languages, label: "Vocabulaire", tone: "neutral" },
  astuce: { icon: Sparkles, label: "Astuce", tone: "success" },
  texte: { icon: FileText, label: "", tone: "neutral" },
};

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
        <h2 className="text-xl font-semibold">{content.title}</h2>
        <p className="text-text-secondary text-sm mt-1">{content.summary}</p>
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

      <div className="space-y-3">
        {content.blocks.map((block, i) => {
          const style = BLOCK_STYLE[block.type];
          const Icon = style.icon;
          return (
            <Card key={i}>
              <CardBody className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge tone={style.tone}>
                    <Icon size={12} />
                    {style.label || "Notion"}
                  </Badge>
                  <p className="font-medium text-sm">{block.title}</p>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{block.content}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

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
