import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { OwnershipResult } from '../engine/types';
import { getColor } from '../utils/colors';

export default function OwnershipGraph({ data }: { data: OwnershipResult }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.owners.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600, height = 360;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        // Build hierarchy: root -> owners -> files
        const hierarchy: any = {
            name: 'repo',
            children: data.owners.slice(0, 12).map((owner, i) => ({
                name: owner.login,
                color: getColor(i),
                children: data.files
                    .filter(f => f.primaryOwner === owner.login)
                    .slice(0, 20)
                    .map(f => ({
                        name: f.path.split('/').pop(),
                        fullPath: f.path,
                        value: f.totalCommits,
                        ownerPct: f.ownershipPercentage,
                    }))
            })).filter(o => o.children.length > 0)
        };

        const root = d3.hierarchy(hierarchy).sum((d: any) => d.value || 0);

        d3.partition<any>().size([2 * Math.PI, Math.min(width, height) / 2 - 20])(root);

        const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

        const arc = d3.arc<any>()
            .startAngle((d: any) => d.x0)
            .endAngle((d: any) => d.x1)
            .innerRadius((d: any) => d.y0)
            .outerRadius((d: any) => d.y1 - 1);

        const descendants = root.descendants().filter(d => d.depth > 0);

        g.selectAll('path').data(descendants)
            .enter().append('path')
            .attr('d', arc as any)
            .attr('fill', (d: any) => {
                if (d.depth === 1) return d.data.color;
                return d.parent?.data.color || '#506080';
            })
            .attr('fill-opacity', (d: any) => d.depth === 1 ? 0.7 : 0.4)
            .attr('stroke', 'rgba(6,8,15,0.5)')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0)
            .transition().duration(800).delay((_, i) => i * 15)
            .attr('opacity', 1);

        // Add labels for owners
        g.selectAll('text.owner').data(descendants.filter(d => d.depth === 1))
            .enter().append('text')
            .attr('class', 'owner')
            .attr('text-anchor', 'middle')
            .attr('transform', (d: any) => {
                const angle = (d.x0 + d.x1) / 2;
                const radius = (d.y0 + d.y1) / 2;
                return `translate(${radius * Math.sin(angle)},${-radius * Math.cos(angle)}) rotate(${angle * 180 / Math.PI - 90})`;
            })
            .attr('fill', '#e8ecf4')
            .attr('font-size', '9px')
            .attr('font-family', 'inherit')
            .text((d: any) => {
                const span = d.x1 - d.x0;
                return span > 0.3 ? d.data.name : '';
            });

        // Tooltips
        g.selectAll('path').append('title')
            .text((d: any) => {
                if (d.depth === 1) return `${d.data.name}: ${d.data.children?.length || 0} files`;
                return `${d.data.fullPath || d.data.name}\n${d.data.ownerPct || 0}% ownership`;
            });
    }, [data]);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <div>
                    <span style={styles.label}>File Ownership</span>
                    <span style={styles.meta}>Sunburst chart — {data.owners.length} contributors, {data.files.length} files tracked</span>
                </div>
            </div>
            {data.owners.length > 0 ? (
                <svg ref={svgRef} style={{ width: '100%', height: '360px' }} />
            ) : (
                <div style={styles.empty}>No ownership data available</div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { marginBottom: '12px' },
    label: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    meta: { fontSize: '0.75rem', color: '#506080' },
    empty: { textAlign: 'center' as const, color: '#506080', padding: '60px 20px', fontSize: '0.85rem' },
};
