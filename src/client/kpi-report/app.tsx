import React, { useCallback, useState } from 'react';
import { FilterBar } from './components/FilterBar';
import { ResultsView } from './components/ResultsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchReport, ReportResult, ReportParams } from './services/api';

export default function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<ReportResult | null>(null);

    const run = useCallback(async (params: ReportParams) => {
        setLoading(true);
        setError('');
        try {
            setData(await fetchReport(params));
        } catch (e) {
            setData(null);
            setError(e instanceof Error ? e.message : 'Failed to load report data.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh re-pulls the SAME records currently on screen (by table + sys_id)
    // with the live filter params — primarily so a user can toggle the
    // "Limit Work Notes to Assigned to" option and re-apply it without drawing a
    // new random sample.
    const handleRefresh = useCallback(
        (params: ReportParams) => {
            const recordRefs = (data?.rows ?? []).map(r => `${r.table}:${r.sysId}`);
            return run({ ...params, recordRefs });
        },
        [data, run]
    );

    return (
        <ErrorBoundary>
            <main className="rr-app">
                <header className="rr-header">
                    <h1 className="rr-title">KPI Review Report</h1>
                    <p className="rr-subtitle">
                        A random sample of up to five Incident and Catalog Task records per selected user,
                        with assignment, on-hold, work note, and resolution KPIs.
                    </p>
                </header>
                <FilterBar loading={loading} hasData={!!data} onGenerate={run} onRefresh={handleRefresh} />
                <ResultsView loading={loading} error={error} data={data} />
            </main>
        </ErrorBoundary>
    );
}
