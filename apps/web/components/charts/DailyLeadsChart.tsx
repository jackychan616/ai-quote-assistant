type DailyPoint = {
  label: string;
  value: number;
};

export function DailyLeadsChart({ points }: { points: DailyPoint[] }) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className="flex h-52 items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-4">
      {points.map((point) => {
        const height = Math.max(8, Math.round((point.value / max) * 100));
        return (
          <div key={point.label} className="group flex flex-1 flex-col items-center justify-end">
            <div className="mb-2 text-[11px] font-medium text-slate-500 opacity-0 transition group-hover:opacity-100">
              {point.value}
            </div>
            <div className="w-full rounded-md bg-gradient-to-b from-indigo-400 to-indigo-600" style={{ height: `${height}%` }} />
            <p className="mt-2 text-[11px] text-slate-500">{point.label}</p>
          </div>
        );
      })}
    </div>
  );
}
