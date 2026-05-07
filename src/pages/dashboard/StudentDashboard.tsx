import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Course } from '../../types';
import { 
  Search, 
  ChevronRight, 
  Target, 
  Clock, 
  TrendingUp,
  Cpu,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // Fetch purchased courses
        const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('student_id', user.id);
        const courseIds = enrollments?.map((e: any) => e.course_id) || [];
        
        let fetchedCourses: Course[] = [];
        if (courseIds.length > 0) {
          const { data: coursesData } = await supabase.from('courses').select('*').in('id', courseIds);
          fetchedCourses = (coursesData || []).map((c: any) => ({
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
          })) as Course[];
        }
        setCourses(fetchedCourses);

        // Fetch AI recommendation
        try {
          const { data: allCoursesSnap } = await supabase.from('courses').select('*').eq('status', 'published');
          const allCourses = (allCoursesSnap || []).map((c: any) => ({
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
          })) as Course[];

          const res = await fetch('/api/ai/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userProfile: profile,
              availableCourses: allCourses
            })
          });
          const recIds = await res.json();
          if (Array.isArray(recIds) && recIds.length > 0) {
            const recommended = allCourses.find(c => c.id === recIds[0]);
            if (recommended) setAiRecommendation(recommended);
          }
        } catch (aiErr) {
          console.error("AI fetch failed", aiErr);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  const totalHours = courses.length * 15.5;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-10">
          
          {/* 3 Top Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <Search className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Browse Courses</h3>
               <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">Explore 500+ premium AI and Dev courses.</p>
               <Link to="/courses" className="mt-auto text-sm font-bold text-indigo-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore Catalogue <ChevronRight className="h-4 w-4" />
               </Link>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group">
               <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-6">
                  <Briefcase className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Purchase Courses</h3>
               <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">Starting at just ₹499 INR. Lifetime access.</p>
               <Link to="/courses" className="mt-auto text-sm font-bold text-indigo-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                  View Pricing <ChevronRight className="h-4 w-4" />
               </Link>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                  <Target className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">My Certificates</h3>
               <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">View and download your earned credentials.</p>
               <Link to="/dashboard/student/certificates" className="mt-auto text-sm font-bold text-indigo-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                  View Certificates <ChevronRight className="h-4 w-4" />
               </Link>
            </motion.div>
          </div>

          {/* Learning Flow Section */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-2xl font-black text-slate-900">Learning Flow</h2>
               <Link to="/dashboard/student/my-courses" className="text-sm font-bold text-indigo-600 hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
               {loading ? (
                 <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-slate-100 rounded-3xl w-full"></div>
                    <div className="h-24 bg-slate-100 rounded-3xl w-full"></div>
                 </div>
               ) : courses.length > 0 ? (
                 courses.slice(0, 3).map((course, i) => (
                   <div key={course.id} className="bg-indigo-50/30 rounded-3xl p-6 flex items-center gap-6 border border-indigo-50/50 cursor-pointer hover:bg-indigo-50/60 transition-colors" onClick={() => navigate(`/courses/${course.id}`)}>
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                         <Target className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start">
                            <div>
                               <h4 className="font-bold text-slate-900">{course.title}</h4>
                               <p className="text-xs text-slate-400 font-medium mt-1">In Progress • Continue Learning</p>
                            </div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-100 px-3 py-1 rounded-full whitespace-nowrap hidden sm:inline-block">Resume</span>
                         </div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10">
                    <p className="text-slate-500 font-medium">You haven't enrolled in any courses yet.</p>
                    <Link to="/courses" className="inline-block mt-4 text-indigo-600 font-bold hover:underline">Browse Courses</Link>
                 </div>
               )}
            </div>
          </div>

          {/* Daily Attendance & Streak */}
          <div className="grid md:grid-cols-2 gap-8 pb-10">
             <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all" onClick={() => navigate('/dashboard/student/attendance')}>
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <Clock className="h-8 w-8" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Daily Check-in</h4>
                      <p className="text-xs text-slate-400 font-medium">Mark your attendance for today</p>
                   </div>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20">Mark Now</button>
             </div>

             <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-all" onClick={() => navigate('/dashboard/student/attendance')}>
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-8 w-8" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black tracking-tight">Current Streak</h4>
                      <p className="text-xs text-white/50 font-medium">12 Days Running 🔥</p>
                   </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/20 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="lg:col-span-3 space-y-8">
           {/* AI Assistant Card */}
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-6 opacity-60">
                    <Cpu className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI ASSISTANT</span>
                 </div>
                 <h3 className="text-2xl font-black mb-4 leading-tight">Recommended for your Next Step</h3>
                 <p className="text-white/70 text-xs font-medium mb-8 leading-relaxed">
                   {aiRecommendation ? `Based on your profile, we recommend "${aiRecommendation.title}".` : 'Analyzing your profile to find the best match...'}
                 </p>
                 <button onClick={() => aiRecommendation && navigate(`/courses/${aiRecommendation.id}`)} className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm shadow-lg">
                    {aiRecommendation ? 'View Course' : 'Discover'}
                 </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           </div>

           {/* Learning Insights */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Learning Insights</h3>
              <div className="space-y-10">
                 <div className="flex items-start justify-between border-l-4 border-indigo-600 pl-4">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Hours</p>
                       <span className="text-3xl font-black text-slate-900 tracking-tight">{totalHours > 0 ? totalHours : 0}h</span>
                    </div>
                 </div>

                 <div className="flex items-start justify-between border-l-4 border-cyan-500 pl-4">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skill Level</p>
                       <span className="text-2xl font-black text-slate-900 tracking-tight">{courses.length > 2 ? 'Advanced' : courses.length > 0 ? 'Intermediate' : 'Beginner'}</span>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                       <TrendingUp className="h-5 w-5" />
                    </div>
                 </div>

                 <div className="flex items-start justify-between border-l-4 border-orange-500 pl-4">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Course Points</p>
                       <span className="text-2xl font-black text-slate-900 tracking-tight">{courses.length * 1500}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
