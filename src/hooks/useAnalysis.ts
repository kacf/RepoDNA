import { useState, useCallback } from 'react';
import type { AnalysisResult, AnalysisProgress, ProgressCallback } from '../engine/types';
import { parseRepoUrl, fetchRepoInfo, fetchTree, fetchCommits, fetchLanguages, fetchContributors, fetchMultipleFiles } from '../api/github';
import { analyzeCodingPersonality } from '../engine/personality';
import { analyzeArchitecture } from '../engine/architecture';
import { analyzeDependencies } from '../engine/dependencies';
import { analyzeDebt } from '../engine/debt';
import { analyzeHotspots } from '../engine/hotspots';
import { analyzeContributors } from '../engine/contributors';
import { analyzeHeatmap } from '../engine/heatmap';
import { analyzeDeadCode } from '../engine/deadcode';
import { analyzeDocs } from '../engine/docs';
import { analyzeBusFactor } from '../engine/busfactor';
import { analyzeOwnership } from '../engine/ownership';
import { analyzeComplexity } from '../engine/complexity';
import { buildCity } from '../engine/city';

export function useAnalysis() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<AnalysisProgress>({ stage: '', progress: 0, detail: '' });
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const report: ProgressCallback = (p) => setProgress(p);

    const analyze = useCallback(async (input: string) => {
        setLoading(true);
        setError(null);
        setResult(null);
        const startTime = Date.now();

        try {
            const parsed = parseRepoUrl(input);
            if (!parsed) throw new Error('Invalid repository URL. Use format: github.com/owner/repo');
            const { owner, name } = parsed;

            // Stage 1: Fetch repo info
            report({ stage: 'Repository Info', progress: 5, detail: `Fetching ${owner}/${name}...` });
            const repo = await fetchRepoInfo(owner, name);

            // Stage 2: Fetch tree
            report({ stage: 'File Tree', progress: 15, detail: 'Loading repository structure...' });
            const tree = await fetchTree(owner, name, repo.defaultBranch);

            // Stage 3: Fetch commits
            report({ stage: 'Commit History', progress: 25, detail: 'Loading commit history...' });
            const commits = await fetchCommits(owner, name);

            // Stage 4: Fetch languages
            report({ stage: 'Languages', progress: 35, detail: 'Analyzing language distribution...' });
            const languages = await fetchLanguages(owner, name);

            // Stage 5: Fetch contributors
            report({ stage: 'Contributors', progress: 40, detail: 'Loading contributor data...' });
            const contributorData = await fetchContributors(owner, name);

            // Stage 6: Fetch key files for content analysis
            report({ stage: 'File Contents', progress: 45, detail: 'Fetching key files for analysis...' });
            const keyFiles = [
                'package.json', 'requirements.txt', 'go.mod', 'Cargo.toml', 'Gemfile',
                'README.md', 'readme.md',
            ];
            // Also fetch some code files for deeper analysis (limit to keep API calls manageable)
            const codeFiles = tree
                .filter(n => n.type === 'blob' && n.size && n.size < 50000)
                .filter(n => /\.(ts|tsx|js|jsx|py|go|rs|java|rb|cpp|c|h)$/.test(n.path))
                .slice(0, 30)
                .map(n => n.path);

            const filesToFetch = [...new Set([...keyFiles, ...codeFiles])];
            const fileContents = await fetchMultipleFiles(owner, name, filesToFetch, repo.defaultBranch);

            // Stage 7-19: Run all analyses
            report({ stage: 'Coding Personality', progress: 55, detail: 'Analyzing coding patterns...' });
            const personality = analyzeCodingPersonality(commits, languages);

            report({ stage: 'Architecture', progress: 60, detail: 'Scoring architecture quality...' });
            const architecture = analyzeArchitecture(tree);

            report({ stage: 'Dependencies', progress: 65, detail: 'Mapping dependency graph...' });
            const dependencies = analyzeDependencies(fileContents);

            report({ stage: 'Technical Debt', progress: 70, detail: 'Tracking technical debt...' });
            const debt = analyzeDebt(tree, commits, fileContents);

            report({ stage: 'Hotspots', progress: 73, detail: 'Detecting refactoring hotspots...' });
            const hotspots = analyzeHotspots(tree, commits);

            report({ stage: 'Contributors', progress: 76, detail: 'Building contributor network...' });
            const contributors = analyzeContributors(commits, contributorData);

            report({ stage: 'Commit Heatmap', progress: 79, detail: 'Generating commit heatmap...' });
            const heatmap = analyzeHeatmap(commits);

            report({ stage: 'Dead Code', progress: 82, detail: 'Estimating dead code...' });
            const deadCode = analyzeDeadCode(tree, fileContents);

            report({ stage: 'Documentation', progress: 85, detail: 'Scoring documentation...' });
            const docs = analyzeDocs(tree, fileContents);

            report({ stage: 'Bus Factor', progress: 88, detail: 'Calculating bus factor...' });
            const busFactor = analyzeBusFactor(commits, contributorData);

            report({ stage: 'File Ownership', progress: 91, detail: 'Mapping file ownership...' });
            const ownership = analyzeOwnership(commits);

            report({ stage: 'Complexity', progress: 94, detail: 'Mapping code complexity...' });
            const complexity = analyzeComplexity(tree, fileContents);

            report({ stage: 'Repository City', progress: 97, detail: 'Building repository city...' });
            const city = buildCity(complexity.files);

            report({ stage: 'Complete', progress: 100, detail: 'Analysis complete!' });

            const analysisResult: AnalysisResult = {
                repo, personality, architecture, dependencies, debt, hotspots,
                contributors, heatmap, deadCode, docs, busFactor, ownership,
                complexity, city,
                analyzedAt: new Date().toISOString(),
                analysisTime: Date.now() - startTime,
            };

            setResult(analysisResult);
        } catch (err: any) {
            setError(err.message || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    }, []);

    return { analyze, loading, progress, result, error };
}
