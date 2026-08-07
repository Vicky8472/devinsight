import { Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

export default function AppShell({ children }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-base">DevInsight</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
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

      <main className="max-w-[1800px] mx-auto px-6 lg:px-10 py-10">{children}</main>
    </div>
  );
}
