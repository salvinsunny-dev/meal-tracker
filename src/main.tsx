import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding: 32, fontFamily: 'monospace', background: '#1a1a2e', color: '#ff6b6b', minHeight: '100vh'}}>
          <h2>App crashed — check browser console (F12)</h2>
          <pre style={{whiteSpace: 'pre-wrap', color: '#ffa07a'}}>{this.state.error.message}</pre>
          <pre style={{whiteSpace: 'pre-wrap', color: '#888', fontSize: 12}}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
