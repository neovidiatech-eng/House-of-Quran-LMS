import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateSchedule,
  createSchedule,
  createRecurringSchedule,
  deleteSchedule,
  deleteRecurringScheduale,
} from "../services/SchedulesServices";
import {
  UpdateSchedulePayload,
  CreateSchedulePayload,
  CreateRecurringSchedulePayload,
} from "../../../types/scheduales";
import {
  getAllSchedules,
  searchSchedules,
  getSchedulesForTeacher,
} from "../services/SessionsServices";
import { message } from "antd";

export const useGetSchedules = (
  page: number = 1,
  limit: number = 10,
  filters: {
    fromDate?: string;
    toDate?: string;
  } = {},
) => {
  return useQuery({
    queryKey: ["schedules", page, limit, filters],
    queryFn: () => getAllSchedules(page, limit, filters),
  });
};

export const useSearchSchedules = (
  searchTerm: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    fromDate?: string;
    toDate?: string;
  } = {},
) => {
  return useQuery({
    queryKey: ["schedules", searchTerm, page, limit, filters],
    queryFn: () =>
      searchTerm
        ? searchSchedules(searchTerm, page, limit, filters)
        : getAllSchedules(page, limit, filters),
  });
};

export const useGetSchedulesByTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: ["schedules", "teacher", teacherId],
    queryFn: () => getSchedulesForTeacher(teacherId),
    enabled: !!teacherId,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchedulePayload) => createSchedule(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success(data.message || 'Schedule Created Successfully');
    },
  });
};

export const useCreateRecurringSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecurringSchedulePayload) =>
      createRecurringSchedule(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success(data.message || 'Recurring Schedules Created Successfully');
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success(data.message || 'Schedule Deleted Successfully');
    },
  });
};

export const useDeleteGroupedSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurringScheduale(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success(data.message || 'Grouped Schedule Deleted Successfully');
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchedulePayload }) =>
      updateSchedule(id, data),

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success(data.message || 'Schedule Updated Successfully');
    },
  });
};

