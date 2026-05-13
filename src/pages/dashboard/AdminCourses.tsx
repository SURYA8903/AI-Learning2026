import React from 'react';
import { supabase } from '../../lib/supabase';
import { Course } from '../../types';
import { Search, Filter, BookOpen, Users, ShieldCheck, AlertTriangle, MoreVertical } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      setCourses((data || []).map(c => ({
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
      })) as Course[]);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    avgScore: courses.length > 0 ? (courses.reduce((acc, c) => acc + (c.qualityScore || 0), 0) / courses.length).toFixed(1) : 0,
    pending: courses.filter(c => c.status === 'pending').length
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Oversee Courses</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Global curriculum management and quality assurance dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 mb-1">Total Courses</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 mb-1">Published</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.published}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 mb-1">Avg Quality Score</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.avgScore} <span className="text-sm text-slate-400 font-bold">/ 5.0</span></h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 mb-1">Pending Review</p>
          <h3 className="text-2xl font-black text-slate-900">{stats.pending}</h3>
        </div>
      </div>

      {/* Course Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative pb-10">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
           <h2 className="text-xl font-bold text-slate-900">Course Inventory</h2>
           <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Course Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading courses...</td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No courses found.</td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100'} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-slate-200" alt="" />
                        <div>
                           <p className="text-sm font-bold text-slate-900">{course.title}</p>
                           <p className="text-[10px] text-slate-500 font-medium mt-0.5">Created {new Date(course.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded-full">{course.category}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`flex items-center gap-1.5 text-xs font-bold ${
                         course.status === 'published' ? 'text-emerald-600' :
                         course.status === 'pending' ? 'text-amber-600' :
                         'text-slate-400'
                       }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             course.status === 'published' ? 'bg-emerald-500' :
                             course.status === 'pending' ? 'bg-amber-500' :
                             'bg-slate-300'
                          }`}></div> {course.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">₹{course.price}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-6 right-6">
           <button className="px-6 py-3 bg-indigo-800 text-white font-bold text-sm rounded-full shadow-xl shadow-indigo-900/30 flex items-center gap-2 hover:-translate-y-1 hover:shadow-2xl hover:bg-indigo-900 transition-all">
              <ShieldCheck className="h-5 w-5" /> Audit New Course
           </button>
        </div>
      </div>
    </div>
  );
}
