import type { KpiSummary } from "../lib/api";

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function fmtNum(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function Delta({ value }: { value: number }) {
  const ok = value >= 0;
  return (
    <span className={ok ? "text-emerald-300" : "text-red-300"}>
      {ok ? "+" : ""}
      {fmtNum(value)}
    </span>
  );
}

export default function KpiSummaryCards({ kpi }: { kpi: KpiSummary | null }) {
  if (!kpi) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">Dates</div>
        <div className="text-sm mt-1">{kpi.d1} → {kpi.d2}</div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">Orders Sold</div>
        <div className="text-sm mt-1">
          {fmtNum(kpi.orders_sold_d1)} → {fmtNum(kpi.orders_sold_d2)}
        </div>
        <div className="text-xs mt-2">
          Delta: <Delta value={kpi.orders_sold_delta} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">Gross Sales</div>
        <div className="text-sm mt-1">
          {fmtMoney(kpi.gross_sales_d1)} → {fmtMoney(kpi.gross_sales_d2)}
        </div>
        <div className="text-xs mt-2">
          Delta:{" "}
          <span className={kpi.gross_sales_delta >= 0 ? "text-emerald-300" : "text-red-300"}>
            {kpi.gross_sales_delta >= 0 ? "+" : ""}
            {fmtMoney(kpi.gross_sales_delta)}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="text-xs text-zinc-400">AOV</div>
        <div className="text-sm mt-1">
          {kpi.aov_d1.toFixed(2)} → {kpi.aov_d2.toFixed(2)}
        </div>
        <div className="text-xs mt-2">
          Delta:{" "}
          <span className={kpi.aov_delta >= 0 ? "text-emerald-300" : "text-red-300"}>
            {kpi.aov_delta >= 0 ? "+" : ""}
            {kpi.aov_delta.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
