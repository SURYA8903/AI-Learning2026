import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Course, CourseModule } from '../../types';
import { PlayCircle, CheckCircle, ChevronRight, Award, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
      if (data) {
        setCourse(data);
        if (data.modules && data.modules.length > 0) {
          setCurrentModule(data.modules[0]);
        }
      }
      setLoading(false);
    };
    fetchCourse();
  }, [courseId]);

  const toggleModuleCompletion = (moduleId: string) => {
    setCompletedModules(prev => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const isAllCompleted = course?.modules?.every(m => completedModules.includes(m.id));

  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white font-bold">Initializing Classroom...</div>;
  if (!course) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white">Course not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Video Content */}
      <div className="flex-1 flex flex-col bg-black">
        <div className="p-4 bg-slate-900/50 flex items-center justify-between border-b border-white/5">
           <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
           </button>
           <h1 className="text-white font-black text-sm truncate px-4">{course.title}</h1>
           <div className="w-10"></div>
        </div>

        <div className="relative flex-1 aspect-video lg:aspect-auto">
          {currentModule ? (
            <iframe 
              src={getEmbedUrl(currentModule.videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-medium italic">
              Select a module to begin learning
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
           <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className="text-2xl font-black text-white mb-2">{currentModule?.title}</h2>
                    <p className="text-slate-400 text-sm font-medium">Module Duration: {currentModule?.duration || 'N/A'}</p>
                 </div>
                 <button 
                   onClick={() => currentModule && toggleModuleCompletion(currentModule.id)}
                   className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                     completedModules.includes(currentModule?.id || '') 
                     ? 'bg-emerald-500 text-white' 
                     : 'bg-white/10 text-white hover:bg-white/20'
                   }`}
                 >
                   {completedModules.includes(currentModule?.id || '') ? <CheckCircle className="h-5 w-5" /> : null}
                   {completedModules.includes(currentModule?.id || '') ? 'Module Completed' : 'Mark as Complete'}
                 </button>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-8">
                 <motion.div 
                   className="h-full bg-indigo-500"
                   initial={{ width: 0 }}
                   animate={{ width: `${(completedModules.length / (course.modules?.length || 1)) * 100}%` }}
                 ></motion.div>
              </div>
           </div>
        </div>
      </div>

      {/* Sidebar - Curriculum */}
      <div className="w-full lg:w-96 bg-slate-900 border-l border-white/5 flex flex-col h-screen">
        <div className="p-6 border-b border-white/5">
           <h3 className="text-white font-black text-lg uppercase tracking-tight">Course Curriculum</h3>
           <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">{completedModules.length} / {course.modules?.length} Completed</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {course.modules?.map((mod, idx) => (
             <button 
               key={mod.id}
               onClick={() => setCurrentModule(mod)}
               className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left group ${
                 currentModule?.id === mod.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-white/5 border border-transparent hover:bg-white/10'
               }`}
             >
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                 completedModules.includes(mod.id) ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
               }`}>
                 {completedModules.includes(mod.id) ? <CheckCircle className="h-4 w-4" /> : idx + 1}
               </div>
               <div className="flex-1">
                  <p className={`text-sm font-bold truncate ${currentModule?.id === mod.id ? 'text-white' : 'text-slate-400'}`}>{mod.title}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{mod.duration}</p>
               </div>
               <PlayCircle className={`h-4 w-4 transition-all ${currentModule?.id === mod.id ? 'text-indigo-400 opacity-100' : 'text-white opacity-0 group-hover:opacity-30'}`} />
             </button>
           ))}
        </div>

        {isAllCompleted && (
          <div className="p-6 bg-indigo-600/10 border-t border-indigo-500/20">
             <button 
               onClick={() => navigate(`/dashboard/student/course/${courseId}/assessment`)}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
             >
               <Award className="h-5 w-5" /> Take Final Assessment
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
