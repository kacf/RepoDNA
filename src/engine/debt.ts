import type { TreeNode, CommitData, DebtResult, DebtDataPoint } from './types';

export function analyzeDebt(tree: TreeNode[], commits: CommitData[], fileContents: Map<string, string>): DebtResult {
    const files = tree.filter(n => n.type === 'blob');

    // Count TODO/FIXME/HACK markers in file contents
    let totalTodos = 0, totalFixmes = 0, totalHacks = 0;
    const todoFiles: string[] = [];
    const fixmeFiles: string[] = [];
    const hackFiles: string[] = [];

    fileContents.forEach((content, path) => {
        const todoCount = (content.match(/\bTODO\b/gi) || []).length;
        const fixmeCount = (content.match(/\bFIXME\b/gi) || []).length;
        const hackCount = (content.match(/\bHACK\b/gi) || []).length;
        if (todoCount > 0) { totalTodos += todoCount; todoFiles.push(path); }
        if (fixmeCount > 0) { totalFixmes += fixmeCount; fixmeFiles.push(path); }
        if (hackCount > 0) { totalHacks += hackCount; hackFiles.push(path); }
    });

    // Stale files: files not modified in recent commits
    const recentlyModified = new Set<string>();
    commits.forEach(c => {
        c.filesChanged?.forEach(f => recentlyModified.add(f));
    });

    // Estimate stale files
    const codeExtensions = new Set(['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'h', 'rb', 'php', 'cs', 'swift', 'kt']);
    const codeFiles = files.filter(f => {
        const ext = f.path.split('.').pop()?.toLowerCase() || '';
        return codeExtensions.has(ext);
    });

    // Build approximate timeline based on commit dates
    const timeline: DebtDataPoint[] = [];
    if (commits.length > 0) {
        const sortedCommits = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const bucketSize = Math.max(Math.floor(sortedCommits.length / 12), 1);

        let accTodos = 0, accFixmes = 0, accHacks = 0;
        for (let i = 0; i < sortedCommits.length; i += bucketSize) {
            const bucket = sortedCommits.slice(i, i + bucketSize);
            const date = bucket[bucket.length - 1].date;

            // Simulate debt accumulation based on commit messages
            bucket.forEach(c => {
                const msg = c.message.toLowerCase();
                if (msg.includes('todo')) accTodos++;
                if (msg.includes('fixme') || msg.includes('fix me')) accFixmes++;
                if (msg.includes('hack') || msg.includes('workaround') || msg.includes('temporary')) accHacks++;
                if (msg.includes('refactor') || msg.includes('cleanup') || msg.includes('clean up')) {
                    accTodos = Math.max(0, accTodos - 1);
                    accFixmes = Math.max(0, accFixmes - 1);
                }
            });

            const staleEstimate = Math.floor(codeFiles.length * (i / sortedCommits.length) * 0.1);

            timeline.push({
                date,
                todos: accTodos + Math.floor(totalTodos * (i / sortedCommits.length)),
                fixmes: accFixmes + Math.floor(totalFixmes * (i / sortedCommits.length)),
                hacks: accHacks + Math.floor(totalHacks * (i / sortedCommits.length)),
                staleFiles: staleEstimate,
                totalDebt: accTodos + accFixmes + accHacks + Math.floor(totalTodos * (i / sortedCommits.length)) + staleEstimate,
            });
        }
    }

    const currentDebt = totalTodos + totalFixmes + totalHacks;
    const debtTrend = timeline.length >= 2
        ? timeline[timeline.length - 1].totalDebt > timeline[Math.floor(timeline.length / 2)].totalDebt ? 'increasing' : 'decreasing'
        : 'stable';

    const topIssues: { type: string; count: number; files: string[] }[] = [];
    if (totalTodos > 0) topIssues.push({ type: 'TODO', count: totalTodos, files: todoFiles.slice(0, 5) });
    if (totalFixmes > 0) topIssues.push({ type: 'FIXME', count: totalFixmes, files: fixmeFiles.slice(0, 5) });
    if (totalHacks > 0) topIssues.push({ type: 'HACK', count: totalHacks, files: hackFiles.slice(0, 5) });
    topIssues.sort((a, b) => b.count - a.count);

    return { timeline, currentDebt, debtTrend, topIssues };
}
