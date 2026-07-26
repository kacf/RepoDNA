import type { TreeNode, DeadCodeResult } from './types';

export function analyzeDeadCode(tree: TreeNode[], fileContents: Map<string, string>): DeadCodeResult {
    const files = tree.filter(n => n.type === 'blob');
    const codeExtensions = new Set(['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'rb', 'php', 'cs', 'vue', 'svelte']);
    const configFiles = new Set(['config', 'rc', 'env', 'yml', 'yaml', 'json', 'toml', 'ini', 'cfg']);

    const codeFiles = files.filter(f => {
        const ext = f.path.split('.').pop()?.toLowerCase() || '';
        return codeExtensions.has(ext);
    });

    // Check which files are imported/required by others
    const referencedFiles = new Set<string>();
    fileContents.forEach((content, _path) => {
        // ES6 imports: import ... from './path'
        const importMatches = content.matchAll(/(?:import|from)\s+['"]([^'"]+)['"]/g);
        for (const m of importMatches) {
            const imp = m[1];
            // Resolve relative imports
            const baseName = imp.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
            if (baseName) referencedFiles.add(baseName);
        }

        // require() calls
        const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
        for (const m of requireMatches) {
            const baseName = m[1].split('/').pop()?.replace(/\.[^.]+$/, '') || '';
            if (baseName) referencedFiles.add(baseName);
        }
    });

    // Find orphan files: not imported by anyone
    const orphanFiles: string[] = [];
    const potentialDeadFiles: { path: string; reason: string }[] = [];

    codeFiles.forEach(f => {
        const name = (f.path.split('/').pop() || '').replace(/\.[^.]+$/, '');
        const isEntry = ['index', 'main', 'app', 'server', 'mod', 'lib'].includes(name.toLowerCase());
        const isTest = /\.(test|spec)$/.test(name) || f.path.includes('test/') || f.path.includes('__tests__/');
        const isConfig = f.path.split('/').pop()?.startsWith('.') || false;

        if (!isEntry && !isTest && !isConfig && !referencedFiles.has(name)) {
            orphanFiles.push(f.path);
            potentialDeadFiles.push({ path: f.path, reason: 'Not imported by any other file' });
        }
    });

    // Unused config files
    const unusedConfigs: string[] = [];
    files.forEach(f => {
        const ext = f.path.split('.').pop()?.toLowerCase() || '';
        const name = f.path.split('/').pop() || '';
        if (configFiles.has(ext) && name.startsWith('.') && !['gitignore', 'env', 'env.example', 'editorconfig'].some(n => name.includes(n))) {
            const relatedTool = name.replace(/^\./, '').replace(/rc$/, '').replace(/\.[^.]+$/, '');
            const hasRelatedDep = fileContents.get('package.json')?.includes(relatedTool) || false;
            if (!hasRelatedDep) {
                unusedConfigs.push(f.path);
                potentialDeadFiles.push({ path: f.path, reason: 'Config file for uninstalled tool' });
            }
        }
    });

    const estimatedPercentage = codeFiles.length > 0
        ? Math.round((orphanFiles.length / codeFiles.length) * 100)
        : 0;

    return {
        estimatedPercentage: Math.min(estimatedPercentage, 40), // Cap at 40% since this is heuristic
        orphanFiles: orphanFiles.slice(0, 20),
        unusedConfigs,
        potentialDeadFiles: potentialDeadFiles.slice(0, 25),
        totalFiles: codeFiles.length,
        deadFileCount: orphanFiles.length,
    };
}
