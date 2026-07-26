import type { CommitData, ContributorData, ContributorResult, ContributorNode, ContributorEdge } from './types';

export function analyzeContributors(commits: CommitData[], contributors: ContributorData[]): ContributorResult {
    // Build contributor nodes
    const authorMap = new Map<string, { commits: number; files: Set<string> }>();
    commits.forEach(c => {
        const key = c.author;
        if (!authorMap.has(key)) authorMap.set(key, { commits: 0, files: new Set() });
        const data = authorMap.get(key)!;
        data.commits++;
        c.filesChanged?.forEach(f => data.files.add(f));
    });

    const nodes: ContributorNode[] = contributors.map(c => {
        const authorData = authorMap.get(c.login) || authorMap.get(c.login.toLowerCase());
        return {
            id: c.login,
            login: c.login,
            avatarUrl: c.avatarUrl,
            contributions: c.contributions,
            filesOwned: authorData?.files.size || 0,
        };
    });

    // If contributors from API don't cover all commit authors, add them
    authorMap.forEach((data, author) => {
        if (!nodes.find(n => n.login === author || n.login.toLowerCase() === author.toLowerCase())) {
            nodes.push({
                id: author,
                login: author,
                avatarUrl: '',
                contributions: data.commits,
                filesOwned: data.files.size,
            });
        }
    });

    // Build edges: contributors who touched the same files
    const edges: ContributorEdge[] = [];
    const nodeIds = nodes.map(n => n.id);

    for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
            const filesA = authorMap.get(nodeIds[i])?.files || new Set();
            const filesB = authorMap.get(nodeIds[j])?.files || new Set();
            let shared = 0;
            filesA.forEach(f => { if (filesB.has(f)) shared++; });
            if (shared > 0) {
                edges.push({ source: nodeIds[i], target: nodeIds[j], sharedFiles: shared });
            }
        }
    }

    return {
        nodes: nodes.slice(0, 30), // Limit for visualization performance
        edges: edges.sort((a, b) => b.sharedFiles - a.sharedFiles).slice(0, 100),
        totalContributors: nodes.length,
    };
}
