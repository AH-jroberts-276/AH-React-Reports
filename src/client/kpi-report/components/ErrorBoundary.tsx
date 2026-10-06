import React from 'react';
import { Alert } from '@servicenow/react-components/Alert';

interface ErrorBoundaryState {
    hasError: boolean;
    message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, message: error.message || 'An unexpected error occurred.' };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Alert
                    status="critical"
                    header="Something went wrong"
                    content={this.state.message}
                />
            );
        }
        return this.props.children;
    }
}
