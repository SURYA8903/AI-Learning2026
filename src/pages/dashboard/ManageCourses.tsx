import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Upload, 
  Settings, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter,
  FileText,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export default function ManageCourses() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const mapped = data.map((c: any) => ({
           id: c.id,
           title: c.title,
           description: c.description,
           category: c.category,
           status: c.status,
           image: c.thumbnail_url,
           modules: [] // Mock for now or fetch from a modules table
        }));
        setCourses(mapped);
        if (selectedCourse) {
          const updated = mapped.find((c: any) => c.id === selectedCourse.id);
          if (updated) setSelectedCourse(updated);
        }
        setLoading(false);
      }
    };
    
    fetchCourses();
    
    const channel = supabase.channel('public:courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses', filter: `instructor_id=eq.${user.id}` }, payload => {
        fetchCourses();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedCourse]);

  const enrolledStudents = [
    { name: 'Alex Thompson', email: 'a.thompson@student.edu', progress: 88, status: 'Active' },
    { name: 'Sarah Jenkins', email: 's.jenkins@student.edu', progress: 95, status: 'Active' },
    { name: 'Michael Chen', email: 'm.chen@student.edu', progress: 42, status: 'Active' },
  ];

  if (selectedCourse) {
    const course = selectedCourse;
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{course?.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                course?.status === 'published' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {course?.status}
              </span>
              <span className="text-xs text-slate-400 font-bold">• 0 Enrolled Students</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Materials Upload Section */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900">Course Materials</h2>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                  <Upload className="w-4 h-4" />
                  Upload Material
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Module 1 - Architecture Overview.pdf</h4>
                      <p className="text-xs text-slate-500 font-medium">Added 2 days ago • 4.2 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-slate-900"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Advanced Design Patterns Cheat Sheet.pdf</h4>
                      <p className="text-xs text-slate-500 font-medium">Added 5 days ago • 1.8 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-slate-900"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrolled Students Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">Enrolled Students</h2>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrolledStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                            {s.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{s.name}</h5>
                            <p className="text-[10px] text-slate-400 font-medium">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                            <div className="h-full bg-teal-500" style={{ width: `${s.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-600">{s.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-700 p-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white">
              <h3 className="text-lg font-black mb-6">Course Stats</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Completion Rate</span>
                  <span className="text-sm font-black text-indigo-400">72%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Avg. Test Score</span>
                  <span className="text-sm font-black text-indigo-400">84/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Active Today</span>
                  <span className="text-sm font-black text-teal-400">12 Students</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[32px] p-8 text-white text-center">
              <h4 className="text-lg font-black mb-2">Need to update?</h4>
              <p className="text-xs text-indigo-100 opacity-70 mb-6">Changes will be reflected in student dashboards immediately.</p>
              <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors">
                Edit Curriculum
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Courses</h1>
          <p className="text-slate-500 font-medium mt-1">Review your library, update materials, and track enrollment.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:scale-95">
          <Plus className="w-5 h-5" />
          <span>New Course</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search library..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
          <button className="text-indigo-600">All (12)</button>
          <button className="hover:text-slate-600">Published (8)</button>
          <button className="hover:text-slate-600">Drafts (4)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.map((course) => (
          <div key={course.id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-2">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                <span className={`text-[8px] font-black uppercase tracking-widest text-white`}>
                  {course.status}
                </span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">{course.title}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">0</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{course.modules?.length || 0} Modules</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedCourse(course)}
                  className="text-xs font-black text-indigo-600 flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Manage Course
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Placeholder */}
        <Link to="/dashboard/trainer/courses/create" className="aspect-[16/22] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center p-8 text-center group hover:border-indigo-500/50 hover:bg-indigo-50/10 transition-all">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors mb-6">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Create New Course</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">Launch a new module to your library in minutes.</p>
        </Link>
      </div>
    </div>
  );
}
