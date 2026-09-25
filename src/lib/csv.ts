// Helper CSV untuk export data penelitian Prof. Wawan.
// - Escape standar RFC 4180 (kutip ganda, koma, newline aman).
// - Prefix BOM (\uFEFF) supaya Excel Indonesia tidak merusak huruf.

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/["\n\r,]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}

/** Rakit file CSV lengkap (header + baris) siap diunduh. */
export function csvFile(header: string[], rows: unknown[][]): string {
  return "\uFEFF" + [csvRow(header), ...rows.map(csvRow)].join("\r\n") + "\r\n";
}
