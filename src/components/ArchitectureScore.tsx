import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ArchitectureResult } from '../engine/types';
import { GRADE_COLORS } from '../utils/colors';

export default function ArchitectureScore({ data }: { data: ArchitectureResult }) {
    const gaugeRef = useRef<SVGSVGElement>(null);
    const gradeColor = GRADE_COLORS[data.grade] || '#94a3b8';

    useEffect(() => {
        if (!gaugeRef.current) return;
        const svg = d3.select(gaugeRef.current);
        svg.selectAll('*').remove();

        const w = 160, h = 100;
        const g = svg.append('g').attr('transform', `translate(${w / 2},${h - 10})`);
        const radius = 65;
        const startAngle = -Math.PI / 1.3;
        const endAngle = Math.PI / 1.3;
        const pct = data.score / data.maxScore;

        // Background arc
        const bgArc = d3.arc<any>().innerRadius(radius - 10).outerRadius(radius).startAngle(startAngle).endAngle(endAngle);
        g.append('path').attr('d', bgArc({}) || '').attr('fill', 'rgba(99,117,236,0.1)');

        // Value arc
        const valAngle = startAngle + (endAngle - startAngle) * pct;
        const valArc = d3.arc<any>().innerRadius(radius - 10).outerRadius(radius).startAngle(startAngle).endAngle(startAngle);

        const path = g.append('path').attr('d', valArc({}) || '').attr('fill', gradeColor);
        path.transition().duration(1200).ease(d3.easeCubicOut)
            .attrTween('d', () => {
                const interp = d3.interpolate(startAngle, valAngle);
                return (t: number) => {
                    const arc = d3.arc<any>().innerRadius(radius - 10).outerRadius(radius).startAngle(startAngle).endAngle(interp(t));
                    return arc({}) || '';
                };
            });

        // Score text
        g.append('text').attr('text-anchor', 'middle').attr('y', -20).attr('fill', '#e8ecf4')
            .attr('font-size', '28px').attr('font-weight', '700').attr('font-family', 'inherit')
            .text(data.score);
        g.append('text').attr('text-anchor', 'middle').attr('y', -4).attr('fill', '#506080')
            .attr('font-size', '11px').attr('font-family', 'inherit')
            .text(`/ ${data.maxScore}`);
    }, [data, gradeColor]);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <span style={styles.label}>Architecture Score</span>
                <span style={{ ...styles.grade, color: gradeColor, borderColor: `${gradeColor}40` }}>{data.grade}</span>
            </div>
            <div style={styles.gaugeWrap}>
                <svg ref={gaugeRef} width="160" height="100" style={{ display: 'block', margin: '0 auto' }} />
            </div>
            <div style={styles.breakdown}>
                {data.breakdown.map((b, i) => (
                    <div key={i} style={styles.breakdownRow}>
                        <span style={styles.breakdownName}>{b.name}</span>
                        <div style={styles.breakdownBar}>
                            <div style={{ ...styles.breakdownFill, width: `${(b.score / b.max) * 100}%` }} />
                        </div>
                        <span style={styles.breakdownScore}>{b.score}/{b.max}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    label: { fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    grade: { fontSize: '1.2rem', fontWeight: 700, padding: '2px 10px', border: '1px solid', borderRadius: '6px' },
    gaugeWrap: { marginBottom: '16px' },
    breakdown: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
    breakdownRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    breakdownName: { fontSize: '0.75rem', color: '#94a3b8', width: '130px', flexShrink: 0 },
    breakdownBar: { flex: 1, height: '4px', background: 'rgba(99,117,236,0.1)', borderRadius: '2px', overflow: 'hidden' },
    breakdownFill: { height: '100%', background: 'linear-gradient(90deg, #ffffff, #cccccc)', borderRadius: '2px', transition: 'width 0.8s ease' },
    breakdownScore: { fontSize: '0.72rem', color: '#506080', width: '36px', textAlign: 'right' as const },
};
