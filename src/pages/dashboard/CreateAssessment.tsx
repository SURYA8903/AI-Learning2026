import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  HelpCircle,
  Clock,
  ChevronRight,
  Send,
  Layout
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function CreateAssessment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState([{ id: Date.now(), text: '' }]);
  const [isPublishing, setIsPublishing] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '' }]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const publishAssessment = async () => {
    if (!user || !title) return;
    setIsPublishing(true);
    try {
      await supabase.from('assessments').insert([{
        title,
        // Assuming instructions/questions are columns or jsonb in your schema, or just mock it:
        instructor_id: user.id
      }]);
      navigate('/dashboard/trainer/assessments/grade');
    } catch (err) {
      console.error('Error publishing assessment', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Assessment</h1>
          <p className="text-slate-500 font-medium mt-1">Design challenges and evaluate student progress.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            Save as Draft
          </button>
          <button 
            onClick={publishAssessment}
            disabled={isPublishing}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isPublishing ? 'Publishing...' : 'Publish Assessment'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Assessment Details</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Quiz Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Calculus Midterm" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Instructions</label>
                <textarea 
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Briefly explain the assessment rules..." 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="pt-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">Questions</h3>
                  <button 
                    onClick={addQuestion}
                    className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl group animate-in zoom-in-95 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Question {idx + 1}</span>
                        <button 
                          onClick={() => removeQuestion(q.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Enter your question here..." 
                        className="w-full px-0 py-2 bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:text-slate-400"
                      />
                      <div className="mt-6 flex gap-4">
                        <div className="flex-1 h-12 bg-white border border-slate-100 rounded-xl flex items-center px-4 text-xs font-bold text-slate-400">Option 1</div>
                        <div className="flex-1 h-12 bg-white border border-slate-100 rounded-xl flex items-center px-4 text-xs font-bold text-slate-400">Option 2</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Side */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/20">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Layout className="w-5 h-5 text-indigo-400" />
              Settings
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Time Limit</p>
                  <p className="text-[10px] text-white/50">Duration for completion</p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg font-black text-xs">
                  <Clock className="w-3 h-3" />
                  60m
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Pass Marks</p>
                  <p className="text-[10px] text-white/50">Minimum to succeed</p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg font-black text-xs">
                  75%
                </div>
              </div>

              <div className="p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-indigo-300">Link to Course</p>
                  <p className="text-[10px] text-indigo-400/80">Auto-unlock on completion</p>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white/50">PREVIEW SCORE</span>
                <span className="text-xs font-black text-indigo-400">100 PTS</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[100%] h-full bg-indigo-500"></div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-[32px] p-8 border border-indigo-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="font-black text-indigo-900">Tips for Trainers</h4>
            </div>
            <p className="text-xs font-medium text-indigo-700/70 leading-relaxed">
              Mix multiple choice with descriptive questions for better evaluation of student understanding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
