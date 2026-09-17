// Content-Disposition filename doit rester ASCII (les matières contiennent
// des accents comme "Mathématiques") pour éviter un header invalide.
export function pdfFilename(prefix: string, label: string | null): string {
  const slug = (label ?? "document")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${prefix}-${slug || "document"}.pdf`;
}
