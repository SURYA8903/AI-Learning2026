import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Assessment, Course } from '../../types';
import { CheckCircle, ShieldCheck, ArrowRight, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

export default function AssessmentView() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      
      const [courseRes, assessmentRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('assessments').select('*').eq('course_id', courseId).single()
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (assessmentRes.data) {
        setAssessment(assessmentRes.data);
        setAnswers(new Array(assessmentRes.data.questions.length).fill(-1));
      }
      setLoading(false);
    };
    fetchData();
  }, [courseId]);

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = oIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!user || !courseId || !assessment) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('submissions').insert([{
        user_id: user.id,
        course_id: courseId,
        type: 'assessment',
        content: {
          assessmentId: assessment.id,
          answers: answers,
          questions: assessment.questions
        },
        status: 'submitted'
      }]);

      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard/student/my-courses'), 3000);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">Loading Assessment...</div>;
  if (!assessment) return <div className="min-h-screen flex items-center justify-center bg-slate-50">No assessment found for this course.</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle className="h-12 w-12" />
        </motion.div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Assessment Submitted!</h1>
        <p className="text-slate-500 max-w-sm font-medium">Your answers have been sent to the trainer for evaluation. You will be notified once they have graded your submission.</p>
        <p className="text-xs text-slate-400 mt-8 font-black uppercase tracking-widest animate-pulse">Redirecting to Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
         <header className="mb-12">
            <div className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">
               <BrainCircuit className="h-4 w-4" /> Final Step
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">{assessment.title}</h1>
            <p className="text-slate-500 font-medium">Please answer all questions carefully. This assessment determines your eligibility for certification.</p>
         </header>

         <div className="space-y-8">
            {assessment.questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex gap-4">
                  <span className="text-indigo-200">0{qIdx + 1}</span>
                  {q.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleOptionSelect(qIdx, oIdx)}
                      className={`p-6 rounded-2xl border text-left font-bold transition-all ${
                        answers[qIdx] === oIdx 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' 
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
         </div>

         <footer className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-900 rounded-[2.5rem] p-10 text-white">
            <div>
               <h4 className="text-lg font-black mb-1 flex items-center gap-2">
                 <ShieldCheck className="h-5 w-5 text-emerald-400" /> Integrity Check
               </h4>
               <p className="text-slate-400 text-sm font-medium">By submitting, you confirm this is your own work.</p>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || answers.includes(-1)}
              className="px-10 py-5 bg-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-indigo-900/50"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Assessment'} <ArrowRight className="h-5 w-5" />
            </button>
         </footer>
      </div>
    </div>
  );
}
