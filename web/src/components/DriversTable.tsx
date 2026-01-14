import { WhyChangedResponse } from "../lib/api";
import { num, pct } from "../lib/format";

export function DriversTable({ data }: { data: WhyChangedResponse }) {
  const drivers = data.drivers as any[];

  const isRate = "rate_delta" in (drivers?.[0] ?? {});
  return (
    <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-4 overflow-auto">
      <div className="text-sm text-neutral-400 mb-3">
        Drivers for {data.metric_key} by {data.dimension}
      </div>

      <table className="min-w-full text-sm">
        <thead className="text-neutral-400">
          <tr className="border-b border-neutral-800">
            <th className="text-left py-2 pr-4">Value</th>
            {isRate ? (
              <>
                <th className="text-right py-2 pr-4">Rate d2</th>
                <th className="text-right py-2 pr-4">Rate d1</th>
                <th className="text-right py-2 pr-4">Δ Rate</th>
                <th className="text-right py-2 pr-4">Total d2</th>
              </>
            ) : (
              <>
                <th className="text-right py-2 pr-4">d2</th>
                <th className="text-right py-2 pr-4">d1</th>
                <th className="text-right py-2 pr-4">Δ</th>
                <th className="text-right py-2 pr-4">% change</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {drivers.map((r, i) => (
            <tr key={i} className="border-b border-neutral-900">
              <td className="py-2 pr-4 text-neutral-100">{r.dim_value}</td>

              {isRate ? (
                <>
                  <td className="py-2 pr-4 text-right">{num(r.rate_d2)}</td>
                  <td className="py-2 pr-4 text-right">{num(r.rate_d1)}</td>
                  <td className="py-2 pr-4 text-right">{num(r.rate_delta)}</td>
                  <td className="py-2 pr-4 text-right">{num(r.total_d2)}</td>
                </>
              ) : (
                <>
                  <td className="py-2 pr-4 text-right">{num(r.value_d2)}</td>
                  <td className="py-2 pr-4 text-right">{num(r.value_d1)}</td>
                  <td className="py-2 pr-4 text-right">{num(r.delta)}</td>
                  <td className="py-2 pr-4 text-right">{pct(r.pct_change)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
