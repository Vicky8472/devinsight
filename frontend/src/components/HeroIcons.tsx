import { motion } from 'framer-motion';
import { Terminal, Code2, Braces } from 'lucide-react';

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.9.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.35-3.88-1.35-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.96.1-.74.4-1.25.72-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.71 5.4-5.29 5.69.42.36.78 1.07.78 2.16 0 1.56-.02 2.82-.02 3.2 0 .3.2.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function VSCodeMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M17.4 2.1c.5-.25 1.1-.2 1.55.15l3.2 2.5c.4.3.6.8.55 1.3v11.8c.05.5-.15 1-.55 1.3l-3.2 2.5c-.45.35-1.05.4-1.55.15L8.6 15.6l-3.5 2.7c-.4.3-.95.3-1.3-.05l-1.5-1.4c-.35-.35-.35-.9 0-1.25L5.2 12 2.3 8.4c-.35-.35-.35-.9 0-1.25l1.5-1.4c.35-.35.9-.35 1.3-.05l3.5 2.7 8.8-6.3Zm-1 4.2L11.2 12l5.2 5.7V6.3Z" />
    </svg>
  );
}

function DockerMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M22.5 10.2c-.4-.3-1.2-.4-1.8-.3-.1-.6-.4-1.1-.9-1.5l-.3-.2-.2.3c-.4.5-.6 1.2-.5 1.8.1.3.2.6.4.9-.2.1-.4.2-.6.2H2.6c-.2.9-.2 4.7 2.5 6.6 2 1.4 5 1.6 7.6.8 3.3-1 6-3.4 7.3-6.9h.2c1.1 0 1.8-.4 2.2-.8l.1-.1-.1-.1c-.1 0 0 0 0 0Zm-16.7-1h1.8v-1.7H5.8v1.7Zm2.4 0h1.8v-1.7H8.2v1.7Zm2.4 0h1.8v-1.7h-1.8v1.7Zm2.4 0h1.8v-1.7h-1.8v1.7ZM8.2 6.8H10V5H8.2v1.8Zm2.4 0h1.8V5h-1.8v1.8Zm2.4 0h1.8V5h-1.8v1.8Zm-7.2 4.9h1.8V9.9H5.8v1.8Zm9.6-4.9h1.8V5h-1.8v1.8Z" />
    </svg>
  );
}

function ReactMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function PythonMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M11.9 1.6c-1.4 0-2.6.1-3.6.3-1.9.35-2.2 1.05-2.2 2.4v1.75h4.4v.55H4.4c-1.35 0-2.55.8-2.9 2.35-.45 1.75-.45 2.85 0 4.65.35 1.35 1.15 2.35 2.5 2.35h1.6v-2.1c0-1.55 1.35-2.9 2.9-2.9h4.4c1.3 0 2.35-1.05 2.35-2.35V4.3c0-1.25-1.05-2.2-2.35-2.4-1-.2-2.15-.3-3-.3ZM9.3 3.05c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9Z" />
      <path d="M12.1 22.4c1.4 0 2.6-.1 3.6-.3 1.9-.35 2.2-1.05 2.2-2.4v-1.75h-4.4v-.55h7.5c1.35 0 2.05-.9 2.5-2.35.45-1.75.45-2.9 0-4.65-.35-1.35-1.15-2.35-2.5-2.35h-1.6v2.1c0 1.55-1.35 2.9-2.9 2.9h-4.4c-1.3 0-2.35 1.05-2.35 2.35v3.6c0 1.25 1.05 2.2 2.35 2.4 1 .2 2.15.3 3 .3Zm2.6-1.45c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9Z" />
    </svg>
  );
}

interface Badge {
  key: string;
  content: React.ReactNode;
  top: string;
  left?: string;
  right?: string;
  size: number;
  tint: 'violet' | 'red';
  delay: number;
  opacity?: number;
}

const badges: Badge[] = [
  { key: 'github', content: <GitHubMark />, top: '68%', left: '52%', size: 60, tint: 'violet', delay: 0 },
  { key: 'linkedin', content: <LinkedInMark />, top: '4%', right: '8%', size: 54, tint: 'red', delay: 0.5 },
  { key: 'terminal', content: <Terminal className="w-1/2 h-1/2" />, top: '8%', left: '6%', size: 58, tint: 'violet', delay: 1.5 },
  { key: 'docker', content: <DockerMark />, top: '2%', left: '56%', size: 52, tint: 'violet', delay: 2 },
  { key: 'vscode', content: <VSCodeMark />, top: '80%', right: '10%', size: 60, tint: 'red', delay: 3 },
  { key: 'react', content: <ReactMark />, top: '86%', left: '5%', size: 56, tint: 'violet', delay: 1 },
  { key: 'python', content: <PythonMark />, top: '38%', right: '2%', size: 56, tint: 'red', delay: 2.5 },
  { key: 'code', content: <Code2 className="w-1/2 h-1/2" />, top: '30%', left: '2%', size: 54, tint: 'violet', delay: 1.8, opacity: 0.07 },
  { key: 'braces', content: <Braces className="w-1/2 h-1/2" />, top: '58%', left: '14%', size: 50, tint: 'violet', delay: 2.3, opacity: 0.06 },
];

const tintStyles = {
  violet: { bg: 'rgba(124,58,237,0.06)', border: 'rgba(167,139,250,0.18)', color: '#a78bfa' },
  red: { bg: 'rgba(190,24,60,0.07)', border: 'rgba(248,113,113,0.18)', color: '#f87171' },
};

export default function HeroIcons() {
  return (
    <div className="hidden lg:block absolute top-24 left-0 right-0 bottom-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {badges.map((b) => {
        const t = tintStyles[b.tint];
        return (
          <motion.div
            key={b.key}
            className="absolute rounded-2xl flex items-center justify-center backdrop-blur-sm"
            style={{
              top: b.top,
              left: b.left,
              right: b.right,
              width: b.size,
              height: b.size,
              backgroundColor: t.bg,
              border: `1px solid ${t.border}`,
              color: t.color,
              padding: b.size * 0.28,
              opacity: b.opacity ?? 0.4,
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5 + b.delay, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {b.content}
          </motion.div>
        );
      })}
    </div>
  );
}
