import api from "../../../lib/axios";
import { AgendaResponse } from "../../../types/Agenda";

export const AgendaService = {
  getCalendarSessions: async (startDate: string, endDate: string) => {
    const response = await api.get<AgendaResponse>(
      `/calendar?startDate=${startDate}&endDate=${endDate}`,
    );

    return response.data.data;
  },
};
