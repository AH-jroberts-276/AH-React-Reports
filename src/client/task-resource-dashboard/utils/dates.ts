// Date conversion helpers. Queries use ISO (yyyy-MM-dd); the DateTime control
// is configured with the MM-dd-yyyy display format.

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_RE = /^(\d{2})-(\d{2})-(\d{4})$/;

// Read the value emitted by now-date-time's onValueSet (MM-dd-yyyy string).
export function readDateValue(e: { detail?: { payload?: { value?: string } } }): string {
    return e?.detail?.payload?.value || '';
}

// MM-dd-yyyy (display) -> yyyy-MM-dd (query). Accepts ISO passthrough.
export function toIsoDate(displayValue: string): string {
    if (!displayValue) return '';
    const trimmed = displayValue.trim();
    const m = DISPLAY_RE.exec(trimmed);
    if (m) return `${m[3]}-${m[1]}-${m[2]}`;
    if (ISO_RE.test(trimmed)) return trimmed;
    return '';
}

// yyyy-MM-dd (query) -> MM-dd-yyyy (display).
export function toDisplayDate(iso: string): string {
    if (!iso) return '';
    const m = ISO_RE.exec(iso.trim());
    if (m) return `${m[2]}-${m[3]}-${m[1]}`;
    return iso;
}
