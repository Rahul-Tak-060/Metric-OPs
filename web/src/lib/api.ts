const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://127.0.0.1:8000";

async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, "")}${path}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }

  return res.json();
}

export type Metric = {
  metric_key: string;
  metric_name: string;
  metric_type: "ADDITIVE" | "RATE";
  description: string;
};

export type MetricsResponse = { metrics: Metric[] };

export type KpiSummary = {
  d1: string;
  d2: string;

  aov_d1: number;
  aov_d2: number;
  aov_delta: number;

  gross_sales_d1: number;
  gross_sales_d2: number;
  gross_sales_delta: number;

  orders_sold_d1: number;
  orders_sold_d2: number;
  orders_sold_delta: number;

  units_sold_d1: number;
  units_sold_d2: number;
  units_sold_delta: number;

  cancellation_rate_d1: number;
  cancellation_rate_d2: number;
  cancellation_rate_delta: number;
};


export type WhyChangedAdditiveDriver = {
  dimension: string;
  dim_value: string;
  value_d1: number;
  value_d2: number;
  delta: number;
  pct_change: number;
};

export type WhyChangedRateDriver = {
  dimension: string;
  dim_value: string;
  cancelled_d2: number;
  total_d2: number;
  rate_d2: number;
  cancelled_d1: number;
  total_d1: number;
  rate_d1: number;
  rate_delta: number;
};

export type WhyChangedResponse =
  | {
      metric_key: string;
      dimension: string;
      summary: KpiSummary;
      drivers: WhyChangedAdditiveDriver[];
    }
  | {
      metric_key: string;
      dimension: string;
      summary: KpiSummary;
      drivers: WhyChangedRateDriver[];
    };

export type DqLatest = {
  run_id: number;
  run_ts: string;
  source: string;
  status: "PASSED" | "FAILED";
  checks_total: number;
  checks_passed: number;
  checks_failed: number;
};

export type DqFailure = {
  severity: string;
  check_name: string;
  passed: boolean;
  metric_value: number | null;
  threshold_value: number | null;
  details: string;
};

export type DqFailuresResponse = { failures: DqFailure[] };

export const api = {
  metrics: () => apiGet<MetricsResponse>("/metrics"),

  kpiSummary: (d1?: string, d2?: string) => {
    const qs = new URLSearchParams();
    if (d1) qs.set("d1", d1);
    if (d2) qs.set("d2", d2);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiGet<KpiSummary>(`/kpi-summary${suffix}`);
  },

  whyChanged: (metric_key: string, dimension: string, top_n = 10, d1?: string, d2?: string) => {
    const qs = new URLSearchParams({ metric_key, dimension, top_n: String(top_n) });
    if (d1) qs.set("d1", d1);
    if (d2) qs.set("d2", d2);
    return apiGet<WhyChangedResponse>(`/why-changed?${qs.toString()}`);
  },

  dqLatest: () => apiGet<DqLatest>("/dq/latest"),

  dqFailures: () => apiGet<DqFailuresResponse>("/dq/latest/failures"),
};
