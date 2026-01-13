const API_BASE = "/api";

export type Metric = {
  metric_key: string;
  metric_name: string;
  metric_type: string;
  description?: string | null;
};

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
};

export async function getHealth() {
  const r = await fetch(`${API_BASE}/health`);
  if (!r.ok) throw new Error(`health failed: ${r.status}`);
  return r.json();
}

export async function getMetrics(): Promise<{ metrics: Metric[] }> {
  const r = await fetch(`${API_BASE}/metrics`);
  if (!r.ok) throw new Error(`metrics failed: ${r.status}`);
  return r.json();
}

export async function getKpiSummary(params?: { d1?: string; d2?: string }): Promise<KpiSummary> {
  const qs = new URLSearchParams();
  if (params?.d1) qs.set("d1", params.d1);
  if (params?.d2) qs.set("d2", params.d2);

  const url = qs.toString() ? `${API_BASE}/kpi-summary?${qs}` : `${API_BASE}/kpi-summary`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`kpi-summary failed: ${r.status}`);
  return r.json();
}

export async function getWhyChanged(params: {
  metric_key: string;
  dimension: string;
  d1?: string;
  d2?: string;
  top_n?: number;
}) {
  const qs = new URLSearchParams();
  qs.set("metric_key", params.metric_key);
  qs.set("dimension", params.dimension);
  if (params.d1) qs.set("d1", params.d1);
  if (params.d2) qs.set("d2", params.d2);
  if (params.top_n) qs.set("top_n", String(params.top_n));

  const r = await fetch(`${API_BASE}/why-changed?${qs.toString()}`);
  if (!r.ok) throw new Error(`why-changed failed: ${r.status}`);
  return r.json();
}

export async function getDqLatest() {
  const r = await fetch(`${API_BASE}/dq/latest`);
  if (!r.ok) throw new Error(`dq/latest failed: ${r.status}`);
  return r.json();
}

export async function getDqLatestFailures() {
  const r = await fetch(`${API_BASE}/dq/latest/failures`);
  if (!r.ok) throw new Error(`dq/latest/failures failed: ${r.status}`);
  return r.json();
}
