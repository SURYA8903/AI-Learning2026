import React from 'react';
import { 
  Users, 
  Star, 
  BookOpen, 
  Plus, 
  Play, 
  ChevronRight, 
  MessageSquare, 
  FileText,
  Rocket,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrainerDashboard() {
  const stats = [
    { label: 'TOTAL STUDENTS', value: '1,284', change: '+12% this month', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'AVERAGE RATING', value: '4.9/5.0', change: 'Top 1% of Trainers', icon: Star, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'ACTIVE COURSES', value: '12', change: '3 sessions live today', icon: Play, color: 'bg-orange-50 text-orange-600' },
  ];

  const reviewItems = [
    { title: 'Intro to AI Ethics', meta: 'Drafted by AI • 4 mins ago', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Final Assessment V2', meta: 'Manual Draft • 2 hours ago', icon: MessageSquare, color: 'bg-indigo-50 text-indigo-600', isNew: true },
    { title: 'Week 3 Video Captions', meta: 'Processing • 5 hours ago', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
  ];

  const studentProgress = [
    { name: 'Product Management 101', progress: 88 },
    { name: 'User Research Methods', progress: 64 },
    { name: 'Figma Advanced Prototyping', progress: 92 },
    { name: 'Design Systems with React', progress: 31 },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Trainer Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back, Sarah. Here's your teaching summary for today.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:scale-95">
          <Plus className="w-5 h-5" />
          <span>New Request</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-teal-500 mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Session & Create Course */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row h-full">
            <div className="md:w-1/2 relative min-h-[300px]">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
                alt="Live Session" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Live Now
              </div>
            </div>
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Advanced UX Design</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-6">Module 4: Cognitive Load & Retention</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                You are currently hosting a live session with 42 active participants. 3 students have pending questions.
              </p>
              <div className="flex items-center gap-6 mt-auto">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      className="w-10 h-10 rounded-full border-4 border-white object-cover" 
                      alt="Student"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +39
                  </div>
                </div>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Course Sidebar Card */}
        <div className="bg-indigo-600 rounded-[32px] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-black leading-tight mb-6">Create Course</h2>
            <p className="text-indigo-100 font-medium leading-relaxed mb-10 opacity-80">
              Use our AI-assisted curriculum builder to launch your next module in minutes.
            </p>
            <div className="mt-auto">
              <Link to="/dashboard/trainer/courses/create" className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all group/btn shadow-xl shadow-indigo-900/20">
                Start Building
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Content */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Content</h2>
            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">3 Pending</span>
          </div>
          <div className="space-y-4">
            {reviewItems.map((item, i) => (
              <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{item.meta}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Student Progress */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Progress</h2>
              <p className="text-xs font-medium text-slate-400 mt-1">Real-time engagement across your top 4 courses.</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white rounded-lg shadow-sm">Weekly</button>
              <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly</button>
            </div>
          </div>
          <div className="space-y-8">
            {studentProgress.map((course, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-700">{course.name}</span>
                  <span className="text-xs font-black text-teal-600">{course.progress}% Completion</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
