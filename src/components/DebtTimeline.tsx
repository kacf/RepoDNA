import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DebtResult } from '../engine/types';
import { formatDate } from '../utils/format';

export default function DebtTimeline({ data }: { data: DebtResult }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.timeline.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = 560, height = 220;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        const x = d3.scaleLinear().domain([0, data.timeline.length - 1]).range([0, innerW]);
        const maxDebt = d3.max(data.timeline, d => d.totalDebt) || 1;
        const y = d3.scaleLinear().domain([0, maxDebt * 1.1]).range([innerH, 0]);

        // Grid lines
        g.selectAll('.grid-line').data(y.ticks(4)).enter()
            .append('line').attr('x1', 0).attr('x2', innerW)
            .attr('y1', d => y(d)).attr('y2', d => y(d))
            .attr('stroke', 'rgba(99,117,236,0.06)');

        // Area
        const area = d3.area<any>()
            .x((_, i) => x(i))
            .y0(innerH)
            .y1(d => y(d.totalDebt))
            .curve(d3.curveMonotoneX);

        const gradient = svg.append('defs').append('linearGradient').attr('id', 'debt-gradient').attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.3);
        gradient.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.02);

        g.append('path').datum(data.timeline).attr('d', area).attr('fill', 'url(#debt-gradient)');

        // Line
        const line = d3.line<any>()
            .x((_, i) => x(i))
            .y(d => y(d.totalDebt))
            .curve(d3.curveMonotoneX);

        const linePath = g.append('path').datum(data.timeline).attr('d', line)
            .attr('fill', 'none').attr('stroke', '#f43f5e').attr('stroke-width', 2);

        const totalLength = linePath.node()?.getTotalLength() || 0;
        linePath.attr('stroke-dasharray', totalLength).attr('stroke-dashoffset', totalLength)
            .transition().duration(1500).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

        // Dots
        data.timeline.forEach((d, i) => {
            g.append('circle').attr('cx', x(i)).attr('cy', y(d.totalDebt))
                .attr('r', 3).attr('fill', '#f43f5e').attr('opacity', 0)
                .transition().delay(1500 + i * 50).duration(300).attr('opacity', 0.8);
        });

        // X axis labels
        const labelIndices = [0, Math.floor(data.timeline.length / 2), data.timeline.length - 1];
        labelIndices.forEach(i => {
            if (data.timeline[i]) {
                g.append('text').attr('x', x(i)).attr('y', innerH + 18)
                    .attr('text-anchor', 'middle').attr('fill', '#506080').attr('font-size', '9px').attr('font-family', 'inherit')
                    .text(formatDate(data.timeline[i].date).slice(0, -6));
            }
        });
    }, [data]);

    const trendIcon = data.debtTrend === 'increasing' ? '📈' : data.debtTrend === 'decreasing' ? '📉' : '➡️';
    const trendColor = data.debtTrend === 'increasing' ? '#f43f5e' : data.debtTrend === 'decreasing' ? '#10b981' : '#f59e0b';

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <div>
                    <span style={styles.label}>Technical Debt Timeline</span>
                    <span style={{ ...styles.trend, color: trendColor }}>{trendIcon} {data.debtTrend}</span>
                </div>
                <span style={styles.meta}>{data.currentDebt} markers found</span>
            </div>
            {data.timeline.length > 0 ? (
                <svg ref={svgRef} style={{ width: '100%', height: 'auto' }} />
            ) : (
                <div style={styles.empty}>No debt markers (TODO/FIXME/HACK) detected</div>
            )}
            {data.topIssues.length > 0 && (
                <div style={styles.issues}>
                    {data.topIssues.map((issue, i) => (
                        <span key={i} style={styles.issueTag}>
                            {issue.type}: {issue.count}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap' as const, gap: '8px' },
    label: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    trend: { fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' as const },
    meta: { fontSize: '0.75rem', color: '#506080' },
    empty: { textAlign: 'center' as const, color: '#506080', padding: '40px', fontSize: '0.85rem' },
    issues: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' as const },
    issueTag: { padding: '4px 10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '6px', fontSize: '0.75rem', color: '#f43f5e' },
};
