import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  ClassGroup,
  Lesson,
  AttendanceRecord,
  StudentFeedback,
  TeacherEvaluation,
  TeacherReport,
  PerformanceGoal,
} from '../types';
import {
  mockClassGroups,
  mockLessons,
  mockAttendance,
  mockStudentFeedback,
  mockTeacherEvaluations,
  mockTeacherReports,
  mockPerformanceGoals,
  mockUsers,
} from '../lib/mockData';

interface DataContextType {
  classGroups: ClassGroup[];
  lessons: Lesson[];
  attendance: AttendanceRecord[];
  studentFeedback: StudentFeedback[];
  teacherEvaluations: TeacherEvaluation[];
  teacherReports: TeacherReport[];
  performanceGoals: PerformanceGoal[];
  addClassGroup: (group: Omit<ClassGroup, 'id' | 'createdAt'>) => void;
  updateClassGroup: (id: string, data: Partial<ClassGroup>) => void;
  deleteClassGroup: (id: string) => void;
  addLesson: (lesson: Omit<Lesson, 'id' | 'createdAt'>) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  addStudentFeedback: (feedback: Omit<StudentFeedback, 'id' | 'createdAt'>) => void;
  addTeacherEvaluation: (evaluation: Omit<TeacherEvaluation, 'id' | 'createdAt'>) => void;
  addTeacherReport: (report: Omit<TeacherReport, 'id' | 'createdAt'>) => void;
  addPerformanceGoal: (goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoalProgress: (goalId: string, progress: number, status: PerformanceGoal['status']) => void;
  getStudentsByClass: (classGroupId: string) => typeof mockUsers;
  getAttendanceByClass: (classGroupId: string) => AttendanceRecord[];
  getLessonsByClass: (classGroupId: string) => Lesson[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>(mockClassGroups);
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [studentFeedback, setStudentFeedback] = useState<StudentFeedback[]>(mockStudentFeedback);
  const [teacherEvaluations, setTeacherEvaluations] = useState<TeacherEvaluation[]>(mockTeacherEvaluations);
  const [teacherReports, setTeacherReports] = useState<TeacherReport[]>(mockTeacherReports);
  const [performanceGoals, setPerformanceGoals] = useState<PerformanceGoal[]>(mockPerformanceGoals);

  const addClassGroup = useCallback((group: Omit<ClassGroup, 'id' | 'createdAt'>) => {
    const newGroup: ClassGroup = {
      ...group,
      id: `class-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClassGroups((prev) => [...prev, newGroup]);
  }, []);

  const updateClassGroup = useCallback((id: string, data: Partial<ClassGroup>) => {
    setClassGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }, []);

  const deleteClassGroup = useCallback((id: string) => {
    setClassGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addLesson = useCallback((lesson: Omit<Lesson, 'id' | 'createdAt'>) => {
    const newLesson: Lesson = {
      ...lesson,
      id: `lesson-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLessons((prev) => [...prev, newLesson]);
  }, []);

  const addAttendance = useCallback((record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAttendance((prev) => [...prev, newRecord]);
  }, []);

  const addStudentFeedback = useCallback((feedback: Omit<StudentFeedback, 'id' | 'createdAt'>) => {
    const newFeedback: StudentFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudentFeedback((prev) => [...prev, newFeedback]);
  }, []);

  const addTeacherEvaluation = useCallback((evaluation: Omit<TeacherEvaluation, 'id' | 'createdAt'>) => {
    const newEval: TeacherEvaluation = {
      ...evaluation,
      id: `eval-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTeacherEvaluations((prev) => [...prev, newEval]);
  }, []);

  const addTeacherReport = useCallback((report: Omit<TeacherReport, 'id' | 'createdAt'>) => {
    const newReport: TeacherReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTeacherReports((prev) => [...prev, newReport]);
  }, []);

  const addPerformanceGoal = useCallback((goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newGoal: PerformanceGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setPerformanceGoals((prev) => [...prev, newGoal]);
  }, []);

  const updateGoalProgress = useCallback((goalId: string, progress: number, status: PerformanceGoal['status']) => {
    setPerformanceGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, progress, status, updatedAt: new Date().toISOString().split('T')[0] } : g
      )
    );
  }, []);

  const getStudentsByClass = useCallback(
    (classGroupId: string) => {
      const group = classGroups.find((g) => g.id === classGroupId);
      if (!group) return [];
      return mockUsers.filter((u) => group.studentIds.includes(u.id));
    },
    [classGroups]
  );

  const getAttendanceByClass = useCallback(
    (classGroupId: string) => {
      return attendance.filter((a) => a.classGroupId === classGroupId);
    },
    [attendance]
  );

  const getLessonsByClass = useCallback(
    (classGroupId: string) => {
      return lessons.filter((l) => l.classGroupId === classGroupId);
    },
    [lessons]
  );

  return (
    <DataContext.Provider
      value={{
        classGroups,
        addClassGroup,
        updateClassGroup,
        deleteClassGroup,
        lessons,
        attendance,
        studentFeedback,
        teacherEvaluations,
        teacherReports,
        performanceGoals,
        addLesson,
        addAttendance,
        addStudentFeedback,
        addTeacherEvaluation,
        addTeacherReport,
        addPerformanceGoal,
        updateGoalProgress,
        getStudentsByClass,
        getAttendanceByClass,
        getLessonsByClass,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
