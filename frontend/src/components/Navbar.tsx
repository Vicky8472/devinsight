import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">DevScope</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors">
            How it works
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-slate-300 hover:text-white text-sm px-4 py-2 transition-colors">
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-col gap-4">
          <a href="#features" className="text-slate-400 text-sm" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" className="text-slate-400 text-sm" onClick={() => setMobileOpen(false)}>
            How it works
          </a>
          <Link to="/login" className="text-slate-300 text-sm">Log in</Link>
          <Link
            to="/signup"
            className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg font-medium text-center"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </motion.nav>
  );
}
