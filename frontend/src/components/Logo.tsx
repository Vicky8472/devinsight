import { Code2 } from 'lucide-react';

interface Props {
  size?: number;
  iconSize?: number;
  rounded?: string;
}

export default function Logo({ size = 32, iconSize = 16, rounded = 'rounded-lg' }: Props) {
  return (
    <div
      className={`${rounded} flex items-center justify-center flex-shrink-0`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #38bdf8 0%, #7c3aed 100%)',
      }}
    >
      <Code2 size={iconSize} className="text-white" strokeWidth={2.5} />
    </div>
  );
}
