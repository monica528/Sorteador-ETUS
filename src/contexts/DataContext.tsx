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

const SHOW_EXAMPLES_KEY = 'etus-academy-show-examples';

function getInitialShowExamples(): boolean {
  try {
    const stored = localStorage.getItem(SHOW_EXAMPLES_KEY);
    if (stored !== null) return stored === 'true';
    return false;
  } catch {
    return false;
  }
}

interface DataContextType {
  classGroups: ClassGroup[];
  lessons: Lesson[];
  attendance: AttendanceRecord[];
  studentFeedback: StudentFeedback[];
  teacherEvaluations: TeacherEvaluation[];
  teacherReports: TeacherReport[];
  performanceGoals: PerformanceGoal[];
  showExamples: boolean;
  toggleExamples: () => void;
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
  const [showExamples, setShowExamples] = useState(getInitialShowExamples);
  const [userClassGroups, setUserClassGroups] = useState<ClassGroup[]>([]);
  const [userLessons, setUserLessons] = useState<Lesson[]>([]);
  const [userAttendance, setUserAttendance] = useState<AttendanceRecord[]>([]);
  const [userStudentFeedback, setUserStudentFeedback] = useState<StudentFeedback[]>([]);
  const [userTeacherEvaluations, setUserTeacherEvaluations] = useState<TeacherEvaluation[]>([]);
  const [userTeacherReports, setUserTeacherReports] = useState<TeacherReport[]>([]);
  const [userPerformanceGoals, setUserPerformanceGoals] = useState<PerformanceGoal[]>([]);

  const classGroups = showExamples ? [...mockClassGroups, ...userClassGroups] : userClassGroups;
  const lessons = showExamples ? [...mockLessons, ...userLessons] : userLessons;
  const attendance = showExamples ? [...mockAttendance, ...userAttendance] : userAttendance;
  const studentFeedback = showExamples ? [...mockStudentFeedback, ...userStudentFeedback] : userStudentFeedback;
  const teacherEvaluations = showExamples ? [...mockTeacherEvaluations, ...userTeacherEvaluations] : userTeacherEvaluations;
  const teacherReports = showExamples ? [...mockTeacherReports, ...userTeacherReports] : userTeacherReports;
  const performanceGoals = showExamples ? [...mockPerformanceGoals, ...userPerformanceGoals] : userPerformanceGoals;

  const toggleExamples = useCallback(() => {
    setShowExamples((prev) => {
      const next = !prev;
      localStorage.setItem(SHOW_EXAMPLES_KEY, String(next));
      return next;
    });
  }, []);

  const addClassGroup = useCallback((group: Omit<ClassGroup, 'id' | 'createdAt'>) => {
    const newGroup: ClassGroup = {
      ...group,
      id: `class-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUserClassGroups((prev) => [...prev, newGroup]);
  }, []);

  const updateClassGroup = useCallback((id: string, data: Partial<ClassGroup>) => {
    setUserClassGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }, []);

  const deleteClassGroup = useCallback((id: string) => {
    setUserClassGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addLesson = useCallback((lesson: Omit<Lesson, 'id' | 'createdAt'>) => {
    const newLesson: Lesson = {
      ...lesson,
      id: `lesson-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUserLessons((prev) => [...prev, newLesson]);
  }, []);

  const addAttendance = useCallback((record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUserAttendance((prev) => [...prev, newRecord]);
  }, []);

  const addStudentFeedback = useCallback((feedback: Omit<StudentFeedback, 'id' | 'createdAt'>) => {
    const newFeedback: StudentFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUserStudentFeedback((prev) => [...prev, newFeedback]);
  }, []);

  const addTeacherEvaluation = useCallback((evaluation: Omit<TeacherEvaluation, 'id' | 'createdAt'>) => {
    const newEval: TeacherEvaluation = {
      ...evaluation,
      id: `eval-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUserTeacherEvaluations((prev) => [...prev, newEval]);
  }, []);

  const addTeacherReport = useCallback((report: Omit<TeacherReport, 'id' | 'createdAt'>) => {
    const newReport: TeacherReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUserTeacherReports((prev) => [...prev, newReport]);
  }, []);

  const addPerformanceGoal = useCallback((goal: Omit<PerformanceGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newGoal: PerformanceGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setUserPerformanceGoals((prev) => [...prev, newGoal]);
  }, []);

  const updateGoalProgress = useCallback((goalId: string, progress: number, status: PerformanceGoal['status']) => {
    setUserPerformanceGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, progress, status, updatedAt: new Date().toISOString().split('T')[0] } : g
      )
    );
  }, []);

  const getStudentsByClass = useCallback(
    (classGroupId: string) => {
      const allGroups = showExamples ? [...mockClassGroups, ...userClassGroups] : userClassGroups;
      const group = allGroups.find((g) => g.id === classGroupId);
      if (!group) return [];
      return mockUsers.filter((u) => group.studentIds.includes(u.id));
    },
    [showExamples, userClassGroups]
  );

  const getAttendanceByClass = useCallback(
    (classGroupId: string) => {
      const allAtt = showExamples ? [...mockAttendance, ...userAttendance] : userAttendance;
      return allAtt.filter((a) => a.classGroupId === classGroupId);
    },
    [showExamples, userAttendance]
  );

  const getLessonsByClass = useCallback(
    (classGroupId: string) => {
      const allLessons = showExamples ? [...mockLessons, ...userLessons] : userLessons;
      return allLessons.filter((l) => l.classGroupId === classGroupId);
    },
    [showExamples, userLessons]
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
        showExamples,
        toggleExamples,
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
