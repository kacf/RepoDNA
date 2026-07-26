import { useState } from 'react';
import type { AnalysisResult } from '../engine/types';
import { formatNumber, formatDuration, formatDate } from '../utils/format';
import PersonalityCard from './PersonalityCard';
import ArchitectureScore from './ArchitectureScore';
import DependencyMap from './DependencyMap';
import DebtTimeline from './DebtTimeline';
import HotspotMap from './HotspotMap';
import ContributorNetwork from './ContributorNetwork';
import CommitHeatmap from './CommitHeatmap';
import DeadCodeCard from './DeadCodeCard';
import DocsScore from './DocsScore';
import BusFactorCard from './BusFactorCard';
import OwnershipGraph from './OwnershipGraph';
import ComplexityMap from './ComplexityMap';
import RepoCity from './RepoCity';
import ShareCard from './ShareCard';

interface DashboardProps {
    result: AnalysisResult;
    onBack: () => void;
}

export default function Dashboard({ result, onBack }: DashboardProps) {
    const [showShare, setShowShare] = useState(false);
    const repo = result.repo;

    return (
        <div style={styles.container}>
            {/* Top bar */}
            <header style={styles.header}>
                <button onClick={onBack} style={styles.backBtn} id="back-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M15 8H1M8 15L1 8l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                </button>
                <div style={styles.repoInfo}>
                    <h1 style={styles.repoName}>
                        <span style={styles.repoOwner}>{repo.owner}/</span>
                        <span className="gradient-text">{repo.name}</span>
                    </h1>
                    <div style={styles.repoBadges}>
                        <span style={styles.badge}>⭐ {formatNumber(repo.stars)}</span>
                        <span style={styles.badge}>🍴 {formatNumber(repo.forks)}</span>
                        <span style={styles.badge}>📂 {repo.language}</span>
                        {repo.license && <span style={styles.badge}>📄 {repo.license}</span>}
                        <span style={{ ...styles.badge, color: '#506080' }}>Analyzed in {formatDuration(result.analysisTime)}</span>
                    </div>
                    {repo.description && <p style={styles.repoDesc}>{repo.description}</p>}
                </div>
                <button onClick={() => setShowShare(!showShare)} className="btn-secondary" style={styles.shareBtn} id="share-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8h8M12 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Share
                </button>
            </header>

            <hr className="glow-line" />

            {showShare && <ShareCard result={result} onClose={() => setShowShare(false)} />}

            {/* Dashboard grid */}
            <div className="dashboard-grid">
                <div className="animate-in" style={{ animationDelay: '0ms' }}>
                    <PersonalityCard data={result.personality} />
                </div>
                <div className="animate-in" style={{ animationDelay: '60ms' }}>
                    <ArchitectureScore data={result.architecture} />
                </div>
                <div className="animate-in" style={{ animationDelay: '120ms' }}>
                    <CommitHeatmap data={result.heatmap} />
                </div>
                <div className="animate-in" style={{ animationDelay: '180ms' }}>
                    <DocsScore data={result.docs} />
                </div>
                <div className="animate-in" style={{ animationDelay: '240ms' }}>
                    <BusFactorCard data={result.busFactor} />
                </div>
                <div className="animate-in" style={{ animationDelay: '300ms' }}>
                    <DeadCodeCard data={result.deadCode} />
                </div>
                <div className="animate-in span-2" style={{ animationDelay: '360ms' }}>
                    <DebtTimeline data={result.debt} />
                </div>
                <div className="animate-in span-2" style={{ animationDelay: '420ms' }}>
                    <DependencyMap data={result.dependencies} />
                </div>
                <div className="animate-in span-2" style={{ animationDelay: '480ms' }}>
                    <HotspotMap data={result.hotspots} />
                </div>
                <div className="animate-in span-2" style={{ animationDelay: '540ms' }}>
                    <ContributorNetwork data={result.contributors} />
                </div>
                <div className="animate-in span-2" style={{ animationDelay: '600ms' }}>
                    <ComplexityMap data={result.complexity} />
                </div>
                <div className="animate-in span-2" style={{ animationDelay: '660ms' }}>
                    <OwnershipGraph data={result.ownership} />
                </div>
                <div className="animate-in span-full" style={{ animationDelay: '720ms' }}>
                    <RepoCity data={result.city} repoName={repo.fullName} />
                </div>
            </div>

            <footer style={styles.footer}>
                <span>RepoDNA Analysis — {formatDate(result.analyzedAt)}</span>
            </footer>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 24px 60px',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap' as const,
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: 'transparent',
        border: '1px solid rgba(99,117,236,0.15)',
        borderRadius: '8px',
        color: '#94a3b8',
        fontSize: '0.85rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        flexShrink: 0,
    },
    repoInfo: {
        flex: 1,
        minWidth: '200px',
    },
    repoName: {
        fontSize: '1.8rem',
        fontWeight: 700,
        letterSpacing: '-0.5px',
        marginBottom: '8px',
    },
    repoOwner: {
        color: '#94a3b8',
        fontWeight: 400,
    },
    repoBadges: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '8px',
        marginBottom: '8px',
    },
    badge: {
        padding: '3px 10px',
        background: 'rgba(99,117,236,0.08)',
        borderRadius: '6px',
        fontSize: '0.78rem',
        color: '#94a3b8',
    },
    repoDesc: {
        color: '#506080',
        fontSize: '0.9rem',
        maxWidth: '600px',
    },
    shareBtn: {
        flexShrink: 0,
    },
    footer: {
        textAlign: 'center' as const,
        padding: '40px 20px 0',
        fontSize: '0.8rem',
        color: '#94a3b8',
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap' as const,
    },
};
