import api from "../../../lib/axios";

// Admin: get all recitations
export const getAllRecitations = async () => {
  const response = await api.get("/daily-quran-recitation/");
  return response.data;
};
