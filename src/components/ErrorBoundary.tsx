import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 font-mono text-destructive bg-background min-h-screen">
          <h1 className="text-2xl font-bold mb-4">💥 React Crash</h1>
          <pre className="whitespace-pre-wrap break-words mb-2">
            {this.state.error.message}
          </pre>
          <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
