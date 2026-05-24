import api from "../../../lib/axios";
import {
  CreateRecurringSchedulePayload,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from "../../../types/scheduales";

export const getSchedulesForTeacher = async (teacherId: string) => {
  const response = await api.get(`/schedules/teacher/${teacherId}`);
  return response.data;
};

export const getSchedulesForStudent = async (studentId: string) => {
  const response = await api.get(`/schedules/student/${studentId}`);
  return response.data;
};

export const createSchedule = async (scheduleData: CreateSchedulePayload) => {
  const response = await api.post("/schedules/create-one/", scheduleData);
  return response.data;
};

export const createRecurringSchedule = async (
  scheduleData: CreateRecurringSchedulePayload,
) => {
  const response = await api.post("/schedules/create-recurring/", scheduleData);
  return response.data;
};

export const deleteSchedule = async (scheduleId: string) => {
  const response = await api.delete(`/schedules/${scheduleId}`);
  return response.data;
};

export const deleteRecurringScheduale = async (groupId: string) => {
  const response = await api.delete(`/schedules/group/${groupId}`);
  return response.data;
};

export const updateSchedule = async (
  scheduleId: string,
  scheduleData: UpdateSchedulePayload,
) => {
  const response = await api.patch(`/schedules/${scheduleId}`, scheduleData);
  return response.data;
};
