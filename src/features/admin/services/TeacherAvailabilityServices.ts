import api from "../../../lib/axios";

export interface TeacherSchedule {
  id: string;
  teacherId: string;
  studentId: string;
  status: string;
  title: string;
  description: string;
  type: string;
  start_time: string;
  end_time: string;
  link?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  is_recurring: boolean;
  day_of_week: string | null;
  parent_recurring_id: string | null;
}
export interface TeacherApi {
  id: string;
  hour_price: number;
  gender: string;
  schedules: any[];
  user: {
    name: string;
    email: string;
    role: {
      name: string;
    };
  };
}
export interface Teacher {
  id: string;
  user_id: string;
  currencyId: string;
  hour_price: number;
  gender: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;

  roleId: string | null;
  schedules: TeacherSchedule[];
}

export interface TeachersCalendarResponse {
  message: string;
  status: number;
  data: {
    teachers: TeacherApi[];
  };
}

export const TeacherService = {
  getTeachersCalendar: async (startDate: string, endDate: string) => {
    const response = await api.get<TeachersCalendarResponse>(
      `/calendar/teachers?startDate=${startDate}&endDate=${endDate}`,
    );

    return response.data.data.teachers;
  },
};
