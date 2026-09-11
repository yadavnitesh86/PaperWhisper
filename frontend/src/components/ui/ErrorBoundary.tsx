import { Component, type ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper-100 p-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-ink-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              An unexpected error occurred. You can try again.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
