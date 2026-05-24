import { createContext, useContext, useState, ReactNode } from 'react';

interface SessionData {
  id: string;
  sessionName: string;
  studentName: string;
  teacherName: string;
  subject: string;
  day: string;
  date: string;
  time: string;
  endTime: string;
  meetingLink?: string;
}

interface SessionsContextType {
  sessions: SessionData[];
  addSession: (session: SessionData) => void;
  addMultipleSessions: (sessions: SessionData[]) => void;
  updateSession: (id: string, updatedData: Partial<SessionData>) => void;
  deleteSession: (id: string) => void;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SessionData[]>([
    {
      id: '1',
      sessionName: 'حصة - الإثنين',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الإثنين',
      date: '2026-03-01',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '2',
      sessionName: 'حصة - الأربعاء',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الأربعاء',
      date: '2026-03-04',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '3',
      sessionName: 'حصة - الأحد',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الأحد',
      date: '2026-03-08',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '4',
      sessionName: 'حصة - الأربعاء',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الأربعاء',
      date: '2026-03-11',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '5',
      sessionName: 'حصة - الأحد',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الأحد',
      date: '2026-03-15',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '6',
      sessionName: 'حصة - الأربعاء',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الأربعاء',
      date: '2026-03-18',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '7',
      sessionName: 'حصة - الأحد',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الأحد',
      date: '2026-03-22',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '8',
      sessionName: 'حصة - الأربعاء',
      studentName: 'ابراهيم مسلم',
      teacherName: 'Ahmed Qandil',
      subject: 'القرآن الكريم',
      day: 'الأربعاء',
      date: '2026-03-25',
      time: '12:00 PM',
      endTime: '01:00 PM',
      meetingLink: 'https://zoom.us/j/123456789'
    }
  ]);

  const addSession = (session: SessionData) => {
    setSessions(prev => [...prev, session]);
  };

  const addMultipleSessions = (newSessions: SessionData[]) => {
    setSessions(prev => [...prev, ...newSessions]);
  };

  const updateSession = (id: string, updatedData: Partial<SessionData>) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id ? { ...session, ...updatedData } : session
      )
    );
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        addSession,
        addMultipleSessions,
        updateSession,
        deleteSession
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
}
