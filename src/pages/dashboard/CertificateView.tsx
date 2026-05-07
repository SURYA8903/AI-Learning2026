import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Download, Share2, Award, Printer } from 'lucide-react';
import { motion } from 'motion/react';

export default function CertificateView() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      if (!certificateId) return;
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', certificateId)
        .single();
      if (data) setCert(data);
      setLoading(false);
    };
    fetchCert();
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Verifying Credential...</div>;
  if (!cert) return <div className="h-screen flex items-center justify-center">Certificate not found or not yet issued.</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 print:hidden">
           <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                 <Award className="h-10 w-10 text-indigo-600" /> Professional Credential
              </h1>
              <p className="text-slate-500 font-medium">Verify your mastery and share your achievement with the world.</p>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={handlePrint} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                 <Printer className="h-4 w-4" /> Print PDF
              </button>
              <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                 <Share2 className="h-4 w-4" /> Share to LinkedIn
              </button>
           </div>
        </header>

        {/* Certificate Template Replication */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white aspect-[1.414/1] shadow-2xl rounded-sm border-[12px] border-double border-indigo-600 p-1 print:shadow-none print:border-indigo-600"
        >
           <div className="h-full w-full border border-indigo-100 p-16 flex flex-col items-center text-center relative overflow-hidden">
              {/* Decorative Corner */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-indigo-600/20 -translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-indigo-600/20 translate-x-8 translate-y-8"></div>
              
              <div className="uppercase tracking-[0.4em] font-black text-indigo-400 text-[10px] mb-12">Professional Credential</div>
              
              <h2 className="text-6xl font-serif font-black text-slate-800 mb-12">Certificate of Completion</h2>
              
              <p className="font-serif italic text-slate-500 text-xl mb-12">This high honors certificate is proudly presented to</p>
              
              <h3 className="text-7xl font-serif font-black text-slate-900 border-b-2 border-slate-900 pb-4 mb-12 min-w-[500px]">
                 {cert.user_name}
              </h3>
              
              <p className="text-slate-500 font-medium max-w-2xl leading-relaxed mb-8">
                 In recognition of their exceptional dedication and successful mastery of the advanced curriculum in
              </p>
              
              <h4 className="text-2xl font-black text-indigo-600 mb-20 max-w-xl">
                 {cert.course_name}
              </h4>
              
              <div className="w-full flex justify-between items-end mt-auto px-12">
                 <div className="flex flex-col items-center">
                    <div className="w-48 border-b border-slate-300 pb-2 mb-2 font-serif italic text-2xl text-slate-700">Dr. Sarah Vance</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Instructor</div>
                 </div>
                 
                 <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-indigo-100 flex items-center justify-center p-2 mb-4">
                       <div className="w-full h-full rounded-full border border-indigo-50 flex flex-col items-center justify-center">
                          <Award className="h-8 w-8 text-indigo-400 mb-1" />
                          <span className="text-[6px] font-black text-indigo-300">CERTIFIED</span>
                       </div>
                    </div>
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">CREDENTIAL ID: ADZ-{cert.id.slice(0, 8).toUpperCase()}</div>
                 </div>

                 <div className="flex flex-col items-center">
                    <div className="w-48 border-b border-slate-300 pb-2 mb-2 font-serif italic text-2xl text-slate-700">Marcus Chen</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Administrator</div>
                 </div>
              </div>

              <div className="mt-12 text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                 ISSUED ON {new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} • ADZ4NEEDZ GLOBAL LEARNING SYSTEMS
              </div>
           </div>
        </motion.div>

        <div className="mt-12 p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center justify-between print:hidden">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                 <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-sm font-black text-slate-900">Blockchain Verified</p>
                 <p className="text-xs text-slate-500 font-medium">This credential is immutable and verifiable on the public ledger.</p>
              </div>
           </div>
           <button className="text-indigo-600 font-bold text-sm hover:underline">Verify Credential Page &rarr;</button>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
