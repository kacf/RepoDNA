export function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

export function formatPercentage(n: number, decimals = 1): string {
    return n.toFixed(decimals) + '%';
}

export function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)}s`;
    return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

export function toGrade(score: number, max: number): string {
    const pct = (score / max) * 100;
    if (pct >= 95) return 'A+';
    if (pct >= 90) return 'A';
    if (pct >= 85) return 'A-';
    if (pct >= 80) return 'B+';
    if (pct >= 75) return 'B';
    if (pct >= 70) return 'B-';
    if (pct >= 65) return 'C+';
    if (pct >= 60) return 'C';
    if (pct >= 55) return 'C-';
    if (pct >= 50) return 'D';
    return 'F';
}

export function truncatePath(path: string, maxLen = 40): string {
    if (path.length <= maxLen) return path;
    const parts = path.split('/');
    if (parts.length <= 2) return '...' + path.slice(-maxLen + 3);
    return parts[0] + '/.../' + parts[parts.length - 1];
}

export function fileExtension(path: string): string {
    const dot = path.lastIndexOf('.');
    return dot >= 0 ? path.slice(dot + 1).toLowerCase() : '';
}

export function fileName(path: string): string {
    return path.split('/').pop() || path;
}

export function directoryPath(path: string): string {
    const parts = path.split('/');
    return parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
