import type { DocsResult } from '../engine/types';
import { GRADE_COLORS } from '../utils/colors';

export default function DocsScore({ data }: { data: DocsResult }) {
    const gradeColor = GRADE_COLORS[data.grade] || '#94a3b8';

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <span style={styles.label}>Documentation Score</span>
                <span style={{ ...styles.grade, color: gradeColor, borderColor: `${gradeColor}40` }}>{data.grade}</span>
            </div>

            <div style={styles.scoreRow}>
                <span style={{ ...styles.bigScore, color: gradeColor }}>{data.score}</span>
                <span style={styles.maxScore}>/ {data.maxScore}</span>
            </div>

            <div style={styles.checks}>
                {data.checks.map((c, i) => (
                    <div key={i} style={styles.checkRow}>
                        <span style={{ ...styles.checkIcon, color: c.passed ? '#ffffff' : '#a1a1a6' }}>
                            {c.passed ? '✓' : '✗'}
                        </span>
                        <span style={styles.checkName}>{c.name}</span>
                        <span style={styles.checkDetail}>{c.detail}</span>
                        <span style={styles.checkWeight}>+{c.weight}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    label: { fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    grade: { fontSize: '1.2rem', fontWeight: 700, padding: '2px 10px', border: '1px solid', borderRadius: '6px' },
    scoreRow: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' },
    bigScore: { fontSize: '2.5rem', fontWeight: 700 },
    maxScore: { fontSize: '1rem', color: '#506080' },
    checks: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
    checkRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(99,117,236,0.04)' },
    checkIcon: { fontSize: '0.85rem', fontWeight: 700, width: '18px', textAlign: 'center' as const },
    checkName: { fontSize: '0.8rem', color: '#e8ecf4', minWidth: '120px' },
    checkDetail: { flex: 1, fontSize: '0.72rem', color: '#506080' },
    checkWeight: { fontSize: '0.68rem', color: '#506080' },
};
