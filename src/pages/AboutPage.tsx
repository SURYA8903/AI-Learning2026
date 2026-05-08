import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'motion/react';
import { Target, Heart, Award, Shield, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none"></div>
      <Navbar />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24 text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="badge-premium mb-8"
        >
          <Sparkles className="h-3 w-3 mr-2" />
          Our Story
        </motion.div>
        <h1 className="text-5xl lg:text-8xl font-black text-slate-900 mb-8 leading-[0.85] tracking-tight">
          Empowering India's <br /> <span className="text-gradient">Next Gen Ecosystem.</span>
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-slate-500 leading-relaxed font-medium">
          ADZ4NEEDZ is more than just a platform—it's a mission to bridge the gap between learners and industry experts through AI-driven personalization and local context.
        </p>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Target, title: 'Tailored Learning', desc: 'Custom curriculum generation based on your current skills and career goals.' },
              { icon: Heart, title: 'Student Centric', desc: 'Focusing on results, certifications, and real-world placement readiness.' },
              { icon: Award, title: 'Verified Excellence', desc: 'Every trainer and course undergoes strict quality checks before approval.' },
              { icon: Shield, title: 'Secure & Reliable', desc: 'Top-tier data protection and verified Razorpay transaction processing.' }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="glass-card p-8 group"
              >
                <div className="bg-white h-14 w-14 rounded-2xl shadow-sm flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
             <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight">Founded on the principle of <span className="text-primary">"Knowledge for All"</span>.</h2>
             <p className="text-lg text-slate-600 font-medium leading-relaxed">
               Our founders realized that professional education was often either too generic or too expensive. We built ADZ4NEEDZ to democratize access to high-quality training for everyone, bridging the gap between talent and opportunity.
             </p>
             <div className="flex flex-wrap gap-12">
               <div>
                  <p className="text-4xl font-black text-primary">95%</p>
                  <p className="text-xs text-slate-400 font-black uppercase mt-2 tracking-widest">Success Rate</p>
               </div>
               <div>
                  <p className="text-4xl font-black text-primary">12k+</p>
                  <p className="text-xs text-slate-400 font-black uppercase mt-2 tracking-widest">Active Learners</p>
               </div>
               <div>
                  <p className="text-4xl font-black text-primary">500+</p>
                  <p className="text-xs text-slate-400 font-black uppercase mt-2 tracking-widest">Certified Trainers</p>
               </div>
             </div>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-primary/10 rounded-3xl -rotate-3 animate-pulse-soft"></div>
             <img 
               src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1470" 
               className="rounded-3xl shadow-2xl relative z-10 glass-card p-2" 
               alt="team" 
               referrerPolicy="no-referrer" 
             />
          </div>
        </div>
      </section>
      
      {/* Mini CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
           <h2 className="text-3xl font-black mb-8">Ready to join our ecosystem?</h2>
           <p className="text-xl text-slate-500 mb-8">If you're a student, trainer, or admin, then this place is for you.</p>
           <Link to="/register" className="btn-primary inline-flex items-center gap-2">Find Your Pathway</Link>
        </div>
      </section>
    </div>
  );
}
