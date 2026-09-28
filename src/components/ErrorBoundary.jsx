import React from 'react';

/**
 * Catches render errors so a bug in one view shows a recoverable message
 * instead of a blank page. Sessions live in localStorage, so reloading is safe.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isApp = this.props.scope === 'app';
    return (
      <div className={`flex items-center justify-center p-8 ${isApp ? 'min-h-screen bg-canvas' : 'flex-1'}`}>
        <div role="alert" className="panel max-w-md w-full p-6 text-center">
          <h2 className="text-base font-semibold text-fg">Something went wrong</h2>
          <p className="mt-1.5 text-sm text-fg-2">
            {isApp
              ? 'The app hit an unexpected error. Your saved sessions are safe in this browser.'
              : 'This view hit an unexpected error. Your sessions and notes are safe.'}
          </p>
          <pre className="mt-4 p-3 rounded-lg bg-muted text-left text-xs text-fg-2 font-mono whitespace-pre-wrap break-words max-h-32 overflow-auto">
            {String(error?.message || error)}
          </pre>
          <div className="mt-5 flex justify-center gap-2">
            {!isApp && (
              <button type="button" className="btn btn-secondary" onClick={() => this.setState({ error: null })}>
                Try again
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
