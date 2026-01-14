type Props = {
  title: string;
  subtitle?: string;
  data: unknown;
  emptyText?: string;
};

export default function JsonPanel({ title, subtitle, data, emptyText }: Props) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <span className="text-xs text-zinc-400">{subtitle}</span>}
      </div>

      <pre className="mt-3 text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-auto max-h-[420px]">
        {data ? JSON.stringify(data, null, 2) : emptyText ?? "No data yet."}
      </pre>
    </div>
  );
}
