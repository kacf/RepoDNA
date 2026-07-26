import { useRef, useState } from 'react';
import type { AnalysisResult } from '../engine/types';
import { GRADE_COLORS } from '../utils/colors';

export default function ShareCard({ result, onClose }: { result: AnalysisResult; onClose: () => void }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const repo = result.repo;
    const p = result.personality;

    // Use async to load avatar image before rendering canvas
    const handleDownload = async () => {
        setDownloading(true);

        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background gradient (Monochrome Apple style base to keep it clean)
        const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#111111');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1920);

        // Grid overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 1080; i += 60) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke(); }
        for (let i = 0; i < 1920; i += 60) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke(); }

        // Massive Transparent GitHub Watermark
        ctx.save();
        ctx.translate(650, 150);
        ctx.scale(55, 55);
        ctx.rotate(15 * Math.PI / 180);
        const ghPath = new Path2D('M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fill(ghPath);
        ctx.restore();

        // Ambient glows to match Apple monochrome style
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath(); ctx.arc(150, 250, 400, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        ctx.beginPath(); ctx.arc(900, 1400, 500, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.beginPath(); ctx.arc(200, 1600, 300, 0, 2 * Math.PI); ctx.fill();

        // Load Avatar
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Still needed for canvas so it can download
        // use githubusercontent to reduce redirect issues
        img.src = `https://avatars.githubusercontent.com/${repo.owner}`;
        await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });

        // Brand header
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px "Microsoft Sans Serif", sans-serif';
        ctx.fillText('RepoDNA', 80, 120);
        ctx.fillText(new Date().getFullYear().toString(), 920, 120);

        // Header Block (Avatar + Info)
        if (img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(140, 290, 60, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, 80, 230, 120, 120);
            ctx.restore();
        }

        const textX = (img.complete && img.naturalWidth > 0) ? 230 : 80;

        // Repo Name
        ctx.fillStyle = '#94a3b8';
        ctx.font = '36px "Microsoft Sans Serif", sans-serif';
        ctx.fillText(repo.owner + '/', textX, 260);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 84px "Microsoft Sans Serif", sans-serif';
        ctx.fillText(repo.name, textX, 350);

        // Stars (Cyan) & Forks (Violet)
        ctx.fillStyle = '#00d4ff';
        ctx.font = '30px "Microsoft Sans Serif", sans-serif';
        const starsText = `★ ${repo.stars} Stars`;
        ctx.fillText(starsText, textX, 400);

        ctx.fillStyle = '#7c3aed';
        ctx.fillText(`⑂ ${repo.forks} Forks`, textX + ctx.measureText(starsText).width + 30, 400);

        // Color Palette
        const cyan = '#00d4ff';
        const purple = '#7c3aed';
        const rose = '#f43f5e';
        const green = '#10b981';
        const amber = '#f59e0b';
        const subduedColor = '#94a3b8';

        // Box 1: Personality - CYAN
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = cyan;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(80, 500, 920, 360, 24); ctx.fill(); ctx.stroke();

        ctx.fillStyle = cyan;
        ctx.font = 'bold 28px "Microsoft Sans Serif", sans-serif';
        ctx.fillText('CODING PERSONALITY', 120, 560);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px "Microsoft Sans Serif", sans-serif';
        ctx.fillText(p.title, 120, 660);

        ctx.fillStyle = subduedColor;
        ctx.font = '32px "Microsoft Sans Serif", sans-serif';
        const lines = p.description.match(/.{1,50}(\s|$)/g) || [];
        lines.forEach((line, i) => ctx.fillText(line.trim(), 120, 740 + i * 40));

        // Box 2: Architecture - Dynamic GRADE color
        const a = result.architecture;
        const archColor = GRADE_COLORS[a.grade] || green;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = archColor;
        ctx.beginPath(); ctx.roundRect(80, 920, 440, 280, 24); ctx.fill(); ctx.stroke();

        ctx.fillStyle = archColor;
        ctx.font = 'bold 28px "Microsoft Sans Serif", sans-serif';
        ctx.fillText('ARCHITECTURE', 120, 980);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 120px "Microsoft Sans Serif", sans-serif';
        ctx.fillText(a.grade, 120, 1120);

        ctx.fillStyle = subduedColor;
        ctx.font = '32px "Microsoft Sans Serif", sans-serif';
        ctx.fillText(`${a.score}/${a.maxScore} Score`, 120, 1170);

        // Box 3: Technical Debt - ROSE
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = rose;
        ctx.beginPath(); ctx.roundRect(560, 920, 440, 280, 24); ctx.fill(); ctx.stroke();

        ctx.fillStyle = rose;
        ctx.font = 'bold 28px "Microsoft Sans Serif", sans-serif';
        ctx.fillText('TECH DEBT', 600, 980);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 84px "Microsoft Sans Serif", sans-serif';
        ctx.fillText(`${result.debt.currentDebt}`, 600, 1090);

        ctx.fillStyle = subduedColor;
        ctx.font = '32px "Microsoft Sans Serif", sans-serif';
        ctx.fillText('Markers Found', 600, 1140);
        const trendColor = result.debt.debtTrend === 'increasing' ? rose : result.debt.debtTrend === 'decreasing' ? green : amber;
        ctx.fillStyle = trendColor;
        ctx.fillText(result.debt.debtTrend === 'increasing' ? '📈 Increasing' : '📉 Decreasing', 600, 1190);

        // Box 4: Key Stats
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath(); ctx.roundRect(80, 1260, 920, 240, 24); ctx.fill();

        const drawStat = (x: number, y: number, label: string, value: string, color: string) => {
            ctx.fillStyle = color;
            ctx.font = 'bold 24px "Microsoft Sans Serif", sans-serif';
            ctx.fillText(label, x, y);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 56px "Microsoft Sans Serif", sans-serif';
            ctx.fillText(value, x, y + 70);
        };

        drawStat(140, 1330, 'CONTRIBUTORS', `${result.contributors.totalContributors}`, purple);
        drawStat(420, 1330, 'DEPENDENCIES', `${result.dependencies.totalDeps}`, green);
        drawStat(700, 1330, 'BUS FACTOR', `${result.busFactor.busFactor}`, amber);

        // Footer
        ctx.fillStyle = '#506080';
        ctx.font = '28px "Microsoft Sans Serif", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Generated natively by RepoDNA', 540, 1780);

        // Trigger download
        const link = document.createElement('a');
        link.download = `repodna_${repo.name}_summary.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setDownloading(false);
    };

    const archColor = GRADE_COLORS[result.architecture.grade] || '#10b981';
    // Handle overlay click to close if they click outside the card
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div style={styles.overlay} onClick={handleOverlayClick}>
            <div className="glass-card" style={styles.modal} ref={cardRef}>
                <button onClick={onClose} style={styles.closeBtn}>&times;</button>

                <div style={styles.previewContainer}>
                    <div style={styles.previewCard}>
                        {/* Background SVG Watermark for Preview */}
                        <svg style={styles.previewBgSvg} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>

                        <div style={styles.pcHeader}>
                            <span style={styles.pcLogo}>RepoDNA</span>
                            <span style={styles.pcYear}>{new Date().getFullYear()}</span>
                        </div>

                        <div style={styles.pcTitleHeader}>
                            <img src={`https://avatars.githubusercontent.com/${repo.owner}`} alt="Owner" style={styles.pcAvatar} />
                            <div style={styles.pcTitleInfo}>
                                <span style={styles.pcOwner}>{repo.owner}/</span>
                                <span style={styles.pcName}>{repo.name}</span>
                                <span style={styles.pcStats}>
                                    <span style={{ color: '#00d4ff' }}>★ {repo.stars}</span> &nbsp;&nbsp;
                                    <span style={{ color: '#7c3aed' }}>⑂ {repo.forks}</span>
                                </span>
                            </div>
                        </div>

                        <div style={{ ...styles.pcBox, borderColor: '#00d4ff' }}>
                            <span style={{ ...styles.pcLabel, color: '#00d4ff' }}>CODING PERSONALITY</span>
                            <div style={styles.pcType}>{p.title}</div>
                            <div style={styles.pcDesc}>{p.description}</div>
                        </div>

                        <div style={styles.pcGrid}>
                            <div style={{ ...styles.pcBox, borderColor: archColor }}>
                                <span style={{ ...styles.pcLabel, color: archColor }}>ARCHITECTURE</span>
                                <div style={styles.pcGrade}>{result.architecture.grade}</div>
                                <div style={styles.pcStatSub}>{result.architecture.score}/{result.architecture.maxScore}</div>
                            </div>

                            <div style={{ ...styles.pcBox, borderColor: '#f43f5e' }}>
                                <span style={{ ...styles.pcLabel, color: '#f43f5e' }}>TECH DEBT</span>
                                <div style={styles.pcDebt}>{result.debt.currentDebt}</div>
                                <div style={styles.pcStatSub}>{result.debt.debtTrend}</div>
                            </div>
                        </div>

                        <div style={{ ...styles.pcBox, borderColor: 'transparent', background: 'rgba(255,255,255,0.05)' }}>
                            <div style={styles.pcRow}>
                                <div>
                                    <span style={{ ...styles.pcLabel, color: '#7c3aed' }}>CONTRIBUTORS</span>
                                    <div style={styles.pcStatMed}>{result.contributors.totalContributors}</div>
                                </div>
                                <div>
                                    <span style={{ ...styles.pcLabel, color: '#f59e0b' }}>BUS FACTOR</span>
                                    <div style={styles.pcStatMed}>{result.busFactor.busFactor}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.actions}>
                    <button onClick={handleDownload} className="btn-primary" disabled={downloading} style={{ width: '100%', color: '#000', background: '#fff' }}>
                        {downloading ? 'Generating...' : 'Download Image (9:16)'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(6,8,15,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
    },
    modal: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' as const, position: 'relative' as const },
    closeBtn: { position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', color: '#ffffff', fontSize: '28px', cursor: 'pointer', zIndex: 50 },
    previewContainer: { padding: '30px 20px 20px', display: 'flex', justifyContent: 'center', position: 'relative' as const },
    previewCard: { width: '270px', height: '480px', background: 'linear-gradient(180deg, #0a0a0a, #111111)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflow: 'hidden', position: 'relative' as const },
    previewBgSvg: { position: 'absolute', right: '-15%', top: '25%', width: '100%', height: '100%', opacity: 0.05, transform: 'rotate(15deg)', pointerEvents: 'none', color: '#fff' },
    pcHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, zIndex: 1 },
    pcLogo: { color: '#fff' }, pcYear: { color: '#ffffff' },
    pcTitleHeader: { display: 'flex', gap: '12px', alignItems: 'center', margin: '6px 0 10px', zIndex: 1 },
    pcAvatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' as const, border: '2px solid rgba(255,255,255,0.1)' },
    pcTitleInfo: { display: 'flex', flexDirection: 'column' as const },
    pcOwner: { color: '#94a3b8', fontSize: '11px', lineHeight: 1 },
    pcName: { color: '#fff', fontSize: '20px', fontWeight: 700, lineHeight: 1.1, margin: '2px 0 4px' },
    pcStats: { color: '#a1a1a6', fontSize: '10px' },
    pcBox: { border: '1px solid', borderRadius: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', zIndex: 1 },
    pcLabel: { fontSize: '8px', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px', display: 'block' },
    pcType: { fontSize: '20px', fontWeight: 700, color: '#fff' },
    pcDesc: { fontSize: '10px', color: '#94a3b8', margin: '4px 0 0' },
    pcGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', zIndex: 1 },
    pcGrade: { fontSize: '32px', fontWeight: 700, color: '#fff' },
    pcStatSub: { fontSize: '10px', color: '#94a3b8' },
    pcDebt: { fontSize: '28px', fontWeight: 700, color: '#fff' },
    pcRow: { display: 'flex', justifyContent: 'space-between' },
    pcStatMed: { fontSize: '18px', fontWeight: 700, color: '#fff' },
    actions: { padding: '0 20px 20px' },
};
