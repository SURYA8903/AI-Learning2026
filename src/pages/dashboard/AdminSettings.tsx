import React from 'react';
import { Save, Settings, Shield, Zap, Key, Plus, ExternalLink, Eye, Activity, Terminal } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your global platform settings, API bridges, and security protocols.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
          <Save className="h-4 w-4" /> Save All Changes
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* General Platform Settings */}
           <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <Settings className="h-5 w-5 text-indigo-600" />
                 <h2 className="text-lg font-bold text-slate-900">General Platform Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Platform Name</label>
                    <input type="text" defaultValue="ADZ4NEEDZ Enterprise" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Support Email</label>
                    <input type="email" defaultValue="admin@adz4needz.ai" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Timezone</label>
                    <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none">
                       <option>UTC (Coordinated Universal Time)</option>
                       <option>IST (Indian Standard Time)</option>
                    </select>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                       <p className="text-sm font-bold text-slate-900">Maintenance Mode</p>
                       <p className="text-xs text-slate-500 mt-0.5">Disable public access during updates</p>
                    </div>
                    <button className="w-10 h-6 bg-slate-200 rounded-full relative transition-colors focus:outline-none">
                       <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform"></div>
                    </button>
                 </div>
              </div>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Razorpay Bridge */}
              <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                             <Zap className="h-4 w-4" />
                          </div>
                          <h2 className="text-base font-bold text-slate-900">Razorpay Bridge</h2>
                       </div>
                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">Connected</span>
                    </div>
                    
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Merchant Key ID</label>
                    <div className="relative">
                       <input type="password" defaultValue="rzp_live_abcdef12345678" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-700 focus:outline-none pr-10" disabled />
                       <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                 </div>
                 <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                    <span className="text-xs font-medium text-slate-500">Live Webhook Status</span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                 </div>
              </section>

              {/* AI Engine */}
              <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-fuchsia-50 flex items-center justify-center text-fuchsia-600">
                             <Activity className="h-4 w-4" />
                          </div>
                          <h2 className="text-base font-bold text-slate-900">AI Engine (LLM)</h2>
                       </div>
                       <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-md uppercase tracking-wider">Config Needed</span>
                    </div>
                    
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Core API Endpoint</label>
                    <input type="text" defaultValue="https://api.openai.com/v1" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mb-4" />
                    
                    <button className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                       <Plus className="h-4 w-4" /> Add API Secret Key
                    </button>
                 </div>
              </section>
           </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
           {/* Access Control */}
           <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <Shield className="h-5 w-5 text-indigo-600" />
                 <h2 className="text-lg font-bold text-slate-900">Access Control</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Admin Roles</p>
                 
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Shield className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Super Admin</p>
                          <p className="text-[10px] text-slate-500">Full System Access</p>
                       </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                 </div>

                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                          <Settings className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Course Manager</p>
                          <p className="text-[10px] text-slate-500">Content & Enrollment Only</p>
                       </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                 </div>

                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                          <Activity className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Support Desk</p>
                          <p className="text-[10px] text-slate-500">Ticket Management</p>
                       </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                 </div>

                 <button className="w-full py-2.5 border-2 border-dashed border-indigo-100 text-indigo-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">
                    <Plus className="h-4 w-4" /> Define New Role
                 </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Security Policies</p>
                 
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Enforce 2FA for Admins</span>
                    <button className="w-10 h-6 bg-indigo-600 rounded-full relative transition-colors focus:outline-none">
                       <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm transition-transform"></div>
                    </button>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Session Timeout (30m)</span>
                    <button className="w-10 h-6 bg-indigo-600 rounded-full relative transition-colors focus:outline-none">
                       <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm transition-transform"></div>
                    </button>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">IP Whitelisting</span>
                    <button className="w-10 h-6 bg-slate-200 rounded-full relative transition-colors focus:outline-none">
                       <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm transition-transform"></div>
                    </button>
                 </div>
              </div>
           </section>

           {/* System Runtime Logs */}
           <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <h2 className="text-sm font-bold text-white">System Runtime Logs</h2>
                 </div>
                 <ExternalLink className="h-4 w-4 text-slate-500 cursor-pointer hover:text-white transition-colors" />
              </div>
              <div className="font-mono text-[10px] space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                 <p className="text-slate-400"><span className="text-emerald-400">[10:45:12]</span> :: <span className="text-indigo-400">AI_ENGINE_BRIDGE</span> :: <span className="text-emerald-500">Handshake verified.</span></p>
                 <p className="text-slate-400"><span className="text-emerald-400">[10:48:01]</span> :: <span className="text-cyan-400">AUTH_SERVICE</span> :: Token refreshed for Admin_01.</p>
                 <p className="text-slate-400"><span className="text-amber-400">[10:52:45]</span> :: <span className="text-orange-400">RAZORPAY_API</span> :: Webhook ping latency &gt; 200ms.</p>
                 <p className="text-slate-400"><span className="text-emerald-400">[11:01:10]</span> :: <span className="text-slate-300">SYSTEM_SETTINGS</span> :: Cache invalidated by user.</p>
                 <p className="text-slate-400"><span className="text-emerald-400">[11:05:22]</span> :: <span className="text-indigo-400">AI_ENGINE_BRIDGE</span> :: Query execution successful (120ms).</p>
                 <p className="text-slate-400"><span className="text-rose-400">[11:12:05]</span> :: <span className="text-rose-400">SECURITY_MODULE</span> :: Failed login attempt from IP 192.168.1.45.</p>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
