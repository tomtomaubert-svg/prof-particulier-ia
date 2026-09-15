"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuizContent } from "@/lib/ai/schemas";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function QuizTaker({ content }: { content: QuizContent }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return 0;
    return content.questions.reduce((acc, q, i) => {
      const given = answers[i];
      if (given && normalize(given) === normalize(q.correctAnswer)) return acc + 1;
      return acc;
    }, 0);
  }, [submitted, answers, content.questions]);

  const answeredCount = Object.keys(answers).length;

  if (submitted) {
    return (
      <div className="space-y-4">
        <Card className="bg-primary text-white">
          <CardBody>
            <p className="text-xs uppercase tracking-wide opacity-80">Résultat</p>
            <p className="text-2xl font-semibold mt-1">
              {score} / {content.questions.length}
            </p>
          </CardBody>
        </Card>

        <div className="space-y-3">
          {content.questions.map((q, i) => {
            const given = answers[i];
            const isCorrect = given ? normalize(given) === normalize(q.correctAnswer) : false;
            return (
              <Card key={i}>
                <CardBody className="space-y-2">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={18} className="text-error shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  <p className="text-sm text-text-secondary pl-6">
                    Ta réponse : <span className={isCorrect ? "text-success" : "text-error"}>{given || "(pas de réponse)"}</span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm pl-6">
                      Bonne réponse : <strong>{q.correctAnswer}</strong>
                    </p>
                  )}
                  <p className="text-xs text-text-secondary pl-6">{q.explanation}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Button className="w-full" variant="secondary" onClick={() => { setSubmitted(false); setAnswers({}); }}>
          Recommencer ce quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        {answeredCount} / {content.questions.length} répondues
      </p>
      {content.questions.map((q, i) => (
        <Card key={i}>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">Question {i + 1}</Badge>
              <Badge tone="primary">{q.type === "qcm" ? "QCM" : q.type === "vrai_faux" ? "Vrai/Faux" : "Réponse courte"}</Badge>
            </div>
            <p className="text-sm font-medium">{q.question}</p>

            {q.type === "qcm" && q.choices && (
              <div className="grid grid-cols-1 gap-2">
                {q.choices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => setAnswers((prev) => ({ ...prev, [i]: choice }))}
                    className={clsx(
                      "text-left px-3 py-2 rounded-[var(--radius-md)] border text-sm transition-colors",
                      answers[i] === choice ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                    )}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {q.type === "vrai_faux" && (
              <div className="flex gap-2">
                {["Vrai", "Faux"].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => setAnswers((prev) => ({ ...prev, [i]: choice }))}
                    className={clsx(
                      "flex-1 py-2 rounded-[var(--radius-md)] border text-sm transition-colors",
                      answers[i] === choice ? "border-primary bg-primary-soft" : "border-border hover:border-primary"
                    )}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {q.type === "question_courte" && (
              <input
                value={answers[i] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                placeholder="Ta réponse…"
                className="w-full h-11 px-3 rounded-[var(--radius-md)] border border-border bg-background outline-none focus:border-primary"
              />
            )}
          </CardBody>
        </Card>
      ))}

      <Button className="w-full" size="lg" onClick={() => setSubmitted(true)}>
        Valider mes réponses
      </Button>
    </div>
  );
}
