import { useMemo, useState } from "react";
import type { WhyChangedResponse } from "../lib/api";

type AnyDriver = Record<string, any>;

function isRatePayload(data: WhyChangedResponse): boolean {
  const first = (data as any)?.drivers?.[0];
  return !!first && ("rate_d1" in first || "rate_delta" in first);
}

function fmtInt(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function fmtPct(x: number, digits = 2) {
  if (x === null || x === undefined || !isFinite(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}

function fmtPp(x: number, digits = 2) {
  if (x === null || x === undefined || !isFinite(x)) return "—";
  const sign = x > 0 ? "+" : "";
  return `${sign}${(x * 100).toFixed(digits)} pp`;
}

function deltaClass(x: number) {
  if (x > 0) return "text-green-400";
  if (x < 0) return "text-red-400";
  return "text-zinc-300";
}

export function DriversTable({ data, topN }: { data: WhyChangedResponse | null; topN?: number }) {
  const [showDebug, setShowDebug] = useState(false);

  const drivers = useMemo(() => {
    if (!data?.drivers) return [];
    const copy = [...(data.drivers as AnyDriver[])];

    // Sort by absolute impact
    if (isRatePayload(data)) {
      copy.sort((a, b) => Math.abs(b.rate_delta ?? 0) - Math.abs(a.rate_delta ?? 0));
    } else {
      copy.sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0));
    }

    return topN ? copy.slice(0, topN) : copy;
  }, [data, topN]);

  if (!data) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="text-sm text-zinc-400">Run Why Changed to populate.</div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="text-sm text-zinc-400">No drivers found.</div>
      </div>
    );
  }

  const isRate = isRatePayload(data);

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-zinc-100">Why Changed</div>
          <div className="text-xs text-zinc-400">
            {data.metric_key} by {data.dimension}
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={showDebug}
            onChange={(e) => setShowDebug(e.target.checked)}
          />
          Debug JSON
        </label>
      </div>

      <table className="min-w-full text-sm">
        <thead className="text-zinc-400 border-b border-zinc-800">
          {isRate ? (
            <tr>
              <th className="text-left py-2 pr-4">Dim value</th>
              <th className="text-right py-2 pr-4">Rate d1</th>
              <th className="text-right py-2 pr-4">Rate d2</th>
              <th className="text-right py-2 pr-4">Δ rate</th>
              <th className="text-right py-2 pr-4">Cancelled/Total d1</th>
              <th className="text-right py-2">Cancelled/Total d2</th>
            </tr>
          ) : (
            <tr>
              <th className="text-left py-2 pr-4">Dim value</th>
              <th className="text-right py-2 pr-4">d1</th>
              <th className="text-right py-2 pr-4">d2</th>
              <th className="text-right py-2 pr-4">Delta</th>
              <th className="text-right py-2">% change</th>
            </tr>
          )}
        </thead>

        <tbody>
          {drivers.map((d, i) => (
            <tr key={i} className="border-b border-zinc-800/60">
              <td className="py-2 pr-4 text-zinc-100">{d.dim_value ?? "—"}</td>

              {isRate ? (
                <>
                  <td className="py-2 pr-4 text-right">{fmtPct(d.rate_d1, 2)}</td>
                  <td className="py-2 pr-4 text-right">{fmtPct(d.rate_d2, 2)}</td>
                  <td className={`py-2 pr-4 text-right font-medium ${deltaClass(d.rate_delta ?? 0)}`}>
                    {fmtPp(d.rate_delta, 2)}
                  </td>
                  <td className="py-2 pr-4 text-right text-zinc-300">
                    {fmtInt(d.cancelled_d1 ?? 0)} / {fmtInt(d.total_d1 ?? 0)}
                  </td>
                  <td className="py-2 text-right text-zinc-300">
                    {fmtInt(d.cancelled_d2 ?? 0)} / {fmtInt(d.total_d2 ?? 0)}
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 pr-4 text-right text-zinc-300">{fmtInt(d.value_d1 ?? 0)}</td>
                  <td className="py-2 pr-4 text-right text-zinc-300">{fmtInt(d.value_d2 ?? 0)}</td>
                  <td className={`py-2 pr-4 text-right font-medium ${deltaClass(d.delta ?? 0)}`}>
                    {fmtInt(d.delta ?? 0)}
                  </td>
                  <td className={`py-2 text-right font-medium ${deltaClass(d.pct_change ?? 0)}`}>
                    {fmtPct(d.pct_change, 1)}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showDebug && (
        <pre className="mt-4 text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto text-zinc-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
