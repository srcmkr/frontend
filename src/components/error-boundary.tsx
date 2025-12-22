"use client";

import { Component, type ReactNode } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorState } from "./error-state";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Class-based error boundary for catching render errors
 */
class ErrorBoundaryInner extends Component<
  ErrorBoundaryProps & { onReset: () => void },
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps & { onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          title="Ein Fehler ist aufgetreten"
          message={this.state.error?.message ?? "Unbekannter Fehler"}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Query-aware error boundary that integrates with TanStack Query
 *
 * Usage:
 * ```tsx
 * <QueryErrorBoundary>
 *   <ComponentThatUsesQueries />
 * </QueryErrorBoundary>
 * ```
 */
export function QueryErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundaryInner onReset={reset} fallback={fallback}>
      {children}
    </ErrorBoundaryInner>
  );
}

/**
 * Simple error boundary without query integration
 */
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryInner onReset={() => {}} fallback={fallback}>
      {children}
    </ErrorBoundaryInner>
  );
}
