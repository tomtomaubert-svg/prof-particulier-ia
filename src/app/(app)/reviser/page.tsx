import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReviserPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Réviser</h1>
      <Card>
        <CardBody className="space-y-2">
          <Badge tone="neutral">Bientôt disponible</Badge>
          <p className="text-sm text-text-secondary">
            Quiz et flashcards générés automatiquement depuis tes fiches et exercices arriveront ici dans une
            prochaine itération.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
