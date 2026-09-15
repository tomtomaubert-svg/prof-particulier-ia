import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export function ModuleCard({
  href,
  icon: Icon,
  title,
  description,
  disabled,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const content = (
    <Card
      className={clsx(
        "transition-transform h-full",
        disabled ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      )}
    >
      <CardBody className="space-y-3">
        <div className="h-11 w-11 rounded-[var(--radius-md)] bg-primary-soft text-primary flex items-center justify-center">
          <Icon size={22} />
        </div>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{title}</p>
          {disabled && <Badge tone="neutral">Bientôt</Badge>}
        </div>
        <p className="text-sm text-text-secondary">{description}</p>
      </CardBody>
    </Card>
  );

  if (disabled) return <div aria-disabled>{content}</div>;
  return <Link href={href}>{content}</Link>;
}
