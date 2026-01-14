export function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function num(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

export function pct(n: number) {
  return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 2 }).format(n);
}
