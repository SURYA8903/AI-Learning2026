import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, Monitor, Code, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const profile = await login(email, password);
      navigate(`/dashboard/${profile.role}`);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-white/50"
        >
          {/* Left Panel - Branding & Social Proof */}
          <div className="md:w-[42%] bg-slate-900 relative p-12 flex flex-col justify-between overflow-hidden">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full -ml-20 -mb-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
             
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-10 border border-white/10">
                   <Zap className="h-6 w-6 text-primary-light" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                  Master the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary">Future of AI</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-12 font-medium">
                  Join 10,000+ ambitious learners leveling up their careers with precision-engineered courses.
                </p>

                <div className="space-y-6">
                   {[
                     { icon: ShieldCheck, text: 'Industry recognized certifications' },
                     { icon: Sparkles, text: 'AI-powered learning paths' },
                     { icon: Code, text: 'Access to exclusive repositories' }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 text-white/80">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                           <item.icon className="h-4 w-4 text-primary-light" />
                        </div>
                        <span className="text-sm font-bold tracking-wide">{item.text}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                <div className="flex -space-x-3 mb-4">
                   {[1,2,3,4].map(i => (
                     <img key={i} src={`https://ui-avatars.com/api/?name=U${i}&background=random`} className="w-8 h-8 rounded-full border-2 border-slate-900 shadow-xl" alt="user" />
                   ))}
                   <div className="w-8 h-8 rounded-full bg-primary border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">+2k</div>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Learners This Week</p>
             </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <header className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
                <p className="text-slate-400 text-sm font-medium">Elevate your potential with ADZ4NEEDZ</p>
              </header>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-bold flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</div>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-premium pl-12"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 ml-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                    <Link to="/register" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-premium pl-12 pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                   <input 
                    type="checkbox" 
                    id="remember" 
                    className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer" 
                   />
                   <label htmlFor="remember" className="text-xs text-slate-500 font-bold cursor-pointer hover:text-slate-700 transition-colors">Keep me signed in</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4.5 flex items-center justify-center gap-3 disabled:opacity-70 text-lg shadow-glow"
                >
                  {loading ? 'Authenticating...' : (
                    <>Sign In <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>
              </form>

              <div className="my-10 flex items-center gap-4 text-slate-200">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Social Login</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <button className="flex items-center justify-center gap-2 py-3.5 px-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm shadow-sm active:scale-95">
                  <Monitor className="h-5 w-5 text-red-500" /> Google
                </button>
                <button className="flex items-center justify-center gap-2 py-3.5 px-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm shadow-sm active:scale-95">
                  <Code className="h-5 w-5 text-slate-900" /> GitHub
                </button>
              </div>

              <p className="text-center text-sm text-slate-400 font-medium">
                New to the platform?{' '}
                <Link to="/register" className="text-primary font-black hover:underline ml-1">Create an account</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>


    </div>
  );
}
