import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 600, margin: '4rem auto' }}>
          <h1 style={{ color: '#c00' }}>Erreur FresCoop</h1>
          <p>Une erreur est survenue. Essayez de vider le cache :</p>
          <button
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer', background: '#059669', color: '#fff', border: 'none', borderRadius: 8 }}
          >
            Vider le cache et recharger
          </button>
          <pre style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
