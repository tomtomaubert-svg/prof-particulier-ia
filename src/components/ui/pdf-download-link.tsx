import { AnchorHTMLAttributes } from "react";
import clsx from "clsx";
import { FileDown } from "lucide-react";
import { variantClasses, sizeClasses, type Variant, type Size } from "@/components/ui/button";

interface PdfDownloadLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  label?: string;
}

// Téléchargement direct (pas de fetch/blob) : le navigateur gère nativement
// la réponse application/pdf + Content-Disposition renvoyée par la route API
// (section 48). Sur mobile, certains navigateurs l'ouvrent dans leur
// visionneuse PDF au lieu de forcer l'enregistrement — l'utilisateur peut
// ensuite l'enregistrer/partager depuis là, ce qui reste acceptable.
export function PdfDownloadLink({
  href,
  variant = "secondary",
  size = "md",
  label = "Télécharger en PDF",
  className,
  ...props
}: PdfDownloadLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <FileDown size={16} />
      {label}
    </a>
  );
}
