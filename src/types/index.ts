export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  studentIds: string[];
  createdAt: string;
  active: boolean;
}

export interface Lesson {
  id: string;
  classGroupId: string;
  date: string;
  topic: string;
  description: string;
  teacherId: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  lessonId: string;
  classGroupId: string;
  date: string;
  records: {
    studentId: string;
    studentName: string;
    present: boolean;
    notes?: string;
  }[];
  createdAt: string;
}

export interface StudentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  classGroupId: string;
  month: number;
  year: number;
  rating: number;
  contentRating: number;
  teacherRating: number;
  comments: string;
  suggestions: string;
  createdAt: string;
}

export interface TeacherEvaluation {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  classGroupId: string;
  bimester: number;
  year: number;
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
  participation: number;
  overallScore: number;
  strengths: string;
  areasToImprove: string;
  comments: string;
  createdAt: string;
}

export interface TeacherReport {
  id: string;
  teacherId: string;
  teacherName: string;
  classGroupId: string;
  classGroupName: string;
  bimester: number;
  year: number;
  summary: string;
  achievements: string;
  challenges: string;
  recommendations: string;
  nextSteps: string;
  createdAt: string;
}

export interface PerformanceGoal {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdAt: string;
  updatedAt: string;
}
