import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Course } from '../types';
import Navbar from '../components/Navbar';
import { CheckCircle2, Star, Clock, Globe, ShieldCheck, Calendar, PlayCircle } from 'lucide-react';

declare var Razorpay: any;

import { dummyCourses } from './CourseMarketplace';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [purchase, setPurchase] = useState<any>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
        if (data) {
          setCourse({ 
            id: data.id, 
            title: data.title, 
            description: data.description, 
            price: data.price,
            thumbnailUrl: data.thumbnail_url,
            category: data.category,
            instructorId: data.instructor_id,
            status: data.status,
          } as Course);
        } else {
          // Check if it's one of our dummy courses
          const dummy = dummyCourses.find(c => c.id === id);
          if (dummy) setCourse(dummy);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!user || !course) return;
      const { data, error } = await supabase.from('enrollments').select('*').eq('student_id', user.id).eq('course_id', course.id).single();
      if (data) {
        setPurchase({ id: data.id, status: data.status });
      }
    };
    fetchPurchase();
  }, [user, course]);

  const handleAction = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!course) return;

    if (purchase && purchase.status === 'completed') {
      navigate('/dashboard/student/certificates');
      return;
    }

    if (purchase && purchase.status === 'active') {
      navigate(`/dashboard/student/course/${course.id}/play`);
      return;
    }

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const { data, error } = await supabase.from('enrollments').insert([{
        student_id: user.id,
        course_id: course.id,
        status: 'active'
      }]).select().single();
      
      if (data) {
         setPurchase({ id: data.id, status: 'active' });
         navigate(`/dashboard/student/course/${course.id}/play`);
      }
    } catch (err) {
      console.error('Action Failed:', err);
      alert('Failed to process. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Render success modal
  const SuccessModal = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Success!</h2>
        <p className="mb-6 text-slate-600">{purchase?.status === 'completed' ? 'Course completed successfully. Your certificate is ready!' : 'Your course has been added to your dashboard.'}</p>
        <button
          onClick={() => {
            setShowModal(false);
            navigate('/dashboard/student/my-courses');
          }}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {purchase?.status === 'completed' ? 'View Certificate' : 'Go to My Courses'}
        </button>
      </div>
    </div>
  );

  // Insert modal into JSX
  const renderModal = showModal && SuccessModal;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found</div>;

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <Navbar />
      {renderModal}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Hero Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 mb-8 shadow-sm flex flex-col lg:flex-row gap-12 items-center border border-slate-100">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-cyan-100 text-cyan-800 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Best Seller</span>
              <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                <Star className="h-4 w-4 fill-current" /> 4.9 (2,450 ratings)
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">{course.title}</h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-4xl font-black text-indigo-600">₹{course.price}</span>
              <button 
                onClick={handleAction}
                disabled={processing}
                className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {processing ? 'Processing...' : purchase ? (purchase.status === 'completed' ? 'View Certificate' : 'Go to Classroom') : 'Enroll Now'}
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full">
            <img 
              src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'} 
              className="w-full h-full min-h-[300px] object-cover rounded-[2rem] shadow-xl" 
              alt={course.title} 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800' }}
            />
          </div>
        </div>

        {/* Two Columns Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex border-b border-slate-100 mb-8 overflow-x-auto">
                  <button className="px-6 py-4 text-indigo-600 font-black border-b-2 border-indigo-600 whitespace-nowrap">Overview</button>
                  <button className="px-6 py-4 text-slate-400 font-bold hover:text-slate-600 whitespace-nowrap transition-colors">Curriculum</button>
                  <button className="px-6 py-4 text-slate-400 font-bold hover:text-slate-600 whitespace-nowrap transition-colors">Instructor</button>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-4">Course Description</h3>
                <p className="text-slate-600 leading-relaxed mb-10 font-medium">
                  This comprehensive course is designed for developers, data scientists, and tech enthusiasts looking to master the cutting-edge field. We cover everything from the foundational architecture to advanced techniques like RAG (Retrieval-Augmented Generation) and fine-tuning specialized models.
                </p>

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">SAMPLE MODULES</h4>
                <div className="space-y-4 mb-10">
                  {[
                    { title: 'Intro to LLMs & Transformers', time: '45 mins' },
                    { title: 'Prompt Engineering Mastery', time: '120 mins' },
                    { title: 'Fine-tuning Open Source Models', time: '180 mins' }
                  ].map((mod, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border border-indigo-50 hover:bg-indigo-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <PlayCircle className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-700">{mod.title}</span>
                      </div>
                      <span className="text-xs font-black text-slate-400">{mod.time}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-8 border-t border-slate-100">
                  <div className="h-20 w-20 shrink-0 rounded-full bg-slate-200 overflow-hidden shadow-sm">
                    <img src="https://ui-avatars.com/api/?name=Rohan+Sharma&background=random" alt="Instructor" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg mb-1">{course.instructorName || 'Dr. Rohan Sharma'}</h4>
                    <p className="text-sm font-medium text-slate-500">PhD in AI from Stanford, 15+ years of research experience in Natural Language Processing and Deep Learning.</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6">What's included</h3>
              <div className="space-y-5 mb-8">
                {[
                  { icon: Clock, text: '24 hours on-demand video' },
                  { icon: CheckCircle2, text: '12 hands-on projects' },
                  { icon: ShieldCheck, text: 'Certificate of completion' },
                  { icon: Globe, text: 'Full lifetime access' },
                  { icon: Calendar, text: 'Access on mobile and TV' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-600">
                    <item.icon className="h-5 w-5 text-teal-600 shrink-0" />
                    <span className="font-medium text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 rounded-[1.5rem] border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:bg-slate-50 transition-all">
                Share Course
              </button>
            </div>

            <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100 border-dashed">
              <h3 className="font-black text-slate-900 mb-2">Learning Support</h3>
              <p className="text-sm font-medium text-slate-600 mb-6">Join our private Discord community of 5,000+ AI developers.</p>
              <button className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all hover:text-indigo-700">
                View Community &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        <div className="mt-20">
          <h2 className="text-3xl font-black text-slate-900 mb-10">Related Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               { title: 'Python for Data Science', price: '₹2,499', cat: 'DATA SCIENCE', rating: '4.8', img: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=500' },
               { title: 'UI/UX Masterclass', price: '₹3,200', cat: 'DESIGN', rating: '4.7', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500' },
               { title: 'Deep Learning Specialization', price: '₹5,499', cat: 'AI & ML', rating: '4.9', img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500' }
             ].map((rc, i) => (
               <div key={i} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                 <div className="h-48 overflow-hidden">
                   <img src={rc.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                 </div>
                 <div className="p-8">
                   <div className="text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit mb-4 uppercase">{rc.cat}</div>
                   <h4 className="font-bold text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors">{rc.title}</h4>
                   <div className="flex justify-between items-center">
                     <span className="font-black text-indigo-600 text-xl">{rc.price}</span>
                     <div className="flex items-center gap-1.5 text-slate-400 text-xs font-black"><Star className="h-4 w-4 fill-orange-400 text-orange-400"/> {rc.rating}</div>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
