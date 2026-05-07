import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Course } from '../types';
import { Search, Filter, Star, Clock, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'motion/react';

export const dummyCourses: Course[] = [
  {
    id: 'c0a80101-0000-0000-0000-000000000001',
    title: 'Advanced Full-Stack Web Development',
    description: 'Learn modern web development using React, Node.js, and Firebase.',
    price: 4999,
    category: 'Development',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    instructorId: 'u0a80101-0000-0000-0000-000000000001',
    instructorName: 'John Doe',
    status: 'published',
    skillsRequired: ['React', 'Node.js'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'c0a80101-0000-0000-0000-000000000002',
    title: 'UI/UX Design Masterclass',
    description: 'Master the art of creating beautiful and functional interfaces.',
    price: 3499,
    category: 'Design',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    instructorId: 'u0a80101-0000-0000-0000-000000000001',
    instructorName: 'Jane Smith',
    status: 'published',
    skillsRequired: ['Figma'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'c0a80101-0000-0000-0000-000000000003',
    title: 'Data Science & Machine Learning',
    description: 'A comprehensive guide to Data Science using Python and TensorFlow.',
    price: 5999,
    category: 'Data Science',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    instructorId: 'u0a80101-0000-0000-0000-000000000001',
    instructorName: 'Alan Turing',
    status: 'published',
    skillsRequired: ['Python', 'Machine Learning'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'c0a80101-0000-0000-0000-000000000004',
    title: 'Digital Marketing Fundamentals',
    description: 'Grow any business online with proven digital marketing strategies.',
    price: 2999,
    category: 'Marketing',
    thumbnailUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800',
    instructorId: 'u0a80101-0000-0000-0000-000000000001',
    instructorName: 'Sarah Connor',
    status: 'published',
    skillsRequired: ['SEO', 'Marketing'],
    createdAt: new Date().toISOString()
  }
];

export default function CourseMarketplace() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('status', 'published');
        const fetchedCourses = (data || []).map((c: any) => ({
           id: c.id,
           title: c.title,
           description: c.description,
           instructorId: c.instructor_id,
           category: c.category,
           status: c.status,
           price: c.price,
           thumbnailUrl: c.thumbnail_url,
           qualityScore: c.quality_score,
           createdAt: c.created_at,
           updatedAt: c.updated_at
        })) as Course[];
        
        if (fetchedCourses.length === 0) {
          setCourses(dummyCourses);
        } else {
          setCourses(fetchedCourses);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 pt-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-5xl font-black text-slate-900 mb-6">Course Marketplace</h1>
            <p className="text-slate-500 text-lg font-medium">Explore premium AI-driven courses designed to elevate your career to the next level.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search for skills, technologies, or topics..."
                className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-semibold text-slate-600 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="px-8 py-4.5 bg-white border border-slate-100 rounded-[1.5rem] flex items-center gap-3 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <SlidersHorizontal className="h-5 w-5" /> Filter
            </button>
          </div>
        </header>

        {loading ? (
           <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
             {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-96 bg-slate-50 rounded-[2rem] animate-pulse"></div>)}
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCourses.map(course => (
              <motion.div 
                key={course.id}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Link to={`/courses/${course.id}`} className="block bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-premium hover:shadow-2xl transition-all h-full flex flex-col">
                  <div className="h-52 overflow-hidden relative">
                    <img 
                      src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600' }}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-4 line-clamp-2 leading-tight text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                    <div className="flex items-center gap-4 mb-8 mt-auto">
                      <div className="flex items-center gap-1 text-orange-500 text-xs font-black">
                         <Star className="h-3.5 w-3.5 fill-current" /> 4.9
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                         <Clock className="h-3.5 w-3.5" /> 12h content
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</span>
                         <span className="text-2xl font-black text-slate-900">₹{course.price}</span>
                      </div>
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="bg-white h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Search className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">No courses found</h3>
            <p className="text-slate-500 mt-3 font-medium max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}

