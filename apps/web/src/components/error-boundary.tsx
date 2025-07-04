'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Conversations</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="text-red-600">⚠️</div>
                <div className="text-red-800">
                  <h3 className="font-semibold">Failed to load conversations</h3>
                  <p className="text-sm mt-1">
                    Unable to connect to the Convex backend. Please try refreshing the page.
                  </p>
                  {this.state.error && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Error details</summary>
                      <pre className="text-xs mt-1 bg-red-100 p-2 rounded overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
