import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Layers, 
  Settings,
  Rocket,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [modules, setModules] = useState([{ id: 1, title: '', materials: [] as string[] }]);
  const [isPublishing, setIsPublishing] = useState(false);

  const addModule = () => {
    setModules([...modules, { id: Date.now(), title: '', materials: [] }]);
  };

  const publishCourse = async () => {
    if (!user || !courseTitle) return;
    setIsPublishing(true);
    try {
      await supabase.from('courses').insert([{
        title: courseTitle,
        description,
        category,
        price: 0, // Set default or update later
        thumbnail_url: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=2000&auto=format&fit=crop',
        instructor_id: user.id,
        status: 'published'
      }]);
      navigate('/dashboard/trainer/courses/manage');
    } catch (err) {
      console.error('Failed to publish course', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Launch New Course</h1>
          <p className="text-slate-500 font-medium mt-1">Design your curriculum and share knowledge with your students.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            Drafts
          </button>
          <button 
            onClick={publishCourse}
            disabled={isPublishing}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rocket className="w-4 h-4" />
            {isPublishing ? 'Publishing...' : 'Publish Course'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">General Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Course Title</label>
                <input 
                  type="text" 
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Advanced React Architecture Patterns" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Difficulty Level</label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Short Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize what students will learn in this course..." 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Curriculum Builder */}
          <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Curriculum</h2>
              </div>
              <button 
                onClick={addModule}
                className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </button>
            </div>

            <div className="space-y-6">
              {modules.map((mod, idx) => (
                <div key={mod.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-6 group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Module {idx + 1}</span>
                    <button className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Module Title (e.g. Introduction to Hooks)" 
                    className="w-full px-0 py-2 bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-bold text-xl text-slate-800 placeholder:text-slate-300"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      Upload PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <Plus className="w-3.5 h-3.5" />
                      Add Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Media & Settings Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Course Cover
            </h3>
            <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center group hover:border-indigo-500/50 hover:bg-indigo-50/10 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">Click to upload image</p>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">High resolution recommended (1920x1080)</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/20 space-y-8">
            <h3 className="text-lg font-black flex items-center gap-3">
              <Settings className="w-5 h-5 text-indigo-400" />
              Course Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Public Access</span>
                <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Enrollment Approval</span>
                <div className="w-10 h-6 bg-slate-700 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Generate Certificate</span>
                <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-6">
              <div className="flex items-center gap-3 text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-bold">SEO Optimized</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-bold">Mobile Responsive</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-[32px] p-8 border border-orange-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-orange-900">AI Preview</h4>
              <p className="text-[10px] text-orange-800/60 font-medium leading-relaxed">
                Your course matches 94% of top-performing content in the Development category.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
