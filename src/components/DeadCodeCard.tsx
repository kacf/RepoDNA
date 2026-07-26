import type { DeadCodeResult } from '../engine/types';

export default function DeadCodeCard({ data }: { data: DeadCodeResult }) {
    const riskColor = data.estimatedPercentage > 25 ? '#a1a1a6' : data.estimatedPercentage > 15 ? '#cccccc' : '#ffffff';

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <span style={styles.label}>Dead Code Estimate</span>
                <span style={styles.meta}>{data.totalFiles} files analyzed</span>
            </div>

            <div style={styles.centerBlock}>
                <div style={styles.bigNumber}>
                    <span style={{ ...styles.pct, color: riskColor }}>{data.estimatedPercentage}</span>
                    <span style={styles.pctSign}>%</span>
                </div>
                <p style={styles.subtext}>{data.deadFileCount} potentially unused files out of {data.totalFiles}</p>
            </div>

            {/* Bar visualization */}
            <div style={styles.barWrap}>
                <div style={styles.barTrack}>
                    <div style={{ ...styles.barActive, width: `${100 - data.estimatedPercentage}%` }} />
                    <div style={{ ...styles.barDead, width: `${data.estimatedPercentage}%`, background: riskColor }} />
                </div>
                <div style={styles.barLabels}>
                    <span>Active</span>
                    <span>Potentially Dead</span>
                </div>
            </div>

            {data.potentialDeadFiles.length > 0 && (
                <div style={styles.fileList}>
                    <span style={styles.fileListLabel}>Top orphan files:</span>
                    {data.potentialDeadFiles.slice(0, 5).map((f, i) => (
                        <div key={i} style={styles.fileItem}>
                            <span style={styles.fileName}>{f.path.split('/').pop()}</span>
                            <span style={styles.fileReason}>{f.reason}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    label: { fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    meta: { fontSize: '0.75rem', color: '#506080' },
    centerBlock: { textAlign: 'center' as const, marginBottom: '16px' },
    bigNumber: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' },
    pct: { fontSize: '3rem', fontWeight: 700, lineHeight: 1 },
    pctSign: { fontSize: '1.5rem', color: '#506080', fontWeight: 400 },
    subtext: { fontSize: '0.8rem', color: '#506080', marginTop: '4px' },
    barWrap: { marginBottom: '16px' },
    barTrack: { display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: '#0a0a0a' },
    barActive: { background: 'linear-gradient(90deg, #ffffff, #3b82f6)', transition: 'width 1s ease' },
    barDead: { transition: 'width 1s ease', opacity: 0.7 },
    barLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#506080', marginTop: '4px' },
    fileList: { borderTop: '1px solid rgba(99,117,236,0.1)', paddingTop: '12px' },
    fileListLabel: { display: 'block', fontSize: '0.72rem', color: '#506080', marginBottom: '8px' },
    fileItem: { padding: '6px 0', borderBottom: '1px solid rgba(99,117,236,0.05)' },
    fileName: { display: 'block', fontSize: '0.82rem', color: '#e8ecf4', fontFamily: 'var(--font-mono)' },
    fileReason: { fontSize: '0.7rem', color: '#506080' },
};
