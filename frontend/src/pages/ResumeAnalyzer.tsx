import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Lightbulb, Star, ArrowRight } from 'lucide-react';
import AppShell from '../components/AppShell';
import ScoreRing from '../components/ScoreRing';
import UploadZone from '../components/UploadZone';
import { api } from '../services/api';
import { saveResume, loadResume } from '../utils/analysisStore';

interface ResumeResult {
  overallScore: number;
  atsScore: number;
  technicalScore: number;
  readabilityScore: number;
  grammarScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  suggestions: { section: string; before: string; after: string }[];
  filename: string;
}

const LOADING_STEPS = [
  'Reading your resume…',
  'Checking ATS compatibility…',
  'Analysing content & keywords…',
  'Generating AI suggestions…',
];

function scoreColor(s: number) {
  if (s >= 75) return '#34d399';
  if (s >= 50) return '#60a5fa';
  if (s >= 25) return '#f59e0b';
  return '#f87171';
}

export default function ResumeAnalyzer() {
  const [searchParams] = useSearchParams();
  const forceReanalyze = searchParams.get('reanalyze') === '1';
  const stored = !forceReanalyze ? loadResume() : null;

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(stored ? 'success' : 'idle');
  const [result, setResult] = useState<ResumeResult | null>(stored as ResumeResult | null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (status !== 'loading') return;
    setStep(0);
    const timers = LOADING_STEPS.map((_, i) => setTimeout(() => setStep(i), i * 1200));
    return () => timers.forEach(clearTimeout);
  }, [status]);

  const handleAnalyse = async () => {
    if (!file) return;
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const data = await api.analyzeResume(file) as ResumeResult;
      saveResume(data);
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setStatus('error');
    }
  };

  const isIdle = status === 'idle' && !file;

  return (
    <AppShell>
      <div className={isIdle ? 'max-w-5xl mx-auto min-h-[calc(100vh-14rem)] flex flex-col justify-center pt-16' : 'max-w-5xl mx-auto'}>
        {/* Header */}
        <div className={isIdle ? 'mb-6 text-center' : 'mb-8 text-center'}>
          <div className={isIdle ? 'flex flex-col items-center gap-3 mb-2' : 'flex flex-col items-center gap-3 mb-2'}>
            <div className={isIdle ? 'w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center' : 'w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center'}>
              <FileText size={isIdle ? 26 : 20} className="text-blue-400" />
            </div>
            <div>
              <h1 className={isIdle ? 'text-3xl font-bold text-white' : 'text-2xl font-bold text-white'}>Resume Analyzer</h1>
              <p className={isIdle ? 'text-slate-400 text-base mt-1' : 'text-slate-400 text-sm'}>AI-powered ATS scoring, keyword gaps, and rewrite suggestions</p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="max-w-2xl mb-8 mx-auto w-full">
          <UploadZone
            onFile={setFile}
            file={file}
            onClear={() => { setFile(null); setResult(null); setStatus('idle'); }}
            disabled={status === 'loading'}
          />
          {file && status !== 'loading' && status !== 'success' && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleAnalyse}
              className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Analyse Resume <ArrowRight size={16} />
            </motion.button>
          )}
        </div>

      <AnimatePresence>
        {/* Loading */}
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto"
          >
            <div className="flex items-center gap-3 mb-6 min-w-0">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin flex-shrink-0" />
              <span className="text-white font-medium truncate">Analysing {file?.name}</span>
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
                    {i === step && <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />}
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
            {/* Scores */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-6">
                <div className="min-w-0 max-w-full">
                  <h3 className="text-lg font-semibold text-white">Score Breakdown</h3>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{result.filename}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-3xl font-black" style={{ color: scoreColor(result.overallScore) }}>
                    {result.overallScore}
                  </span>
                  <span className="text-slate-500 text-lg"> / 100</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
                <ScoreRing score={result.atsScore} label="ATS Score" color={scoreColor(result.atsScore)} />
                <ScoreRing score={result.technicalScore} label="Technical" color={scoreColor(result.technicalScore)} />
                <ScoreRing score={result.readabilityScore} label="Readability" color={scoreColor(result.readabilityScore)} />
                <ScoreRing score={result.grammarScore} label="Grammar" color={scoreColor(result.grammarScore)} />
              </div>
              {result.summary && (
                <p className="mt-6 text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-5">
                  {result.summary}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Improvements */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={16} className="text-yellow-400" />
                  <h3 className="text-base font-semibold text-white">Improvements</h3>
                </div>
                <ul className="space-y-3">
                  {result.improvements.map((item, i) => (
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
                      {item}
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
                  {result.strengths.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-4">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs px-3 py-1.5 rounded-full"
                    >
                      {kw}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Before / After suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-5">Rewrite Suggestions</h3>
                <div className="space-y-5">
                  {result.suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border border-slate-800 rounded-xl overflow-hidden"
                    >
                      <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.section}</span>
                      </div>
                      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
                        <div className="p-4">
                          <p className="text-xs text-red-400 font-medium mb-2 uppercase tracking-wider">Before</p>
                          <p className="text-sm text-slate-400 leading-relaxed">{s.before}</p>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-emerald-400 font-medium mb-2 uppercase tracking-wider">After</p>
                          <p className="text-sm text-slate-200 leading-relaxed">{s.after}</p>
                        </div>
                      </div>
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
