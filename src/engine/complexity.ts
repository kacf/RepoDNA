import type { TreeNode, ComplexityResult, ComplexityFile } from './types';

export function analyzeComplexity(tree: TreeNode[], fileContents: Map<string, string>): ComplexityResult {
    const codeExtensions = new Set(['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'h', 'rb', 'php', 'cs', 'swift', 'kt', 'scala', 'vue', 'svelte']);

    const files: ComplexityFile[] = [];

    tree.filter(n => n.type === 'blob').forEach(node => {
        const ext = node.path.split('.').pop()?.toLowerCase() || '';
        if (!codeExtensions.has(ext)) return;

        const content = fileContents.get(node.path);
        const size = node.size || 0;
        let loc = 0;
        let complexity = 0;

        if (content) {
            const lines = content.split('\n');
            loc = lines.filter(l => l.trim().length > 0).length;

            // Cyclomatic complexity heuristic
            let nestingDepth = 0;
            let maxNesting = 0;
            let branchCount = 0;

            lines.forEach(line => {
                const trimmed = line.trim();
                // Count branching keywords
                if (/^(if|else|elif|for|while|switch|case|catch|except|when)\b/.test(trimmed) ||
                    /\b(if|else|for|while|switch|case|catch)\s*[({]/.test(trimmed)) {
                    branchCount++;
                }
                // Track nesting via braces/indentation
                const opens = (trimmed.match(/{/g) || []).length;
                const closes = (trimmed.match(/}/g) || []).length;
                nestingDepth += opens - closes;
                maxNesting = Math.max(maxNesting, nestingDepth);
            });

            // Complexity score: combination of LOC, branching, and nesting
            complexity = Math.round(
                (loc * 0.3) + (branchCount * 2) + (maxNesting * 5)
            );
        } else {
            // Estimate from file size
            loc = Math.round(size / 40); // ~40 bytes per line average
            complexity = Math.round(loc * 0.3);
        }

        const parts = node.path.split('/');
        const directory = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';

        files.push({ path: node.path, loc, size, complexity, directory });
    });

    // Aggregate by directory
    const dirMap = new Map<string, { totalLoc: number; totalComplexity: number; fileCount: number }>();
    files.forEach(f => {
        if (!dirMap.has(f.directory)) dirMap.set(f.directory, { totalLoc: 0, totalComplexity: 0, fileCount: 0 });
        const d = dirMap.get(f.directory)!;
        d.totalLoc += f.loc;
        d.totalComplexity += f.complexity;
        d.fileCount++;
    });

    const directories = [...dirMap.entries()].map(([path, data]) => ({
        path,
        totalLoc: data.totalLoc,
        avgComplexity: Math.round(data.totalComplexity / data.fileCount),
        fileCount: data.fileCount,
    })).sort((a, b) => b.totalLoc - a.totalLoc);

    const totalLoc = files.reduce((sum, f) => sum + f.loc, 0);
    const avgComplexity = files.length > 0
        ? Math.round(files.reduce((sum, f) => sum + f.complexity, 0) / files.length)
        : 0;

    const maxComplexity = files.reduce(
        (max, f) => f.complexity > max.value ? { path: f.path, value: f.complexity } : max,
        { path: '', value: 0 }
    );

    return { files, totalLoc, avgComplexity, maxComplexity, directories };
}
