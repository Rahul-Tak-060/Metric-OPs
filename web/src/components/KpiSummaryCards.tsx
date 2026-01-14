import type { KpiSummary } from "../lib/api";

const fmtInt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtINR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function safeNum(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function Delta({
  value,
  format,
  suffix,
}: {
  value: number | null | undefined;
  format: (n: number) => string;
  suffix?: string;
}) {
  if (!safeNum(value)) return <span className="text-zinc-400">—</span>;

  const cls = value > 0 ? "text-emerald-300" : value < 0 ? "text-red-300" : "text-zinc-300";
  const sign = value > 0 ? "+" : "";
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "→";

  return (
    <span className={cls}>
      <span className="mr-1">{arrow}</span>
      {sign}
      {format(value)}
      {suffix ?? ""}
    </span>
  );
}

export default function KpiSummaryCards({ kpi }: { kpi: KpiSummary | null }) {
  if (!kpi) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">Dates</div>
        <div className="text-sm mt-1">
          {kpi.d1} → {kpi.d2}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">Orders Sold</div>
        <div className="text-sm mt-1">
          {fmtInt.format(kpi.orders_sold_d1)} → {fmtInt.format(kpi.orders_sold_d2)}
        </div>
        <div className="text-xs mt-2">
          Delta: <Delta value={kpi.orders_sold_delta} format={(n) => fmtInt.format(n)} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">Gross Sales</div>
        <div className="text-sm mt-1">
          {fmtINR0.format(kpi.gross_sales_d1)} → {fmtINR0.format(kpi.gross_sales_d2)}
        </div>
        <div className="text-xs mt-2">
          Delta: <Delta value={kpi.gross_sales_delta} format={(n) => fmtINR0.format(n)} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">AOV</div>
        <div className="text-sm mt-1">
          {fmt2.format(kpi.aov_d1)} → {fmt2.format(kpi.aov_d2)}
        </div>
        <div className="text-xs mt-2">
          Delta: <Delta value={kpi.aov_delta} format={(n) => fmt2.format(n)} />
        </div>
      </div>
    </div>
  );
}
