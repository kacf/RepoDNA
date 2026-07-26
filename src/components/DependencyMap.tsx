import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DependencyResult } from '../engine/types';

export default function DependencyMap({ data }: { data: DependencyResult }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.nodes.length) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600, height = 400;
        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const typeColor: Record<string, string> = {
            internal: '#ffffff',
            runtime: '#cccccc',
            dev: '#cccccc',
            peer: '#ffffff',
        };

        const simulation = d3.forceSimulation(data.nodes as any[])
            .force('link', d3.forceLink(data.edges as any[]).id((d: any) => d.id).distance(60))
            .force('charge', d3.forceManyBody().strength(-120))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide(20));

        const g = svg.append('g');

        // Links
        const links = g.selectAll('line').data(data.edges)
            .enter().append('line')
            .attr('stroke', 'rgba(99,117,236,0.15)')
            .attr('stroke-width', 1);

        // Nodes
        const nodes = g.selectAll('g.node').data(data.nodes)
            .enter().append('g').attr('class', 'node');

        nodes.append('circle')
            .attr('r', (d: any) => d.type === 'internal' ? 12 : 7)
            .attr('fill', (d: any) => typeColor[d.type] || '#506080')
            .attr('stroke', (d: any) => typeColor[d.type] || '#506080')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.3)
            .attr('fill-opacity', 0.7);

        nodes.append('text')
            .text((d: any) => d.name.length > 16 ? d.name.slice(0, 14) + '..' : d.name)
            .attr('text-anchor', 'middle')
            .attr('dy', (d: any) => d.type === 'internal' ? -18 : -12)
            .attr('fill', '#94a3b8')
            .attr('font-size', (d: any) => d.type === 'internal' ? '10px' : '8px')
            .attr('font-family', 'inherit');

        nodes.append('title').text((d: any) => `${d.name}${d.version ? ' v' + d.version : ''} (${d.type})`);

        simulation.on('tick', () => {
            links
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);
            nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });

        // Drag behavior
        const drag = d3.drag<SVGGElement, any>()
            .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x; d.fy = d.y;
            })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null; d.fy = null;
            });

        nodes.call(drag as any);

        return () => { simulation.stop(); };
    }, [data]);

    return (
        <div className="glass-card" style={styles.card}>
            <div style={styles.header}>
                <div>
                    <span style={styles.label}>Dependency Map</span>
                    <span style={styles.meta}>{data.totalDeps} dependencies ({data.runtimeDeps} runtime, {data.devDeps} dev)</span>
                </div>
                <div style={styles.legend}>
                    <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#ffffff' }} />Project</span>
                    <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#cccccc' }} />Runtime</span>
                    <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#cccccc' }} />Dev</span>
                </div>
            </div>
            {data.nodes.length > 0 ? (
                <svg ref={svgRef} style={{ width: '100%', height: '400px' }} />
            ) : (
                <div style={styles.empty}>No dependency files detected (package.json, requirements.txt, etc.)</div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap' as const, gap: '8px' },
    label: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#506080', fontWeight: 600 },
    meta: { fontSize: '0.75rem', color: '#506080' },
    legend: { display: 'flex', gap: '12px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#94a3b8' },
    dot: { width: '6px', height: '6px', borderRadius: '50%' },
    empty: { textAlign: 'center' as const, color: '#506080', padding: '60px 20px', fontSize: '0.85rem' },
};
