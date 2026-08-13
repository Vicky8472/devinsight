import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, GitBranch, Globe, ArrowRight, CheckCircle,
  Zap, BarChart3, Shield,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroIcons from '../components/HeroIcons';

function ScoreRing({ score, color, label }: { score: number; color: string; label: string }) {
  const size = 80;
  const r = 32;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth="5" fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
          {score}
        </text>
      </svg>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};

const features = [
  {
    icon: FileText,
    color: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Resume Analyzer',
    description: 'Upload your PDF or DOCX and get an ATS score, keyword gaps, grammar review, and AI-powered rewrite suggestions.',
    bullets: ['ATS compatibility score', 'Keyword gap analysis', 'Before & after rewrites', 'Readability scoring'],
  },
  {
    icon: GitBranch,
    color: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    title: 'GitHub Analyzer',
    description: 'Enter your username and get insights on profile completeness, repository quality, README depth, and project diversity.',
    bullets: ['Profile completeness check', 'README quality score', 'Language diversity chart', 'AI project improvements'],
  },
  {
    icon: Globe,
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Portfolio Analyzer',
    description: 'Paste your URL and get UX, accessibility, SEO, and content quality scores with specific, actionable fixes.',
    bullets: ['UX heuristics review', 'SEO & accessibility audit', 'Content quality score', 'Copywriting improvements'],
  },
];

const steps = [
  {
    number: '01',
    title: 'Input Your Details',
    desc: 'Upload your resume, enter your GitHub username, or paste your portfolio URL — no account needed to start.',
  },
  {
    number: '02',
    title: 'AI Evaluates Your Developer Profile',
    desc: 'AI analyzes your profile against hiring signals and industry best practices.',
  },
  {
    number: '03',
    title: 'Get Actionable Results',
    desc: 'Receive a detailed score breakdown with specific, prioritized steps you can act on today.',
  },
];

const mockChecklist = [
  { label: 'Add action verbs to bullet points', done: false },
  { label: 'Pin top 3 GitHub repositories', done: false },
  { label: 'Improve hero section copy', done: false },
  { label: 'Add TypeScript to skills section', done: true },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center pt-32 pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(115deg, #0b1330 0%, #1e2a5e 22%, #4c2a7a 45%, #7a2f6b 62%, #9c2d4a 78%, #7a1f2e 100%)',
          }}
        />
        <HeroIcons />

        <div className="max-w-6xl xl:max-w-[1800px] mx-auto relative">
          <div className="max-w-6xl xl:max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 xl:gap-24">

            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={0}
                className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6"
              >
                <Zap size={13} /> AI-Powered Resume • GitHub • Portfolio Analysis
              </motion.div>

              <motion.h1
                variants={fadeUp} initial="hidden" animate="visible" custom={1}
                className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white mb-6"
              >
                Elevate Your{' '}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Developer Profile
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="text-slate-300 text-lg xl:text-xl mb-8 max-w-lg xl:max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Get AI-powered insights on your resume, GitHub, and portfolio. Know exactly what to fix and land your next role faster.
              </motion.p>

              <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={3}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 xl:px-8 py-3 xl:py-4 rounded-xl transition-colors text-base xl:text-lg"
                >
                  Start Free Analysis <ArrowRight size={16} />
                </Link>
              </motion.div>

            </div>

            {/* Right: mock dashboard card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-sm flex-shrink-0"
            >
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-black/40 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Sample Result
                </div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Career Score</p>
                    <p className="text-4xl font-bold text-white">
                      78 <span className="text-slate-500 text-xl font-normal">/ 100</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <BarChart3 className="text-violet-400" size={20} />
                  </div>
                </div>

                <div className="flex justify-between mb-6 px-2">
                  <ScoreRing score={82} color="#60a5fa" label="Resume" />
                  <ScoreRing score={71} color="#a78bfa" label="GitHub" />
                  <ScoreRing score={76} color="#34d399" label="Portfolio" />
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Top Priorities</p>
                  {mockChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          item.done
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-600'
                        }`}
                      >
                        {item.done && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <span className={item.done ? 'text-slate-600 line-through' : 'text-slate-300'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl xl:max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to stand out</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Three powerful analyzers. One unified score. Clear next steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 max-w-[88%] xl:max-w-[85%] mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/40 hover:shadow-[0_0_20px_-8px_rgba(139,92,246,0.35)] transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl border ${f.iconBg} flex items-center justify-center mb-4`}>
                  <f.icon size={21} className={f.color} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm mb-5 leading-relaxed">{f.description}</p>
                <ul className="space-y-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/40">
        <div className="max-w-6xl xl:max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Get results in minutes</h2>
            <p className="text-slate-400 text-lg">No setup. No configuration. Just paste and go.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-[3.3rem] font-black text-violet-500/45 mb-4 leading-none">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-5">
              <Zap size={13} /> AI-Powered Resume • GitHub • Portfolio Analysis
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Start improving your profile today
            </h2>
            <p className="text-slate-400 text-lg mb-8">Analyze your developer profile.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Analyze My Profile Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-6xl xl:max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm text-slate-400 font-semibold">DevInsight</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Shield size={11} /> Built with FastAPI · React · Groq AI
          </div>
          <p className="text-sm text-slate-600">© 2026 DevInsight. Free to use.</p>
        </div>
      </footer>
    </div>
  );
}
