export interface StoredGitHub {
  overallScore: number;
  profileScore: number;
  repositoryScore: number;
  documentationScore: number;
  diversityScore: number;
  suggestions: string[];
  strengths: string[];
  username: string;
  savedAt: number;
}

export interface StoredResume {
  overallScore: number;
  atsScore: number;
  technicalScore: number;
  readabilityScore: number;
  grammarScore: number;
  improvements: string[];
  strengths: string[];
  filename: string;
  savedAt: number;
}

export interface StoredPortfolio {
  overallScore: number;
  uxScore: number;
  accessibilityScore: number;
  seoScore: number;
  contentScore: number;
  suggestions: string[];
  issues: string[];
  url: string;
  savedAt: number;
}

const KEYS = { github: 'ds_github', resume: 'ds_resume', portfolio: 'ds_portfolio' };

function load<T>(key: string): T | null {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; }
}

export const saveGitHub = (d: Omit<StoredGitHub, 'savedAt'>) =>
  sessionStorage.setItem(KEYS.github, JSON.stringify({ ...d, savedAt: Date.now() }));

export const saveResume = (d: Omit<StoredResume, 'savedAt'>) =>
  sessionStorage.setItem(KEYS.resume, JSON.stringify({ ...d, savedAt: Date.now() }));

export const savePortfolio = (d: Omit<StoredPortfolio, 'savedAt'>) =>
  sessionStorage.setItem(KEYS.portfolio, JSON.stringify({ ...d, savedAt: Date.now() }));

export const loadGitHub = () => load<StoredGitHub>(KEYS.github);
export const loadResume = () => load<StoredResume>(KEYS.resume);
export const loadPortfolio = () => load<StoredPortfolio>(KEYS.portfolio);

export function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
