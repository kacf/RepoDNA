import type { TreeNode, ArchitectureResult } from './types';
import { toGrade } from '../utils/format';

export function analyzeArchitecture(tree: TreeNode[]): ArchitectureResult {
    const files = tree.filter(n => n.type === 'blob');
    const dirs = tree.filter(n => n.type === 'tree');

    const breakdown: { name: string; score: number; max: number; detail: string }[] = [];

    // 1. Directory structure depth (3-5 levels is ideal)
    const depths = files.map(f => f.path.split('/').length);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / Math.max(depths.length, 1);
    const maxDepth = Math.max(...depths, 0);
    const depthScore = avgDepth >= 2 && avgDepth <= 5 ? 15 :
        avgDepth >= 1.5 && avgDepth <= 7 ? 10 : 5;
    breakdown.push({ name: 'Directory Depth', score: depthScore, max: 15, detail: `Avg depth: ${avgDepth.toFixed(1)}, Max: ${maxDepth}` });

    // 2. Separation of concerns (src/ lib/ test/ docs/ etc.)
    const rootDirs = new Set(dirs.filter(d => !d.path.includes('/')).map(d => d.path));
    const goodDirs = ['src', 'lib', 'test', 'tests', '__tests__', 'spec', 'docs', 'doc', 'scripts', 'config', 'public', 'assets', 'components', 'utils', 'hooks', 'services', 'api', 'types', 'models', 'views', 'controllers'];
    const matchedDirs = goodDirs.filter(d => rootDirs.has(d) || dirs.some(dir => dir.path.endsWith('/' + d)));
    const sepScore = Math.min(matchedDirs.length * 3, 15);
    breakdown.push({ name: 'Separation of Concerns', score: sepScore, max: 15, detail: `Found: ${matchedDirs.join(', ') || 'none'}` });

    // 3. File organization (files in subdirs vs root)
    const rootFiles = files.filter(f => !f.path.includes('/'));
    const nestedFiles = files.length - rootFiles.length;
    const nestRatio = nestedFiles / Math.max(files.length, 1);
    const orgScore = nestRatio > 0.7 ? 15 : nestRatio > 0.5 ? 10 : nestRatio > 0.3 ? 7 : 3;
    breakdown.push({ name: 'File Organization', score: orgScore, max: 15, detail: `${Math.round(nestRatio * 100)}% files in subdirectories` });

    // 4. Naming consistency (kebab-case, camelCase, snake_case)
    const fileNames = files.map(f => f.path.split('/').pop() || '').filter(n => !n.startsWith('.'));
    const kebab = fileNames.filter(n => /^[a-z][a-z0-9-]*\.[a-z]+$/.test(n)).length;
    const camel = fileNames.filter(n => /^[a-z][a-zA-Z0-9]*\.[a-z]+$/.test(n)).length;
    const pascal = fileNames.filter(n => /^[A-Z][a-zA-Z0-9]*\.[a-z]+$/.test(n)).length;
    const snake = fileNames.filter(n => /^[a-z][a-z0-9_]*\.[a-z]+$/.test(n)).length;
    const maxConsistency = Math.max(kebab, camel, pascal, snake);
    const consistencyRatio = maxConsistency / Math.max(fileNames.length, 1);
    const nameScore = consistencyRatio > 0.7 ? 10 : consistencyRatio > 0.5 ? 7 : 4;
    breakdown.push({ name: 'Naming Consistency', score: nameScore, max: 10, detail: `${Math.round(consistencyRatio * 100)}% consistent naming` });

    // 5. Config file presence (indicates mature project)
    const configFiles = ['.gitignore', '.editorconfig', '.prettierrc', '.eslintrc', 'tsconfig.json', 'jest.config', 'vite.config', 'webpack.config', '.env.example', 'Makefile', 'Dockerfile', 'docker-compose', '.github'];
    const foundConfigs = configFiles.filter(c => files.some(f => f.path.includes(c)) || dirs.some(d => d.path.includes(c)));
    const configScore = Math.min(foundConfigs.length * 2, 10);
    breakdown.push({ name: 'Project Config', score: configScore, max: 10, detail: `${foundConfigs.length} config files found` });

    // 6. Test presence
    const testFiles = files.filter(f => /\.(test|spec)\.[a-z]+$/.test(f.path) || /^(test|tests|__tests__|spec)\//.test(f.path));
    const testRatio = testFiles.length / Math.max(files.length, 1);
    const testScore = testRatio > 0.15 ? 10 : testRatio > 0.08 ? 7 : testRatio > 0.02 ? 4 : 0;
    breakdown.push({ name: 'Test Coverage', score: testScore, max: 10, detail: `${testFiles.length} test files (${Math.round(testRatio * 100)}%)` });

    // 7. Module size balance
    const dirFileCounts = new Map<string, number>();
    files.forEach(f => {
        const dir = f.path.includes('/') ? f.path.split('/')[0] : '.';
        dirFileCounts.set(dir, (dirFileCounts.get(dir) || 0) + 1);
    });
    const counts = [...dirFileCounts.values()];
    const maxFiles = Math.max(...counts, 0);
    const avgFiles = counts.reduce((a, b) => a + b, 0) / Math.max(counts.length, 1);
    const balanceRatio = maxFiles > 0 ? avgFiles / maxFiles : 0;
    const balanceScore = balanceRatio > 0.3 ? 10 : balanceRatio > 0.15 ? 7 : 4;
    breakdown.push({ name: 'Module Balance', score: balanceScore, max: 10, detail: `Balance ratio: ${balanceRatio.toFixed(2)}` });

    // 8. README and docs
    const hasReadme = files.some(f => f.path.toLowerCase() === 'readme.md' || f.path.toLowerCase() === 'readme');
    const hasDocs = dirs.some(d => ['docs', 'doc', 'documentation'].includes(d.path));
    const docScore = (hasReadme ? 5 : 0) + (hasDocs ? 5 : 0);
    breakdown.push({ name: 'Documentation', score: docScore, max: 10, detail: `README: ${hasReadme ? 'Yes' : 'No'}, Docs dir: ${hasDocs ? 'Yes' : 'No'}` });

    const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0);
    const maxScore = breakdown.reduce((sum, b) => sum + b.max, 0);
    const grade = toGrade(totalScore, maxScore);

    return { score: totalScore, maxScore, grade, breakdown };
}
