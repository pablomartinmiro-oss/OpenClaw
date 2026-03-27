export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (!data.length) return;
  const cols = columns ?? Object.keys(data[0]).map(k => ({ key: k, label: k }));
  const header = cols.map(c => `"${c.label}"`).join(",");
  const rows = data.map(row =>
    cols.map(c => {
      const val = row[c.key];
      if (val == null) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
