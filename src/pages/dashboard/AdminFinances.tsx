import React from 'react';
import { Search, Filter, Wallet, MoreHorizontal, Flag, AlertTriangle, IndianRupee, RotateCcw, MoreVertical } from 'lucide-react';

export default function AdminFinances() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finances & Payments</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Oversee global revenue flow and manage pending distributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-700/20 hover:bg-teal-800 transition-colors">
            <IndianRupee className="h-4 w-4" /> Process Payouts
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-50 transition-colors">
            <RotateCcw className="h-4 w-4" /> Handle Refunds
          </button>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md">
              +12.5%
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900">₹4,285,900</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Payouts</p>
          <h3 className="text-3xl font-black text-slate-900 mb-4">₹842,000</h3>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
             <div className="h-full bg-teal-600 w-[60%]"></div>
             <div className="h-full bg-slate-200 w-[40%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
            <Flag className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Refund Requests</p>
          <h3 className="text-3xl font-black text-slate-900 mb-3">14</h3>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
             <AlertTriangle className="h-3.5 w-3.5" /> 4 Urgent requests pending
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center gap-4">
           <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
           <div className="flex items-center gap-3 w-full max-w-md">
              <div className="relative w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search student or course..." 
                   className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 />
              </div>
              <button className="p-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex-shrink-0">
                 <Filter className="h-5 w-5" />
              </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Amount (₹)</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                    <div>
                       <p className="text-sm font-bold text-slate-900">Ananya Sharma</p>
                       <p className="text-[10px] text-slate-500">ananya.s@email.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg block w-max">UI/UX Advanced Mastery</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">₹12,499</td>
                <td className="px-6 py-4">
                   <p className="text-sm font-medium text-slate-700">Oct 24, 2023</p>
                </td>
                <td className="px-6 py-4">
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full w-max">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Success
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60" className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                    <div>
                       <p className="text-sm font-bold text-slate-900">Rohan Verma</p>
                       <p className="text-[10px] text-slate-500">rohan.v@techmail.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg block w-max">Data Science Boot Camp</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">₹24,999</td>
                <td className="px-6 py-4">
                   <p className="text-sm font-medium text-slate-700">Oct 23, 2023</p>
                </td>
                <td className="px-6 py-4">
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full w-max">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Refunded
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60" className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                    <div>
                       <p className="text-sm font-bold text-slate-900">Priya Kapur</p>
                       <p className="text-[10px] text-slate-500">p.kapur@gmail.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg block w-max">Digital Marketing 101</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">₹5,999</td>
                <td className="px-6 py-4">
                   <p className="text-sm font-medium text-slate-700">Oct 22, 2023</p>
                </td>
                <td className="px-6 py-4">
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full w-max">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Success
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white text-sm">
           <span className="text-slate-500 font-medium">Showing 1 to 10 of 48 transactions</span>
           <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold">&gt;</button>
           </div>
        </div>
      </div>
    </div>
  );
}
