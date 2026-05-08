import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { supabase } from '../../lib/supabase';

export default function Attendance() {
  const { user } = useAuth();
  const [hasMarked, setHasMarked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
        
      if (data) {
        setHistory(data);
        const today = new Date().setHours(0,0,0,0);
        const markedToday = data.some(r => {
          const d = new Date(r.created_at);
          return d.setHours(0,0,0,0) === today;
        });
        setHasMarked(markedToday);
        setStreak(markedToday ? 13 : 12);
        setLoading(false);
      }
    };

    fetchHistory();

    const channel = supabase.channel('public:attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${user.id}` }, payload => {
        fetchHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAttendance = async () => {
    if (!user || hasMarked) return;
    try {
      await supabase.from('attendance').insert([{
        student_id: user.id,
        status: 'present'
      }]);
      // Streak logic & notifications would be handled via Cloud Functions or deeper local logic
    } catch (err) {
      console.error('Error marking attendance:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Tracker</h1>
        <p className="text-slate-500 font-medium mt-1">Stay consistent and build your learning streak.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Check-in */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Daily Check-in</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Your attendance is crucial for your final grade. Mark your attendance for today to keep your streak alive.
            </p>
            <div className="pt-4">
              <button
                onClick={markAttendance}
                disabled={hasMarked || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  hasMarked 
                    ? 'bg-green-100 text-green-700 shadow-green-100/50 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {hasMarked ? 'Attendance Marked' : 'Mark My Attendance'}
              </button>
              <p className="text-xs text-slate-400 mt-3 font-medium">
                {hasMarked ? 'Next check-in available tomorrow' : 'Next check-in available in 23h 45m'}
              </p>
            </div>
          </div>
          <div className="w-full md:w-64 h-48 bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
             <div className="bg-white/80 backdrop-blur shadow-sm border border-slate-200/50 rounded-xl p-4 z-10 w-full text-center">
                <CalendarIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <div className="h-2 w-16 bg-slate-200 rounded-full mx-auto mb-1"></div>
                <div className="h-2 w-12 bg-slate-200 rounded-full mx-auto"></div>
             </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Current Streak</h2>
            <span className="text-4xl font-black text-indigo-600">{hasMarked ? '13' : '12'}</span>
          </div>

          <div className="flex justify-between items-center mb-10">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 4 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 
                  (i === 4 && hasMarked) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {i < 4 || (i === 4 && hasMarked) ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Next Milestone</p>
              <p className="text-xs font-medium text-slate-500">15 Days - "The Scholar" Badge</p>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">Attendance History</h2>
            <div className="flex items-center gap-4 font-bold text-slate-600">
               <button className="hover:text-indigo-600 transition-colors">&lt;</button>
               <span>October 2023</span>
               <button className="hover:text-indigo-600 transition-colors">&gt;</button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 md:gap-4 text-center">
             {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-xs font-bold text-slate-400 mb-2">{d}</div>
             ))}
             {Array.from({length: 31}).map((_, i) => {
                const day = i + 1;
                const isPresent = day < 5 || day > 7 && day < 12;
                const isToday = day === 5;
                const offset = 2; // Starts on Tuesday

                if (i === 0) {
                   return (
                      <React.Fragment key="start">
                         <div className="aspect-square"></div>
                         <div className="aspect-square"></div>
                         <div className={`aspect-square flex flex-col items-center justify-center rounded-xl font-bold text-sm ${isPresent ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}>
                           {day}
                           {isPresent && <div className="w-1 h-1 bg-indigo-600 rounded-full mt-1"></div>}
                         </div>
                      </React.Fragment>
                   )
                }

                return (
                   <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-xl font-bold text-sm ${
                      isToday ? (hasMarked ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200' : 'bg-slate-50 text-slate-900 border-2 border-slate-200') :
                      isPresent ? 'bg-indigo-50 text-indigo-700' : 
                      day > 5 ? 'text-slate-400' :
                      'text-slate-900 bg-slate-50'
                   }`}>
                     {day}
                     {isPresent || (isToday && hasMarked) ? <div className="w-1 h-1 bg-indigo-600 rounded-full mt-1"></div> : null}
                   </div>
                )
             })}
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-500 mb-6">Monthly Attendance</h2>
              <div className="flex items-end gap-3 mb-4">
                 <span className="text-5xl font-black text-slate-900">92%</span>
                 <span className="text-sm font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg mb-1">+4% vs last month</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                 <div className="bg-indigo-600 h-2 rounded-full w-[92%]"></div>
              </div>
              <p className="text-xs font-medium text-slate-500">24 out of 26 school days attended in October.</p>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-500 mb-6">Recent Activity</h2>
              <div className="space-y-6">
                 <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                       <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5" />
                       <div>
                          <p className="text-sm font-bold text-slate-900">Oct 03, 2023</p>
                          <p className="text-xs text-slate-500">Present</p>
                       </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">08:45 AM</span>
                 </div>
                 <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                       <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5" />
                       <div>
                          <p className="text-sm font-bold text-slate-900">Oct 02, 2023</p>
                          <p className="text-xs text-slate-500">Present</p>
                       </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">09:02 AM</span>
                 </div>
                 <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                       <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                       <div>
                          <p className="text-sm font-bold text-slate-900">Sep 30, 2023</p>
                          <p className="text-xs text-slate-500 text-red-500">Absent</p>
                       </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">-</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
