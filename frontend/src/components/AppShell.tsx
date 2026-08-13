import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

const BACKGROUND_DIMMING: Record<string, { opacity: number; saturate?: number }> = {
  '/dashboard': { opacity: 0.72 },
  '/analyze/resume': { opacity: 0.75, saturate: 0.8 },
  '/analyze/portfolio': { opacity: 0.75, saturate: 0.8 },
  '/analyze/github': { opacity: 0.75, saturate: 0.8 },
};

export default function AppShell({ children }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = location.pathname === '/dashboard';
  const dimming = BACKGROUND_DIMMING[location.pathname];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(115deg, #0b1330 0%, #1e2a5e 22%, #4c2a7a 45%, #7a2f6b 62%, #9c2d4a 78%, #7a1f2e 100%)',
          opacity: dimming?.opacity ?? 1,
          filter: dimming?.saturate ? `saturate(${dimming.saturate})` : undefined,
        }}
      />

      {/* Top bar */}
      <header className="relative border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-base">DevInsight</span>
            </Link>
            {!onDashboard && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-[1800px] mx-auto px-6 lg:px-10 py-10">{children}</main>
    </div>
  );
}
