import type { RepoInfo, TreeNode, CommitData, ContributorData, LanguageData, FileContent } from '../engine/types';

const API_BASE = 'https://api.github.com';
const CACHE_PREFIX = 'repodna_';

let rateLimitRemaining = 60;
let rateLimitReset = 0;

function getCached<T>(key: string): T | null {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const { data, expiry } = JSON.parse(raw);
        if (Date.now() > expiry) {
            sessionStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return data as T;
    } catch { return null; }
}

function setCache(key: string, data: unknown, ttlMs = 600000): void {
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expiry: Date.now() + ttlMs }));
    } catch { /* storage full */ }
}

function getToken(): string | null {
    return sessionStorage.getItem('repodna_gh_token') || null;
}

export function setToken(token: string): void {
    sessionStorage.setItem('repodna_gh_token', token);
}

export function getRateLimit(): { remaining: number; reset: number } {
    return { remaining: rateLimitRemaining, reset: rateLimitReset };
}

async function apiFetch<T>(path: string, cacheKey?: string): Promise<T> {
    if (cacheKey) {
        const cached = getCached<T>(cacheKey);
        if (cached) return cached;
    }

    if (rateLimitRemaining <= 1 && Date.now() / 1000 < rateLimitReset) {
        throw new Error(`GitHub API rate limit exceeded. Resets at ${new Date(rateLimitReset * 1000).toLocaleTimeString()}`);
    }

    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
    };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { headers });

    const remaining = res.headers.get('X-RateLimit-Remaining');
    const reset = res.headers.get('X-RateLimit-Reset');
    if (remaining) rateLimitRemaining = parseInt(remaining, 10);
    if (reset) rateLimitReset = parseInt(reset, 10);

    if (!res.ok) {
        if (res.status === 403 && rateLimitRemaining === 0) {
            throw new Error(`Rate limit exceeded. Resets at ${new Date(rateLimitReset * 1000).toLocaleTimeString()}`);
        }
        if (res.status === 404) throw new Error('Repository not found. Make sure it is public.');
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as T;
    if (cacheKey) setCache(cacheKey, data);
    return data;
}

export function parseRepoUrl(input: string): { owner: string; name: string } | null {
    const cleaned = input.trim().replace(/\/+$/, '');
    // https://github.com/owner/repo or github.com/owner/repo
    const urlMatch = cleaned.match(/(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)/);
    if (urlMatch) return { owner: urlMatch[1], name: urlMatch[2].replace(/\.git$/, '') };
    // owner/repo
    const slashMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (slashMatch) return { owner: slashMatch[1], name: slashMatch[2] };
    return null;
}

export async function fetchRepoInfo(owner: string, name: string): Promise<RepoInfo> {
    const key = `repo_${owner}_${name}`;
    const raw = await apiFetch<any>(`/repos/${owner}/${name}`, key);
    return {
        owner,
        name,
        fullName: raw.full_name,
        description: raw.description || '',
        stars: raw.stargazers_count,
        forks: raw.forks_count,
        watchers: raw.watchers_count,
        defaultBranch: raw.default_branch,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        size: raw.size,
        language: raw.language || 'Unknown',
        topics: raw.topics || [],
        license: raw.license?.spdx_id || null,
        openIssues: raw.open_issues_count,
        hasWiki: raw.has_wiki,
        hasPages: raw.has_pages,
    };
}

export async function fetchTree(owner: string, name: string, branch: string): Promise<TreeNode[]> {
    const key = `tree_${owner}_${name}_${branch}`;
    const raw = await apiFetch<any>(`/repos/${owner}/${name}/git/trees/${branch}?recursive=1`, key);
    return (raw.tree || []).map((n: any) => ({
        path: n.path,
        type: n.type,
        size: n.size,
        sha: n.sha,
    }));
}

export async function fetchCommits(owner: string, name: string, perPage = 100, maxPages = 5): Promise<CommitData[]> {
    const actualMaxPages = getToken() ? maxPages : 2; // Save API quota for unauthenticated users
    const key = `commits_${owner}_${name}_${perPage}_${actualMaxPages}`;
    const cached = getCached<CommitData[]>(key);
    if (cached) return cached;

    const allCommits: CommitData[] = [];
    for (let page = 1; page <= actualMaxPages; page++) {
        const raw = await apiFetch<any[]>(`/repos/${owner}/${name}/commits?per_page=${perPage}&page=${page}`);
        if (!raw.length) break;
        for (const c of raw) {
            allCommits.push({
                sha: c.sha,
                message: c.commit?.message || '',
                author: c.commit?.author?.name || c.author?.login || 'unknown',
                authorEmail: c.commit?.author?.email || '',
                date: c.commit?.author?.date || '',
            });
        }
        if (raw.length < perPage) break;
    }
    setCache(key, allCommits);
    return allCommits;
}

export async function fetchLanguages(owner: string, name: string): Promise<LanguageData> {
    return apiFetch<LanguageData>(`/repos/${owner}/${name}/languages`, `langs_${owner}_${name}`);
}

export async function fetchContributors(owner: string, name: string): Promise<ContributorData[]> {
    const key = `contribs_${owner}_${name}`;
    const raw = await apiFetch<any[]>(`/repos/${owner}/${name}/contributors?per_page=100`, key);
    return raw.map((c: any) => ({
        login: c.login,
        avatarUrl: c.avatar_url,
        contributions: c.contributions,
    }));
}

export async function fetchFileContent(owner: string, name: string, path: string, branch: string = 'master'): Promise<FileContent | null> {
    try {
        const key = `rawfile_${owner}_${name}_${path}_${branch}`;
        const cached = getCached<FileContent>(key);
        if (cached) return cached;

        // Fetch from raw.githubusercontent.com to completely bypass API rate limits
        const res = await fetch(`https://raw.githubusercontent.com/${owner}/${name}/${branch}/${path}`);
        if (!res.ok) return null;

        const content = await res.text();
        const data: FileContent = { path, content, size: content.length, encoding: 'utf-8' };
        setCache(key, data);
        return data;
    } catch { return null; }
}

export async function fetchMultipleFiles(owner: string, name: string, paths: string[], branch: string = 'master'): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    const promises = paths.map(async (p) => {
        const file = await fetchFileContent(owner, name, p, branch);
        if (file) results.set(p, file.content);
    });
    await Promise.allSettled(promises);
    return results;
}
