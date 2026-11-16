import api from "../../../lib/axios";

export interface CreateDailyQuranPayload {
  studentId: string;
  surah: string;
  startPage: number;
  endPage: number;
  dueDate: string;
  status: "pending" | "completed" | "reviewed" | "rejected";
}

export interface UpdateDailyQuranPayload {
  surah?: string;
  startPage?: number;
  endPage?: number;
  dueDate?: string;
  status?: "pending" | "completed" | "reviewed" | "rejected";
}

// Create daily quran recitation
export const createDailyQuranRecitation = async (
  payload: CreateDailyQuranPayload
) => {
  const response = await api.post("/daily-quran-recitation", payload);
  return response.data;
};

// Get all daily quran recitations (teacher)
export const getDailyQuranRecitations = async () => {
  const response = await api.get("/daily-quran-recitation/");
  return response.data;
};

// Get by id
export const getDailyQuranRecitationById = async (id: string) => {
  const response = await api.get(`/daily-quran-recitation/${id}`);
  return response.data;
};

// Update (PATCH)
export const updateDailyQuranRecitation = async (
  id: string,
  payload: UpdateDailyQuranPayload
) => {
  const response = await api.patch(`/daily-quran-recitation/${id}`, payload);
  return response.data;
};

// Delete
export const deleteDailyQuranRecitation = async (id: string) => {
  const response = await api.delete(`/daily-quran-recitation/${id}`);
  return response.data;
};

