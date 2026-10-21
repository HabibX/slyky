export function MetricCard({
  current,
  target,
  label,
}: {
  current: number;
  target: number;
  label: string;
}) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-text-primary">{current}</span>
        <span className="text-sm text-text-muted">/ {target}</span>
      </div>
      <div className="text-sm font-medium text-text-secondary mb-3">{label}</div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}