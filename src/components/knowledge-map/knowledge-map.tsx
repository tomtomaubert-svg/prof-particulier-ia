import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

interface SkillRow {
  subject: string;
  skill: string;
  masteryPct: number;
  attempts: number;
}

// Carte des connaissances (section 31 du cahier des charges) : évolue selon
// les exercices, fiches et quiz réels de l'élève — pas une valeur figée.
export function KnowledgeMap({ skills }: { skills: SkillRow[] }) {
  if (skills.length === 0) {
    return (
      <Card>
        <CardBody className="text-sm text-text-secondary">
          Ta carte de connaissances se remplira au fil de tes exercices, fiches et quiz.
        </CardBody>
      </Card>
    );
  }

  const bySubject = new Map<string, SkillRow[]>();
  for (const s of skills) {
    if (!bySubject.has(s.subject)) bySubject.set(s.subject, []);
    bySubject.get(s.subject)!.push(s);
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        {Array.from(bySubject.entries()).map(([subject, rows]) => (
          <div key={subject} className="space-y-3">
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wide">{subject}</p>
            <div className="space-y-2.5">
              {rows.map((row) => (
                <ProgressBar key={row.skill} label={row.skill} value={row.masteryPct} />
              ))}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
