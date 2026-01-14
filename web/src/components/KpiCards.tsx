import { KpiSummary } from "../lib/api";
import { money, num } from "../lib/format";

function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-4">
      <div className="text-sm text-neutral-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub ? <div className="text-sm text-neutral-500 mt-1">{sub}</div> : null}
    </div>
  );
}

export function KpiCards({ kpi }: { kpi: KpiSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Gross Sales (d1)" value={money(kpi.gross_sales_d1)} sub={`d2: ${money(kpi.gross_sales_d2)} | Δ ${money(kpi.gross_sales_delta)}`} />
      <Card title="Orders Sold (d1)" value={num(kpi.orders_sold_d1)} sub={`d2: ${num(kpi.orders_sold_d2)} | Δ ${num(kpi.orders_sold_delta)}`} />
      <Card title="AOV (d1)" value={money(kpi.aov_d1)} sub={`d2: ${money(kpi.aov_d2)} | Δ ${money(kpi.aov_delta)}`} />
    </div>
  );
}
