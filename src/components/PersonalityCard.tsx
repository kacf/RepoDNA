import type { CodingPersonality } from '../engine/types';

const TYPE_ICONS: Record<string, string> = {
    architect: '🏗️',
    nocturnal: '🌙',
    speedrunner: '⚡',
    polyglot: '🌐',
    minimalist: '✨',
    professional: '💼',
    explorer: '🧭',
    ghost: '👻',
};

const TYPE_COLORS: Record<string, string> = {
    architect: '#cccccc',
    nocturnal: '#6366f1',
    speedrunner: '#cccccc',
    polyglot: '#ffffff',
    minimalist: '#ffffff',
    professional: '#3b82f6',
    explorer: '#a1a1a6',
    ghost: '#64748b',
};

export default function PersonalityCard({ data }: { data: CodingPersonality }) {
    const color = TYPE_COLORS[data.type] || '#ffffff';
    const icon = TYPE_ICONS[data.type] || '🧬';

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <span style={styles.label}>Coding Personality</span>
                <span style={{ ...styles.typeIcon, background: `${color}20`, color }}>{icon}</span>
            </div>
            <h2 style={{ ...styles.title, color }}>{data.title}</h2>
            <p style={styles.desc}>{data.description}</p>

            <div style={styles.traits}>
                {data.traits.map((t, i) => (
                    <div key={i} style={styles.traitRow}>
                        <div style={styles.traitHeader}>
                            <span style={styles.traitName}>{t.name}</span>
                            <span style={styles.traitLabel}>{t.label}</span>
                        </div>
                        <div style={styles.traitTrack}>
                            <div style={{
                                ...styles.traitFill,
                                width: `${t.value}%`,
                                background: `linear-gradient(90deg, ${color}, ${color}80)`,
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Commit Style</span>
                    <span style={styles.metaValue}>{data.commitStyle}</span>
                </div>
                <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Active Hours</span>
                    <span style={styles.metaValue}>{data.activeHours}</span>
                </div>
                <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Top Language</span>
                    <span style={styles.metaValue}>{data.topLanguage}</span>
                </div>
                <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Commit Size</span>
                    <span style={styles.metaValue}>{data.avgCommitSize}</span>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    label: { fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    typeIcon: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
    title: { fontSize: '1.6rem', fontWeight: 700, marginBottom: '6px' },
    desc: { color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' },
    traits: { display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '20px' },
    traitRow: {},
    traitHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
    traitName: { fontSize: '0.78rem', color: '#e8ecf4' },
    traitLabel: { fontSize: '0.72rem', color: '#506080' },
    traitTrack: { height: '4px', background: 'rgba(99,117,236,0.1)', borderRadius: '2px', overflow: 'hidden' },
    traitFill: { height: '100%', borderRadius: '2px', transition: 'width 1s ease' },
    metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    metaItem: { background: 'rgba(99,117,236,0.06)', borderRadius: '8px', padding: '10px 12px' },
    metaLabel: { display: 'block', fontSize: '0.68rem', color: '#506080', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '2px' },
    metaValue: { fontSize: '0.88rem', color: '#e8ecf4', fontWeight: 600 },
};
