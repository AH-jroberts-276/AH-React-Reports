import React, { useCallback, useState } from 'react';
import { FilterBar } from './components/FilterBar';
import { ResultsView } from './components/ResultsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchReport, ReportResult, ReportParams } from './services/api';

export default function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<ReportResult | null>(null);
    const [granularity, setGranularity] = useState<'weekly' | 'monthly'>('weekly');

    const handleGenerate = useCallback(async (params: ReportParams) => {
        setLoading(true);
        setError('');
        setGranularity(params.granularity);
        try {
            setData(await fetchReport(params));
        } catch (e) {
            setData(null);
            setError(e instanceof Error ? e.message : 'Failed to load report data.');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <ErrorBoundary>
            <main className="rr-app">
                <header className="rr-header">
                    <h1 className="rr-title">Resource Time Report</h1>
                    <p className="rr-subtitle">
                        Compare planned capacity, availability, and allocation against actual hours logged.
                    </p>
                </header>
                <FilterBar loading={loading} onGenerate={handleGenerate} />
                <ResultsView loading={loading} error={error} data={data} granularity={granularity} />
            </main>
        </ErrorBoundary>
    );
}
