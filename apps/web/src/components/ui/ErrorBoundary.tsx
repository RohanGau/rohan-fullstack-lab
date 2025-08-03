"use client";

import { Alert, AlertTitle, AlertDescription } from "./alert";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, message: "" };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>Something went wrong</AlertTitle>
                    <AlertDescription>{this.state.message}</AlertDescription>
                </Alert>
            );
        }

        return this.props.children;
    }
}