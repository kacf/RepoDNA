export interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  watchers: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  language: string;
  topics: string[];
  license: string | null;
  openIssues: number;
  hasWiki: boolean;
  hasPages: boolean;
}

export interface TreeNode {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
}

export interface CommitData {
  sha: string;
  message: string;
  author: string;
  authorEmail: string;
  date: string;
  additions?: number;
  deletions?: number;
  filesChanged?: string[];
}

export interface ContributorData {
  login: string;
  avatarUrl: string;
  contributions: number;
}

export interface LanguageData {
  [lang: string]: number;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  encoding: string;
}

// Analysis Results
export interface CodingPersonality {
  type: string;
  title: string;
  description: string;
  traits: { name: string; value: number; label: string }[];
  commitStyle: string;
  activeHours: string;
  topLanguage: string;
  avgCommitSize: string;
}

export interface ArchitectureResult {
  score: number;
  maxScore: number;
  grade: string;
  breakdown: { name: string; score: number; max: number; detail: string }[];
}

export interface DependencyNode {
  id: string;
  name: string;
  version?: string;
  type: 'runtime' | 'dev' | 'peer' | 'internal';
  ecosystem?: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
}

export interface DependencyResult {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  totalDeps: number;
  devDeps: number;
  runtimeDeps: number;
  ecosystems: string[];
}

export interface DebtDataPoint {
  date: string;
  todos: number;
  fixmes: number;
  hacks: number;
  staleFiles: number;
  totalDebt: number;
}

export interface DebtResult {
  timeline: DebtDataPoint[];
  currentDebt: number;
  debtTrend: 'increasing' | 'decreasing' | 'stable';
  topIssues: { type: string; count: number; files: string[] }[];
}

export interface HotspotFile {
  path: string;
  churn: number;
  complexity: number;
  score: number;
  lastModified: string;
}

export interface HotspotResult {
  files: HotspotFile[];
  totalHotspots: number;
  criticalCount: number;
}

export interface ContributorNode {
  id: string;
  login: string;
  avatarUrl: string;
  contributions: number;
  filesOwned: number;
}

export interface ContributorEdge {
  source: string;
  target: string;
  sharedFiles: number;
}

export interface ContributorResult {
  nodes: ContributorNode[];
  edges: ContributorEdge[];
  totalContributors: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}

export interface HeatmapResult {
  cells: HeatmapCell[];
  maxCount: number;
  totalCommits: number;
  peakDay: string;
  peakHour: number;
}

export interface DeadCodeResult {
  estimatedPercentage: number;
  orphanFiles: string[];
  unusedConfigs: string[];
  potentialDeadFiles: { path: string; reason: string }[];
  totalFiles: number;
  deadFileCount: number;
}

export interface DocsResult {
  score: number;
  maxScore: number;
  grade: string;
  checks: { name: string; passed: boolean; detail: string; weight: number }[];
  readmeLength: number;
  hasContributing: boolean;
  hasLicense: boolean;
  hasChangelog: boolean;
}

export interface BusFactorResult {
  busFactor: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  topOwners: { login: string; percentage: number; filesOwned: number }[];
  explanation: string;
}

export interface OwnershipFile {
  path: string;
  primaryOwner: string;
  ownerCommits: number;
  totalCommits: number;
  ownershipPercentage: number;
}

export interface OwnershipResult {
  files: OwnershipFile[];
  owners: { login: string; fileCount: number; percentage: number }[];
}

export interface ComplexityFile {
  path: string;
  loc: number;
  size: number;
  complexity: number;
  directory: string;
}

export interface ComplexityResult {
  files: ComplexityFile[];
  totalLoc: number;
  avgComplexity: number;
  maxComplexity: { path: string; value: number };
  directories: { path: string; totalLoc: number; avgComplexity: number; fileCount: number }[];
}

export interface CityBuilding {
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  path: string;
  loc: number;
  complexity: number;
  directory: string;
}

export interface CityBlock {
  x: number;
  y: number;
  width: number;
  depth: number;
  directory: string;
  buildings: CityBuilding[];
}

export interface CityResult {
  blocks: CityBlock[];
  buildings: CityBuilding[];
  totalBuildings: number;
}

export interface AnalysisResult {
  repo: RepoInfo;
  personality: CodingPersonality;
  architecture: ArchitectureResult;
  dependencies: DependencyResult;
  debt: DebtResult;
  hotspots: HotspotResult;
  contributors: ContributorResult;
  heatmap: HeatmapResult;
  deadCode: DeadCodeResult;
  docs: DocsResult;
  busFactor: BusFactorResult;
  ownership: OwnershipResult;
  complexity: ComplexityResult;
  city: CityResult;
  analyzedAt: string;
  analysisTime: number;
}

export interface AnalysisProgress {
  stage: string;
  progress: number;
  detail: string;
}

export type ProgressCallback = (progress: AnalysisProgress) => void;
