import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Award, Eye, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function Certificates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', user.id);
        
        if (data) setCertificates(data);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  if (loading) return <div className="animate-pulse h-96 bg-slate-50 rounded-[2.5rem]"></div>;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Records</h1>
          <p className="text-slate-500 font-medium mt-1">Your official certifications and verified skills.</p>
        </div>
      </header>

      {certificates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
            <Award className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">No certificates earned yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed mb-10">
            Complete your enrolled courses and pass the final assessments to receive your official certifications.
          </p>
          <button onClick={() => navigate('/courses')} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
             Browse Courses
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map(cert => (
            <motion.div 
              key={cert.id} 
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer"
              onClick={() => navigate(`/dashboard/student/certificate/${cert.id}`)}
            >
              <div className="flex justify-between items-start mb-10">
                 <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Award className="h-8 w-8" />
                 </div>
                 <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                    Verified
                 </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{cert.course_name}</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
              
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                 <span className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                    View Credential <Eye className="h-4 w-4" />
                 </span>
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    &rarr;
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
