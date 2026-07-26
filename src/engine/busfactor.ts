import type { CommitData, ContributorData, BusFactorResult } from './types';

export function analyzeBusFactor(commits: CommitData[], contributors: ContributorData[]): BusFactorResult {
    if (!commits.length || !contributors.length) {
        return {
            busFactor: 0,
            risk: 'critical',
            topOwners: [],
            explanation: 'Insufficient data to calculate bus factor.',
        };
    }

    // Count commits per author
    const authorCommits = new Map<string, Set<string>>();
    commits.forEach(c => {
        const author = c.author;
        if (!authorCommits.has(author)) authorCommits.set(author, new Set());
        c.filesChanged?.forEach(f => authorCommits.get(author)!.add(f));
    });

    // Get all unique files
    const allFiles = new Set<string>();
    authorCommits.forEach(files => files.forEach(f => allFiles.add(f)));
    const totalFiles = allFiles.size || 1;

    // Sort contributors by file ownership
    const ownershipData = [...authorCommits.entries()]
        .map(([login, files]) => ({
            login,
            filesOwned: files.size,
            percentage: Math.round((files.size / totalFiles) * 100),
        }))
        .sort((a, b) => b.filesOwned - a.filesOwned);

    // Calculate bus factor: minimum contributors who own >50% of files
    let cumulativeOwnership = 0;
    let busFactor = 0;
    const coveredFiles = new Set<string>();

    for (const owner of ownershipData) {
        const files = authorCommits.get(owner.login)!;
        files.forEach(f => coveredFiles.add(f));
        busFactor++;
        cumulativeOwnership = (coveredFiles.size / totalFiles) * 100;
        if (cumulativeOwnership >= 50) break;
    }

    // Determine risk level
    let risk: 'low' | 'medium' | 'high' | 'critical';
    if (busFactor >= 5) risk = 'low';
    else if (busFactor >= 3) risk = 'medium';
    else if (busFactor >= 2) risk = 'high';
    else risk = 'critical';

    const explanation = busFactor === 1
        ? `Critical: A single contributor owns over 50% of the codebase. If they leave, the project is at serious risk.`
        : busFactor <= 2
            ? `High risk: Only ${busFactor} contributors own the majority of the codebase.`
            : busFactor <= 4
                ? `Moderate: ${busFactor} contributors cover the core codebase. Consider spreading ownership.`
                : `Healthy: ${busFactor} contributors share broad ownership across the codebase.`;

    return {
        busFactor,
        risk,
        topOwners: ownershipData.slice(0, 10),
        explanation,
    };
}
