type Stage = {
  label: string;
  value: number;
  colorClass: string;
};

export function ConversionFunnel({ stages }: { stages: Stage[] }) {
  const max = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <div className="space-y-2">
      {stages.map((stage) => {
        const width = Math.max(8, Math.round((stage.value / max) * 100));
        return (
          <div key={stage.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">{stage.label}</span>
              <span className="font-medium text-slate-900">{stage.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${stage.colorClass}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
