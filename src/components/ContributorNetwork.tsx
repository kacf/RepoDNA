import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ContributorResult } from '../engine/types';

export default function ContributorNetwork({ data }: { data: ContributorResult }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.nodes.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600, height = 380;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const maxContribs = d3.max(data.nodes, d => d.contributions) || 1;
        const rScale = d3.scaleSqrt().domain([0, maxContribs]).range([6, 24]);

        const simulation = d3.forceSimulation(data.nodes as any[])
            .force('link', d3.forceLink(data.edges as any[]).id((d: any) => d.id).distance(80))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide((d: any) => rScale(d.contributions) + 4));

        const g = svg.append('g');

        // Links
        const links = g.selectAll('line').data(data.edges)
            .enter().append('line')
            .attr('stroke', 'rgba(124,58,237,0.2)')
            .attr('stroke-width', (d: any) => Math.min(d.sharedFiles * 0.5, 4));

        // Node groups
        const nodes = g.selectAll('g.node').data(data.nodes)
            .enter().append('g').attr('class', 'node');

        // Circle with gradient
        nodes.append('circle')
            .attr('r', (d: any) => rScale(d.contributions))
            .attr('fill', (_, i) => {
                const colors = ['#ffffff', '#cccccc', '#a1a1a6', '#ffffff', '#cccccc', '#3b82f6', '#ec4899', '#6366f1'];
                return colors[i % colors.length];
            })
            .attr('fill-opacity', 0.6)
            .attr('stroke', (_, i) => {
                const colors = ['#ffffff', '#cccccc', '#a1a1a6', '#ffffff', '#cccccc', '#3b82f6', '#ec4899', '#6366f1'];
                return colors[i % colors.length];
            })
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.4);

        // Labels
        nodes.filter((d: any) => rScale(d.contributions) > 8)
            .append('text')
            .text((d: any) => d.login.length > 12 ? d.login.slice(0, 10) + '..' : d.login)
            .attr('text-anchor', 'middle')
            .attr('dy', (d: any) => rScale(d.contributions) + 14)
            .attr('fill', '#94a3b8')
            .attr('font-size', '9px')
            .attr('font-family', 'inherit');

        nodes.append('title').text((d: any) => `${d.login}\n${d.contributions} contributions\n${d.filesOwned} files owned`);

        simulation.on('tick', () => {
            links
                .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
            nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });

        const drag = d3.drag<SVGGElement, any>()
            .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });

        nodes.call(drag as any);

        return () => { simulation.stop(); };
    }, [data]);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <div>
                    <span style={styles.label}>Contributor Network</span>
                    <span style={styles.meta}>{data.totalContributors} contributors, connected by shared file ownership</span>
                </div>
            </div>
            {data.nodes.length > 0 ? (
                <svg ref={svgRef} style={{ width: '100%', height: '380px' }} />
            ) : (
                <div style={styles.empty}>No contributor data available</div>
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
