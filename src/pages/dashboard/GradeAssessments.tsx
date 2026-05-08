import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Star,
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { supabase } from '../../lib/supabase';

export default function GradeAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAssessments = async () => {
      const { data } = await supabase.from('assessments').select('*').eq('instructor_id', user.id).order('created_at', { ascending: false });
      if (data) setAssessments(data);
    };
    fetchAssessments();
    
    const channel = supabase.channel('public:assessments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments', filter: `instructor_id=eq.${user.id}` }, payload => {
        fetchAssessments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const submissions = assessments.map(a => ({
      id: a.id, 
      name: 'Student Submission', 
      email: 'student@example.com', 
      assessment: a.title, 
      time: 'Just now', 
      image: 'https://i.pravatar.cc/150?u=student',
      status: 'pending' 
  }));

  const stats = [
    { label: 'AVG. CLASS SCORE', value: '84%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'COMPLETION RATE', value: '92%', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'FEEDBACK SENT', value: '148', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Grade Assessments</h1>
          <p className="text-slate-500 font-medium mt-1">Review student submissions and provide detailed feedback.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Export Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters & Submissions */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Pending Submissions</h2>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">12 New</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
                <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {submissions.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={sub.image} alt={sub.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{sub.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">Submission: <span className="text-indigo-600 font-bold">{sub.assessment}</span></p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{sub.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
                      <Star className="w-3.5 h-3.5" />
                      Review
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl font-bold text-xs hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Feedback
                    </button>
                    <button className="p-2 text-slate-300 hover:text-slate-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
              <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                View all submissions
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="space-y-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center group hover:-translate-y-1 transition-all duration-300">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 group-hover:text-indigo-500 transition-colors">{stat.label}</p>
              <h3 className={`text-5xl font-black ${stat.color} mb-2`}>{stat.value}</h3>
              <div className="w-12 h-1 bg-slate-100 mx-auto rounded-full group-hover:bg-indigo-100 transition-colors"></div>
            </div>
          ))}

          <div className="bg-indigo-600 rounded-[32px] p-8 text-white text-center">
            <h4 className="text-xl font-black mb-2">Ready to grade?</h4>
            <p className="text-xs text-indigo-100 opacity-70 mb-6">Our AI grading assistant can help you process descriptive answers faster.</p>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors">
              Launch AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
