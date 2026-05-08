import React from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import { Search, Bell, User as UserIcon, Calendar, Play, Award, ArrowLeft } from 'lucide-react';

export default function DashboardLayout() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const isStudentDashboard = location.pathname === '/dashboard/student';

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar role={profile.role} />
      
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-8 py-4">
           <div className="flex items-center justify-between gap-8">
              <div className="flex-1">
                 {isStudentDashboard ? (
                    <div>
                       <h1 className="text-2xl font-black text-slate-900 leading-tight">Welcome back, {profile?.fullName?.split(' ')[0] || 'User'}!</h1>
                       <p className="text-xs font-medium text-slate-500 mt-1">You've completed 75% of your weekly learning goal. Keep going!</p>
                    </div>
                 ) : (
                    <div className="relative group max-w-md">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                       <input 
                         type="text" 
                         placeholder="Search anything..." 
                         className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                       />
                    </div>
                 )}
              </div>

              <div className="flex items-center gap-6">
                 {isStudentDashboard && (
                    <div className="hidden md:flex items-center gap-3">
                       <Link to="/dashboard/student/my-courses" className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 text-sm active:scale-95">
                          <Play className="h-4 w-4 fill-current" /> Resume Learning
                       </Link>
                    </div>
                 )}

                 <div className="h-8 w-px bg-slate-100"></div>
                 
                 <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm" title="Go Back">
                       <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="relative group">
                      <button className="relative p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none">
                         <Bell className="h-5 w-5" />
                         <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                      </button>
                      
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50 overflow-hidden focus-within:opacity-100 focus-within:visible">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-sm">Notifications</span>
                          <span className="text-[10px] font-black uppercase text-primary tracking-widest cursor-pointer hover:underline">Mark all read</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {profile?.role?.toLowerCase() === 'admin' ? (
                             <>
                               <Link to="/dashboard/admin/courses" className="block p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                 <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                                       <Bell className="h-4 w-4" />
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold text-slate-900 mb-1">New Course Approval!</p>
                                       <p className="text-xs text-slate-500">Dr. Sarah submitted "Advanced React" for review.</p>
                                    </div>
                                 </div>
                               </Link>
                               <Link to="/dashboard/admin/users" className="block p-4 hover:bg-slate-50 transition-colors">
                                 <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                                       <UserIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold text-slate-900 mb-1">Account Suspended</p>
                                       <p className="text-xs text-slate-500">User John Doe was flagged for suspicious activity.</p>
                                    </div>
                                 </div>
                               </Link>
                             </>
                          ) : (
                             <>
                               <Link to="/dashboard/student/certificates" className="block p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                  <div className="flex gap-3">
                                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <Award className="h-4 w-4" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-slate-900 mb-1">Congrats on completing this course!</p>
                                        <p className="text-xs text-slate-500">You received a certificate for Advanced React Patterns.</p>
                                     </div>
                                  </div>
                               </Link>
                               <Link to="/dashboard/student/certificates" className="block p-4 hover:bg-slate-50 transition-colors">
                                  <div className="flex gap-3">
                                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <Award className="h-4 w-4" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-slate-900 mb-1">Congrats on completing this course!</p>
                                        <p className="text-xs text-slate-500">You received a certificate for Node.js Backend Architecture.</p>
                                     </div>
                                  </div>
                               </Link>
                             </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                       onClick={() => navigate(`/dashboard/${profile.role}/settings`)}
                       className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity"
                    >
                       {profile?.profilePhoto ? (
                         <img
                           src={profile.profilePhoto}
                           alt={profile.fullName}
                           className="w-10 h-10 rounded-xl object-cover border-2 border-primary/20"
                         />
                       ) : (
                         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm border border-primary/20 shadow-sm">
                            {profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                         </div>
                       )}
                    </button>
                 </div>
              </div>
           </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
