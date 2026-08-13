import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, GitBranch, Users, BookOpen, Lightbulb, Star } from 'lucide-react';
import AppShell from '../components/AppShell';
import ScoreRing from '../components/ScoreRing';
import { api } from '../services/api';
import { saveGitHub } from '../utils/analysisStore';

interface GitHubResult {
  overallScore: number;
  profileScore: number;
  repositoryScore: number;
  documentationScore: number;
  diversityScore: number;
  summary: string;
  strengths: string[];
  suggestions: string[];
  topRepos: { name: string; description: string; impact: string }[];
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  publicRepos: number;
  followers: number;
  languages: Record<string, number>;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3776ab',
  Java: '#ed8b00', 'C++': '#00599c', C: '#555555', Go: '#00add8',
  Rust: '#dea584', Swift: '#f05138', Kotlin: '#7f52ff', Ruby: '#cc342d',
  PHP: '#777bb4', CSS: '#563d7c', HTML: '#e34c26', Shell: '#89e051',
  Dart: '#00b4ab', Vue: '#41b883', Svelte: '#ff3e00',
};

const LOADING_STEPS = [
  'Fetching GitHub profile…',
  'Analysing repositories…',
  'Running AI analysis…',
  'Generating suggestions…',
];

function scoreColor(s: number) {
  if (s >= 75) return '#34d399';
  if (s >= 50) return '#60a5fa';
  if (s >= 25) return '#f59e0b';
  return '#f87171';
}

export default function GitHubAnalyzer() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<GitHubResult | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (status !== 'loading') return;
    setStep(0);
    const intervals = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 900)
    );
    return () => intervals.forEach(clearTimeout);
  }, [status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const data = await api.analyzeGitHub(username.trim()) as GitHubResult;
      saveGitHub(data);
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setStatus('error');
    }
  };

  const totalLangs = Object.values(result?.languages ?? {}).reduce((a, b) => a + b, 0);

  const isIdle = status === 'idle';

  return (
    <AppShell>
      <div className={isIdle ? 'max-w-5xl mx-auto min-h-[calc(100vh-14rem)] flex flex-col justify-center pt-16' : 'max-w-5xl mx-auto'}>
        {/* Header */}
        <div className={isIdle ? 'mb-10 text-center' : 'mb-8 text-center'}>
          <div className={isIdle ? 'flex flex-col items-center gap-4 mb-2' : 'flex flex-col items-center gap-3 mb-2'}>
            <div className={isIdle ? 'w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center' : 'w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center'}>
              <GitBranch size={isIdle ? 26 : 20} className="text-violet-400" />
            </div>
            <div>
              <h1 className={isIdle ? 'text-3xl font-bold text-white' : 'text-2xl font-bold text-white'}>GitHub Analyzer</h1>
              <p className={isIdle ? 'text-slate-400 text-base mt-1' : 'text-slate-400 text-sm'}>AI-powered review of your GitHub profile and repositories</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className={isIdle ? 'mb-3 flex justify-center' : 'mb-10 flex justify-center'}>
          <div className={isIdle ? 'flex gap-3 max-w-2xl w-full' : 'flex gap-3 max-w-lg w-full'}>
            <div className="relative flex-1">
              <Search size={isIdle ? 19 : 15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                disabled={status === 'loading'}
                className={isIdle
                  ? 'w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-[1.15rem] pl-12 pr-4 text-[1.05rem] focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50 transition-colors disabled:opacity-50'
                  : 'w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:opacity-50'}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !username.trim()}
              className={isIdle
                ? 'bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold px-7 py-[1.15rem] rounded-xl transition-colors text-[1.05rem] whitespace-nowrap'
                : 'bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm whitespace-nowrap'}
            >
              {status === 'loading' ? 'Analysing…' : 'Analyse Profile'}
            </button>
          </div>
        </form>

        {isIdle && (
          <p className="text-xs text-slate-500 text-center mb-7">
            Repositories, documentation, languages, and profile completeness will be analyzed.
          </p>
        )}

      {/* Loading */}
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-white font-medium">Analysing @{username}</span>
            </div>
            <div className="space-y-3">
              {LOADING_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    i < step ? 'bg-emerald-500 border-emerald-500' :
                    i === step ? 'border-violet-500 bg-violet-500/20' :
                    'border-slate-700'
                  }`}>
                    {i < step && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {i === step && (
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className={`text-sm ${i <= step ? 'text-slate-200' : 'text-slate-600'}`}>{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-400 max-w-lg mx-auto"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Results */}
        {status === 'success' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Profile header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5">
              {result.avatarUrl && (
                <img
                  src={result.avatarUrl}
                  alt={result.name}
                  className="w-16 h-16 rounded-full border-2 border-slate-700"
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white">{result.name}</h2>
                <p className="text-slate-400 text-sm">@{result.username}</p>
                {result.bio && <p className="text-slate-300 text-sm mt-1">{result.bio}</p>}
              </div>
              <div className="flex gap-6 text-center flex-shrink-0">
                <div>
                  <p className="text-xl font-bold text-white">{result.publicRepos}</p>
                  <p className="text-xs text-slate-500">Repos</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{result.followers}</p>
                  <p className="text-xs text-slate-500">Followers</p>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Score Breakdown</h3>
                <div className="text-right">
                  <span className="text-3xl font-black" style={{ color: scoreColor(result.overallScore) }}>
                    {result.overallScore}
                  </span>
                  <span className="text-slate-500 text-lg"> / 100</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                <ScoreRing score={result.profileScore} label="Profile" color={scoreColor(result.profileScore)} />
                <ScoreRing score={result.repositoryScore} label="Repositories" color={scoreColor(result.repositoryScore)} />
                <ScoreRing score={result.documentationScore} label="Documentation" color={scoreColor(result.documentationScore)} />
                <ScoreRing score={result.diversityScore} label="Diversity" color={scoreColor(result.diversityScore)} />
              </div>
              {result.summary && (
                <p className="mt-6 text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-5">
                  {result.summary}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Suggestions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={16} className="text-yellow-400" />
                  <h3 className="text-base font-semibold text-white">Improvements</h3>
                </div>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-slate-500">{i + 1}</span>
                      </div>
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Strengths */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Languages */}
            {totalLangs > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-blue-400" />
                  <h3 className="text-base font-semibold text-white">Language Distribution</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(result.languages)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([lang, count]) => {
                      const pct = Math.round((count / totalLangs) * 100);
                      const color = LANG_COLORS[lang] ?? '#6366f1';
                      return (
                        <div key={lang}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-300">{lang}</span>
                            <span className="text-xs text-slate-500">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Top repos */}
            {result.topRepos?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-violet-400" />
                  <h3 className="text-base font-semibold text-white">Highlighted Repositories</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.topRepos.slice(0, 4).map((repo, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4"
                    >
                      <p className="text-sm font-medium text-white mb-1">{repo.name}</p>
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{repo.description}</p>
                      <p className="text-xs text-violet-400 italic">{repo.impact}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AppShell>
  );
}
