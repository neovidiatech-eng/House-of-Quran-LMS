import { TeacherApi } from "../features/admin/services/TeacherAvailabilityServices";

export const mapTeachersToSessions = (teachers: TeacherApi[]) => {
  const sessions: any[] = [];

  teachers.forEach((teacher) => {
    teacher.schedules.forEach((s) => {
      sessions.push({
        id: s.id,
        sessionName: s.title || "Session",
        teacherId: teacher.id,
        teacherName: teacher.user.name,
        studentName: s.studentId || "Student",
        subject: s.title || "General",
        date: s.start_time.split("T")[0],
        day: new Date(s.start_time).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        time: new Date(s.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: new Date(s.end_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });
  });

  return sessions;
};
