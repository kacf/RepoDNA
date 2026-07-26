import type { TreeNode, CommitData, HotspotResult, HotspotFile } from './types';

export function analyzeHotspots(tree: TreeNode[], commits: CommitData[]): HotspotResult {
    const files = tree.filter(n => n.type === 'blob');

    // Count how many commits mention each file (churn)
    const fileChurn = new Map<string, number>();
    const fileLastModified = new Map<string, string>();

    commits.forEach(c => {
        if (c.filesChanged) {
            c.filesChanged.forEach(f => {
                fileChurn.set(f, (fileChurn.get(f) || 0) + 1);
                if (!fileLastModified.has(f) || new Date(c.date) > new Date(fileLastModified.get(f)!)) {
                    fileLastModified.set(f, c.date);
                }
            });
        }
    });

    // Estimate complexity from file size and path depth
    const codeExtensions = new Set(['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'h', 'rb', 'php', 'cs', 'swift', 'kt', 'scala', 'vue', 'svelte']);

    const hotspots: HotspotFile[] = files
        .filter(f => {
            const ext = f.path.split('.').pop()?.toLowerCase() || '';
            return codeExtensions.has(ext);
        })
        .map(f => {
            const churn = fileChurn.get(f.path) || 1;
            const size = f.size || 100;
            // complexity heuristic: larger files tend to be more complex
            const complexity = Math.log2(size + 1) * (f.path.split('/').length * 0.5);
            const score = churn * complexity;
            return {
                path: f.path,
                churn,
                complexity: Math.round(complexity * 10) / 10,
                score: Math.round(score * 10) / 10,
                lastModified: fileLastModified.get(f.path) || '',
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);

    const criticalThreshold = hotspots.length > 0 ? hotspots[0].score * 0.6 : 0;
    const criticalCount = hotspots.filter(h => h.score >= criticalThreshold).length;

    return {
        files: hotspots,
        totalHotspots: hotspots.length,
        criticalCount,
    };
}
