export const COLORS = {
    cyan: '#00d4ff',
    purple: '#7c3aed',
    rose: '#f43f5e',
    green: '#10b981',
    amber: '#f59e0b',
    blue: '#3b82f6',
    indigo: '#6366f1',
    pink: '#ec4899',
    teal: '#14b8a6',
    orange: '#f97316',
};

export const PALETTE = [
    '#00d4ff', '#7c3aed', '#f43f5e', '#10b981', '#f59e0b',
    '#3b82f6', '#6366f1', '#ec4899', '#14b8a6', '#f97316',
    '#8b5cf6', '#06b6d4', '#ef4444', '#22c55e', '#eab308',
];

export function getColor(index: number): string {
    return PALETTE[index % PALETTE.length];
}

export function interpolateColor(t: number): string {
    // cyan → purple → rose
    if (t <= 0.5) {
        const r = Math.round(0 + (124 - 0) * (t * 2));
        const g = Math.round(212 + (58 - 212) * (t * 2));
        const b = Math.round(255 + (237 - 255) * (t * 2));
        return `rgb(${r},${g},${b})`;
    } else {
        const r = Math.round(124 + (244 - 124) * ((t - 0.5) * 2));
        const g = Math.round(58 + (63 - 58) * ((t - 0.5) * 2));
        const b = Math.round(237 + (94 - 237) * ((t - 0.5) * 2));
        return `rgb(${r},${g},${b})`;
    }
}

export function complexityColor(value: number, max: number): string {
    const t = Math.min(value / Math.max(max, 1), 1);
    return interpolateColor(t);
}

export function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

export const RISK_COLORS = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#f43f5e',
};

export const GRADE_COLORS: Record<string, string> = {
    'A+': '#10b981', 'A': '#10b981', 'A-': '#22c55e',
    'B+': '#84cc16', 'B': '#eab308', 'B-': '#f59e0b',
    'C+': '#f97316', 'C': '#f97316', 'C-': '#ef4444',
    'D': '#f43f5e', 'F': '#dc2626',
};
