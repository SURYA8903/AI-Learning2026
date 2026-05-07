import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Submission, UserProfile } from '../../types';
import { CheckCircle, XCircle, Eye, Award, Clock, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GradeSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('submissions')
      .select('*, profiles:user_id(full_name, email), courses:course_id(title)')
      .eq('status', 'submitted');
    
    if (data) setSubmissions(data);
    setLoading(false);
  };

  const publishCertificate = async (sub: any) => {
    try {
      // 1. Update submission status
      await supabase.from('submissions').update({ status: 'graded', grade: 100 }).eq('id', sub.id);
      
      // 2. Create Certificate record
      await supabase.from('certificates').insert([{
        user_id: sub.user_id,
        course_id: sub.course_id,
        user_name: sub.profiles.full_name,
        course_name: sub.courses.title,
        issued_at: new Date().toISOString()
      }]);

      // 3. Create Notification for student
      await supabase.from('notifications').insert([{
        user_id: sub.user_id,
        title: 'Course Completed! 🎉',
        message: `Congratulations! You have successfully completed "${sub.courses.title}". View your certificate now.`,
        type: 'success'
      }]);

      // 4. Update enrollment status to completed
      await supabase.from('enrollments').update({ status: 'completed' })
        .eq('student_id', sub.user_id).eq('course_id', sub.course_id);

      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err) {
      console.error('Failed to publish certificate:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Grade Assessments</h1>
           <p className="text-slate-500 font-medium mt-1">Review student submissions and award certifications.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search students..." className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-64" />
           </div>
           <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Filter className="h-5 w-5" /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Fetching pending evaluations...</div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
             <p className="text-slate-500 mt-2">There are no pending assessments to grade right now.</p>
          </div>
        ) : (
          submissions.map((sub) => (
            <motion.div 
              key={sub.id}
              layoutId={sub.id}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                       {sub.profiles.full_name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">{sub.profiles.full_name}</h3>
                       <p className="text-slate-500 font-bold text-sm">{sub.courses.title}</p>
                       <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest"><Clock className="h-3 w-3" /> Submitted {new Date(sub.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-500 tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Final Assessment</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedSubmission(sub)}
                      className="px-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" /> View Answers
                    </button>
                    <button 
                      onClick={() => publishCertificate(sub)}
                      className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
                    >
                      <Award className="h-4 w-4" /> Publish Certificate
                    </button>
                 </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedSubmission(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             ></motion.div>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
             >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900">Review Answers</h2>
                      <p className="text-slate-500 text-sm font-bold">{selectedSubmission.profiles.full_name} • {selectedSubmission.courses.title}</p>
                   </div>
                   <button onClick={() => setSelectedSubmission(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-white rounded-full shadow-sm"><XCircle className="h-6 w-6" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-8">
                   {selectedSubmission.content.questions.map((q: any, idx: number) => {
                      const studentAnswer = selectedSubmission.content.answers[idx];
                      const isCorrect = studentAnswer === q.correctAnswer;
                      return (
                        <div key={idx} className={`p-8 rounded-3xl border ${isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                           <p className="font-black text-slate-900 mb-6 flex gap-3"><span className="text-slate-300">{idx + 1}</span> {q.question}</p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.options.map((opt: string, oIdx: number) => (
                                <div key={oIdx} className={`p-4 rounded-xl text-sm font-bold border flex items-center justify-between ${
                                  oIdx === q.correctAnswer ? 'bg-emerald-500 border-emerald-500 text-white' :
                                  oIdx === studentAnswer ? 'bg-rose-500 border-rose-500 text-white' :
                                  'bg-white border-slate-100 text-slate-400'
                                }`}>
                                   {opt}
                                   {oIdx === q.correctAnswer && <CheckCircle className="h-4 w-4" />}
                                   {oIdx === studentAnswer && oIdx !== q.correctAnswer && <XCircle className="h-4 w-4" />}
                                </div>
                              ))}
                           </div>
                        </div>
                      );
                   })}
                </div>
                <div className="p-8 border-t border-slate-100 flex justify-end gap-4">
                   <button onClick={() => setSelectedSubmission(null)} className="px-8 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors">Close</button>
                   <button 
                     onClick={() => publishCertificate(selectedSubmission)}
                     className="px-8 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                   >
                     Approve & Publish Certificate
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
