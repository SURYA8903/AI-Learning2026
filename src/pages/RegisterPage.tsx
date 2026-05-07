import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  X, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
    skills: [] as string[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({
          ...formData,
          skills: [...formData.skills, skillInput.trim()]
        });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData.email, formData.password, {
        fullName: formData.fullName,
        role: formData.role,
        skills: formData.skills
      });
      navigate(`/dashboard/${formData.role}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl w-full bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col md:flex-row border border-white/50"
        >
          {/* Left Panel */}
          <div className="md:w-[40%] bg-slate-50/50 p-12 flex flex-col justify-between overflow-hidden relative border-r border-slate-100">
            <div className="relative z-10">
              <div className="badge-premium mb-8">
                 <Sparkles className="h-3.5 w-3.5 mr-2" />
                 Join the Revolution
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">Level Up Your <span className="text-gradient">Journey</span></h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-12 text-lg">
                Unlock tailored educational resources and expert mentorship in India's fastest growing AI ecosystem.
              </p>
              
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-white">
                 <img 
                   src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" 
                   alt="Learning" 
                   className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700" 
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900/90 to-transparent backdrop-blur-[2px]">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                          <Zap className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-white font-black text-lg">98% Satisfaction</p>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Across 12,000+ Students</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-8 md:p-16">
            <div className="max-w-lg mx-auto">
              <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Create Account</h1>
                <p className="text-slate-400 text-sm font-medium">Join ADZ4NEEDZ and start your transformation</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input-premium pl-12"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-premium pl-12"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Secure Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Choose Your Pathway</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'student', label: 'Student', icon: GraduationCap },
                      { id: 'trainer', label: 'Trainer', icon: Briefcase },
                      { id: 'admin', label: 'Admin', icon: ShieldCheck }
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.id as any })}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group ${
                          formData.role === role.id 
                            ? 'bg-primary/5 border-primary text-primary shadow-glow' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <role.icon className={`h-7 w-7 mb-3 transition-transform duration-300 ${formData.role === role.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Areas of Interest</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <AnimatePresence>
                      {formData.skills.map((skill) => (
                        <motion.span 
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl border border-indigo-100 shadow-sm"
                        >
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-indigo-800 transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="relative group">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="input-premium pl-12"
                      placeholder="Add skills (React, Python, etc.) and press Enter"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4.5 flex items-center justify-center gap-3 mt-6 disabled:opacity-70 text-lg shadow-glow"
                >
                  {loading ? 'Processing...' : (
                    <>Create Account <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>
              </form>
              
              <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-400 font-medium">
                  Already part of the ecosystem?{' '}
                  <Link to="/login" className="text-primary font-black hover:underline ml-1">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>


    </div>
  );
}
