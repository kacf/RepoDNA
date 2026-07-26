import type { CommitData, OwnershipResult, OwnershipFile } from './types';

export function analyzeOwnership(commits: CommitData[]): OwnershipResult {
    // Build per-file commit counts per author
    const fileCommits = new Map<string, Map<string, number>>();

    commits.forEach(c => {
        c.filesChanged?.forEach(f => {
            if (!fileCommits.has(f)) fileCommits.set(f, new Map());
            const authors = fileCommits.get(f)!;
            authors.set(c.author, (authors.get(c.author) || 0) + 1);
        });
    });

    // Determine primary owner for each file
    const files: OwnershipFile[] = [];
    const ownerFileCounts = new Map<string, number>();

    fileCommits.forEach((authors, path) => {
        let primaryOwner = '';
        let maxCommits = 0;
        let total = 0;
        authors.forEach((count, author) => {
            total += count;
            if (count > maxCommits) {
                maxCommits = count;
                primaryOwner = author;
            }
        });

        files.push({
            path,
            primaryOwner,
            ownerCommits: maxCommits,
            totalCommits: total,
            ownershipPercentage: Math.round((maxCommits / total) * 100),
        });

        ownerFileCounts.set(primaryOwner, (ownerFileCounts.get(primaryOwner) || 0) + 1);
    });

    // Build owner summary
    const totalFiles = files.length || 1;
    const owners = [...ownerFileCounts.entries()]
        .map(([login, fileCount]) => ({
            login,
            fileCount,
            percentage: Math.round((fileCount / totalFiles) * 100),
        }))
        .sort((a, b) => b.fileCount - a.fileCount);

    return {
        files: files.sort((a, b) => b.ownershipPercentage - a.ownershipPercentage).slice(0, 100),
        owners: owners.slice(0, 20),
    };
}
