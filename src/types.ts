export type UserRole = 'student' | 'trainer' | 'admin';
export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  skills: string[];
  status: 'approved' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
  profilePhoto?: string;
  theme?: ThemeMode;
  timezone?: string;
  language?: string;
  recoveryEmail?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  price: number;
  thumbnailUrl: string;
  category: string;
  skillsRequired?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'published';
  qualityScore?: number;
  createdAt: string;
  updatedAt?: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
}

export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  courseId: string;
  type: 'project' | 'assessment';
  content: any;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
  createdAt: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  questions: AssessmentQuestion[];
  createdAt: string;
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  courseName: string;
  issuedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}
