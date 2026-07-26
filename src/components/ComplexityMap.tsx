import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ComplexityResult } from '../engine/types';
import { formatNumber } from '../utils/format';

export default function ComplexityMap({ data }: { data: ComplexityResult }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.files.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600, height = 360;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        // Group by directory for treemap
        const dirMap = new Map<string, any[]>();
        data.files.forEach(f => {
            const dir = f.directory;
            if (!dirMap.has(dir)) dirMap.set(dir, []);
            dirMap.get(dir)!.push(f);
        });

        const hierarchy = {
            name: 'root',
            children: [...dirMap.entries()].map(([dir, files]) => ({
                name: dir,
                children: files.slice(0, 30).map(f => ({
                    name: f.path.split('/').pop(),
                    fullPath: f.path,
                    value: f.loc,
                    complexity: f.complexity,
                }))
            }))
        };

        const root = d3.hierarchy(hierarchy).sum((d: any) => d.value || 0);
        d3.treemap<any>().size([width, height]).padding(2).paddingOuter(4).round(true)(root);

        const maxComplexity = data.maxComplexity.value || 1;
        const color = d3.scaleSequential()
            .domain([0, maxComplexity])
            .interpolator(d3.interpolateRgbBasis(['#1a2248', '#00d4ff', '#7c3aed', '#f43f5e']));

        const leaves = root.leaves();

        const cells = svg.selectAll('g').data(leaves).enter().append('g')
            .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

        cells.append('rect')
            .attr('width', (d: any) => Math.max(d.x1 - d.x0, 0))
            .attr('height', (d: any) => Math.max(d.y1 - d.y0, 0))
            .attr('rx', 3)
            .attr('fill', (d: any) => color(d.data.complexity || 0))
            .attr('fill-opacity', 0)
            .attr('stroke', 'rgba(99,117,236,0.08)')
            .transition().duration(600).delay((_, i) => i * 10)
            .attr('fill-opacity', 0.8);

        cells.filter((d: any) => (d.x1 - d.x0) > 45 && (d.y1 - d.y0) > 18)
            .append('text')
            .attr('x', 4).attr('y', 13)
            .attr('fill', '#e8ecf4').attr('font-size', '8px').attr('font-family', 'inherit')
            .attr('opacity', 0.8)
            .text((d: any) => {
                const maxLen = Math.floor((d.x1 - d.x0 - 8) / 5);
                return d.data.name.length > maxLen ? d.data.name.slice(0, maxLen - 2) + '..' : d.data.name;
            });

        cells.append('title').text((d: any) => `${d.data.fullPath || d.data.name}\nLOC: ${d.data.value}\nComplexity: ${d.data.complexity}`);
    }, [data]);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <div>
                    <span style={styles.label}>Complexity Map</span>
                    <span style={styles.meta}>Total: {formatNumber(data.totalLoc)} LOC, Avg complexity: {data.avgComplexity}</span>
                </div>
                <div style={styles.legend}>
                    <span style={styles.legendLabel}>Low</span>
                    <div style={styles.legendBar} />
                    <span style={styles.legendLabel}>High</span>
                </div>
            </div>
            {data.files.length > 0 ? (
                <svg ref={svgRef} style={{ width: '100%', height: 'auto' }} />
            ) : (
                <div style={styles.empty}>No code files detected</div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap' as const, gap: '8px' },
    label: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    meta: { fontSize: '0.75rem', color: '#506080' },
    legend: { display: 'flex', alignItems: 'center', gap: '6px' },
    legendLabel: { fontSize: '0.68rem', color: '#506080' },
    legendBar: { width: '80px', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, #1a2248, #00d4ff, #7c3aed, #f43f5e)' },
    empty: { textAlign: 'center' as const, color: '#506080', padding: '60px 20px', fontSize: '0.85rem' },
};
