import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, CheckCircle, AlertCircle, Lightbulb, ArrowRight, Link, Image, FileText, Tag } from 'lucide-react';
import AppShell from '../components/AppShell';
import ScoreRing from '../components/ScoreRing';
import { api } from '../services/api';
import { savePortfolio } from '../utils/analysisStore';

interface PortfolioMeta {
  title: string;
  word_count: number;
  image_count: number;
  images_missing_alt: number;
  has_nav: boolean;
  html_lang: string;
  og_tags: Record<string, string>;
  link_count: number;
}

interface PortfolioResult {
  overallScore: number;
  uxScore: number;
  accessibilityScore: number;
  seoScore: number;
  contentScore: number;
  summary: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  url: string;
  meta: PortfolioMeta;
}

const LOADING_STEPS = [
  'Fetching your portfolio…',
  'Parsing HTML structure…',
  'Evaluating UX & accessibility…',
  'Running AI content review…',
];

function scoreColor(s: number) {
  if (s >= 75) return '#34d399';
  if (s >= 50) return '#60a5fa';
  if (s >= 25) return '#f59e0b';
  return '#f87171';
}

function MetaStat({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3">
      <div className={`flex-shrink-0 ${warn ? 'text-amber-400' : 'text-slate-400'}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-semibold ${warn ? 'text-amber-300' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  );
}

export default function PortfolioAnalyzer() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (status !== 'loading') return;
    setStep(0);
    const timers = LOADING_STEPS.map((_, i) => setTimeout(() => setStep(i), i * 1400));
    return () => timers.forEach(clearTimeout);
  }, [status]);

  const handleAnalyse = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const data = await api.analyzePortfolio(trimmed) as PortfolioResult;
      savePortfolio(data);
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyse();
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Globe size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio Analyzer</h1>
            <p className="text-slate-400 text-sm">AI-powered UX, accessibility, SEO and content review</p>
          </div>
        </div>
      </div>

      {/* URL input */}
      <div className="max-w-xl mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://yourportfolio.com"
              disabled={status === 'loading'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleAnalyse}
            disabled={!url.trim() || status === 'loading'}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
          >
            Analyse <ArrowRight size={15} />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 pl-1">Works with any public website — portfolio, personal site, or project page</p>
      </div>

      <AnimatePresence>
        {/* Loading */}
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-white font-medium truncate">{url}</span>
            </div>
            <div className="space-y-3">
              {LOADING_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    i < step ? 'bg-emerald-500 border-emerald-500' :
                    i === step ? 'border-emerald-500 bg-emerald-500/20' :
                    'border-slate-700'
                  }`}>
                    {i < step && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {i === step && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
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
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-400 max-w-lg"
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
            {/* Scores */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Score Breakdown</h3>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors truncate block max-w-xs"
                  >
                    {result.url}
                  </a>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black" style={{ color: scoreColor(result.overallScore) }}>
                    {result.overallScore}
                  </span>
                  <span className="text-slate-500 text-lg"> / 100</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                <ScoreRing score={result.uxScore} label="UX Design" color={scoreColor(result.uxScore)} />
                <ScoreRing score={result.accessibilityScore} label="Accessibility" color={scoreColor(result.accessibilityScore)} />
                <ScoreRing score={result.seoScore} label="SEO" color={scoreColor(result.seoScore)} />
                <ScoreRing score={result.contentScore} label="Content" color={scoreColor(result.contentScore)} />
              </div>
              {result.summary && (
                <p className="mt-6 text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-5">
                  {result.summary}
                </p>
              )}
            </div>

            {/* Page Metadata */}
            {result.meta && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-4">Page Metadata</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetaStat icon={<FileText size={15} />} label="Word Count" value={result.meta.word_count.toLocaleString()} />
                  <MetaStat icon={<Image size={15} />} label="Images" value={result.meta.image_count} />
                  <MetaStat
                    icon={<Image size={15} />}
                    label="Missing Alt Text"
                    value={result.meta.images_missing_alt}
                    warn={result.meta.images_missing_alt > 0}
                  />
                  <MetaStat icon={<Link size={15} />} label="Links" value={result.meta.link_count} />
                </div>
                {result.meta.title && (
                  <div className="mt-3 flex gap-2 items-start bg-slate-800/40 rounded-xl px-4 py-3">
                    <Tag size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Page Title</p>
                      <p className="text-sm text-slate-300">{result.meta.title}</p>
                    </div>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.meta.html_lang && (
                    <span className="bg-slate-800 border border-slate-700 text-slate-400 text-xs px-3 py-1.5 rounded-full">
                      lang="{result.meta.html_lang}"
                    </span>
                  )}
                  {result.meta.has_nav && (
                    <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs px-3 py-1.5 rounded-full">
                      Has navigation
                    </span>
                  )}
                  {Object.keys(result.meta.og_tags).length > 0 && (
                    <span className="bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs px-3 py-1.5 rounded-full">
                      Open Graph tags present
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Issues */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={15} className="text-red-400" />
                  <h3 className="text-base font-semibold text-white">Issues Found</h3>
                </div>
                <ul className="space-y-3">
                  {result.issues.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Strengths */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={15} className="text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {result.strengths.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={15} className="text-yellow-400" />
                  <h3 className="text-base font-semibold text-white">Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {result.suggestions.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 bg-slate-800/50 rounded-xl px-4 py-3 text-sm text-slate-300"
                    >
                      <span className="text-xs text-slate-500 font-mono bg-slate-800 rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
