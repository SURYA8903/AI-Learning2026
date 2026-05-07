import React, { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, Calendar, Download, Activity, AlertTriangle, Award, CheckCircle, Search } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Monitoring growth, engagement, and operational health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
            <Calendar className="h-4 w-4" /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              +12.5%
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Active Users</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-3xl font-black text-slate-900">12,840</h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span>8.4k Students</span>
            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
            <span>4.4k Trainers</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden flex">
             <div className="h-full bg-indigo-600 w-[65%]"></div>
             <div className="h-full bg-slate-200 w-[35%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              +8%
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
            <CreditCard className="h-6 w-6" />
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Revenue</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-3xl font-black text-slate-900">$42,180</h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span>Avg. $45 / student</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
              -2%
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Completion</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-3xl font-black text-slate-900">68.4%</h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span>Active learners: 3.2k</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Growth Chart (Dummy representation) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-lg font-bold text-slate-900">Platform Growth</h2>
                 <p className="text-xs text-slate-500 mt-1">Daily registrations and visitor traffic</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                    <span className="text-xs font-bold text-slate-600">Signups</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                    <span className="text-xs font-bold text-slate-600">Traffic</span>
                 </div>
              </div>
           </div>
           
           <div className="h-64 flex items-end justify-between gap-2 px-2">
              {/* Simulated bars */}
              {[40, 55, 45, 65, 80, 50, 60, 90, 70, 85, 60, 75].map((height, i) => (
                 <div key={i} className="w-full bg-indigo-100 rounded-t-sm transition-all hover:bg-indigo-200" style={{ height: `${height}%` }}></div>
              ))}
           </div>
           <div className="flex justify-between items-center mt-4 text-[10px] font-bold text-slate-400 uppercase">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
             <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          <div className="space-y-6 flex-1">
             {/* Activity Item 1 */}
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-1">
                   <Users className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900">New Trainer Application</p>
                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dr. Sarah Jenkins applied for the Science Department.</p>
                   <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-indigo-700">Review</button>
                      <button className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-200">Dismiss</button>
                   </div>
                </div>
             </div>

             {/* Activity Item 2 */}
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0 mt-1">
                   <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900">High Server Load</p>
                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">Platform traffic exceeded 85% capacity during peak hours.</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">2 HOURS AGO</p>
                </div>
             </div>

             {/* Activity Item 3 */}
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-1">
                   <Award className="h-4 w-4" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900">Course Milestone</p>
                   <p className="text-xs text-slate-500 mt-1 leading-relaxed">"Advanced React" reached 500 active enrollments.</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">5 HOURS AGO</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Pending Trainer Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Pending Trainer Approvals</h2>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search trainers..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="px-6 py-4">Trainer Name</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Application Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" className="w-8 h-8 rounded-full object-cover" alt="" />
                    <p className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">Science</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">Oct 24, 2023</td>
                <td className="px-6 py-4">
                   <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div> Pending Review
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Review</button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60" className="w-8 h-8 rounded-full object-cover" alt="" />
                    <p className="text-sm font-bold text-slate-900">Michael Chen</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg">Technology</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">Oct 23, 2023</td>
                <td className="px-6 py-4">
                   <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div> Pending Review
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
