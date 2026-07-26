import { useEffect, useRef, useState } from 'react';
import type { CityResult, CityBuilding } from '../engine/types';
import { formatNumber } from '../utils/format';

export default function RepoCity({ data }: { data: CityResult; repoName: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredBuilding, setHoveredBuilding] = useState<CityBuilding | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!canvasRef.current || !data.blocks.length) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current?.getBoundingClientRect() || { width: 800, height: 500 };
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Isometric projection params
        let scale = Math.min(rect.width / 1200, rect.height / 800) * 0.9;
        let offsetX = rect.width / 2;
        let offsetY = rect.height / 6;

        // Pan state
        let isDragging = false;
        let lastX = 0, lastY = 0;

        const drawIsoCube = (x: number, y: number, z: number, w: number, d: number, h: number, baseColor: string, isHovered = false) => {
            // Isometric projection math: x' = (x - z) * cos(30), y' = y + (x + z) * sin(30)
            const isoX = (px: number, pz: number) => (px - pz) * 0.866 * scale + offsetX;
            const isoY = (px: number, py: number, pz: number) => (py + (px + pz) * 0.5) * scale + offsetY;

            // Parse base color for shading
            let r = 100, g = 100, b = 100;
            if (baseColor.startsWith('rgb')) {
                const parts = baseColor.match(/(\d+)/g);
                if (parts && parts.length >= 3) {
                    r = parseInt(parts[0]); g = parseInt(parts[1]); b = parseInt(parts[2]);
                }
            }

            // Shaded colors (top light, right medium, left dark)
            const topColor = isHovered ? '#fff' : `rgb(${Math.min(r + 40, 255)},${Math.min(g + 40, 255)},${Math.min(b + 40, 255)})`;
            const rightColor = isHovered ? `rgb(${r + 20},${g + 20},${b + 20})` : `rgb(${r},${g},${b})`;
            const leftColor = isHovered ? `rgb(${r - 20},${g - 20},${b - 20})` : `rgb(${Math.max(r - 30, 0)},${Math.max(g - 30, 0)},${Math.max(b - 30, 0)})`;
            const outlineColor = isHovered ? '#fff' : 'rgba(0,0,0,0.3)';

            // 8 corners of the cube
            const p1 = { x: isoX(x, z), y: isoY(x, y - h, z) }; // Top Front
            const p2 = { x: isoX(x + w, z), y: isoY(x + w, y - h, z) }; // Top Right
            const p3 = { x: isoX(x + w, z + d), y: isoY(x + w, y - h, z + d) }; // Top Back
            const p4 = { x: isoX(x, z + d), y: isoY(x, y - h, z + d) }; // Top Left
            const p5 = { x: isoX(x, z), y: isoY(x, y, z) }; // Bottom Front
            const p6 = { x: isoX(x + w, z), y: isoY(x + w, y, z) }; // Bottom Right
            const p8 = { x: isoX(x, z + d), y: isoY(x, y, z + d) }; // Bottom Left

            // Draw Top Face
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
            ctx.closePath();
            ctx.fillStyle = topColor; ctx.fill();
            ctx.strokeStyle = outlineColor; ctx.stroke();

            // Draw Left Face
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y); ctx.lineTo(p8.x, p8.y); ctx.lineTo(p5.x, p5.y);
            ctx.closePath();
            ctx.fillStyle = leftColor; ctx.fill();
            ctx.strokeStyle = outlineColor; ctx.stroke();

            // Draw Right Face
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p6.x, p6.y); ctx.lineTo(p5.x, p5.y);
            ctx.closePath();
            ctx.fillStyle = rightColor; ctx.fill();
            ctx.strokeStyle = outlineColor; ctx.stroke();
        };

        const drawIsoPlane = (x: number, z: number, w: number, d: number, color: string) => {
            const isoX = (px: number, pz: number) => (px - pz) * 0.866 * scale + offsetX;
            const isoY = (px: number, py: number, pz: number) => (py + (px + pz) * 0.5) * scale + offsetY;
            const y = 0; // Ground level

            ctx.beginPath();
            ctx.moveTo(isoX(x, z), isoY(x, y, z));
            ctx.lineTo(isoX(x + w, z), isoY(x + w, y, z));
            ctx.lineTo(isoX(x + w, z + d), isoY(x + w, y, z + d));
            ctx.lineTo(isoX(x, z + d), isoY(x, y, z + d));
            ctx.closePath();
            ctx.fillStyle = color; ctx.fill();
            ctx.strokeStyle = 'rgba(99,117,236,0.1)'; ctx.stroke();
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 0.5;

            // Sort buildings back-to-front for correct overlap (painter's algorithm)
            // In isometric projection, things with higher (x+z) are closer
            const allElements: any[] = [];

            data.blocks.forEach(block => {
                allElements.push({ type: 'block', data: block, order: block.x + block.width / 2 + block.y + block.depth / 2 });
            });

            data.buildings.forEach(building => {
                allElements.push({ type: 'building', data: building, order: building.x + building.width / 2 + building.y + building.depth / 2 });
            });

            allElements.sort((a, b) => a.order - b.order);

            allElements.forEach(el => {
                if (el.type === 'block') {
                    const b = el.data;
                    drawIsoPlane(b.x, b.y, b.width, b.depth, '#12172b');

                    // Draw directory name
                    const isoX = (b.x - Math.max(b.y - 40, 0)) * 0.866 * scale + offsetX;
                    const isoY = (0 + (b.x + Math.max(b.y - 40, 0)) * 0.5) * scale + offsetY;

                    ctx.fillStyle = '#506080';
                    ctx.font = `${Math.max(10 * Math.sqrt(scale), 8)}px "Microsoft Sans Serif", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText(b.directory, isoX, isoY);
                } else {
                    const b = el.data;
                    const isHovered = hoveredBuilding?.path === b.path;
                    // Z in building data is mapped to Y in our renderer (Y is up/down)
                    drawIsoCube(b.x, 0, b.y, b.width, b.depth, b.height, b.color, isHovered);
                }
            });
        };

        render();

        // Event listeners
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoom = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= zoom;

            // Zoom towards mouse
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            offsetX = mouseX - (mouseX - offsetX) * zoom;
            offsetY = mouseY - (mouseY - offsetY) * zoom;

            render();
        };

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            canvas.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                offsetX += (e.clientX - lastX);
                offsetY += (e.clientY - lastY);
                lastX = e.clientX;
                lastY = e.clientY;
                render();
                return;
            }

            // Hit detection (simplified bounding box approach)
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            let found: CityBuilding | null = null;

            // Search top-to-bottom (front-to-back in visual order)
            // Since we sort back-to-front for rendering, we search the reverse for hit detection
            const sortedBuildings = [...data.buildings].sort((a, b) =>
                (b.x + b.width / 2 + b.y + b.depth / 2) - (a.x + a.width / 2 + a.y + a.depth / 2)
            );

            for (const b of sortedBuildings) {
                const isoX = (px: number, pz: number) => (px - pz) * 0.866 * scale + offsetX;
                const isoY = (px: number, py: number, pz: number) => (py + (px + pz) * 0.5) * scale + offsetY;

                // Approximate 2D bounding box of the 3D building
                const bx = isoX(b.x, b.y + b.depth);
                const by = isoY(b.x, -b.height, b.y);
                const bw = isoX(b.x + b.width, b.y) - bx;
                const bh = isoY(b.x + b.width, 0, b.y + b.depth) - by;

                if (mx >= bx && mx <= bx + bw && my >= by && my <= by + bh) {
                    found = b;
                    break;
                }
            }

            if (found !== hoveredBuilding) {
                setHoveredBuilding(found);
                setTooltipPos({ x: e.clientX, y: e.clientY });
                render(); // Re-render to show hover state
            } else if (found) {
                setTooltipPos({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [data, hoveredBuilding]);

    return (
        <div className="glass-card" style={styles.card} ref={containerRef}>
            <div style={styles.header}>
                <div>
                    <span style={styles.label}>Repository City</span>
                    <span style={styles.meta}>{data.totalBuildings} files • Height = Lines of Code • Color = Complexity</span>
                </div>
                <div style={styles.controls}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1v12" stroke="#94a3b8" strokeLinecap="round" /></svg>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Scroll to zoom, drag to pan</span>
                </div>
            </div>

            {data.buildings.length > 0 ? (
                <div style={styles.canvasWrap}>
                    <canvas ref={canvasRef} style={{ display: 'block', cursor: 'grab' }} />

                    {hoveredBuilding && (
                        <div style={{ ...styles.tooltip, left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}>
                            <div style={styles.ttPath}>{hoveredBuilding.path}</div>
                            <div style={styles.ttStats}>
                                <span>{formatNumber(hoveredBuilding.loc)} LOC</span>
                                <span>•</span>
                                <span style={{ color: hoveredBuilding.color }}>Complexity {Math.round(hoveredBuilding.complexity)}</span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={styles.empty}>No layout data available</div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: { padding: '24px', display: 'flex', flexDirection: 'column' as const, height: '100%', minHeight: '500px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' as const, gap: '8px' },
    label: { display: 'block', fontSize: '1rem', textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: '#00d4ff', fontWeight: 600 },
    meta: { fontSize: '0.75rem', color: '#506080' },
    controls: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(99,117,236,0.1)', borderRadius: '6px' },
    canvasWrap: {
        flex: 1, position: 'relative' as const, borderRadius: '8px', overflow: 'hidden', background: 'radial-gradient(ellipse at center, #111631 0%, #06080f 100%)', // Night sky gradient
        margin: '-12px -24px -24px -24px'
    },
    empty: { textAlign: 'center' as const, color: '#506080', padding: '100px 20px', fontSize: '0.85rem', flex: 1 },
    tooltip: { position: 'fixed', background: 'rgba(10, 14, 26, 0.95)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '6px', padding: '8px 12px', pointerEvents: 'none' as const, zIndex: 1000, backdropFilter: 'blur(4px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
    ttPath: { color: '#e8ecf4', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' },
    ttStats: { display: 'flex', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' },
};
