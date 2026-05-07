import React from 'react';
import { ClipboardCheck, ArrowRight, Lock, Target, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function Assessments() {
  const assessments = [
    { id: 1, title: 'Web Development Basics', status: 'Available', type: 'Quiz', duration: '20 mins' },
    { id: 2, title: 'React Performance Optimization', status: 'Locked', type: 'Final Exam', duration: '45 mins' },
    { id: 3, title: 'Database Design Fundamentals', status: 'Locked', type: 'Assignment', duration: '3 days' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Assessments Portal</h1>
        <p className="text-slate-500 font-medium">Validate your knowledge and earn industry-recognized badges.</p>
      </header>

      <div className="grid gap-6">
        {assessments.map(item => (
          <motion.div 
            key={item.id} 
            whileHover={{ x: 5 }}
            className={`bg-white p-8 rounded-[2rem] border ${item.status === 'Locked' ? 'border-slate-50 opacity-60' : 'border-primary/10 shadow-premium'} flex flex-col md:flex-row items-center justify-between gap-6`}
          >
            <div className="flex items-center gap-6">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${item.status === 'Locked' ? 'bg-slate-100 text-slate-400' : 'bg-primary/5 text-primary shadow-sm shadow-primary/5'}`}>
                {item.status === 'Locked' ? <Lock className="h-6 w-6" /> : <Target className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">{item.title}</h3>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.type}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">•</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Available' ? 'text-green-500' : 'text-slate-400'}`}>
                  {item.status}
               </span>
               {item.status !== 'Locked' && (
                 <button className="btn-primary py-3 px-8 text-sm flex items-center gap-2">
                   Start Now <ArrowRight className="h-4 w-4" />
                 </button>
               )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
           <div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-xl">
                 <Award className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black mb-4">Certification Track</h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">Complete all module assessments with a score above 80% to unlock your professional certification.</p>
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                 <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Mastery Progress</span>
                 <span className="text-2xl font-black text-white">25%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '25%' }}
                   className="h-full bg-primary"
                 />
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">3 more modules to reach 80%</p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-20 -mt-20 blur-[100px]"></div>
      </div>
    </div>
  );
}

