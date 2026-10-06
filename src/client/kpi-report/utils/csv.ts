// CSV helpers for the results export. Pure string utilities.
// Duplicated per-report by design — each report stays self-contained.

// Quote a field only when it contains a comma, quote, or newline (RFC 4180).
export function csvField(val: string): string {
    if (/[",\n\r]/.test(val)) {
        return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
}

export function buildCsv(headers: string[], rows: string[][]): string {
    const lines = [headers.map(csvField).join(',')];
    for (const row of rows) {
        lines.push(row.map(csvField).join(','));
    }
    return lines.join('\r\n');
}
