import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  Plus,
  Award,
  Calendar,
  Search,
  FileText,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    courses: true,
    assessments: true,
    students: true
  });

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getLinks = () => {
    const normalizedRole = role?.toLowerCase();
    switch (normalizedRole) {
      case 'student':
        return [
          { to: '/dashboard/student', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/dashboard/student/my-courses', icon: BookOpen, label: 'My Courses' },
          { to: '/dashboard/student/attendance', icon: Calendar, label: 'Attendance' },
          { to: '/courses', icon: Search, label: 'Browse' },
          { to: '/dashboard/student/certificates', icon: Award, label: 'Resources' },
          { to: '/dashboard/student/settings', icon: Settings, label: 'Settings' },
        ];
      case 'trainer':
        return [
          { to: '/dashboard/trainer', icon: LayoutDashboard, label: 'Dashboard' },
          { 
            key: 'courses',
            icon: BookOpen, 
            label: 'Courses',
            subLinks: [
              { to: '/dashboard/trainer/courses/create', label: 'Create New' },
              { to: '/dashboard/trainer/courses/manage', label: 'Manage Library' }
            ]
          },
          { 
            key: 'assessments',
            icon: FileText, 
            label: 'Assessments',
            subLinks: [
              { to: '/dashboard/trainer/assessments/create', label: 'Create Assessments' },
              { to: '/dashboard/trainer/assessments/grade', label: 'Grade Assessments' }
            ]
          },
          { 
            key: 'students',
            icon: Users, 
            label: 'Students',
            subLinks: [
              { to: '/dashboard/trainer/students', label: 'Manage Students' }
            ]
          },
          { to: '/dashboard/trainer/settings', icon: Settings, label: 'Settings' },
        ];
      case 'admin':
        return [
          { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/dashboard/admin/users', icon: Users, label: 'Manage Users' },
          { to: '/dashboard/admin/courses', icon: BookOpen, label: 'Courses' },
          { to: '/dashboard/admin/finances', icon: FileText, label: 'Finances' },
          { to: '/dashboard/admin/settings', icon: Settings, label: 'Settings' },
        ];
      default:
        return [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/courses', icon: BookOpen, label: 'Courses' },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-[#F8FAFC] border-r border-slate-200 h-screen fixed left-0 top-0 hidden lg:flex flex-col shadow-sm">
      <div className="p-8 pb-4">
        <div className="flex flex-col gap-0.5 mb-10">
          <span className="text-xl font-black text-indigo-600 tracking-tighter">ADZ4NEEDZ</span>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Learning Portal</span>
             <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-tight mt-0.5">ADZ4NEEDZ AI</span>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map((link, idx) => {
            if ('subLinks' in link) {
              const isOpen = openMenus[link.key!];
              const isActiveGroup = link.subLinks!.some(sub => location.pathname.startsWith(sub.to));
              
              return (
                <div key={link.key || idx} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(link.key!)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActiveGroup ? 'bg-indigo-50/50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={`h-5 w-5 ${isActiveGroup ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-sm">{link.label}</span>
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  </button>
                  
                  {isOpen && (
                    <div className="pl-12 pr-4 space-y-1 py-1">
                      {link.subLinks!.map((subLink) => (
                        <NavLink
                          key={subLink.to}
                          to={subLink.to}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                              isActive ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`
                          }
                        >
                          {subLink.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative overflow-hidden ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-sm">{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        {role === 'student' && (
           <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-xl shadow-indigo-600/20">
              <h4 className="font-bold text-sm mb-1">Unlock all features</h4>
              <button className="w-full mt-3 bg-white text-indigo-600 py-2 rounded-lg text-xs font-black hover:bg-indigo-50 transition-colors">
                 Upgrade Pro
              </button>
           </div>
        )}
        {role === 'trainer' && (
           <div className="bg-slate-100 rounded-xl p-5">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Need help?</h4>
              <p className="text-xs text-slate-500 mb-3">Check out our trainer documentation for AI tools.</p>
              <button className="w-full bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                 Resources
              </button>
           </div>
        )}
      </div>
    </aside>
  );
}



