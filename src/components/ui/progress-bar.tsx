export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-[var(--radius-full)] bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-[var(--radius-full)] bg-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
