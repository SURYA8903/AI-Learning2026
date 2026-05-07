import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Course } from '../../types';
import { BookOpen, PlayCircle, Trophy, Clock, ArrowRight, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function MyCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      try {
        const { data: enrollments } = await supabase.from('enrollments').select('*').eq('student_id', user.id);
        const courseIds = enrollments?.map((e: any) => e.course_id) || [];

        if (courseIds.length > 0) {
          const { data: coursesData } = await supabase.from('courses').select('*').in('id', courseIds);
          const fetchedCourses = (coursesData || []).map((c: any) => ({
             id: c.id,
             title: c.title,
             description: c.description,
             instructorId: c.instructor_id,
             category: c.category,
             status: c.status,
             price: c.price,
             thumbnailUrl: c.thumbnail_url,
             qualityScore: c.quality_score,
             createdAt: c.created_at,
             updatedAt: c.updated_at
          } as Course));
          
          const completed: Course[] = [];
          const current: Course[] = [];
          
          fetchedCourses.forEach(c => {
             const e = enrollments?.find((e: any) => e.course_id === c.id);
             if (e && e.status === 'completed') completed.push(c);
             else current.push(c);
          });
          
          setCompletedCourses(completed);
          setCurrentCourses(current);
        }
      } catch (err) {
        console.error('Error fetching my courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-3xl w-1/3"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-100 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayedCourses = activeTab === 'current' ? currentCourses : completedCourses;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">My Learning Path</h1>
          <p className="text-slate-500 font-medium">Pick up where you left off and master new skills.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">{completedCourses.length} Completed</span>
           </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('current')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Current Courses ({currentCourses.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Completed ({completedCourses.length})
        </button>
      </div>

      {displayedCourses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-premium"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <BookOpen className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">No {activeTab} courses</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
            {activeTab === 'current' ? "Your learning journey is waiting. Explore our premium AI-driven marketplace to find your next goal." : "Finish your current courses to earn certificates!"}
          </p>
          {activeTab === 'current' && (
            <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
              Browse Courses <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedCourses.map(course => (
            <motion.div 
              key={course.id} 
              whileHover={{ y: -5 }}
              onClick={() => {
                if (activeTab === 'completed') {
                  navigate('/dashboard/student/certificates');
                } else {
                  navigate(`/courses/${course.id}`);
                }
              }}
              className="card-premium p-0 group overflow-hidden cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={course.title} 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400' }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                  {activeTab === 'completed' ? <Award className="h-14 w-14 text-white" /> : <PlayCircle className="h-14 w-14 text-white" />}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-primary">
                  {course.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                
                {activeTab === 'current' ? (
                  <>
                    <div className="space-y-3 mb-6">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-primary">33%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '33%' }}
                            className="h-full bg-primary" 
                          />
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                         <Clock className="h-3.5 w-3.5" />
                         <span className="text-xs font-bold">2h left</span>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-primary group-hover:underline flex items-center gap-1">
                        Continue <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-500">
                       <Trophy className="h-4 w-4" />
                       <span className="text-xs font-bold uppercase tracking-widest">Completed</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-600 group-hover:underline flex items-center gap-1">
                      View Certificate <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
