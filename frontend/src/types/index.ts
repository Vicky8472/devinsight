export interface ResumeAnalysisResult {
  overallScore: number;
  atsScore: number;
  technicalScore: number;
  readabilityScore: number;
  grammarScore: number;
  improvementChecklist: string[];
  suggestions: { before: string; after: string }[];
  keywords: string[];
  missingSkills: string[];
}

export interface GitHubAnalysisResult {
  overallScore: number;
  profileScore: number;
  repositoryScore: number;
  documentationScore: number;
  diversityScore: number;
  suggestions: string[];
  topRepos: { name: string; description: string; stars: number; language: string }[];
  languages: { name: string; percentage: number }[];
}

export interface PortfolioAnalysisResult {
  overallScore: number;
  uxScore: number;
  accessibilityScore: number;
  seoScore: number;
  contentScore: number;
  suggestions: string[];
  issues: string[];
}

export interface CareerDashboard {
  overallCareerScore: number;
  resume: ResumeAnalysisResult | null;
  github: GitHubAnalysisResult | null;
  portfolio: PortfolioAnalysisResult | null;
}

export interface User {
  id: string;
  email: string;
}
