// Display formatting helpers for the KPI Report results table.

// Join a row's work notes into a single human-readable string for CSV export.
import { WorkNote } from '../services/api';

export const formatWorkNotesText = (notes: WorkNote[]): string =>
    (notes || [])
        .map(n => `[${n.createdOn}] ${n.author}: ${n.value}`)
        .join('\n');
