import api from "../../../lib/axios";

// Student: get my recitations
export const getMyRecitations = async () => {
  const response = await api.get("/daily-quran-recitation/my-recitations");
  return response.data;
};
