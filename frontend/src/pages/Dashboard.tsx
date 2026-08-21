import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, GitBranch, Globe, ArrowRight, Clock,
  Lightbulb, TrendingUp, Target, Download,
} from 'lucide-react';
import { api } from '../services/api';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import AppShell from '../components/AppShell';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../context/AuthContext';
import {
  loadGitHub, loadResume, loadPortfolio, timeAgo,
  type StoredGitHub, type StoredResume, type StoredPortfolio,
} from '../utils/analysisStore';

const PENDING_DOWNLOAD_KEY = 'ds_pending_download';

function scoreColor(s: number) {
  if (s >= 75) return '#34d399';
  if (s >= 50) return '#60a5fa';
  if (s >= 25) return '#f59e0b';
  return '#f87171';
}

function careerScore(gh: StoredGitHub | null, re: StoredResume | null, po: StoredPortfolio | null): number {
  const pairs: [number, number][] = [];
  if (gh) pairs.push([gh.overallScore, 0.35]);
  if (re) pairs.push([re.overallScore, 0.45]);
  if (po) pairs.push([po.overallScore, 0.20]);
  if (!pairs.length) return 0;
  const totalW = pairs.reduce((s, [, w]) => s + w, 0);
  return Math.round(pairs.reduce((s, [score, w]) => s + score * w, 0) / totalW);
}

function careerLabel(s: number) {
  if (s >= 80) return 'Elite Developer Profile';
  if (s >= 65) return 'Strong Developer Profile';
  if (s >= 50) return 'Developing Profile';
  if (s >= 35) return 'Emerging Developer';
  return 'Profile Needs Attention';
}

function buildRadarData(gh: StoredGitHub | null, re: StoredResume | null, po: StoredPortfolio | null) {
  return [
    { subject: 'GitHub Profile', score: gh?.profileScore ?? 0 },
    { subject: 'Code Quality', score: gh?.repositoryScore ?? 0 },
    { subject: 'Documentation', score: gh?.documentationScore ?? 0 },
    { subject: 'ATS Ready', score: re?.atsScore ?? 0 },
    { subject: 'Technical', score: re?.technicalScore ?? 0 },
    { subject: 'Web Presence', score: po?.uxScore ?? 0 },
    { subject: 'SEO & Content', score: po ? Math.round((po.seoScore + po.contentScore) / 2) : 0 },
  ];
}

function buildBarData(gh: StoredGitHub | null, re: StoredResume | null, po: StoredPortfolio | null) {
  const items: { name: string; score: number }[] = [];
  if (gh) {
    items.push({ name: 'GH Profile', score: gh.profileScore });
    items.push({ name: 'Repositories', score: gh.repositoryScore });
    items.push({ name: 'Docs', score: gh.documentationScore });
    items.push({ name: 'Diversity', score: gh.diversityScore });
  }
  if (re) {
    items.push({ name: 'ATS Score', score: re.atsScore });
    items.push({ name: 'Technical', score: re.technicalScore });
    items.push({ name: 'Readability', score: re.readabilityScore });
    items.push({ name: 'Grammar', score: re.grammarScore });
  }
  if (po) {
    items.push({ name: 'UX Design', score: po.uxScore });
    items.push({ name: 'Accessibility', score: po.accessibilityScore });
    items.push({ name: 'SEO', score: po.seoScore });
    items.push({ name: 'Content', score: po.contentScore });
  }
  return items.sort((a, b) => b.score - a.score);
}

function buildActions(gh: StoredGitHub | null, re: StoredResume | null, po: StoredPortfolio | null) {
  const modules = [
    { data: gh, label: 'GitHub', items: gh?.suggestions ?? [], color: 'violet' },
    { data: re, label: 'Resume', items: re?.improvements ?? [], color: 'blue' },
    { data: po, label: 'Portfolio', items: po?.suggestions ?? [], color: 'emerald' },
  ]
    .filter(m => m.data)
    .sort((a, b) => (a.data!.overallScore) - (b.data!.overallScore));

  const actions: { text: string; label: string; color: string }[] = [];
  for (const m of modules) {
    m.items.slice(0, 2).forEach(text => actions.push({ text, label: m.label, color: m.color }));
  }
  return actions.slice(0, 6);
}

