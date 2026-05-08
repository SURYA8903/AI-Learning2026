import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MessageSquare, 
  Award, 
  CheckCircle2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar
} from 'lucide-react';

export default function ManageStudents() {
  const stats = [
    { label: 'TOTAL STUDENTS', value: '124', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'AVERAGE ATTENDANCE', value: '92%', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'PENDING QUERIES', value: '18', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'COMPLETIONS', value: '45', icon: Award, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const students = [
    { 
      name: 'Elena Rodriguez', 
      email: 'elena.r@student.edu', 
      image: 'https://i.pravatar.cc/150?u=elena',
      present: 24, 
      absent: 2, 
      course: 'Full Stack Dev', 
      progress: 100, 
      status: 'Completed',
      queries: 3
    },
    { 
      name: 'Julian Thorne', 
      email: 'j.thorne@student.edu', 
      image: 'https://i.pravatar.cc/150?u=julian',
      present: 18, 
      absent: 8, 
      course: 'Data Science', 
      progress: 64, 
      status: 'In Progress',
      queries: 1
    },
    { 
      name: 'Marcus Chen', 
      email: 'm.chen@student.edu', 
      image: 'https://i.pravatar.cc/150?u=marcus',
      present: 26, 
      absent: 0, 
      course: 'Cyber Security', 
      progress: 100, 
      status: 'Completed',
      queries: 0
    },
    { 
      name: 'Sophia Williams', 
      email: 's.williams@student.edu', 
      image: 'https://i.pravatar.cc/150?u=sophia',
      present: 12, 
      absent: 14, 
      course: 'UI/UX Design', 
      progress: 25, 
      status: 'At Risk',
      queries: 5
    }
  ];

  const queries = [
    { name: 'Elena Rodriguez', time: '2h ago', text: "I'm having trouble accessing the final module for the Full Stack course. Can you..." },
    { name: 'Sophia Williams', time: '5h ago', text: "I missed the last session due to health issues. Will there be a recording?" }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor your cohort's performance, manage attendance, and facilitate direct communications.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          {/* Students Table */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Progress</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((student, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={student.image} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                            {student.queries > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                {student.queries}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                            <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            {student.present} Present
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            {student.absent} Absent
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="w-40 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400">{student.course}</span>
                            <span className="text-teal-600">{student.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-500 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          student.status === 'Completed' ? 'bg-teal-50 text-teal-600' :
                          student.status === 'In Progress' ? 'bg-orange-50 text-orange-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          disabled={student.status !== 'Completed'}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            student.status === 'Completed' 
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20' 
                              : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                          }`}
                        >
                          Release Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400">Showing 4 of 124 students</p>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Unread Student Queries */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Unread Student Queries</h2>
              <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">18 New</span>
            </div>
            <div className="space-y-4">
              {queries.map((q, i) => (
                <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group cursor-pointer hover:border-indigo-200 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-900">{q.name}</h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium italic">"{q.text}"</p>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl font-bold text-xs hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm">
                    Reply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Release Schedule Sidebar */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <h3 className="text-2xl font-black mb-6 relative z-10">Release Schedule</h3>
            <p className="text-indigo-100 text-sm font-medium mb-10 opacity-80 leading-relaxed relative z-10">
              Upcoming certificates due for automated release in the next 24 hours.
            </p>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">12 Batch A</h4>
                  <p className="text-[10px] text-indigo-200">Full Stack Dev</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">08 Batch C</h4>
                  <p className="text-[10px] text-indigo-200">Cyber Security</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-10 bg-white text-indigo-600 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all relative z-10">
              Manage Queue
            </button>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2">Office Hours</h4>
            <p className="text-xs text-slate-500 font-medium mb-6">Your next live session starts in 4 hours.</p>
            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-sm hover:bg-slate-800 transition-colors">
              Set Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
