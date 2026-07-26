import type { TreeNode, DocsResult } from './types';
import { toGrade } from '../utils/format';

export function analyzeDocs(tree: TreeNode[], fileContents: Map<string, string>): DocsResult {
    const files = tree.filter(n => n.type === 'blob');
    const dirs = tree.filter(n => n.type === 'tree');
    const checks: { name: string; passed: boolean; detail: string; weight: number }[] = [];

    // 1. README exists
    const readmePath = files.find(f => /^readme\.md$/i.test(f.path))?.path;
    checks.push({ name: 'README.md', passed: !!readmePath, detail: readmePath ? 'Found' : 'Missing', weight: 15 });

    // 2. README length & quality
    const readmeContent = readmePath ? fileContents.get(readmePath) : null;
    const readmeLength = readmeContent?.length || 0;
    const readmeGood = readmeLength > 500;
    checks.push({ name: 'README Quality', passed: readmeGood, detail: `${readmeLength} chars${readmeGood ? '' : ' (too short)'}`, weight: 10 });

    // 3. README has sections (headers)
    const readmeHeaders = readmeContent ? (readmeContent.match(/^#{1,3}\s+.+/gm) || []).length : 0;
    checks.push({ name: 'README Sections', passed: readmeHeaders >= 3, detail: `${readmeHeaders} sections found`, weight: 8 });

    // 4. README has badges
    const hasBadges = readmeContent ? /\[!\[/.test(readmeContent) || /!\[.*badge/i.test(readmeContent) || /shields\.io/.test(readmeContent) : false;
    checks.push({ name: 'Badges', passed: hasBadges, detail: hasBadges ? 'Found' : 'None detected', weight: 3 });

    // 5. README has code examples
    const hasCodeBlocks = readmeContent ? /```[\s\S]*?```/.test(readmeContent) : false;
    checks.push({ name: 'Code Examples', passed: hasCodeBlocks, detail: hasCodeBlocks ? 'Found' : 'No code blocks', weight: 8 });

    // 6. README has installation instructions
    const hasInstall = readmeContent ? /install|getting started|setup|quick start/i.test(readmeContent) : false;
    checks.push({ name: 'Install Instructions', passed: hasInstall, detail: hasInstall ? 'Found' : 'Missing', weight: 8 });

    // 7. LICENSE file
    const hasLicense = files.some(f => /^license/i.test(f.path));
    checks.push({ name: 'LICENSE', passed: hasLicense, detail: hasLicense ? 'Found' : 'Missing', weight: 10 });

    // 8. CONTRIBUTING guide
    const hasContrib = files.some(f => /^contributing/i.test(f.path));
    checks.push({ name: 'CONTRIBUTING', passed: hasContrib, detail: hasContrib ? 'Found' : 'Missing', weight: 5 });

    // 9. CHANGELOG
    const hasChangelog = files.some(f => /^(changelog|changes|history)/i.test(f.path));
    checks.push({ name: 'CHANGELOG', passed: hasChangelog, detail: hasChangelog ? 'Found' : 'Missing', weight: 5 });

    // 10. Docs directory
    const hasDocs = dirs.some(d => /^(docs|doc|documentation)$/i.test(d.path));
    checks.push({ name: 'Docs Directory', passed: hasDocs, detail: hasDocs ? 'Found' : 'Missing', weight: 5 });

    // 11. Code of Conduct
    const hasCoc = files.some(f => /code.of.conduct/i.test(f.path));
    checks.push({ name: 'Code of Conduct', passed: hasCoc, detail: hasCoc ? 'Found' : 'Missing', weight: 3 });

    // 12. Issue/PR templates
    const hasTemplates = dirs.some(d => d.path.includes('.github')) &&
        files.some(f => f.path.includes('ISSUE_TEMPLATE') || f.path.includes('PULL_REQUEST_TEMPLATE'));
    checks.push({ name: 'Issue/PR Templates', passed: hasTemplates, detail: hasTemplates ? 'Found' : 'Missing', weight: 5 });

    // 13. Comments ratio in code
    let totalLines = 0, commentLines = 0;
    fileContents.forEach((content, path) => {
        const ext = path.split('.').pop()?.toLowerCase() || '';
        if (!['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'rb'].includes(ext)) return;
        const lines = content.split('\n');
        totalLines += lines.length;
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
                commentLines++;
            }
        });
    });
    const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;
    checks.push({ name: 'Code Comments', passed: commentRatio > 0.05, detail: `${Math.round(commentRatio * 100)}% comment ratio`, weight: 5 });

    // 14. API docs or type definitions
    const hasApiDocs = files.some(f => /\.(d\.ts|api\.md|openapi|swagger)/i.test(f.path));
    checks.push({ name: 'API Documentation', passed: hasApiDocs, detail: hasApiDocs ? 'Found' : 'None detected', weight: 5 });

    const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
    const maxScore = checks.reduce((sum, c) => sum + c.weight, 0);
    const grade = toGrade(score, maxScore);

    return {
        score, maxScore, grade, checks,
        readmeLength,
        hasContributing: hasContrib,
        hasLicense,
        hasChangelog,
    };
}
