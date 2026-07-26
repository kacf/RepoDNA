import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { HeatmapResult } from '../engine/types';
import { DAY_NAMES } from '../utils/format';

export default function CommitHeatmap({ data }: { data: HeatmapResult }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.cells.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 24, right: 10, bottom: 16, left: 36 };
        const cellSize = 16;
        const cellGap = 3;
        const w = 24 * (cellSize + cellGap) + margin.left + margin.right;
        const h = 7 * (cellSize + cellGap) + margin.top + margin.bottom;

        svg.attr('viewBox', `0 0 ${w} ${h}`);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const colorScale = d3.scaleSequential(
            d3.interpolateRgbBasis(['#0e1228', '#1a2248', '#3b3aad', '#7c3aed', '#00d4ff'])
        ).domain([0, data.maxCount || 1]);

        // Day labels
        DAY_NAMES.forEach((d, i) => {
            g.append('text').attr('x', -6).attr('y', i * (cellSize + cellGap) + cellSize / 2)
                .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
                .attr('fill', '#506080').attr('font-size', '9px').attr('font-family', 'inherit')
                .text(d);
        });

        // Hour labels
        [0, 3, 6, 9, 12, 15, 18, 21].forEach(h => {
            g.append('text').attr('x', h * (cellSize + cellGap) + cellSize / 2).attr('y', -8)
                .attr('text-anchor', 'middle').attr('fill', '#506080').attr('font-size', '8px')
                .attr('font-family', 'inherit')
                .text(`${h}:00`);
        });

        // Cells with animation
        data.cells.forEach((cell, idx) => {
            const rect = g.append('rect')
                .attr('x', cell.hour * (cellSize + cellGap))
                .attr('y', cell.day * (cellSize + cellGap))
                .attr('width', cellSize)
                .attr('height', cellSize)
                .attr('rx', 3)
                .attr('fill', cell.count === 0 ? '#0a0a0a' : colorScale(cell.count))
                .attr('stroke', 'rgba(99,117,236,0.08)')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0);

            rect.transition().delay(idx * 3).duration(400).attr('opacity', 1);

            rect.append('title').text(`${DAY_NAMES[cell.day]} ${cell.hour}:00 — ${cell.count} commits`);
        });
    }, [data]);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <span style={styles.label}>Commit Heatmap</span>
                <span style={styles.meta}>{data.totalCommits} commits analyzed</span>
            </div>
            <svg ref={svgRef} style={{ width: '100%', height: 'auto' }} />
            <div style={styles.stats}>
                <span>Peak: <strong style={{ color: '#ffffff' }}>{data.peakDay}</strong> at <strong style={{ color: '#cccccc' }}>{data.peakHour}:00</strong></span>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    label: { fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    meta: { fontSize: '0.75rem', color: '#506080' },
    stats: { marginTop: '10px', fontSize: '0.82rem', color: '#94a3b8' },
};
