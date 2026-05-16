import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: string | null };

export class GameErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(err: Error): State {
    return { error: err.message };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[CountryChess]', err, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#e8e4dc',
            textAlign: 'center',
            background: '#0a0c10',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 0.75rem' }}>Failed to load the battlefield</h2>
            <p style={{ opacity: 0.85, maxWidth: 420, margin: '0 auto 1rem' }}>
              {this.state.error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: '1px solid #c9a227',
                background: '#3d321c',
                color: '#f2efe8',
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
