import type { DependencyResult, DependencyNode, DependencyEdge } from './types';

interface PackageJson {
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}

export function analyzeDependencies(fileContents: Map<string, string>): DependencyResult {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];
    const ecosystems: Set<string> = new Set();

    // Parse package.json
    const pkgJson = fileContents.get('package.json');
    if (pkgJson) {
        try {
            const pkg: PackageJson = JSON.parse(pkgJson);
            ecosystems.add('npm');
            const projectId = pkg.name || 'project';
            nodes.push({ id: projectId, name: projectId, type: 'internal', ecosystem: 'npm' });

            const addDeps = (deps: Record<string, string> | undefined, type: 'runtime' | 'dev' | 'peer') => {
                if (!deps) return;
                Object.entries(deps).forEach(([name, version]) => {
                    const id = `npm:${name}`;
                    if (!nodes.find(n => n.id === id)) {
                        nodes.push({ id, name, version, type, ecosystem: 'npm' });
                    }
                    edges.push({ source: projectId, target: id });
                });
            };

            addDeps(pkg.dependencies, 'runtime');
            addDeps(pkg.devDependencies, 'dev');
            addDeps(pkg.peerDependencies, 'peer');
        } catch { /* invalid JSON */ }
    }

    // Parse requirements.txt
    const reqTxt = fileContents.get('requirements.txt');
    if (reqTxt) {
        ecosystems.add('pip');
        const projectId = 'python-project';
        if (!nodes.find(n => n.id === projectId)) {
            nodes.push({ id: projectId, name: projectId, type: 'internal', ecosystem: 'pip' });
        }
        reqTxt.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const match = trimmed.match(/^([a-zA-Z0-9_.-]+)/);
            if (match) {
                const name = match[1];
                const id = `pip:${name}`;
                const versionMatch = trimmed.match(/[=<>!]+(.+)/);
                nodes.push({ id, name, version: versionMatch?.[1], type: 'runtime', ecosystem: 'pip' });
                edges.push({ source: projectId, target: id });
            }
        });
    }

    // Parse go.mod
    const goMod = fileContents.get('go.mod');
    if (goMod) {
        ecosystems.add('go');
        const moduleMatch = goMod.match(/module\s+(\S+)/);
        const projectId = moduleMatch?.[1] || 'go-project';
        if (!nodes.find(n => n.id === projectId)) {
            nodes.push({ id: projectId, name: projectId, type: 'internal', ecosystem: 'go' });
        }
        const requireBlock = goMod.match(/require\s*\(([\s\S]*?)\)/);
        if (requireBlock) {
            requireBlock[1].split('\n').forEach(line => {
                const match = line.trim().match(/^(\S+)\s+(\S+)/);
                if (match && !match[1].startsWith('//')) {
                    const id = `go:${match[1]}`;
                    nodes.push({ id, name: match[1], version: match[2], type: 'runtime', ecosystem: 'go' });
                    edges.push({ source: projectId, target: id });
                }
            });
        }
    }

    // Parse Cargo.toml
    const cargoToml = fileContents.get('Cargo.toml');
    if (cargoToml) {
        ecosystems.add('cargo');
        const nameMatch = cargoToml.match(/name\s*=\s*"([^"]+)"/);
        const projectId = nameMatch?.[1] || 'rust-project';
        if (!nodes.find(n => n.id === projectId)) {
            nodes.push({ id: projectId, name: projectId, type: 'internal', ecosystem: 'cargo' });
        }
        const depSection = cargoToml.match(/\[dependencies\]([\s\S]*?)(\[|$)/);
        if (depSection) {
            depSection[1].split('\n').forEach(line => {
                const match = line.trim().match(/^([a-zA-Z0-9_-]+)\s*=/);
                if (match) {
                    const id = `cargo:${match[1]}`;
                    nodes.push({ id, name: match[1], type: 'runtime', ecosystem: 'cargo' });
                    edges.push({ source: projectId, target: id });
                }
            });
        }
    }

    // Parse Gemfile
    const gemfile = fileContents.get('Gemfile');
    if (gemfile) {
        ecosystems.add('gem');
        const projectId = 'ruby-project';
        if (!nodes.find(n => n.id === projectId)) {
            nodes.push({ id: projectId, name: projectId, type: 'internal', ecosystem: 'gem' });
        }
        gemfile.split('\n').forEach(line => {
            const match = line.trim().match(/^gem\s+['"]([^'"]+)['"]/);
            if (match) {
                const id = `gem:${match[1]}`;
                nodes.push({ id, name: match[1], type: 'runtime', ecosystem: 'gem' });
                edges.push({ source: projectId, target: id });
            }
        });
    }

    const runtimeDeps = nodes.filter(n => n.type === 'runtime').length;
    const devDeps = nodes.filter(n => n.type === 'dev').length;

    return {
        nodes,
        edges,
        totalDeps: nodes.filter(n => n.type !== 'internal').length,
        devDeps,
        runtimeDeps,
        ecosystems: [...ecosystems],
    };
}
