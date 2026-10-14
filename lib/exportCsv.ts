/**
 * Utility to export table data to a CSV file and trigger instant browser download.
 * Compatible with Excel, Google Sheets, and Numbers.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) {
  const escapeCell = (cell: string | number | undefined | null) => {
    const str = String(cell ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ];

  const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
