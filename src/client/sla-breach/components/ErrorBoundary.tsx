import React, { Component, ReactNode } from 'react'
import { Alert } from '@servicenow/react-components/Alert'

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    error: string | null
}

/**
 * Error boundary that catches render errors in the dashboard and shows a
 * readable message instead of blanking the whole page.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null }

    static getDerivedStateFromError(err: unknown): ErrorBoundaryState {
        const message = err && (err as Error).message ? (err as Error).message : String(err)
        return { error: message }
    }

    componentDidCatch(err: unknown, info: unknown) {
        // Surface details to the console so runtime diagnostics can capture them.
        console.error('[SLA dashboard] render error:', err, info)
    }

    render(): ReactNode {
        if (this.state.error) {
            return <Alert status="critical" header="The dashboard hit an error" content={this.state.error} />
        }
        return (this as unknown as { props: ErrorBoundaryProps }).props.children
    }
}
