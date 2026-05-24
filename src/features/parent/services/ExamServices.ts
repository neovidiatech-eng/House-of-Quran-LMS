import api from "../../../lib/axios";

export const getUserExams = async () => {
  const response = await api.get("/exams/user-exams");
  return response.data;
};
