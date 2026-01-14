import { useEffect, useMemo, useState } from "react";
import {
  api,
  type Metric,
  type KpiSummary,
  type WhyChangedResponse,
  type DqLatest,
  type DqFailuresResponse,
} from "./lib/api";

import KpiSummaryCards from "./components/KpiSummaryCards";
import { DriversTable } from "./components/DriversTable";
import JsonPanel from "./components/JsonPanel";

const DIMENSIONS = [
  { key: "ship_state", label: "Ship State" },
  { key: "category", label: "Category" },
  { key: "fulfilment", label: "Fulfilment" },
  { key: "ship_service_level", label: "Ship Service Level" },
] as const;

type DimensionKey = (typeof DIMENSIONS)[number]["key"];

function fmtUpdatedAt(d: Date | null) {
  return d ? d.toLocaleString() : "Not run yet";
}

export default function App() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricKey, setMetricKey] = useState("orders_sold");
  const [dimension, setDimension] = useState<DimensionKey>("ship_state");

  const [d1, setD1] = useState<string>("");
  const [d2, setD2] = useState<string>("");
  const [topN, setTopN] = useState<number>(10);

  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [why, setWhy] = useState<WhyChangedResponse | null>(null);
  const [dq, setDq] = useState<DqLatest | null>(null);
  const [dqFailures, setDqFailures] = useState<DqFailuresResponse | null>(null);

  const [loading, setLoading] = useState({ kpi: false, why: false, dq: false });
  const [error, setError] = useState<string | null>(null);

  const [kpiUpdatedAt, setKpiUpdatedAt] = useState<Date | null>(null);
  const [whyUpdatedAt, setWhyUpdatedAt] = useState<Date | null>(null);
  const [dqUpdatedAt, setDqUpdatedAt] = useState<Date | null>(null);

  const [showDebug, setShowDebug] = useState(false);

  const selectedMetric = useMemo(
    () => metrics.find((m) => m.metric_key === metricKey),
    [metrics, metricKey]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await api.metrics();
        setMetrics(data.metrics);

        if (data.metrics.some((m) => m.metric_key === "orders_sold")) {
          setMetricKey("orders_sold");
        } else if (data.metrics[0]) {
          setMetricKey(data.metrics[0].metric_key);
        }
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, []);

  async function runKpi() {
    setError(null);
    setLoading((s) => ({ ...s, kpi: true }));
    try {
      const res = await api.kpiSummary(d1 || undefined, d2 || undefined);
      setKpi(res);
      setKpiUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading((s) => ({ ...s, kpi: false }));
    }
  }

  async function runWhy() {
    setError(null);
    setLoading((s) => ({ ...s, why: true }));
    try {
      const res = await api.whyChanged(metricKey, dimension, topN, d1 || undefined, d2 || undefined);
      setWhy(res);
      setWhyUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading((s) => ({ ...s, why: false }));
    }
  }

  async function runDq() {
    setError(null);
    setLoading((s) => ({ ...s, dq: true }));
    try {
      const [a, b] = await Promise.all([api.dqLatest(), api.dqFailures()]);
      setDq(a);
      setDqFailures(b);
      setDqUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading((s) => ({ ...s, dq: false }));
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">MetricOps</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Certified metrics, data quality checks, and “why changed” drivers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runKpi}
              disabled={loading.kpi}
              className={`px-3 py-2 rounded-lg text-sm ${
                loading.kpi ? "bg-zinc-800 opacity-60 cursor-not-allowed" : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              {loading.kpi ? "Loading…" : "Run KPI Summary"}
            </button>

            <button
              onClick={runWhy}
              disabled={loading.why}
              className={`px-3 py-2 rounded-lg text-sm ${
                loading.why ? "bg-indigo-600 opacity-60 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {loading.why ? "Loading…" : "Run Why Changed"}
            </button>

            <button
              onClick={runDq}
              disabled={loading.dq}
              className={`px-3 py-2 rounded-lg text-sm ${
                loading.dq ? "bg-zinc-800 opacity-60 cursor-not-allowed" : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              {loading.dq ? "Loading…" : "Load Data Quality"}
            </button>

            <label className="ml-2 flex items-center gap-2 text-xs text-zinc-400 select-none">
              <input
                type="checkbox"
                checked={showDebug}
                onChange={(e) => setShowDebug(e.target.checked)}
              />
              Debug JSON
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-950/50 border border-red-900 text-red-200">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400">Metric</div>
            <select
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              {metrics.map((m) => (
                <option key={m.metric_key} value={m.metric_key}>
                  {m.metric_name} ({m.metric_key})
                </option>
              ))}
            </select>

            <div className="text-xs text-zinc-400 mt-3">Description</div>
            <div className="text-sm mt-1 text-zinc-200">{selectedMetric?.description ?? "—"}</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400">Dimension</div>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as DimensionKey)}
              className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
            >
              {DIMENSIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <div className="text-xs text-zinc-400">d1 (optional)</div>
                <input
                  value={d1}
                  onChange={(e) => setD1(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs text-zinc-400">d2 (optional)</div>
                <input
                  value={d2}
                  onChange={(e) => setD2(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              Tip: leave d1/d2 blank to auto-pick latest two dates.
            </div>

            <div className="mt-4">
              <div className="text-xs text-zinc-400">Top N drivers</div>
              <input
                type="number"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
                min={1}
                max={200}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400">What to do next</div>
            <ul className="mt-2 text-sm text-zinc-200 space-y-2">
              <li>1) Run KPI Summary to confirm dates + totals.</li>
              <li>2) Run Why Changed to see the top drivers.</li>
              <li>3) Load Data Quality to check pipeline health.</li>
            </ul>
            <div className="mt-4 text-xs text-zinc-500">
              Tip: leave d1/d2 blank to auto-pick latest two dates.
            </div>
          </div>
        </div>

        {/* KPI + Why */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">KPI Summary</h2>
                <div className="text-xs text-zinc-500">Updated: {fmtUpdatedAt(kpiUpdatedAt)}</div>
              </div>
              <span className="text-xs text-zinc-400">/kpi-summary</span>
            </div>

            <div className="mt-3">
              {loading.kpi ? (
                <div className="text-xs text-zinc-400">Loading KPI Summary…</div>
              ) : !kpi ? (
                <div className="text-xs text-zinc-400">Run KPI Summary to populate.</div>
              ) : (
                <KpiSummaryCards kpi={kpi} />
              )}
            </div>

            {showDebug && (
              <div className="mt-4">
                <JsonPanel title="Raw KPI JSON" data={kpi} emptyText="No KPI payload yet." />
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Why Changed</h2>
                <div className="text-xs text-zinc-500">Updated: {fmtUpdatedAt(whyUpdatedAt)}</div>
              </div>
              <span className="text-xs text-zinc-400">/why-changed</span>
            </div>

            <div className="mt-3">
              {loading.why ? (
                <div className="text-xs text-zinc-400">Loading Why Changed…</div>
              ) : (
                <DriversTable data={why} topN={topN} />
              )}
            </div>

            {showDebug && (
              <div className="mt-4">
                <JsonPanel title="Why Changed JSON" data={why} emptyText="No why payload yet." />
              </div>
            )}
          </div>
        </div>

        {/* DQ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Data Quality Latest</h2>
                <div className="text-xs text-zinc-500">Updated: {fmtUpdatedAt(dqUpdatedAt)}</div>
              </div>
              <span className="text-xs text-zinc-400">/dq/latest</span>
            </div>

            <div className="mt-3">
              {loading.dq ? (
                <div className="text-xs text-zinc-400">Loading Data Quality…</div>
              ) : !dq ? (
                <div className="text-xs text-zinc-400">Load Data Quality to populate.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Status</div>
                    <div className="mt-1 font-semibold">{dq.status}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Source</div>
                    <div className="mt-1 font-semibold">{dq.source}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Checks passed</div>
                    <div className="mt-1 font-semibold">
                      {dq.checks_passed}/{dq.checks_total}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Checks failed</div>
                    <div className="mt-1 font-semibold">{dq.checks_failed}</div>
                  </div>
                </div>
              )}
            </div>

            {showDebug && (
              <div className="mt-4">
                <JsonPanel title="DQ Latest JSON" data={dq} emptyText="No DQ payload yet." />
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">DQ Failures</h2>
                <div className="text-xs text-zinc-500">Updated: {fmtUpdatedAt(dqUpdatedAt)}</div>
              </div>
              <span className="text-xs text-zinc-400">/dq/latest/failures</span>
            </div>

            <div className="mt-3">
              {loading.dq ? (
                <div className="text-xs text-zinc-400">Loading Data Quality…</div>
              ) : !dqFailures ? (
                <div className="text-xs text-zinc-400">Load Data Quality to populate.</div>
              ) : dqFailures.failures.length === 0 ? (
                <div className="text-xs text-zinc-400">No failures 🎉</div>
              ) : (
                <div className="space-y-2">
                  {dqFailures.failures.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{f.check_name}</div>
                        <div className="text-xs text-zinc-400">{f.severity}</div>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">{f.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showDebug && (
              <div className="mt-4">
                <JsonPanel
                  title="DQ Failures JSON"
                  data={dqFailures}
                  emptyText="No failures payload yet."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
