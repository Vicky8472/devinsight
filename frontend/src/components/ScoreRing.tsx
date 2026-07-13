import { motion } from 'framer-motion';

interface Props {
  score: number;
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, label, color, size = 90, strokeWidth = 6 }: Props) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={cx} cy={cx} r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
        <text
          x={cx} y={cx + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          {score}
        </text>
      </svg>
      <span className="text-xs text-slate-400 font-medium text-center leading-tight">{label}</span>
    </div>
  );
}