const BADGE_COLORS: Record<string, string> = {
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

const MODULES = [
  {
    key: 'github' as const,
    to: '/analyze/github',
    icon: GitBranch,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    title: 'GitHub Analyzer',
    description: 'Profile, repositories, documentation & language diversity.',
  },
  {
    key: 'resume' as const,
    to: '/analyze/resume',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Resume Analyzer',
    description: 'ATS scoring, keyword gaps & rewrite suggestions.',
  },
  {
    key: 'portfolio' as const,
    to: '/analyze/portfolio',
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Portfolio Analyzer',
    description: 'UX, accessibility, SEO & content scoring.',
  },
];

const TooltipContent = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white shadow-xl">
      Score: <span className="font-bold">{payload[0].value}</span>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const github = loadGitHub();
  const resume = loadResume();
  const portfolio = loadPortfolio();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!user) {
      sessionStorage.setItem(PENDING_DOWNLOAD_KEY, '1');
      navigate('/signup');
      return;
    }
    setDownloading(true);
    try {
      const blob = await api.downloadReport({ github, resume, portfolio });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devscope-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user can retry
    } finally {
      setDownloading(false);
    }
  };

  const scores: Record<string, StoredGitHub | StoredResume | StoredPortfolio | null> = {
    github, resume, portfolio,
  };

  const doneCount = [github, resume, portfolio].filter(Boolean).length;
  const hasAny = doneCount > 0;
  const overallScore = careerScore(github, resume, portfolio);
  const radarData = buildRadarData(github, resume, portfolio);
  const barData = buildBarData(github, resume, portfolio);
  const actions = buildActions(github, resume, portfolio);

  return (
    <AppShell>
      <div className={hasAny ? 'space-y-8' : 'space-y-8 flex flex-col min-h-[calc(100vh-14rem)]'}>
        {/* Hero section — career score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-5">
              <ScoreRing
                score={hasAny ? overallScore : 0}
                label="Career Score"
                color={scoreColor(overallScore)}
                size={110}
                strokeWidth={8}
              />
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Overall Rating</p>
                <h2 className="text-xl font-bold text-white">{hasAny ? careerLabel(overallScore) : 'No analyses yet'}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {doneCount} of 3 modules analyzed
                </p>
              </div>
            </div>

            {hasAny && (
              <div className="sm:ml-auto flex items-center gap-6">
                <div className="flex gap-4">
                  {github && (
                    <div className="text-center">
                      <p className="text-2xl font-black" style={{ color: scoreColor(github.overallScore) }}>{github.overallScore}</p>
                      <p className="text-xs text-slate-500 mt-0.5">GitHub</p>
                    </div>
                  )}
                  {resume && (
                    <div className="text-center">
                      <p className="text-2xl font-black" style={{ color: scoreColor(resume.overallScore) }}>{resume.overallScore}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Resume</p>
                    </div>
                  )}
                  {portfolio && (
                    <div className="text-center">
                      <p className="text-2xl font-black" style={{ color: scoreColor(portfolio.overallScore) }}>{portfolio.overallScore}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Portfolio</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  {downloading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  {downloading ? 'Generating…' : 'Download Report'}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Module cards */}
        <div className={hasAny ? '' : 'flex-1 flex flex-col justify-center'}>
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Target size={14} /> Analyzers
          </h3>
          <div className={hasAny ? 'grid sm:grid-cols-3 gap-5' : 'grid sm:grid-cols-3 gap-6'}>
            {MODULES.map((m, i) => {
              const stored = scores[m.key];
              const isDone = !!stored;

              return (
                <motion.div
                  key={m.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={
                    hasAny
                      ? 'flex flex-col h-full min-h-[228px] bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-colors group relative overflow-hidden'
                      : 'flex flex-col h-full min-h-[300px] bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-8 transition-colors group relative overflow-hidden'
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={
                      hasAny
                        ? `w-9 h-9 rounded-xl border ${m.bg} flex items-center justify-center`
                        : `w-12 h-12 rounded-xl border ${m.bg} flex items-center justify-center`
                    }>
                      <m.icon size={hasAny ? 17 : 22} className={m.color} />
                    </div>
                  </div>

                  <h2 className={hasAny ? 'text-sm font-semibold text-white mb-1' : 'text-base font-semibold text-white mb-2'}>
                    {m.title}
                  </h2>
                  <p className={hasAny ? 'text-slate-500 text-xs leading-relaxed mb-3' : 'text-slate-500 text-sm leading-relaxed mb-5'}>{m.description}</p>

                  <div className="mt-auto">
                    <div className={hasAny ? 'mb-3' : 'mb-4'}>
                      {isDone && stored ? (
                        <>
                          <span className="text-2xl font-black" style={{ color: scoreColor(stored.overallScore) }}>
                            {stored.overallScore}
                            <span className="text-slate-600 text-sm font-normal">/100</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <Clock size={10} /> {timeAgo(stored.savedAt)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-600">Not started</span>
                      )}
                    </div>

                    {isDone ? (
                      <div className="flex items-center gap-2">
                        <Link
                          to={m.to}
                          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-full px-3 py-1.5 whitespace-nowrap transition-colors"
                        >
                          View Results <ArrowRight size={11} />
                        </Link>
                        <Link
                          to={`${m.to}?reanalyze=1`}
                          className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-violet-500/20 hover:border-violet-500/30 hover:text-violet-300 rounded-full px-3 py-1.5 whitespace-nowrap transition-colors"
                        >
                          Reanalyze
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to={m.to}
                        className={
                          hasAny
                            ? 'flex items-center justify-center gap-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-violet-500/20 hover:border-violet-500/30 hover:text-violet-300 rounded-full px-3 py-1.5 whitespace-nowrap transition-colors'
                            : 'flex items-center justify-center gap-1.5 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-violet-500/20 hover:border-violet-500/30 hover:text-violet-300 rounded-full px-4 py-2.5 whitespace-nowrap transition-colors'
                        }
                      >
                        Run Analysis <ArrowRight size={hasAny ? 11 : 13} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Charts row — only when 2+ modules done */}
        {doneCount >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Radar chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-violet-400" />
                <h3 className="text-base font-semibold text-white">Skill Radar</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#475569', fontSize: 9 }}
                    tickCount={4}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Horizontal bar chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-blue-400" />
                <h3 className="text-base font-semibold text-white">Score Breakdown</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 4 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#475569', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={82}
                  />
                  <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={14}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={scoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Bar chart alone when only 1 done */}
        {doneCount === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-blue-400" />
              <h3 className="text-base font-semibold text-white">Score Breakdown</h3>
              <span className="text-xs text-slate-600 ml-1">— run more analyzers to unlock the radar chart</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 4 }}
              >
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={82} />
                <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={scoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Priority actions */}
        {actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb size={15} className="text-yellow-400" />
              <h3 className="text-base font-semibold text-white">Priority Actions</h3>
              <span className="text-xs text-slate-600 ml-1">— lowest-scoring module first</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {actions.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 bg-slate-800/50 rounded-xl px-4 py-3"
                >
                  <span className={`text-xs font-medium border rounded-full px-2 py-0.5 flex-shrink-0 mt-0.5 ${BADGE_COLORS[a.color]}`}>
                    {a.label}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">{a.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state hint */}
        {!hasAny && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-10 text-slate-600 text-sm"
          >
            Run any analyzer above to see your Career Score, skill radar, and priority actions here.
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
