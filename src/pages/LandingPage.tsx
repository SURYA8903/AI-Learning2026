import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Flag,
  Users,
  Star,
  MessageSquare,
  Monitor,
  Cpu,
  Award,
  LifeBuoy,
  ArrowRight,
  Zap,
  Globe,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Target
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden selection:bg-primary/30 selection:text-primary-dark">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none"></div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 lg:pt-64 lg:pb-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="badge-premium mb-10 shadow-glow shadow-primary/10"
              >
                <Sparkles className="h-3.5 w-3.5 mr-2 animate-pulse" />
                Empowering India's Next Generation
              </motion.div>

              <h1 className="text-7xl lg:text-[10rem] font-black text-slate-900 leading-[0.8] mb-10 tracking-tighter">
                Precision <br />
                <span className="text-gradient drop-shadow-sm">AI Learning</span>
              </h1>

              <p className="text-xl text-slate-500 leading-relaxed max-w-xl mb-14 font-medium">
                Bridging the gap between ambitious learners and world-class experts 
                with <span className="text-slate-900 font-bold">precision-engineered</span> machine intelligence.
              </p>

              <div className="flex flex-wrap gap-6">
                <Link to="/register" className="btn-primary flex items-center gap-3 group text-lg px-10 py-4 shadow-glow">
                  Get Started Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <Link to="/about" className="btn-secondary text-lg px-10 py-4">
                  Our Mission
                </Link>
              </div>

              {/* Stats Mini Banner */}
              <div className="mt-20 flex items-center gap-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <div className="flex flex-col">
                  <span className="text-3xl font-black tracking-tighter">12K+</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Students</span>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black tracking-tighter">500+</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trainers</span>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black tracking-tighter">98%</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Success</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative lg:ml-auto"
            >
              {/* Dynamic Glows */}
              <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] animate-pulse-soft"></div>
              <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[140px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

              <div className="relative z-10 glass-card p-5 rotate-2 hover:rotate-0 transition-all duration-1000 shadow-2xl group border-white/60">
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1632"
                    alt="AI Concept"
                    className="shadow-2xl w-full h-[600px] object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                </div>

                {/* Floating Insight Card */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-12 -left-12 glass-card p-8 shadow-2xl max-w-[260px] border-white/80"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">Live Pulse</span>
                       <p className="text-sm font-black text-slate-900">Adaptive Core</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '85%' }} 
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full" 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completion Avg.</p>
                       <span className="text-[10px] font-black text-primary">85%</span>
                    </div>
                  </div>
                </motion.div>

                {/* Second Floating Card */}
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-10 -right-10 glass-card p-6 shadow-2xl border-white/80 flex items-center gap-4"
                >
                   <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <TrendingUp className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</p>
                      <p className="text-sm font-black text-slate-900">+142% MoM</p>
                   </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
            >
               <h2 className="text-5xl lg:text-7xl font-black mb-8 tracking-tighter">Why ADZ4NEEDZ?</h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                 We've reimagined education from the ground up, using <span className="text-primary font-bold">neural architectures</span> to create a personalized, results-driven ecosystem.
               </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Cpu,
                title: 'Neural Pathways',
                desc: 'Deep-learning recommendation engine that maps your career trajectory in real-time.',
                color: 'text-primary',
                bg: 'bg-primary/5'
              },
              {
                icon: Globe,
                title: 'Global Mentors',
                desc: 'Direct access to elite researchers and industry leads from top tech capitals.',
                color: 'text-secondary',
                bg: 'bg-secondary/5'
              },
              {
                icon: ShieldCheck,
                title: 'Verified Proof',
                desc: 'On-chain verifiable credentials that prove your mastery to global employers.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -15 }}
                className="card-premium group flex flex-col h-full hover:border-primary/20"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-black mb-5 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-lg flex-grow">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission CTA */}
      <section className="py-40 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary opacity-[0.02]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-16 lg:p-28 flex flex-col lg:flex-row items-center justify-between gap-16 border-white/80 shadow-glow shadow-primary/5"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-[0.9] tracking-tighter">Ready to <br /><span className="text-gradient">Redefine</span> your life?</h2>
              <p className="text-xl text-slate-500 max-w-xl font-medium leading-relaxed">Join the 12,000+ pioneers already mastering the future on our precision platform.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
              <Link to="/register" className="btn-primary text-center text-lg px-12 py-5 shadow-glow">
                Start for Free
              </Link>
              <Link to="/courses" className="btn-secondary text-center text-lg px-12 py-5">
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}