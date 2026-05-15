import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, User as UserIcon, LogOut, Menu, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors">
                SkillsUp
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <Link to="/courses" className="text-slate-600 hover:text-primary font-bold text-sm uppercase tracking-widest transition-colors">Courses</Link>
            <Link to="/about" className="text-slate-600 hover:text-primary font-bold text-sm uppercase tracking-widest transition-colors">Mission</Link>
            
            {user ? (
              <div className="flex items-center gap-8">
                <Link to={`/dashboard/${profile?.role}`} className="flex items-center gap-2 text-slate-600 hover:text-primary font-bold text-sm uppercase tracking-widest transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-primary transition-all shadow-lg active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <Link to="/login" className="text-slate-600 hover:text-primary font-bold text-sm uppercase tracking-widest transition-colors">Sign In</Link>
                <Link to="/register" className="px-7 py-3 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
             <button className="text-slate-900 p-2 hover:bg-slate-50 rounded-lg transition-colors"><Menu className="h-6 w-6" /></button>
          </div>
        </div>
      </div>
    </nav>
);
}

