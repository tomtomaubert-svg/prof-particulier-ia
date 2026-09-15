"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles, Target } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExerciseAttemptDTO } from "@/lib/exercise/serialize";

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wide">
          {icon}
          {title}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
      </CardBody>
    </Card>
  );
}

export function CorrectionView({ attempt }: { attempt: ExerciseAttemptDTO }) {
  const { solution, analysis, quality } = attempt;

  if (attempt.status === "error") {
    return (
      <Card>
        <CardBody className="space-y-2">
          <p className="font-medium text-error">L&apos;analyse a échoué</p>
          <p className="text-sm text-text-secondary">{attempt.errorMessage}</p>
        </CardBody>
      </Card>
    );
  }

  if (!solution || !analysis) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-text-secondary">Analyse en cours ({attempt.status})…</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="primary">{attempt.subject}</Badge>
        {attempt.chapter && <Badge tone="neutral">{attempt.chapter}</Badge>}
        {attempt.difficulty && <Badge tone="neutral">{attempt.difficulty}</Badge>}
        {quality && (
          <Badge tone={quality.total >= 16 ? "success" : "warning"}>Qualité {quality.total}/20</Badge>
        )}
      </div>

      {(analysis.unreadableParts.length > 0 || solution.unreadableParts.length > 0) && (
        <Card className="border-warning">
          <CardBody className="flex gap-2 items-start text-sm">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Certains éléments ne sont pas assez lisibles</p>
              <ul className="list-disc pl-4 text-text-secondary mt-1 space-y-0.5">
                {[...new Set([...analysis.unreadableParts, ...solution.unreadableParts])].map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      )}

      {solution.studentWorkReview && <StudentWorkReview review={solution.studentWorkReview} />}

      {attempt.mode === "apprendre" ? (
        <LearnMode solution={solution} />
      ) : (
        <FullCorrection solution={solution} />
      )}
    </div>
  );
}

function StudentWorkReview({ review }: { review: NonNullable<import("@/lib/ai/schemas").ExerciseSolution["studentWorkReview"]> }) {
  return (
    <Card className="border-primary">
      <CardBody className="space-y-3">
        <p className="text-sm font-semibold text-primary">Ton travail, analysé</p>
        <div className="flex gap-2 text-sm">
          <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
          <p>{review.whatWasDoneWell}</p>
        </div>
        {review.firstError && (
          <>
            <div className="flex gap-2 text-sm">
              <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
              <p><strong>Première erreur :</strong> {review.firstError}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <Lightbulb size={18} className="text-accent shrink-0 mt-0.5" />
              <p>{review.whyItsAnError}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
              <p><strong>Comment corriger :</strong> {review.howToFixIt}</p>
            </div>
            {review.restOfReasoning && (
              <div className="flex gap-2 text-sm">
                <Target size={18} className="text-primary shrink-0 mt-0.5" />
                <p>{review.restOfReasoning}</p>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

function FullCorrection({ solution }: { solution: import("@/lib/ai/schemas").ExerciseSolution }) {
  return (
    <div className="space-y-4">
      <Section icon={<Target size={16} />} title="Ce qu'on cherche">{solution.whatWeSearch}</Section>
      {solution.importantData.length > 0 && (
        <Section icon={<Target size={16} />} title="Données importantes">
          <ul className="list-disc pl-4 space-y-1">
            {solution.importantData.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </Section>
      )}
      <Section icon={<Sparkles size={16} />} title="Méthode">
        {solution.method}
        <p className="text-xs text-text-secondary mt-2">{solution.levelJustification}</p>
      </Section>
      {solution.formulaOrRule && (
        <Section icon={<Sparkles size={16} />} title="Formule / règle">
          <code className="font-mono text-sm">{solution.formulaOrRule}</code>
        </Section>
      )}
      <Section icon={<Sparkles size={16} />} title="Résolution étape par étape">
        <ol className="space-y-3 list-decimal pl-4">
          {solution.steps.map((s, i) => (
            <li key={i}>
              <p className="font-medium">{s.title}</p>
              <p>{s.content}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Card className="bg-primary text-white">
        <CardBody>
          <p className="text-xs uppercase tracking-wide opacity-80">Résultat</p>
          <p className="text-lg font-semibold mt-1">{solution.result}</p>
        </CardBody>
      </Card>

      <Section icon={<CheckCircle2 size={16} />} title="Vérification">{solution.verification}</Section>
      <Section icon={<Lightbulb size={16} />} title="À retenir">{solution.keyTakeaway}</Section>
      <Section icon={<AlertTriangle size={16} />} title="Erreur fréquente">{solution.commonMistake}</Section>
      <Section icon={<Sparkles size={16} />} title="Astuce">{solution.tip}</Section>
    </div>
  );
}

type LearnStage = "start" | "hint1" | "hint2" | "formula" | "nextStep" | "method" | "full";
const STAGE_ORDER: LearnStage[] = ["start", "hint1", "hint2", "formula", "nextStep", "method", "full"];

function LearnMode({ solution }: { solution: import("@/lib/ai/schemas").ExerciseSolution }) {
  const [stage, setStage] = useState<LearnStage>("start");
  const idx = STAGE_ORDER.indexOf(stage);

  if (stage === "full") return <FullCorrection solution={solution} />;

  const next = (s: LearnStage) => () => setStage(s);

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary uppercase tracking-wide">
            <Target size={16} /> Ce qu&apos;on cherche
          </div>
          <p className="text-sm">{solution.whatWeSearch}</p>
        </CardBody>
      </Card>

      {idx >= 1 && (
        <Section icon={<Lightbulb size={16} />} title="Indice 1">{solution.hints.hint1}</Section>
      )}
      {idx >= 2 && (
        <Section icon={<Lightbulb size={16} />} title="Indice 2">{solution.hints.hint2}</Section>
      )}
      {idx >= 3 && (
        <Section icon={<Sparkles size={16} />} title="Quelle formule utiliser ?">{solution.hints.whichFormula}</Section>
      )}
      {idx >= 4 && (
        <Section icon={<Sparkles size={16} />} title="Étape suivante">{solution.hints.nextStep}</Section>
      )}
      {idx >= 5 && (
        <Section icon={<Sparkles size={16} />} title="Méthode complète">{solution.method}</Section>
      )}

      <div className="flex flex-wrap gap-2">
        {stage === "start" && <Button size="sm" onClick={next("hint1")}>Indice 1</Button>}
        {stage === "hint1" && <Button size="sm" onClick={next("hint2")}>Indice 2</Button>}
        {stage === "hint2" && <Button size="sm" onClick={next("formula")}>Quelle formule utiliser ?</Button>}
        {stage === "formula" && <Button size="sm" onClick={next("nextStep")}>Étape suivante</Button>}
        {stage === "nextStep" && <Button size="sm" onClick={next("method")}>Voir la méthode</Button>}
        {stage !== "start" && (
          <Button size="sm" variant="secondary" onClick={next("full")}>
            Voir la correction complète
          </Button>
        )}
      </div>
    </div>
  );
}
