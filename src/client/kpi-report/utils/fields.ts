// Field helpers for ServiceNow display/value field shapes.
export const display = (field: any): string => field?.display_value ?? field?.displayValue ?? '';
export const value = (field: any): string => field?.value ?? '';
