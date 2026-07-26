import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { HotspotResult } from '../engine/types';

export default function HotspotMap({ data }: { data: HotspotResult }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.files.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600, height = 360;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const root = d3.hierarchy({ children: data.files.slice(0, 40) } as any)
            .sum((d: any) => d.score || 1);

        d3.treemap<any>().size([width, height]).padding(2).round(true)(root);

        const maxScore = d3.max(data.files, d => d.score) || 1;
        const color = d3.scaleSequential(
            d3.interpolateRgbBasis(['#1a2248', '#7c3aed', '#f43f5e'])
        ).domain([0, maxScore]);

        const cells = svg.selectAll('g').data(root.leaves()).enter().append('g')
            .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

        cells.append('rect')
            .attr('width', (d: any) => Math.max(d.x1 - d.x0, 0))
            .attr('height', (d: any) => Math.max(d.y1 - d.y0, 0))
            .attr('rx', 4)
            .attr('fill', (d: any) => color(d.data.score))
            .attr('fill-opacity', 0)
            .attr('stroke', 'rgba(99,117,236,0.1)')
            .attr('stroke-width', 0.5)
            .transition().duration(800).delay((_, i) => i * 20)
            .attr('fill-opacity', 0.85);

        cells.filter((d: any) => (d.x1 - d.x0) > 50 && (d.y1 - d.y0) > 22)
            .append('text')
            .attr('x', 6).attr('y', 14)
            .attr('fill', '#e8ecf4').attr('font-size', '8px').attr('font-family', 'inherit')
            .text((d: any) => {
                const name = d.data.path.split('/').pop();
                const maxLen = Math.floor((d.x1 - d.x0 - 12) / 5);
                return name.length > maxLen ? name.slice(0, maxLen - 2) + '..' : name;
            });

        cells.append('title').text((d: any) => `${d.data.path}\nChurn: ${d.data.churn}\nComplexity: ${d.data.complexity}\nScore: ${d.data.score}`);
    }, [data]);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <div>
                    <span style={styles.label}>Refactoring Hotspots</span>
                    <span style={styles.meta}>Churn × Complexity — {data.criticalCount} critical spots</span>
                </div>
            </div>
            {data.files.length > 0 ? (
                <svg ref={svgRef} style={{ width: '100%', height: 'auto' }} />
            ) : (
                <div style={styles.empty}>No hotspot data available</div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
    label: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    meta: { fontSize: '0.75rem', color: '#506080' },
    empty: { textAlign: 'center' as const, color: '#506080', padding: '60px 20px', fontSize: '0.85rem' },
};
