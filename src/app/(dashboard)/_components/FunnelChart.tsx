"use client";

interface FunnelQuote {
  status: string;
  source: string | null;
  totalAmount: number;
}

interface FunnelChartProps {
  quotes: FunnelQuote[];
  totalReservations: number;
}

export function FunnelChart({ quotes, totalReservations }: FunnelChartProps) {
  const leads = quotes.filter((q) => q.source === "survey").length;
  const total = quotes.length;
  const sent = quotes.filter((q) =>
    ["enviado", "pagado", "aceptado"].includes(q.status),
  ).length;
  const paid = quotes.filter(
    (q) => q.status === "pagado" || q.status === "aceptado",
  ).length;

  const stages = [
    { label: "Leads", count: leads || total, color: "#E87B5A" },
    { label: "Presupuestos", count: total, color: "#D4A853" },
    { label: "Enviados", count: sent, color: "#5B8C6D" },
    { label: "Pagados", count: paid, color: "#5B8C6D" },
    { label: "Reservas", count: totalReservations, color: "#E87B5A" },
  ];

  const maxCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="space-y-2.5">
      {stages.map((stage, i) => {
        const pct = Math.max((stage.count / maxCount) * 100, 8);
        const prevCount = i > 0 ? stages[i - 1].count : 0;
        const dropRate =
          prevCount > 0
            ? Math.round(((prevCount - stage.count) / prevCount) * 100)
            : 0;

        return (
          <div key={stage.label}>
            {i > 0 && dropRate > 0 && (
              <div className="mb-1 ml-2 text-[10px] text-slate-500">
                &darr; -{dropRate}%
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-right text-xs font-medium text-slate-900">
                {stage.label}
              </span>
              <div className="flex-1">
                <div
                  className="flex h-7 items-center rounded-lg px-3 text-xs font-semibold text-white transition-all"
                  style={{ width: `${pct}%`, backgroundColor: stage.color }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
