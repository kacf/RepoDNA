import type { BusFactorResult } from '../engine/types';
import { RISK_COLORS } from '../utils/colors';

export default function BusFactorCard({ data }: { data: BusFactorResult }) {
    const riskColor = RISK_COLORS[data.risk];
    const maxBus = 10;
    const fillPct = Math.min((data.busFactor / maxBus) * 100, 100);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <span style={styles.label}>Bus Factor</span>
                <span style={{ ...styles.riskBadge, color: riskColor, background: `${riskColor}15`, borderColor: `${riskColor}30` }}>
                    {data.risk} risk
                </span>
            </div>

            <div style={styles.centerBlock}>
                <div style={{ ...styles.bigNumber, color: riskColor }}>{data.busFactor}</div>
                <p style={styles.subtext}>contributors needed to cover 50% of the codebase</p>
            </div>

            {/* Risk meter */}
            <div style={styles.meter}>
                <div style={styles.meterTrack}>
                    <div style={{ ...styles.meterFill, width: `${fillPct}%`, background: `linear-gradient(90deg, ${riskColor}, ${riskColor}80)` }} />
                </div>
                <div style={styles.meterLabels}>
                    <span style={{ color: '#a1a1a6' }}>Critical</span>
                    <span style={{ color: '#cccccc' }}>Medium</span>
                    <span style={{ color: '#ffffff' }}>Healthy</span>
                </div>
            </div>

            <p style={styles.explanation}>{data.explanation}</p>

            {data.topOwners.length > 0 && (
                <div style={styles.owners}>
                    {data.topOwners.slice(0, 5).map((o, i) => (
                        <div key={i} style={styles.ownerRow}>
                            <span style={styles.ownerRank}>#{i + 1}</span>
                            <span style={styles.ownerName}>{o.login}</span>
                            <div style={styles.ownerBar}>
                                <div style={{ ...styles.ownerFill, width: `${o.percentage}%` }} />
                            </div>
                            <span style={styles.ownerPct}>{o.percentage}%</span>
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
    riskBadge: { padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid', textTransform: 'capitalize' as const },
    centerBlock: { textAlign: 'center' as const, marginBottom: '16px' },
    bigNumber: { fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 },
    subtext: { fontSize: '0.8rem', color: '#506080', marginTop: '4px' },
    meter: { marginBottom: '16px' },
    meterTrack: { height: '6px', background: 'rgba(99,117,236,0.08)', borderRadius: '3px', overflow: 'hidden' },
    meterFill: { height: '100%', borderRadius: '3px', transition: 'width 1s ease' },
    meterLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginTop: '4px' },
    explanation: { fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px' },
    owners: { borderTop: '1px solid rgba(99,117,236,0.1)', paddingTop: '12px', display: 'flex', flexDirection: 'column' as const, gap: '6px' },
    ownerRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    ownerRank: { fontSize: '0.7rem', color: '#506080', width: '24px' },
    ownerName: { fontSize: '0.8rem', color: '#e8ecf4', width: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
    ownerBar: { flex: 1, height: '4px', background: 'rgba(99,117,236,0.1)', borderRadius: '2px', overflow: 'hidden' },
    ownerFill: { height: '100%', background: 'linear-gradient(90deg, #cccccc, #ffffff)', borderRadius: '2px', transition: 'width 0.8s ease' },
    ownerPct: { fontSize: '0.72rem', color: '#506080', width: '36px', textAlign: 'right' as const },
};
