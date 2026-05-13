import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbjuojnasuzhvvfqmnfj.supabase.co';
const supabaseKey = 'sb_publishable_QpjQUQHQ9PhJ_4XhxtJ7lg_XpdxvODu'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertDummyData() {
  console.log('Inserting proper ecosystem data...');

  // 1. Insert Profiles (5 Users)
  const profiles = [
    { id: '10a80101-0000-0000-0000-000000000001', email: 'trainer1@SkillsUp.com', full_name: 'Dr. Sarah Vance', role: 'trainer', status: 'active', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    { id: '10a80101-0000-0000-0000-000000000002', email: 'student1@gmail.com', full_name: 'Alexander Sterling', role: 'student', status: 'active', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { id: '10a80101-0000-0000-0000-000000000003', email: 'admin@SkillsUp.com', full_name: 'Marcus Chen', role: 'admin', status: 'active', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    { id: '10a80101-0000-0000-0000-000000000004', email: 'trainer2@SkillsUp.com', full_name: 'Prof. James Wilson', role: 'trainer', status: 'active', avatar_url: 'https://ui-avatars.com/api/?name=James+Wilson' },
    { id: '10a80101-0000-0000-0000-000000000005', email: 'student2@gmail.com', full_name: 'Elena Rodriguez', role: 'student', status: 'active', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
  ];

  for (const p of profiles) {
    const { error } = await supabase.from('profiles').upsert(p);
    if (error) console.error(`Error inserting profile ${p.email}:`, error.message);
    else console.log(`Profile ${p.email} inserted.`);
  }

  // 2. Insert Courses (5 Courses with Modules)
  const courses = [
    { 
      id: '20a80101-0000-0000-0000-000000000001', 
      title: 'Advanced AI Architectures', 
      description: 'Master Neural Networks, Transformers, and Large Language Models.', 
      instructor_id: '10a80101-0000-0000-0000-000000000001', 
      category: 'AI', 
      status: 'published', 
      price: 4999, 
      thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      modules: [
        { id: 'm1', title: 'Introduction to Neural Networks', videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk', duration: '20:00' },
        { id: 'm2', title: 'The Transformer Revolution', videoUrl: 'https://www.youtube.com/watch?v=TQQlZhbC5ps', duration: '25:00' },
        { id: 'm3', title: 'Building LLMs from Scratch', videoUrl: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', duration: '45:00' }
      ]
    },
    { 
      id: '20a80101-0000-0000-0000-000000000002', 
      title: 'Full-Stack Web Mastery', 
      description: 'Build enterprise-grade apps with React, Next.js, and Supabase.', 
      instructor_id: '10a80101-0000-0000-0000-000000000004', 
      category: 'Development', 
      status: 'published', 
      price: 3499, 
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      modules: [
        { id: 'm1', title: 'React 19 Fundamentals', videoUrl: 'https://www.youtube.com/watch?v=8pDquaoEriE', duration: '15:00' },
        { id: 'm2', title: 'Mastering Supabase Backend', videoUrl: 'https://www.youtube.com/watch?v=7uKQBl9_hmU', duration: '30:00' }
      ]
    },
    { 
      id: '20a80101-0000-0000-0000-000000000003', 
      title: 'UI/UX Design Masterclass', 
      description: 'Design pixel-perfect interfaces that users adore.', 
      instructor_id: '10a80101-0000-0000-0000-000000000001', 
      category: 'Design', 
      status: 'published', 
      price: 2999, 
      thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      modules: [
        { id: 'm1', title: 'Typography & Color Theory', videoUrl: 'https://www.youtube.com/watch?v=7I7pS9P6Vp4', duration: '12:00' },
        { id: 'm2', title: 'Advanced Figma Auto-Layout', videoUrl: 'https://www.youtube.com/watch?v=T_5Z_6W9X0U', duration: '22:00' }
      ]
    },
    { 
      id: '20a80101-0000-0000-0000-000000000004', 
      title: 'Data Science with Python', 
      description: 'Predict the future using data and statistical models.', 
      instructor_id: '10a80101-0000-0000-0000-000000000004', 
      category: 'Data Science', 
      status: 'published', 
      price: 5999, 
      thumbnail_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
      modules: [
        { id: 'm1', title: 'Pandas & NumPy Basics', videoUrl: 'https://www.youtube.com/watch?v=F6kmIpWWEdU', duration: '18:00' },
        { id: 'm2', title: 'Machine Learning Pipelines', videoUrl: 'https://www.youtube.com/watch?v=0_u6_4V7y-U', duration: '35:00' }
      ]
    },
    { 
      id: '20a80101-0000-0000-0000-000000000005', 
      title: 'Cloud DevOps Engineering', 
      description: 'Automate deployments and manage cloud scale.', 
      instructor_id: '10a80101-0000-0000-0000-000000000001', 
      category: 'DevOps', 
      status: 'published', 
      price: 4500, 
      thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      modules: [
        { id: 'm1', title: 'Docker Containerization', videoUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', duration: '25:00' },
        { id: 'm2', title: 'Kubernetes Orchestration', videoUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do', duration: '40:00' }
      ]
    }
  ];

  for (const c of courses) {
    const { error } = await supabase.from('courses').upsert(c);
    if (error) console.error(`Error inserting course ${c.title}:`, error.message);
    else console.log(`Course ${c.title} inserted.`);
  }

  // 3. Insert Assessments for each course
  const assessments = courses.map(c => ({
    course_id: c.id,
    title: `Final Assessment: ${c.title}`,
    instructor_id: c.instructor_id,
    questions: [
      { question: `What is the core concept of ${c.title}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 },
      { question: `Which tool is best for ${c.category}?`, options: ['Tool X', 'Tool Y', 'Tool Z', 'Tool W'], correctAnswer: 2 }
    ]
  }));

  for (const a of assessments) {
    const { error } = await supabase.from('assessments').upsert(a);
    if (error) {
      console.error(`Error inserting assessment for ${a.title}:`, error.message);
      console.log('Assessment object attempted:', JSON.stringify(a, null, 2));
    }
    else console.log(`Assessment for ${a.title} inserted.`);
  }

  // 4. Insert Enrollments (Linking Students to Courses)
  const enrollments = [
    { student_id: '10a80101-0000-0000-0000-000000000002', course_id: '20a80101-0000-0000-0000-000000000001', status: 'enrolled' },
    { student_id: '10a80101-0000-0000-0000-000000000002', course_id: '20a80101-0000-0000-0000-000000000002', status: 'completed' },
    { student_id: '10a80101-0000-0000-0000-000000000005', course_id: '20a80101-0000-0000-0000-000000000001', status: 'enrolled' },
    { student_id: '10a80101-0000-0000-0000-000000000005', course_id: '20a80101-0000-0000-0000-000000000003', status: 'enrolled' }
  ];

  for (const e of enrollments) {
    const { error } = await supabase.from('enrollments').upsert(e);
    if (error) console.error(`Error inserting enrollment:`, error.message);
    else console.log(`Enrollment inserted.`);
  }



  console.log('Ecosystem seeding complete.');
}

insertDummyData();
