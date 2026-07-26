import { useState } from 'react';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import { useAnalysis } from './hooks/useAnalysis';
import './index.css';

function App() {
  const { analyze, loading, progress, result, error } = useAnalysis();
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAnalyze = async (url: string) => {
    await analyze(url);
    setShowDashboard(true);
  };

  const handleBack = () => {
    setShowDashboard(false);
  };

  return (
    <div id="app-root" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Global Background Elements */}
      <div style={styles.bgGrid} />
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />
      <svg style={styles.bgGithub} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {!showDashboard || !result ? (
          <Landing
            onAnalyze={handleAnalyze}
            loading={loading}
            progress={progress}
            error={error}
          />
        ) : (
          <Dashboard result={result} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '80px 80px',
    zIndex: 0,
    pointerEvents: 'none',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-10%',
    left: '10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)',
    filter: 'blur(80px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-10%',
    right: '5%',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)',
    filter: 'blur(100px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  bgGithub: {
    position: 'absolute',
    top: '5%',
    right: '-15%',
    height: '110vh',
    width: '110vh',
    color: '#ffffff',
    opacity: 0.03, // Extremely subtle transparency
    transform: 'rotate(12deg)',
    zIndex: 0,
    pointerEvents: 'none',
  },
};

export default App;
