import api from "../../../lib/axios";
import { CreateRecurringSessionBody, CreateSessionBody, GetSessionsResponse, UpdateSessionBody } from "../../../types/scheduales";

interface ScheduleFilters {
    fromDate?: string;
    toDate?: string;
}

export const getAllSchedules = async (
    page: number = 1,
    limit: number = 10,
    filters: ScheduleFilters = {},
): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>("/schedules/", {
        params: {
            page,
            limit,
            fromDate: filters.fromDate || undefined,
            toDate: filters.toDate || undefined,
        },
    });
    return response.data;
};

export const searchSchedules = async (
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    filters: ScheduleFilters = {},
): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>("/schedules", {
        params: {
            search: searchTerm || undefined,
            page,
            limit,
            fromDate: filters.fromDate || undefined,
            toDate: filters.toDate || undefined,
        },
    });
    return response.data;
};

export const getSchedulesForTeacher = async (
    teacherId: string
): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>(
        `/schedules/teacher/${teacherId}`
    );
    return response.data;
};

export const getSchedulesForStudent = async (
    studentId: string
): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>(
        `/schedules/student/${studentId}`
    );
    return response.data;
};

export const createSchedule = async (
    scheduleData: CreateSessionBody
) => {
    const response = await api.post("/schedules/create-one/", scheduleData);
    return response.data;
};

export const createRecurringSchedule = async (
    scheduleData: CreateRecurringSessionBody
) => {
    const response = await api.post(
        "/schedules/create-recurring/",
        scheduleData
    );
    return response.data;
};

export const deleteSchedule = async (scheduleId: string) => {
    const response = await api.delete(`/schedules/${scheduleId}`);
    return response.data;
};

export const updateSchedule = async (
    scheduleId: string,
    scheduleData: UpdateSessionBody
) => {
    const response = await api.patch(
        `/schedules/${scheduleId}`,
        scheduleData
    );
    return response.data;
};
