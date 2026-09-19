import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error in React component tree:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4 text-on-surface">
          <div className="max-w-md w-full rounded-2xl bg-surface-container border border-error/20 p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
            <div>
              <h2 className="text-xl font-bold font-headline tracking-tight text-on-surface">
                Something went wrong
              </h2>
              <p className="text-sm text-outline mt-1 font-body">
                An unexpected interface error occurred. Please refresh or reset to continue.
              </p>
            </div>
            {this.state.error?.message && (
              <pre className="w-full text-left bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-error/90 overflow-x-auto font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 w-full">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-container hover:opacity-90 font-medium text-sm transition-opacity"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
