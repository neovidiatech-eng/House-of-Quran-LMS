import { useQuery } from '@tanstack/react-query';
import { getStudentSessions, getStudentExams, getStudentHomeworks, getStudentAttendance } from '../services/parentServices';

export const useStudentSessions = (studentId: string) => {
  return useQuery({
    queryKey: ['student-sessions', studentId],
    queryFn: () => getStudentSessions(studentId),
    enabled: !!studentId,
  });
};

export const useStudentExams = (studentId: string) => {
  return useQuery({
    queryKey: ['student-exams', studentId],
    queryFn: () => getStudentExams(studentId),
    enabled: !!studentId,
  });
};

export const useStudentHomeworks = (studentId: string) => {
  return useQuery({
    queryKey: ['student-homeworks', studentId],
    queryFn: () => getStudentHomeworks(studentId),
    enabled: !!studentId,
  });
};

export const useStudentAttendance = (studentId: string) => {
  return useQuery({
    queryKey: ['student-attendance', studentId],
    queryFn: () => getStudentAttendance(studentId),
    enabled: !!studentId,
  });
};
