// Display formatting helpers for the Resource Time Report results table.
// Values are rendered with one decimal place to match the original report.

export const formatHours = (n: number): string => n.toFixed(1);

export const formatUtilization = (n: number): string => `${n.toFixed(1)}%`;
