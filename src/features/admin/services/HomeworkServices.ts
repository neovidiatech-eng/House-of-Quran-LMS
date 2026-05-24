import api from "../../../lib/axios";
import { HomeworkResponse } from "../../../types/assignment";

export const getHomeworkList = async (): Promise<HomeworkResponse> => {
  const response = await api.get("/homework");
  return response.data;
};