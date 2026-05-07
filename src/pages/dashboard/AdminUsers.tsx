import React from 'react';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { Search, AlertOctagon, Eye, MoreVertical, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setUsers((data || []).map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        status: u.status,
        avatarUrl: u.avatar_url,
        createdAt: u.created_at
      })) as unknown as UserProfile[]);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    trainers: users.filter(u => u.role === 'trainer').length,
    students: users.filter(u => u.role === 'student').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Oversee system access, verify trainers, and manage global user roles.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-600">
           <AlertOctagon className="h-4 w-4" />
           <span className="text-xs font-bold">Admins: Course Creation Restricted</span>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-sm font-bold text-slate-500 mb-2">Total Users</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">+12%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-sm font-bold text-slate-500 mb-2">Pending Trainers</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.pending}</h3>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-md">Needs Review</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-sm font-bold text-slate-500 mb-2">Active Students</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.students}</h3>
            <span className="text-xs font-medium text-slate-400">{Math.round((stats.students / stats.total) * 100) || 0}% of total</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-sm font-bold text-slate-500 mb-2">Suspended Accounts</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.suspended}</h3>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-md">Flagged</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
           <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or ID..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                All Roles
              </button>
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                All Statuses
              </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-xs font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">User Information</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} className="w-10 h-10 rounded-xl object-cover border border-slate-200" alt="" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200">
                            {u.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                           <p className="text-sm font-bold text-slate-900">{u.fullName}</p>
                           <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        u.role === 'admin' ? 'bg-slate-800 text-white border-slate-700' :
                        u.role === 'trainer' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`flex items-center gap-2 text-xs font-bold ${
                         u.status === 'active' ? 'text-emerald-600' :
                         u.status === 'pending' ? 'text-amber-600' :
                         'text-rose-600'
                       }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            u.status === 'active' ? 'bg-emerald-500' :
                            u.status === 'pending' ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}></div> {u.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                         {u.status === 'pending' && (
                           <button className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Approve</button>
                         )}
                         <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Eye className="h-4 w-4" /></button>
                         <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-white text-sm">
           <span className="text-slate-500 font-medium">Showing 1 to 4 of 12,842 users</span>
           <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold">3</button>
              <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold">3211</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">&gt;</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
               <Shield className="h-6 w-6" />
            </div>
            <div>
               <h3 className="text-base font-bold text-slate-900 mb-2">Trainer Verification Process</h3>
               <p className="text-sm text-slate-600 leading-relaxed">
                 Before approving new Trainers, ensure their professional credentials and identity have been verified via the 'View Profile' section. Approved trainers get immediate access to the course creator studio and assessment tools.
               </p>
            </div>
         </div>
         <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-600">
               <AlertOctagon className="h-5 w-5" />
               <h3 className="text-sm font-bold">Security Alert</h3>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
               Admins are restricted from creating learning content. To create courses, a Trainer role must be requested via super-admin.
            </p>
         </div>
      </div>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}
