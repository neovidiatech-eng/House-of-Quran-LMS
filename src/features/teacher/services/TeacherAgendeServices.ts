import api from "../../../lib/axios";
import { AgendaResponse } from "../../../types/Agenda";

export const getTeacherAgenda = async (startDate: string, endDate: string) => {
  const response = await api.get(
    `/calendar/teacher?startDate=${startDate}&endDate=${endDate}`,
  );
  return response.data as AgendaResponse;
};
