import { useState, useRef, useEffect } from 'react';
import type { AnalysisProgress } from '../engine/types';
import { setToken } from '../api/github';

interface LandingProps {
    onAnalyze: (url: string) => void;
    loading: boolean;
    progress: AnalysisProgress;
    error: string | null;
}

export default function Landing({ onAnalyze, loading, progress, error }: LandingProps) {
    const [url, setUrl] = useState('');
    const [token, setTokenInput] = useState(() => sessionStorage.getItem('repodna_gh_token') || '');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.trim();
        setTokenInput(val);
        if (val) {
            setToken(val);
        } else {
            sessionStorage.removeItem('repodna_gh_token');
        }
    };

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim() && !loading) onAnalyze(url.trim());
    };

    return (
        <div style={styles.container}>
            <main style={styles.main}>
                {/* Logo */}
                <div style={styles.logoWrap}>
                    <div style={styles.logoIcon}>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <path d="M12 8c0 12 16 12 16 24M28 8c0 12-16 12-16 24" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                            <line x1="15" y1="13" x2="25" y2="13" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                            <line x1="15" y1="27" x2="25" y2="27" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                            <line x1="18" y1="20" x2="22" y2="20" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                        </svg>
                    </div>
                    <h1 style={styles.title}>
                        <span style={{ color: '#ffffff' }}>Repo</span>
                        <span style={styles.titleDna}>DNA</span>
                    </h1>
                </div>

                <p style={styles.subtitle}>
                    Decode the DNA of any GitHub repository. Architecture, complexity, ownership, debt — all visualized beautifully. Pure algorithms.
                </p>

                {/* Input form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputWrap}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={styles.inputIcon}>
                            <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#506080" />
                            <path d="M7 6.5c0-.83 1.34-1.5 3-1.5s3 .67 3 1.5V8c0 .83-1.34 1.5-3 1.5S7 8.83 7 8V6.5z" fill="#506080" />
                            <path d="M10 11c-2.5 0-4 1-4 2v1.5c0 .28.22.5.5.5h7c.28 0 .5-.22.5-.5V13c0-1-1.5-2-4-2z" fill="#506080" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="github.com/owner/repo"
                            style={styles.input}
                            disabled={loading}
                            id="repo-input"
                        />
                        <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading || !url.trim()} id="analyze-btn">
                            {loading ? (
                                <span style={styles.spinnerWrap}>
                                    <span style={styles.spinner} />
                                    Analyzing...
                                </span>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Analyze
                                </>
                            )}
                        </button>
                    </div>
                    {/* Token input for rate limits */}
                    <div style={styles.tokenWrap}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path d="M12.5 5h-1V4c0-1.93-1.57-3.5-3.5-3.5S4.5 2.07 4.5 4v1h-1C2.67 5 2 5.67 2 6.5v7C2 14.33 2.67 15 3.5 15h9c.83 0 1.5-.67 1.5-1.5v-7C14 5.67 13.33 5 12.5 5zm-7-1c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v1h-5V4zm5.5 8h-6v-5h6v5z" fill="#506080" />
                            <circle cx="8" cy="9.5" r="1" fill="#506080" />
                        </svg>
                        <span style={styles.tokenLabel}>API limit exceeded? Add an optional GitHub Token to bypass:</span>
                        <input
                            type="password"
                            value={token}
                            onChange={handleTokenChange}
                            placeholder="ghp_..."
                            spellCheck={false}
                            style={styles.tokenInput}
                            disabled={loading}
                        />
                    </div>
                </form>

                {/* Progress bar */}
                {loading && (
                    <div style={styles.progressWrap}>
                        <div style={styles.progressTrack}>
                            <div style={{ ...styles.progressFill, width: `${progress.progress}%` }} />
                        </div>
                        <div style={styles.progressText}>
                            <span style={styles.progressStage}>{progress.stage}</span>
                            <span style={styles.progressPct}>{progress.progress}%</span>
                        </div>
                        <p style={styles.progressDetail}>{progress.detail}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="8" stroke="#ffffff" strokeWidth="1.5" />
                            <path d="M9 5v4M9 11.5v.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Try these repos */}
                <div style={styles.examples}>
                    <span style={styles.examplesLabel}>Try these:</span>
                    {['facebook/react', 'denoland/deno', 'sindresorhus/is', 'expressjs/express'].map(repo => (
                        <button
                            key={repo}
                            onClick={() => { setUrl(`github.com/${repo}`); }}
                            style={styles.exampleBtn}
                            disabled={loading}
                        >
                            {repo}
                        </button>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer style={styles.footer}>
                <span>RepoDNA — Pure algorithmic repository analysis</span>
            </footer>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 20px',
    },
    main: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '720px',
        width: '100%',
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '20px',
    },
    logoIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: '3.2rem',
        fontWeight: 700,
        letterSpacing: '-1px',
        lineHeight: 1,
    },
    titleDna: {
        color: '#e8ecf4',
        fontWeight: 300,
    },
    subtitle: {
        textAlign: 'center' as const,
        color: '#94a3b8',
        fontSize: '1.1rem',
        lineHeight: 1.7,
        marginBottom: '24px',
        maxWidth: '560px',
    },

    form: {
        width: '100%',
        marginBottom: '16px',
    },
    inputWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        background: '#0a0a0a',
        border: '1px solid rgba(99,117,236,0.2)',
        borderRadius: '14px',
        padding: '6px 6px 6px 16px',
        transition: 'border-color 0.3s, box-shadow 0.3s',
    },
    inputIcon: {
        flexShrink: 0,
        marginRight: '10px',
    },
    input: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#e8ecf4',
        fontSize: '1rem',
        fontFamily: 'inherit',
        padding: '12px 0',
        minWidth: 0,
    },
    submitBtn: {
        flexShrink: 0,
        padding: '12px 24px',
        borderRadius: '10px',
        fontSize: '0.95rem',
    },
    spinnerWrap: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
    },
    spinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(0,0,0,0.1)',
        borderTopColor: '#000',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
    },
    progressWrap: {
        width: '100%',
        maxWidth: '500px',
        marginBottom: '16px',
        animation: 'fadeInUp 0.4s ease',
    },
    progressTrack: {
        height: '4px',
        background: 'rgba(99,117,236,0.15)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '8px',
    },
    progressFill: {
        height: '100%',
        background: '#ffffff',
        borderRadius: '2px',
        transition: 'width 0.5s ease',
    },
    progressText: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
    },
    progressStage: {
        color: '#ffffff',
        fontWeight: 600,
    },
    progressPct: {
        color: '#94a3b8',
    },
    progressDetail: {
        color: '#506080',
        fontSize: '0.78rem',
        marginTop: '4px',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '10px',
        color: '#ffffff',
        fontSize: '0.9rem',
        marginBottom: '16px',
        width: '100%',
        maxWidth: '500px',
    },
    examples: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'center',
    },
    examplesLabel: {
        color: '#506080',
        fontSize: '0.82rem',
    },
    exampleBtn: {
        background: 'transparent',
        border: '1px solid rgba(99,117,236,0.15)',
        borderRadius: '8px',
        padding: '5px 12px',
        color: '#94a3b8',
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
    },
    footer: {
        position: 'relative' as const,
        zIndex: 1,
        marginTop: 'auto',
        paddingTop: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.75rem',
        color: '#506080',
        flexWrap: 'wrap' as const,
        justifyContent: 'center',
    },

    tokenWrap: {
        margin: '16px auto 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        maxWidth: '560px',
    },
    tokenLabel: {
        fontSize: '0.75rem',
        color: '#506080',
    },
    tokenInput: {
        background: 'rgba(99,117,236,0.06)',
        border: '1px solid rgba(99,117,236,0.15)',
        borderRadius: '6px',
        padding: '6px 10px',
        fontSize: '0.75rem',
        color: '#94a3b8',
        outline: 'none',
        flex: 1,
        maxWidth: '180px',
        fontFamily: 'var(--font-mono)',
        transition: 'border-color 0.3s',
    },
};
